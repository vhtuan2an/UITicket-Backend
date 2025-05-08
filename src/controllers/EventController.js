const EventService = require('../services/EventService');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

class EventController {
    async createEvent(req, res) {
        try {
            const eventData = req.body;
            const createdBy = req.id; 

            const requiredFields = ['name', 'categoryId', 'location', 'date', 'time'];
            for (const field of requiredFields) {
                if (!eventData[field]) {
                    return res.status(400).json({
                        status: "error",
                        message: "Missing required field: " + field,
                    })
                }
            }

            // Kiểm tra định dạng thời gian
            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!timeRegex.test(eventData.time)) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid time format. Use HH:MM (24-hour format)",
                });
            }

            // Xử lý ngày và giờ
            const dateObj = new Date(eventData.date);
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid date format",
                });
            }

            // Tách giờ và phút từ time
            const [hours, minutes] = eventData.time.split(':').map(Number);
            
            // Thiết lập giờ phút cho đối tượng Date
            dateObj.setHours(hours, minutes, 0, 0);
            
            // Gán lại date với đối tượng Date đầy đủ (bao gồm giờ)
            eventData.date = dateObj;

            // Check if date is in the past
            const currentDate = new Date();
            if (eventData.date < currentDate) {
                return res.status(400).json({
                    status: "error",
                    message: "Event date and time cannot be in the past",
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