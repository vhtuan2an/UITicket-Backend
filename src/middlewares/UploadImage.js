const multer = require('multer');
const path = require('path');
const cloudinary = require('../configs/cloudinary');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Please upload an image'), false);
    } else {
        cb(null, true);
    }
};

const uploadImage = multer({
    storage: storage,
    fileFilter: fileFilter,

    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
    },
});

module.exports = uploadImage;