const Reel = require("../models/Reel");

// Random user generator
function getRandomUser() {
  const users = ["Abhinav", "Priya", "Rahul", "Sneha", "VLMGuest"];
  return users[Math.floor(Math.random() * users.length)];
}

// Get all reels
exports.getReels = async (req, res) => {
  try {
    const reels = await Reel.find();
    res.json(reels.map(r => ({
      id: r._id,
      creator: r.creator,
      caption: r.caption,
      likes: r.likes,
      comments: r.comments,
      shares: r.shares,
      views: r.views,
      videoUrl: r.videoUrl,
      status: r.status // 0 = reject, 1 = approved
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new reel
exports.createReel = async (req, res) => {
  try {
    const reel = new Reel(req.body);
    await reel.save();
    res.status(201).json(reel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Like / Comment / Share in single API
exports.updateReelAction = async (req, res) => {
  try {
    const { action, text } = req.body; // action = "like" | "comment" | "share"
    const reel = await Reel.findById(req.params.id);

    if (!reel) return res.status(404).json({ message: "Reel not found" });

    switch (action) {
      case "like":
        reel.likes += 1;
        break;
      case "comment":
        reel.comments += 1;
        reel.lastComment = text || null;
        break;
      case "share":
        reel.shares += 1;
        break;
      default:
        return res.status(400).json({ message: "Invalid action" });
    }

    await reel.save();
    res.json({ message: `Reel ${action}d successfully!`, reel });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin approve/reject reel (status = 0 or 1)
exports.updateReelStatus = async (req, res) => {
  try {
    const { status } = req.body; // 0 or 1
    const reel = await Reel.findById(req.params.id);

    if (!reel) return res.status(404).json({ message: "Reel not found" });
    if (![0, 1].includes(status)) {
      return res.status(400).json({ message: "Invalid status, use 0 or 1" });
    }

    reel.status = status;
    await reel.save();

    res.json({ message: "Reel status updated!", reel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
