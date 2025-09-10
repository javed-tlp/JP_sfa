const CustomerModel = require('../../models/webMod/customerModel');
const redeemModel = require('../../models/webMod/redeemRequestModel');
const couponModel = require('../../models/webMod/newCouponModel');
const productModel = require('../../models/webMod/productModel');
const GiftModel = require('../../models/webMod/giftModel');

exports.dashboardData = async (req, res) => {
    try {
        const topCustomers = await CustomerModel.find({status:true})
            .sort({ totalPoints: -1 })
            .limit(10)
            .select('name mobile_no totalPoints');

        const totalCarpenter = await CustomerModel.countDocuments({ status: true });
        const pendingRedeemRequest = await redeemModel.countDocuments({ status: "pending" });
        const totalCoupons = await couponModel.countDocuments();
        const scannedCoupons = await couponModel.countDocuments({ isScanned: true });
        const totalProducts = await productModel.ProductData.countDocuments();
        const totalGift = await GiftModel.countDocuments();

        const data = {
            topCustomers,
            topCustomersCount: topCustomers.length,
            totalCarpenter,
            pendingRedeemRequest,
            totalCoupons,
            scannedCoupons,
            totalProducts,
            totalGift
        };

        return res.status(200).json({ success: true, day_ta: data });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error });
    }
};
