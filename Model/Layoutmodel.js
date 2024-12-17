const mongoose = require("mongoose");

const LayoutSchema = new mongoose.Schema(
  {
    layout: {
      type: Array,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencing User schema
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Layout", LayoutSchema);
