const Gift = require('../../models/webMod/giftModel');

exports.addGift = async (req, res) => {
    try {
        const { name, description, points } = req.body;
        const image_path = req.file ? req.file.path : null;

        if (!points) return res.status(400).json({ error: 'Points are required' });

        const newGift = new Gift({ name, description, image_path, points });
        await newGift.save();

        return res.status(201).json({ message: 'Gift added successfully', day_ta: newGift });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

exports.updateGift = async (req, res) => {
    try {
        const { _id, name, description, points } = req.body;
        const image_path = req.file ? req.file.path : undefined;

        const updatedGift = await Gift.findOneAndUpdate(
            { _id },
            { name, description, points, image_path },
            { new: true }
        );

        if (!updatedGift) return res.status(404).json({ error: 'Gift not found' });
        return res.status(200).json({ message: 'Gift updated successfully', day_ta: updatedGift });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

exports.deleteGift = async (req, res) => {
    try {
        const { _id } = req.body;
        const deletedGift = await Gift.findOneAndUpdate(
            { _id },
            { status: false },
            { new: true }
        );
        if (!deletedGift) return res.status(404).json({ error: 'Gift not found' });
        return res.status(200).json({ message: 'Gift deleted successfully', day_ta: deletedGift });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

exports.giftdetails = async (req, res) => {
    try {
        const { _id } = req.body;

        const giftdetailss = await Gift.findOne({ _id, status: true });

        if (!giftdetailss) return res.status(404).json({ error: 'Gift not found' });
        
        return res.status(200).json({
            message: 'Gift details fetched successfully',
            day_ta: giftdetailss
        });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

const createGiftFilter = (body) => {
    const filter = { status: true };

    if (body.name) {
        filter.name = new RegExp(body.name, 'i');
    }

    return filter;
};

exports.getAllGifts = async (req, res) => {
    try {
        const { start, limit } = req.body;

        if (start === undefined || limit === undefined) {
            return res.status(400).json({
                success: false,
                message: 'You need to provide both start and limit in the request body.'
            });
        }

        const parsedStart = parseInt(start, 10);
        const parsedLimit = parseInt(limit, 10);

        if (isNaN(parsedStart) || parsedStart < 0) {
            return res.status(400).json({
                success: false,
                message: 'Start should be a non-negative integer.'
            });
        }

        if (isNaN(parsedLimit) || parsedLimit < 1) {
            return res.status(400).json({
                success: false,
                message: 'Limit must be a positive integer.'
            });
        }

        const filter = createGiftFilter(req.body);

        const gifts = await Gift.find(filter)
            .skip(parsedStart)
            .limit(parsedLimit);

        const totalGifts = await Gift.countDocuments(filter);

        const totalPages = Math.ceil(totalGifts / parsedLimit);

        res.status(200).json({
            success: true,
            day_ta: gifts,
            pagination: {
                day_ta:totalGifts,
                totalPages,
                currentPage: Math.floor(parsedStart / parsedLimit) + 1,
                perPage: parsedLimit,
            }
        });
    } catch (error) {
        console.error('Error fetching gifts:', error);
        res.status(500).json({ success: false, message: 'Something went wrong on the server.' });
    }
};
