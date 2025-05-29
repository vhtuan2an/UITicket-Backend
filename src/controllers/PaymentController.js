const MomoService = require("../services/MomoService");
const Ticket = require("../models/TicketModel");
// const EmailService = require("../services/EmailService");
// const NotificationService = require("../services/NotificationService");

class PaymentController {
  static async createPayment(req, res) {
    try {
      const { amount, orderInfo } = req.body;
      const result = await MomoService.createPayment(amount, orderInfo);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  }

  // Xử lý IPN callback từ MoMo (tự động)
  static async handleCallback(req, res) {
    try {
      console.log("=== MOMO IPN CALLBACK ===");
      console.log("Body:", req.body);

      const { orderId, resultCode, message } = req.body;

      const ticket = await Ticket.findOne({
        "paymentData.orderId": orderId,
      }).populate("buyerId eventId");

      if (!ticket) {
        return res.status(200).json({ // Return 200 để MoMo không retry
          message: "Ticket not found",
        });
      }

      const oldStatus = ticket.paymentStatus;
      ticket.paymentStatus = resultCode === 0 ? "paid" : "failed";
      await ticket.save();

      console.log(
        `IPN: Updated payment status from ${oldStatus} to ${ticket.paymentStatus}`
      );

      // Gửi notification nếu cần
      if (resultCode === 0) {
        // TODO: Send push notification to user
      }

      return res.status(200).json({
        message: "Callback processed successfully",
      });
    } catch (error) {
      console.error("IPN Callback error:", error);
      return res.status(200).json({ // Return 200 để MoMo không retry
        message: "Error processed",
      });
    }
  }

  // Xử lý mobile callback từ frontend
  static async handleMobileCallback(req, res) {
    try {
      console.log("=== MOBILE PAYMENT CALLBACK ===");
      console.log("Body:", req.body);

      const { orderId, resultCode, message, requestId, transId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "orderId is required",
        });
      }

      const ticket = await Ticket.findOne({
        "paymentData.orderId": orderId,
      }).populate("buyerId eventId");

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found",
        });
      }

      // Cập nhật payment status nếu chưa được cập nhật
      const shouldUpdate = ticket.paymentStatus === "pending";

      if (shouldUpdate) {
        const oldStatus = ticket.paymentStatus;
        ticket.paymentStatus = resultCode === 0 ? "paid" : "failed";

        // Cập nhật thêm thông tin transaction
        ticket.paymentData = {
          ...ticket.paymentData,
          resultCode,
          message,
          transId,
          updatedAt: new Date(),
        };

        await ticket.save();
        console.log(
          `Mobile: Updated payment status from ${oldStatus} to ${ticket.paymentStatus}`
        );
      }

      return res.status(200).json({
        success: true,
        message: "Payment callback processed",
        data: {
          ticketId: ticket._id,
          paymentStatus: ticket.paymentStatus,
          resultCode,
        },
      });
    } catch (error) {
      console.error("Mobile callback error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async checkTransactionStatus(req, res) {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "orderId is required",
        });
      }

      const result = await MomoService.checkTransactionStatus(orderId);
      const ticket = await Ticket.findOne({
        "paymentData.orderId": orderId,
      });

      if (ticket) {
        const newPaymentStatus = result.resultCode === 0 ? "paid" : "failed";

        // Chỉ gửi email nếu trạng thái thay đổi từ pending sang paid
        // if (ticket.paymentStatus !== "paid" && newPaymentStatus === "paid") {
        //   try {
        //     await EmailService.sendPaymentSuccessEmail(ticket);
        //     console.log("Payment success email sent");
        //   } catch (emailError) {
        //     console.error("Error sending payment success email:", emailError);
        //   }
        // }

        ticket.paymentStatus = newPaymentStatus;
        await ticket.save();
      }

      return res.status(200).json({
        success: true,
        data: {
          ...result,
          ticketStatus: ticket ? ticket.paymentStatus : null,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = PaymentController;
