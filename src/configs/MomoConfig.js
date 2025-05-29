const momoConfig = {
  PARTNER_CODE: "MOMO",
  ACCESS_KEY: "F8BBA842ECF85",
  SECRET_KEY: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  API_ENDPOINT: "https://test-payment.momo.vn/v2/gateway/api",
  REDIRECT_URL: "https://uiticket-backend.onrender.com/tickets",
  MOBILE_RETURN_URL: "uiticket://payment",
  IPN_URL: "https://uiticket-backend.onrender.com/payments/callback",
};

module.exports = momoConfig;