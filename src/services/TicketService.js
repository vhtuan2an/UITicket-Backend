const TicketModel = require("../models/TicketModel");
const User = require("../models/UserModel");
const EventModel = require("../models/EventModel");
const QRCode = require("qrcode");

class TicketService {
  static generateBookingCode() {
    return "TICKET-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  async bookTicket(eventId, buyerId) {
    try {
      const event = await EventModel.findById(eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      const user = await User.findById(buyerId);
      if (!user) {
        throw new Error("User not found");
      }

      if (event.ticketsSold >= event.maxAttendees) {
        throw new Error("No tickets available");
      }

      const bookingCode = TicketService.generateBookingCode();
      const qrCode = await QRCode.toDataURL(bookingCode);

      const ticket = await TicketModel.create({
        eventId,
        buyerId,
        bookingCode,
        qrCode,
        status: "booked",
        paymentStatus: "pending",
      });

      await ticket.save();

      event.ticketsSold += 1;
      await event.save();

      user.ticketsBought.push(ticket._id);
      await user.save();

      return ticket;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTicketById(ticketId) {
    try {
      const ticket = await TicketModel.findById(ticketId)
        .populate("eventId", "name date location")
        .populate("buyerId", "name email");
      if (!ticket) {
        throw new Error("Ticket not found");
      }
      return ticket;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async cancelTicket(ticketId, userId, cancelReason) {
    try {
      const ticket = await TicketModel.findById(ticketId);
      if (!ticket) {
        throw new Error("Ticket not found");
      }

      if (ticket.buyerId.toString() !== userId) {
        throw new Error("You are not authorized to cancel this ticket");
      }

      if (ticket.status === "cancelled") {
        throw new Error("Ticket is already cancelled");
      }

      ticket.status = "cancelled";
      ticket.cancelReason = cancelReason;
      await ticket.save();

      // Update the event's tickets sold count
      const event = await EventModel.findById(ticket.eventId);
      if (event) {
        event.ticketsSold -= 1;
        await event.save();
      }

      return ticket;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async checkInTicket(bookingCode, userId) {
    try {
      const ticket = await TicketModel.findOne({ bookingCode })
        .populate("eventId")
        .populate("buyerId");

      if (!ticket) {
        throw new Error("Ticket not found");
      }
      if (!ticket) {
        throw new Error("Ticket not found");
      }

      const event = await EventModel.findById(ticket.eventId);
      if (!event) {
        throw new Error("Event not found");
      }
      if (ticket.status !== "booked") {
        throw new Error("Ticket is not in a state to be checked in");
      }

      if (event.creatorId.toString() !== userId || !event.collaborators.includes(userId)) {
        throw new Error("You are not authorized to check in this ticket");
      }

      ticket.status = "checked-in";
      ticket.checkedInBy = userId;
      await ticket.save();
      return ticket;
    }
    catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new TicketService();
