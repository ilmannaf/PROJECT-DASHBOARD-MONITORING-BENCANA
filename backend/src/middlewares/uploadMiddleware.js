const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadRoot = path.join(__dirname, '../../uploads');
const publicUploadDir = path.join(uploadRoot, 'public');
const privateUploadDir = path.join(uploadRoot, 'private');

for (const directory of [uploadRoot, publicUploadDir, privateUploadDir]) {
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
}

const createStorage = (directory) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, directory),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, uniqueName);
  },
});

const storage = createStorage(privateUploadDir);
const publicStorage = createStorage(publicUploadDir);

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file harus JPG, PNG, atau WEBP'), false);
  }
};

const jpgFileFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/jpg'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Foto dokumentasi harus berformat JPG'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const publicUpload = multer({
  storage: publicStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadJpgUnder2Mb = multer({
  storage,
  fileFilter: jpgFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const publicUploadJpgUnder2Mb = multer({
  storage: publicStorage,
  fileFilter: jpgFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = upload;
module.exports.publicUpload = publicUpload;
module.exports.uploadJpgUnder2Mb = uploadJpgUnder2Mb;
module.exports.publicUploadJpgUnder2Mb = publicUploadJpgUnder2Mb;