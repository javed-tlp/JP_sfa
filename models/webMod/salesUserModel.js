const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { getCurrentDateTime } = require("../../middlewares/dateTimeUtil");

const salesUserSchema = new mongoose.Schema(
  {
    sales_user_id: { type: Number, unique: true }, // Auto Increment ID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile_no: { type: String, required: true, unique: true },
    manager_id: { type: Number, ref: "SalesUser" }, // reference to sales_user_id
    status: { type: Boolean, default: true },
    created_on: { type: String },
    updated_on: { type: String }
  },
  { collection: "jps_sales_users" }
);

// Auto Increment Plugin
salesUserSchema.plugin(AutoIncrement, { inc_field: "sales_user_id" });

salesUserSchema.pre("save", function (next) {
  if (!this.created_on) {
    this.created_on = getCurrentDateTime();
  }
  this.updated_on = getCurrentDateTime();
  next();
});

const SalesUser = mongoose.model("SalesUser", salesUserSchema);

module.exports = SalesUser;
