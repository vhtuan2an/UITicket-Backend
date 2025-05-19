const TicketService = require("../services/TicketService");
const TicketModel = require("../models/TicketModel");
const User = require("../models/UserModel");
const MomoService = require("../services/MomoService");
const EventModel = require("../models/EventModel");

class TicketController {
  async bookTicket(req, res) {
    try {
      const { eventId } = req.body;
      const userId = req.id;

      const event = await EventModel.findById(eventId);
      if (!event) {
        return res.status(404).json({
          status: "error",
          message: "Event not found",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      if (event.ticketsSold >= event.maxAttendees) {
        return res.status(400).json({
          status: "error",
          message: "No tickets available",
        });
      }

      const ticket = await TicketService.bookTicket(eventId, userId);

      const orderInfo = `Thanh toán vé sự kiện "${event.name}"`;
      const redirectUrl = "";
      const paymentResponse = await MomoService.createPayment(
        event.price,
        orderInfo,
        redirectUrl
      );

      await TicketModel.findByIdAndUpdate(ticket._id, {
        paymentData: paymentResponse,
      });

      res.status(201).json({
        _id: ticket._id,
        eventId: ticket.eventId,
        buyerId: ticket.buyerId,
        bookingCode: ticket.bookingCode,
        //qrCode: ticket.qrCode,
        status: ticket.status,
        paymentStatus: ticket.paymentStatus,
        paymentData: paymentResponse,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      });
    } catch (error) {
      console.error("Error booking ticket:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async getTicketById(req, res) {
    try {
      const ticketId = req.params.id;
      const ticket = await TicketService.getTicketById(ticketId);
      res.status(200).json({
        status: "success",
        data: ticket,
      });
    } catch (error) {
      console.error("Error getting ticket:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }  

  async cancelTicket(req, res) {
    try {
      const {ticketId} = req.params;
      console.log("Ticket ID:", ticketId);
      const userId = req.id;
      const { cancelReason } = req.body;

      const ticket = await TicketService.cancelTicket(ticketId, userId, cancelReason);
      res.status(200).json({
        status: "success",
        data: ticket,
      });
    } catch (error) {
      console.error("Error cancelling ticket:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }
}

module.exports = new TicketController();
