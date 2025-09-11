// models/webMod/systemUserModel.js
const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { getCurrentDateTime } = require("../../middlewares/dateTimeUtil");

const systemUserSchema = new mongoose.Schema(
  {
    system_user_id: { type: Number, unique: true }, // auto increment
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed password
    role: { type: String, enum: ["admin", "user"], default: "user" },
    assigned_modules: [{ type: String }], // list of module keys like ["sales", "orders", "reports"]
    status: { type: Boolean, default: true },
    created_on: { type: String },
    updated_on: { type: String }
  },
  { collection: "jps_system_users" }
);

systemUserSchema.plugin(AutoIncrement, { inc_field: "system_user_id" });

systemUserSchema.pre("save", function (next) {
  if (!this.created_on) {
    this.created_on = getCurrentDateTime();
  }
  this.updated_on = getCurrentDateTime();
  next();
});

const SystemUser = mongoose.model("SystemUser", systemUserSchema);

module.exports = SystemUser;
