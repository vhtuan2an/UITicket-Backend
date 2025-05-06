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

            return {
                status: "success",
                message: "Event created successfully",
                data: savedEvent,
            }
        }
        catch (error) {
            throw new Error(error.message);
        }
    }

}

module.exports = new EventService();