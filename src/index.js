const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const routes = require("./routes");

// Load biến môi trường
dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined"));

// Kết nối MongoDB
const uri = process.env.MONGO_URI;
const port = process.env.PORT || 3001;

// Khởi động các routes
routes(app);

mongoose
  .connect(uri)
  .then(() => {
    console.log("Mongoose connected to MongoDB");
    // Khởi động server sau khi kết nối DB thành công
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Mongoose connection error:", err);
  });

