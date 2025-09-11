// controller/webCon/systemUserController.js
const SystemUser = require("../../models/webMod/systemUserModel");

// ✅ Add System User
exports.addSystemUser = async (req, res) => {
  try {
    const { name, email, password, role, assigned_modules } = req.body;

    const user = new SystemUser({ name, email, password, role, assigned_modules });
    await user.save();

    res.status(201).json({ success: true, message: "System user created", data: user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update Assigned Modules
exports.assignModules = async (req, res) => {
  try {
    const { system_user_id, assigned_modules } = req.body;

    const user = await SystemUser.findOneAndUpdate(
      { system_user_id },
      { assigned_modules },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "System user not found" });

    res.json({ success: true, message: "Modules updated successfully", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get System User by ID
exports.getSystemUserById = async (req, res) => {
  try {
    const { system_user_id } = req.body;

    const user = await SystemUser.findOne({ system_user_id });

    if (!user) return res.status(404).json({ success: false, message: "System user not found" });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
