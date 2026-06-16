const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  method: { type: String, default: 'GET', enum: ['GET','POST','PUT','PATCH','DELETE','HEAD'] },
  headers: { type: Map, of: String, default: {} },
  body: { type: String, default: '' }, // Store as string, parse on use
}, { _id: true, timestamps: true });

const apiCollectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  requests: [requestSchema],
}, { timestamps: true });

// Compound index: efficiently load all collections for a user
apiCollectionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ApiCollection', apiCollectionSchema);