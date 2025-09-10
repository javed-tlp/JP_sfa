const mongoose = require('mongoose');
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil');

// Video Schema
const videoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    link: { type: String, required: true },
    status: { type: Boolean, default: true },
    created_on: { type: String },
    updated_on: { type: String }
}, {
    collection: 'jps_videos'
});

videoSchema.pre('save', function(next) {
    if (!this.created_on) {
        this.created_on = getCurrentDateTime();
    }
    this.updated_on = getCurrentDateTime();
    next();
});

// Banner Schema
const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    status: { type: Boolean, default: true },
    image_path: { type: String, required: true },
    carpenter_banner: { type: Number, default: 1 },
    created_on: { type: String },
    updated_on: { type: String }
  },
  { collection: 'jps_banner' }
);

bannerSchema.pre('save', function(next) {
    if (!this.created_on) {
        this.created_on = getCurrentDateTime();
    }
    this.updated_on = getCurrentDateTime();
    next();
});

const Video = mongoose.model('Video', videoSchema);
const Banner = mongoose.model('Banner', bannerSchema);

module.exports = { Video, Banner };
