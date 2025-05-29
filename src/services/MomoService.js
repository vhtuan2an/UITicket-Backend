const axios = require("axios");
const crypto = require("crypto");
const momoConfig = require("../configs/MomoConfig");

class MomoService {
  static generateSignature(rawSignature) {
    return crypto
      .createHmac("sha256", momoConfig.SECRET_KEY)
      .update(rawSignature)
      .digest("hex");
  }

  static async createPayment(amount, orderInfo = "Payment for ticket", redirectUrl = momoConfig.REDIRECT_URL, returnUrl = null) {
    const orderId = momoConfig.PARTNER_CODE + new Date().getTime();
    const requestId = orderId;
    
    // Sử dụng returnUrl nếu được cung cấp, nếu không thì dùng redirectUrl
    const finalReturnUrl = returnUrl || redirectUrl;

    const rawSignature =
      "accessKey=" + momoConfig.ACCESS_KEY +
      "&amount=" + amount +
      "&extraData=" +
      "&ipnUrl=" + momoConfig.IPN_URL +
      "&orderId=" + orderId +
      "&orderInfo=" + orderInfo +
      "&partnerCode=" + momoConfig.PARTNER_CODE +
      "&redirectUrl=" + finalReturnUrl +
      "&requestId=" + requestId +
      "&requestType=captureWallet";

    const signature = this.generateSignature(rawSignature);

    const requestBody = {
      partnerCode: momoConfig.PARTNER_CODE,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: finalReturnUrl, // Sử dụng finalReturnUrl thay vì redirectUrl
      ipnUrl: momoConfig.IPN_URL,
      lang: "vi",
      requestType: "captureWallet",
      autoCapture: true,
      extraData: "",
      orderGroupId: "",
      signature: signature,
    };

    try {
      const response = await axios.post(
        `${momoConfig.API_ENDPOINT}/create`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("MoMo API Error:", error.response?.data || error.message);
      throw new Error("Failed to create MoMo payment");
    }
  }

  static async checkTransactionStatus(orderId) {
    try {
      const requestId = `CHECK_${Date.now()}`;
      const rawSignature = `accessKey=${momoConfig.ACCESS_KEY}&orderId=${orderId}&partnerCode=${momoConfig.PARTNER_CODE}&requestId=${requestId}`;
      const signature = crypto
        .createHmac('sha256', momoConfig.SECRET_KEY)
        .update(rawSignature)
        .digest('hex');

      const requestBody = {
        partnerCode: momoConfig.PARTNER_CODE,
        requestId: requestId,
        orderId: orderId,
        signature: signature,
        lang: 'vi'
      };

      const response = await axios.post(
        `${momoConfig.API_ENDPOINT}/query`,
        requestBody
      );

      return response.data;
    } catch (error) {
      throw new Error('Lỗi khi kiểm tra trạng thái giao dịch: ' + error.message);
    }
  }
}

module.exports = MomoService;
