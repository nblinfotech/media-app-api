// models/File.js

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  tags: { type: [String], default: [] },
  fileType: { type: String, required: true },
  shareCount: {type: Number,default: 0},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  views: { type: Number, default: 0 },
});

const File = mongoose.model('File', fileSchema);
module.exports = File;
