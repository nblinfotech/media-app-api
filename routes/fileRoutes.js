const express = require('express');
const { uploadFile, getFileStatistics, incrementFileViews,getUserFiles,updateShareCount,getUploadedFile } = require('../controllers/fileController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const multerS3 = require('multer-s3');
const router = express.Router();
const path = require('path');


// Set up Multer for local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Save to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });


router.post('/upload', authMiddleware,upload.single('file'), uploadFile);
router.get('/',authMiddleware, getUserFiles);
router.get('/:fileId/stats', getFileStatistics);
router.post('/:fileId/views', incrementFileViews);
router.post('/:fileId/share', updateShareCount);

// router.post('/share', async (req, res) => {
//   const { mediaId } = req.body;

//   try {
//     // Find the media by ID
//     const media = await File.findById(mediaId);
//     if (!media) {
//       return res.status(404).json({ message: 'Media not found' });
//     }

//     // Generate a shareable link using the DOMAIN from .env
//     const shareableLink = `${process.env.DOMAIN}/media/${mediaId}`; // Adjust to your actual path

//     res.status(200).json({ link: shareableLink });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

module.exports = router;
