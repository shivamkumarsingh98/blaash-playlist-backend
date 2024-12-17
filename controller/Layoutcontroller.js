const Layout = require("../Model/Layoutmodel");

const saveLayout = async (req, res) => {
  try {
    const { layout } = req.body;
    console.log(layout);
    if (!req.user) {
      return res.status(400).json({ error: "User not authenticated" });
    }
    const userId = req.user.id;
    const newLayout = new Layout({ layout, user: userId });
    const savedLayout = await newLayout.save();
    res.status(200).json({
      message: "Layout saved successfully",
      layout: savedLayout.layout,
    });
    console.log("Layout saved successfully");
  } catch (error) {
    console.error("Error saving layout:", error.message);
    res
      .status(500)
      .json({ error: "Failed to save layout", error: error.message });
  }
};

const loadLayout = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({ error: "User not authenticated" });
    }
    const userId = req.user.id;
    const layout = await Layout.findOne({ user: userId }).sort({
      createdAt: -1,
    });
    if (!layout) {
      return res.status(404).json({ error: "No layout found for this user" });
    }
    res.status(200).json({message: "Layout loaded successfully",layout});
  } catch (error) {
    console.error("Error loading layout:", error.message);
    res
      .status(500)
      .json({ error: "Failed to load layout", error: error.message });
  }
};

module.exports = { saveLayout, loadLayout };
