const Snapshot = require("../models/Snapshot");

// Allowable ranges
const validRanges = ["24h", "7d", "30d", "all"];

const getTimeWindow = (range) => {
  const now = new Date();
  switch (range) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "all":
      return new Date(0); // from epoch start
  }
};

exports.getPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { range = "7d" } = req.query;

    // Validate range input
    if (!validRanges.includes(range)) {
      return res.status(400).json({
        error: "Invalid range. Use one of: 24h, 7d, 30d, all",
      });
    }

    const startTime = getTimeWindow(range);

    const snapshots = await Snapshot.find({
      portfolioId: id,
      timestamp: { $gte: startTime },
    }).sort({ timestamp: 1 });

    const formatted = snapshots
      .filter((s) => Number(s.totalValue) > 0) 
      .map((s) => ({
        timestamp: s.timestamp,
        value: Number(s.totalValue),
      }));

    res.json({ data: formatted });
  } catch (err) {
    console.error("[Performance API] Error:", err);
    res.status(500).json({ error: "Failed to fetch performance data" });
  }
};
