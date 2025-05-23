const EventModel = require('../models/EventModel');
const TicketModel = require('../models/TicketModel');
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

    async updateEvent(eventId, eventData, userId) {
        try {
            const event = await EventModel.findById(eventId);

            if (!event) {
                return {
                    status: "error",
                    message: "Event not found",
                }
            }

            if (event.createdBy.toString() != userId.toString()) {
                return {
                    status: "error",
                    message: "You are not authorized to update this event",
                }
            }

            const updatedEvent = await EventModel.findByIdAndUpdate(eventId,
                { $set: eventData },
                { new: true }
            )
            .populate('categoryId', 'name') 
            .populate('createdBy', 'name')
            .populate('collaborators', 'name');
            return updatedEvent;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }

    async searchEvent(params) {
        try {
            const query = { isDeleted: false };
            // Chuyển đổi ngày tìm kiếm sang UTC
            if (params.date) {
                const GMT7_OFFSET = 7 * 60 * 60 * 1000;
                const searchDate = new Date(params.date);
                const startDateUTC = new Date(searchDate.setHours(0, 0, 0, 0) - GMT7_OFFSET);
                const endDateUTC = new Date(searchDate.setHours(23, 59, 59, 999) + GMT7_OFFSET);

                query.date = {
                    $gte: startDateUTC,
                    $lte: endDateUTC
                }
            }

            if (params.name) {
                query.name = {
                    $regex: params.name,
                    $options: 'i'
                }
            }

            if (params.location) {
                query.location = {
                    $regex: params.location,
                    $options: 'i'
                }
            }

            if (params.category) {
                query.category = {
                    $regex: params.category,
                    $options: 'i'
                }
            }

            if (params.status) {
                query.status = params.status;
            }

            return await EventModel.find(query)
                .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất
                .populate( 'categoryId', 'name') // Thay thế ObjectId bằng tên category
                .populate('createdBy', 'name') // Thay thế ObjectId bằng tên người tạo
                .populate('collaborators', 'name') // Thay thế ObjectId bằng tên người tạo
                .exec()
                .then((events) =>
                    events.map((event) => {
                        const eventObj = event.toObject();
                        eventObj.category = eventObj.categoryId;
                        delete eventObj.categoryId;
                        return eventObj;
          })
        );

        }
        catch (error) {
            throw new Error(error.message);
        }  
    }

    async deleteEvent(eventId, userId) {
        try {
            const event = await EventModel.findById(eventId);
            if (!event) {
                return {
                    status: "error",
                    message: "Event not found",
                };
            }
            const user = await User.findById(userId);
            const role = user.role;
            if (role !== 'admin' && role !== 'event_creator') {
                return {
                    status: "error",
                    message: "You are not authorized to delete this event"
                };
            }

            if (event.createdBy.toString() != userId.toString()) {
                return {
                    status: "error",
                    message: "You are not authorized to delete this event"
                };
            }
        

            event.isDeleted = true;
            event.status = "cancelled";

            await TicketModel.updateMany(
                { eventId: eventId },
                { $set: { 
                    status: "cancelled",
                    cancelReason: "Event has been deleted"
                },
                $unset: {
            transferTo: "",
            transferRequestTime: ""
          } });

            await event.save();

            return {
                status: "success",
                message: "Event deleted successfully",
                data: event,
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }

}

module.exports = new EventService();