const { validationResult } = require('express-validator');
const SetupModel = require('../../models/webMod/setupModel');

exports.addVideo = async (req, res) => {
    try {
        let { name, description, link, status } = req.body;

        if (link.includes("youtube.com/watch?v=")) {
            const videoId = link.split("v=")[1];
            link = `https://www.youtube.com/embed/${videoId}`;
        } else if (link.includes("youtu.be/")) {
            const videoId = link.split("youtu.be/")[1];
            link = `https://www.youtube.com/embed/${videoId}`;
        }

        const videoData = { name, description, link, status };
        const newVideo = new SetupModel.Video(videoData);
        await newVideo.save();

        res.status(201).json({ message: 'Video added successfully', day_ta: newVideo });
    } catch (error) {
        res.status(500).json({ error: 'Error adding video', details: error.message });
    }
};

exports.updateVideo = async (req, res) => {
    try {
        const { _id, name, description, link, status } = req.body;
        const updatedVideo = await SetupModel.Video.findByIdAndUpdate(_id, { name, description, link, status }, { new: true });
        res.status(200).json({ message: 'Video updated successfully', day_ta: updatedVideo });
    } catch (error) {
        res.status(500).json({ error: 'Error updating video', details: error.message });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const { _id } = req.body;
        await SetupModel.Video.findByIdAndUpdate(_id, { status: false });
        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting video', details: error.message });
    }
};

exports.getVideoDetails = async (req, res) => {
    try {
        const { _id } = req.body;
        const video = await SetupModel.Video.findOne({ _id, status: true });
        if (!video) return res.status(404).json({ message: 'Video not found' });
        res.status(200).json({ day_ta: video });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching video details', details: error.message });
    }
};

exports.getAllVideos = async (req, res) => {
    try {
        const videos = await SetupModel.Video.find({ status: true });
        const videosCount = await SetupModel.Video.countDocuments({ status: true });
        res.status(200).json({ day_ta: videos, TotalVideosCount: videosCount });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching videos', details: error.message });
    }
};

exports.addBannerData = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Invalid Values',
            status: 'invalid',
            errors: errors.mapped(),
        });
    }

    try {
        const { title } = req.body;
        const image_path = req.file ? req.file.path.replace(/\\/g, '/') : null;
        console.log("IMage--->", image_path)

        if (!image_path) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const bannerData = {
            title,
            status: true,
            image_path,
            carpenter_banner: 1,
        };

        const newBanner = new SetupModel.Banner(bannerData);
        await newBanner.save();

        return res.status(200).json({
            message: 'Banner data added successfully',
            status: 'success',
            day_ta: newBanner,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error occurred while adding banner data',
            status: 'error',
            error: error.message,
        });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const { _id } = req.body;
        const updatedBanner = await SetupModel.Banner.findByIdAndUpdate(_id, { status: false }, { new: true });

        if (!updatedBanner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        res.status(200).json({ message: 'Banner deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting banner', details: error.message });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const { _id, title } = req.body;
        let image_path = req.file ? req.file.path.replace(/\\/g, '/') : null;

        const banner = await SetupModel.Banner.findById(_id);

        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        const updatedBanner = await SetupModel.Banner.findByIdAndUpdate(
            _id,
            { 
                title, 
                image_path: image_path || undefined,
                created_on: banner.created_on
            },
            { new: true }
        );

        res.status(200).json({ message: 'Banner updated successfully', day_ta: updatedBanner });
    } catch (error) {
        res.status(500).json({ error: 'Error updating banner', details: error.message });
    }
};

exports.getAllBanners = async (req, res) => {
    try {
        const banners = await SetupModel.Banner.find({ status: true });
        const bannersCount = await SetupModel.Banner.countDocuments({ status: true });
        res.status(200).json({
            day_ta: banners,
            TotalBannersCount: bannersCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching banners', details: error.message });
    }
};
