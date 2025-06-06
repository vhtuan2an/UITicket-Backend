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
      
      // Thêm returnUrl cho mobile app
      const returnUrl = "uiticket://payment"; // Deep link cho mobile app
      const redirectUrl = ""; // Giữ trống hoặc sử dụng web URL
      
      const paymentResponse = await MomoService.createPayment(
        event.price,
        orderInfo,
        redirectUrl,
        returnUrl // Thêm parameter returnUrl
      );

      await TicketModel.findByIdAndUpdate(ticket._id, {
        paymentData: paymentResponse,
      });

      return res.status(201).json({
        status: "success",
        message: "Ticket booked successfully",
        data: {
          _id: ticket._id,
          eventId: ticket.eventId,
          buyerId: ticket.buyerId,
          bookingCode: ticket.bookingCode,
          qrCode: ticket.qrCode,
          status: ticket.status,
          paymentStatus: ticket.paymentStatus,
          paymentData: paymentResponse,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
        },
      });
    } catch (error) {
      console.error("Error booking ticket:", error);
      return res.status(500).json({
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
      const { ticketId } = req.params;
      console.log("Ticket ID:", ticketId);
      const userId = req.id;
      const { cancelReason } = req.body;

      const ticket = await TicketService.cancelTicket(
        ticketId,
        userId,
        cancelReason
      );
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

  async checkInTicket(req, res) {
    try {
      const { bookingCode } = req.body;
      const userId = req.id;

      const ticket = await TicketService.checkInTicket(bookingCode, userId);
      res.status(200).json({
        status: "success",
        data: ticket,
      });
    } catch (error) {
      console.error("Error checking in ticket:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async getUserTickets(req, res) {
    try {
      const userId = req.id; // From auth middleware

      // Find user and populate ticketsBought with event details
      const user = await User.findById(userId).populate({
        path: "ticketsBought",
        populate: {
          path: "eventId",
          select: "name date location price images description maxAttendees ticketsSold"
        },
        options: { sort: { createdAt: -1 } } // Sort by newest first
      });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Format tickets data for frontend
      const formattedTickets = user.ticketsBought.map((ticket) => ({
        _id: ticket._id,
        eventId: ticket.eventId._id,
        buyerId: ticket.buyerId,
        bookingCode: ticket.bookingCode,
        status: ticket.status,
        paymentStatus: ticket.paymentStatus,
        paymentData: ticket.paymentData,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        // Event details for display
        event: {
          _id: ticket.eventId._id,
          name: ticket.eventId.name,
          date: ticket.eventId.date,
          location: ticket.eventId.location,
          price: ticket.eventId.price,
          images: ticket.eventId.images,
          description: ticket.eventId.description,
          maxAttendees: ticket.eventId.maxAttendees,
          ticketsSold: ticket.eventId.ticketsSold
        }
      }));

      return res.status(200).json({
        status: "success",
        data: formattedTickets,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
}

module.exports = new TicketController();
