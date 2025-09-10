const Offer = require('../../models/webMod/offerModel');
const Gift = require('../../models/webMod/giftModel');
const { validationResult } = require('express-validator');

exports.createOffer = async (req, res) => {
    try {
        const { title, description, startDate, endDate, pointsRequired, gifts } = req.body;
        const giftDetails = await Gift.find({ _id: { $in: gifts } });

        if (giftDetails.length !== gifts.length) {
            return res.status(400).json({ error: 'One or more gifts not found' });
        }

        const newOffer = new Offer({
            title,
            description,
            startDate,
            endDate,
            pointsRequired,
            gifts: giftDetails
        });

        await newOffer.save();
        return res.status(201).json({ message: 'Offer created successfully', day_ta: newOffer });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

exports.getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find();
        const offersCount = await Offer.countDocuments();

        return res.status(200).json({ day_ta: offers, count:offersCount });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

const ExcelJS = require('exceljs');


exports.downloadOffersExcel = async (req, res) => {
    try {
        console.log("Starting the Excel export...");

        // Fetch the offers
        const offers = await Offer.find();
        console.log(`Offers fetched: ${offers.length} offers found.`);

        if (!offers || offers.length === 0) {
            console.log("No offers found to export.");
            return res.status(404).json({ message: 'No offers found to export.' });
        }

        // Create a new workbook and sheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Offers');
        console.log("Excel workbook and worksheet created.");

        // Define columns for the Excel sheet
        worksheet.columns = [
            { header: 'Offer ID', key: 'offer_id', width: 10 },
            { header: 'Title', key: 'title', width: 20 },
            { header: 'Description', key: 'description', width: 30 },
            { header: 'Start Date', key: 'startDate', width: 20 },
            { header: 'End Date', key: 'endDate', width: 20 },
            { header: 'Points Required', key: 'pointsRequired', width: 15 },
            { header: 'Status', key: 'status', width: 10 },
            { header: 'Created On', key: 'created_on', width: 20 },
            { header: 'Updated On', key: 'updated_on', width: 20 }
        ];
        console.log("Excel columns defined.");

        // Add data rows
        offers.forEach(offer => {
            console.log(`Adding offer: ${offer.offer_id}`);
            worksheet.addRow({
                offer_id: offer.offer_id,
                title: offer.title,
                description: offer.description,
                startDate: offer.startDate,
                endDate: offer.endDate,
                pointsRequired: offer.pointsRequired,
                status: offer.status ? 'Active' : 'Inactive',
                created_on: offer.created_on,
                updated_on: offer.updated_on
            });
        });
        console.log("Offer data rows added to the worksheet.");

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Offers.xlsx"`);
        console.log("Response headers set for download.");

        // Writing the workbook to a file first (for testing purposes)
        // const filePath = './Offers.xlsx';
        // await workbook.xlsx.writeFile(filePath);
        // console.log(`File written to ${filePath}`);

        // Write the workbook to the response stream
        await workbook.xlsx.write(res);
        console.log("Workbook written to response.");
        res.end();  // Ensure the response ends after writing the file
    } catch (error) {
        console.error('Error exporting offers:', error);
        res.status(500).json({ error: 'Failed to export offers', details: error.message });
    }
};





exports.getOfferById = async (req, res) => {
    try {
        const offer = await Offer.findOne({ _id: req.body._id });
        if (!offer) return res.status(404).json({ error: 'Offer not found' });
        return res.status(200).json({ day_ta: offer });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.updateOffer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { _id, title, description, startDate, endDate, pointsRequired, gifts, status } = req.body;

        const offer = await Offer.findOneAndUpdate(
            { _id },
            { title, description, startDate, endDate, pointsRequired, gifts, status },
            { new: true }
        );

        if (!offer) return res.status(404).json({ error: 'Offer not found' });
        return res.status(200).json({ message: 'Offer updated successfully', day_ta: offer });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};



exports.deleteOffer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const offer = await Offer.findOneAndUpdate(
            { _id: req.body._id },
            { status: false },  // Soft delete by setting status to false
            { new: true }
        );

        if (!offer) return res.status(404).json({ error: 'Offer not found' });
        return res.status(200).json({ message: 'Offer deleted successfully', day_ta: offer });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};


