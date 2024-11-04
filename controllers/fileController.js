const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'video/avi'];
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
// Upload file

const uploadFile = async (req, res) => {
  const { file } = req;

  // Validate input
  if (!file) {
    return res.status(400).json({ error: 'File is required' });
  }

  // Validate file type
  if (!validMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type. Only image and video files are allowed.' });
  }

  try {
    const fileName = file.filename;
    const fileType = file.mimetype.startsWith('image/') ? 'image' : 'file'; // Change here to 'file'
    const tags = JSON.parse(req.body.tags);
    const newFile = new File({
      url: `${BASE_URL}/uploads/${fileName}`,
      name: fileName,
      tags: tags || [],
      fileType: fileType,
      userId: req.user.id, // Assuming `req.user` is populated by your authentication middleware
    });

    await newFile.save();
    res.status(201).json({ message: 'File uploaded successfully', file: newFile });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


//get all files

const getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id }); // Find all files by userId
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    console.error('Error fetching user files:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get file statistics
const getFileStatistics = async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    } 

    res.status(200).json({
      name: file.name,
      url: file.url,
      views: file.views,
      tags: file.tags,
    });
  } catch (error) {
    console.error('Error fetching file statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Increment file views
const incrementFileViews = async (fileId) => {

  try {
    const file = await File.findByIdAndUpdate(fileId, { $inc: { views: 1 } }, { new: true });
    if (!file) {
      return 'File not found';
    }

  } catch (error) {
    console.error('Error incrementing file views:', error);
  }
};

const updateShareCount = async(req,res) =>{
  const { fileId } = req.params;

  try {
    // Find the media item by ID
    const mediaItem = await File.findById(fileId);
    if (!mediaItem) {
      return res.status(404).json({ message: 'Media item not found' });
    }

    // Increment the share count
    mediaItem.shareCount = (mediaItem.shareCount || 0) + 1;

    const shareableLink = `${BASE_URL}/api/get/${fileId}`; 

    // Save the updated media item
    await mediaItem.save();

    const responseObject = {
      mediaItem: {
        ...JSON.parse(JSON.stringify(mediaItem)), 
        link: shareableLink
      }
    };

    res.status(200).json(responseObject);
  } catch (error) {
    console.error('Error updating share count:', error);
    res.status(500).json({ message: 'Server error. Unable to update share count.' });
  }
}

const getUploadedFile = async (req, res) => {

  const fileId  = req.params.fileId; 


  const file = await File.findById(fileId);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  

  const filePath = path.join(__dirname, '../uploads', file.name); 

  

  // Check if the file exists
  fs.stat(filePath, (err, stats) => {
    if (err) {
      return res.status(404).json({ message: 'File not found' });
    }

   // Determine the content type based on the file extension
   const contentType = mime.contentType(path.extname(filePath)); 

   // Set the Content-Type header
   res.setHeader('Content-Type', contentType || 'application/octet-stream'); 

   incrementFileViews(fileId);

    // Send the file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(err.status).end();
      }
    });
  });
};

module.exports = {
  uploadFile,
  getFileStatistics,
  incrementFileViews,
  getUserFiles,
  updateShareCount,
  getUploadedFile
};
