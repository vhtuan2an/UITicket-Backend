const TicketModel = require("../models/TicketModel");
const User = require("../models/UserModel");
const EventModel = require("../models/EventModel");
const QRCode = require("qrcode");

class TicketService {
  static generateBookingCode() {
    return "TICKET-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  async bookTicket(eventId, userId) {
    try {
      const event = await EventModel.findById(eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (event.ticketsSold >= event.maxAttendees) {
        throw new Error("No tickets available");
      }

      const bookingCode = this.generateBookingCode();
      const qrCode = await QRCode.toDataURL(bookingCode);

      const ticket = await TicketModel.create({
        eventId,
        userId,
        bookingCode,
        qrCode,
        status: "booked",
        paymentStatus: "pending",
      });

      await ticket.save();

      event.ticketsSold += 1;
      await event.save();

    user.ticketsBooked.push(ticket._id);

    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new TicketService();
