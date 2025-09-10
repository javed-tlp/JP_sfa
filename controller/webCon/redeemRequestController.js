const RedeemRequest = require('../../models/webMod/redeemRequestModel');

// Accept or reject a redeem request by _id
exports.updateRedeemRequestStatus = async (req, res) => {
    try {
        const { _id, status } = req.body; // Expecting _id and status in the request body

        // Validate status input
        if (!['pending', 'accepted', 'discarded'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be either "pending", "accepted", or "discarded".' });
        }

        // Find the redeem request by _id
        const redeemRequest = await RedeemRequest.findById(_id);
        console.log("Redeem Request Found:", redeemRequest);

        if (!redeemRequest) {
            return res.status(404).json({ error: 'Redeem request not found' });
        }

        // Update the status
        redeemRequest.status = status;
        await redeemRequest.save();

        return res.status(200).json({ message: `Redeem request ${status} successfully`, day_ta: redeemRequest });
    } catch (error) {
        console.error("Error updating redeem request status:", error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Coupon Controller - Get all redeem requests
exports.getAllRedeemRequests = async (req, res) => {
    try {
        // Fetch all redeem requests from the RedeemRequestModel
        const redeemRequests = await RedeemRequest.find({});
        
        // Get the total count of redeem requests
        const redeemRequestCount = await RedeemRequest.countDocuments();

        if (redeemRequests.length === 0) {
            return res.status(404).json({
                message: "No redeem requests found",
                status: "error",
            });
        }

        // Return the redeem requests and the total count in the response
        res.status(200).json({
            message: "Redeem requests retrieved successfully",
            status: "success",
            count: redeemRequestCount, // Add the count of redeem requests
            day_ta: redeemRequests // Return the redeem requests as is
        });

    } catch (error) {
        console.error("Error retrieving redeem requests:", error);
        res.status(500).json({
            message: "An error occurred while retrieving redeem requests",
            status: "error",
            error: { code: error.code, message: error.message }
        });
    }
};
