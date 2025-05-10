const EventModel = require('../models/EventModel');
const User = require('../models/UserModel');

class EventService {
    async createEvent(eventData) {
        try {
            const newEvent = await EventModel.create({
                ...eventData,
                status: "active",
                ticketsSold: 0,
                isDeleted: false,
            });
            const savedEvent = await newEvent.save();

            // Update the user's eventsCreated array
            await User.findByIdAndUpdate(savedEvent.createdBy, 
                {$push: { eventsCreated: savedEvent._id }},
                {new: true}
            );

            return savedEvent;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }

    async getEvent() {
        try {
            const events = await EventModel.find({ isDeleted: false});
            return events;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }

    async getEventById(eventId) {
        try {
            const event = await EventModel.findById(eventId);
            if (!event) {
                return {
                    status: "error",
                    message: "Event not found",
                }
            }
            return event;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }

}

module.exports = new EventService();