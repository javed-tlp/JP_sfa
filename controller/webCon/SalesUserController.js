// controller/webCon/salesUserController.js
const SalesUser = require("../../models/webMod/salesUserModel");

exports.addSalesUser = async (req, res) => {
  try {
    const { name, email, mobile_no, manager_id, status } = req.body;

    const user = new SalesUser({ name, email, mobile_no, manager_id, status });
    await user.save();

    res.status(201).json({
      success: true,
      message: "✅ Sales user created successfully",
      data: user
    });
  } catch (err) {
    if (err.code === 11000) {
      // Handle duplicate key error
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists, please use another one`
      });
    }

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.updateSalesUser = async (req, res) => {
  try {
    const { sales_user_id, name, email, mobile_no, manager_id, status } = req.body;

    // Find by sales_user_id instead of Mongo's _id
    const user = await SalesUser.findOneAndUpdate(
      { sales_user_id: sales_user_id },
      { name, email, mobile_no, manager_id, status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "❌ Sales user not found" });
    }

    res.json({
      success: true,
      message: "✅ Sales user updated successfully",
      data: user
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists, please use another one`
      });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};


exports.deleteSalesUser = async (req, res) => {
    try {
        const { _id } = req.body;

        const user = await SalesUser.findByIdAndUpdate(_id, { status: false }, { new: true });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, message: "Sales user deactivated", data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllSalesUsers = async (req, res) => {
  try {
    const { limit = 10, start = 0, filters = {} } = req.body;

    // Build query dynamically using Mongo field names
    let query = {};
    for (let key in filters) {
      if (filters[key]) {
        const value = filters[key].toString().trim();
        query[key] = { $regex: value, $options: "i" }; // case-insensitive
      }
    }

    console.log("Filters received:", filters);
    console.log("Mongo query:", query);

    // Fetch users with pagination
    const users = await SalesUser.find(query)
      .skip(parseInt(start))
      .limit(parseInt(limit));

    // If no users found, return empty
    if (!users.length) {
      return res.json({ success: true, structure: [], data: [] });
    }

    // Dynamically get all keys from first document
    const mongoKeys = Object.keys(users[0].toObject());

    // Build table structure dynamically
    const table_Structure = [
      { name: "S.no" },
      ...mongoKeys.map(key => ({
        name: key,
        filter_Slug: key,
        sort: true,
        search: true
      })),
      { name: "Action", value: "", filter_Slug: "reset", sort: false, search: false }
    ];

    // Prepare data for frontend (keep Mongo fields as-is)
    const table_Data = users.map(u => ({
      ...u.toObject(),
      action: ["Edit", "Delete"] // always add Action column
    }));

    res.json({
      success: true,
      structure: table_Structure,
      data: table_Data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// exports.getAllSalesUsers = async (req, res) => {
//     try {
//         const { limit = 10, start = 0 } = req.body;

//         const users = await SalesUser.find()
//             .skip(parseInt(start))
//             .limit(parseInt(limit));

//         res.json({ success: true, data: users });
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message });
//     }
// };

exports.getSalesUserById = async (req, res) => {
    try {
        const { _id } = req.body;

        const user = await SalesUser.findById(_id);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
