const EventService = require('../services/EventService');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

class EventController {
    async createEvent(req, res) {
        try {
            const eventData = req.body;
            const createdBy = req.id; 

            const requiredFields = ['name', 'categoryId', 'location', 'date'];
            for (const field of requiredFields) {
                if (!eventData[field]) {
                    return res.status(400).json({
                        status: "error",
                        message: "Missing required field: " + field,
                    })
                }
            }

            // Date validation
            eventData.date = new Date(eventData.date);
            if (isNaN(eventData.date.getTime())) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid date format",
                });
            }

            // Check if date is in the past
            const currentDate = new Date();
            if (eventData.date < currentDate) {
                return res.status(400).json({
                    status: "error",
                    message: "Event date cannot be in the past",
                });
            }

            // Continue with creating the event
            const result = await EventService.createEvent({
                ...eventData,
                createdBy
            });

            return res.status(201).json({
                status: "success",
                message: "Event created successfully",
                data: result
            });
        }
        catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Internal server error",
                error: error.toString(),
            });
        }
    }
}

module.exports = new EventController();