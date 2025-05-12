const EventService = require("../services/EventService");
const { authMiddleware } = require("../middlewares/AuthMiddleware");
const { uploadToCloudinary } = require("../utils/UploadImage");

class EventController {
  async createEvent(req, res) {
    try {
      const eventData = req.body;
      const files = req.files; // Các file đã upload qua multer
      const createdBy = req.id;

      const requiredFields = ["name", "categoryId", "location", "date", "time"];
      for (const field of requiredFields) {
        if (!eventData[field]) {
          return res.status(400).json({
            status: "error",
            message: "Missing required field: " + field,
          });
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
      const [hours, minutes] = eventData.time.split(":").map(Number);

      // Thiết lập giờ phút cho đối tượng Date
      dateObj.setHours(hours, minutes, 0, 0);

      // Gán lại date với đối tượng Date đầy đủ (bao gồm giờ)
      eventData.date = dateObj;

      const currentDate = new Date();
      if (eventData.date < currentDate) {
        return res.status(400).json({
          status: "error",
          message: "Event date and time cannot be in the past",
        });
      }

      // Upload hình ảnh lên Cloudinary nếu có
      if (files && files.length > 0) {
        try {
          const imageUrls = await Promise.all(
            files.map((file) =>
              uploadToCloudinary(file.buffer, { folder: "events" })
            )
          );
          eventData.images = imageUrls;
        } catch (uploadError) {
          return res.status(500).json({
            status: "error",
            message: "Error uploading images",
            error: uploadError.toString(),
          });
        }
      }

      // Tiếp tục tạo sự kiện
      const result = await EventService.createEvent({
        ...eventData,
        createdBy,
      });

      return res.status(201).json({
        status: "success",
        message: "Event created successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async getEvent(req, res) {
    try {
      const events = await EventService.getEvent();
      if (!events || events.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No events found",
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Events retrieved successfully",
        data: events,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async getEventById(req, res) {
    try {
      const eventId = req.params.id;
      const event = await EventService.getEventById(eventId);
      if (event.status === "error") {
        return res.status(404).json({
          status: "error",
          message: "event not found",
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Event retrieved successfully",
        data: event,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async searchEvent(req, res) {
    try {
      console.log("Search params: ", req.query);
      const searchParams = req.query;
      const events = await EventService.searchEvent(searchParams);
      return res.status(200).json({
        status: "success",
        message: "Events retrieved successfully",
        data: events,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async updateEvent(req, res) {
    try {
      const eventId = req.params.eventId;
      const eventData = req.body;
      const files = req.files;
      const userId = req.id;

      // Xác thực dữ liệu đầu vào
      if (
        eventData.status &&
        !["active", "completed", "cancelled"].includes(eventData.status)
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid status. Allowed values are: active, completed, cancelled",
        });
      }

      if (eventData.date && eventData.time) {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(eventData.time)) {
          return res.status(400).json({
            status: "error",
            message:
              "Invalid time format. Use HH:MM (24-hour format)",
          });
        }

        const dateObj = new Date(eventData.date);
        if (isNaN(dateObj.getTime())) {
          return res.status(400).json({
            status: "error",
            message: "Invalid date format",
          });
        }

        const [hours, minutes] = eventData.time.split(":").map(Number);

        dateObj.setHours(hours, minutes, 0, 0);

        eventData.date = dateObj;

        const currentDate = new Date();
        if (eventData.date < currentDate) {
          return res.status(400).json({
            status: "error",
            message: "Event date and time cannot be in the past",
          });
        }

        delete eventData.time;
      } else if (eventData.date) {
        const existingEvent = await EventService.getEventById(eventId);
        if (existingEvent.status === "error") {
          return res.status(404).json({
            status: "error",
            message: "Event not found",
          });
        }

        const existingDate = new Date(existingEvent.date);
        const newDate = new Date(eventData.date);

        newDate.setHours(
          existingDate.getHours(),
          existingDate.getMinutes(),
          existingDate.getSeconds(),
          existingDate.getMilliseconds()
        );

        eventData.date = newDate;
      }
      
    // Upload hình ảnh lên Cloudinary nếu có

      if (files && files.length > 0) {
        try {
          const imageUrls = await Promise.all(
            files.map((file) =>
              uploadToCloudinary(file.buffer, { folder: "events" })
            )
          );

          if (eventData.images && Array.isArray(eventData.images)) {
            eventData.images = [...eventData.images, ...imageUrls];
          } else {
            const existingEvent = await EventService.getEventById(eventId);
            if (existingEvent && existingEvent.images) {
              eventData.images = [...existingEvent.images, ...imageUrls];
            } else {
              eventData.images = imageUrls;
            }
          }
        } catch (uploadError) {
          return res.status(500).json({
            status: "error",
            message: "Error uploading images",
            error: uploadError.toString(),
          });
        }
      }

      const result = await EventService.updateEvent(eventId, eventData, userId);

      if (result.status === "error") {
        const statusCode = result.message.includes("permission") ? 403 : 404;
        return res.status(statusCode).json({
          status: "error",
          message: result.message,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Event updated successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }
}

module.exports = new EventController();
