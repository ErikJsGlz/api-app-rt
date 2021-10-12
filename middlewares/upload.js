var appRoot = require('app-root-path');
const path = require('path');
const multer = require('multer')

const { reportsPhotoFolder } = require('../config');

const storageConfig = multer.diskStorage({
    destination: (req, file, callback) => {
        // make sure to create a "productImages" folder before storing files
        let fullPath = path.join(appRoot + `/${reportsPhotoFolder}/`);
        callback(null, fullPath);
    },
    filename: (req, file, callback) => {
        let extension = '.' + file.originalname.split(".").pop();
        callback(null, file.fieldname + '-' + Date.now() + extension);
    }
});
const uploadMiddleware = multer({ storage: storageConfig });

module.exports = { uploadMiddleware }
