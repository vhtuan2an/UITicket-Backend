const cloudinary = require("../configs/cloudinary");
const { Readable } = require('stream');

/**
 * Uploads one or more buffers to Cloudinary
 * @param {Buffer|Array<Buffer>} input - Single buffer or array of buffers to upload
 * @param {Object} options - Upload options
 * @param {String} options.folder - Cloudinary folder (default: 'event_images')
 * @param {String} options.resourceType - Resource type (default: 'image')
 * @returns {Promise<String|Array<String>>} The secure URL(s) of the uploaded image(s)
 */
const uploadToCloudinary = async (input, options = {}) => {
    // If input is an array, process multiple uploads
    if (Array.isArray(input)) {
        const uploadPromises = input.map(buffer => uploadSingleBuffer(buffer, options));
        return Promise.all(uploadPromises);
    }
    
    // Otherwise process single upload
    return uploadSingleBuffer(input, options);
};

/**
 * Helper function to upload a single buffer
 * @private
 */
const uploadSingleBuffer = async (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: options.folder || 'event_images',
            resource_type: options.resourceType || 'image',
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        
        // Create a readable stream from the buffer and pipe it to the upload stream
        const readableStream = new Readable({
            read() {
                this.push(buffer);
                this.push(null);
            }
        });
        
        readableStream.pipe(uploadStream);
    });
};

/**
 * Deletes an image from Cloudinary by URL
 * @param {String} imageUrl - The URL of the image to delete
 * @returns {Promise<Object>} Cloudinary deletion result
 */
const deleteFromCloudinary = async (imageUrl) => {
    // Extract public ID from URL
    // Example URL: https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/folder/filename.jpg
    const urlParts = imageUrl.split('/');
    const filenameWithExtension = urlParts[urlParts.length - 1];
    const filename = filenameWithExtension.split('.')[0];
    
    const folderIndex = urlParts.indexOf('upload') + 1;
    let publicId = '';
    
    if (folderIndex < urlParts.length - 1) {
        // Combine folder path and filename without extension
        const folderPath = urlParts.slice(folderIndex, urlParts.length - 1).join('/');
        publicId = `${folderPath}/${filename}`;
    } else {
        publicId = filename;
    }
    
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
};