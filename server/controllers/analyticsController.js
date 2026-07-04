const asyncHandler = require("../utils/asyncHandler");
const Document = require("../models/Document");

// @route GET /api/analytics/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalDocuments, riskBreakdown, typeBreakdown, recentDocuments, avgRiskAgg] = await Promise.all([
    Document.countDocuments({ user: userId, status: "completed" }),
    Document.aggregate([
      { $match: { user: userId, status: "completed" } },
      { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
    ]),
    Document.aggregate([
      { $match: { user: userId, status: "completed" } },
      { $group: { _id: "$documentType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    Document.find({ user: userId }).sort({ createdAt: -1 }).limit(5).select("originalFileName riskScore riskLevel status createdAt"),
    Document.aggregate([
      { $match: { user: userId, status: "completed" } },
      { $group: { _id: null, avgRisk: { $avg: "$riskScore" } } },
    ]),
  ]);

  const riskLevels = { low: 0, medium: 0, high: 0 };
  riskBreakdown.forEach((r) => {
    if (r._id) riskLevels[r._id] = r.count;
  });

  res.status(200).json({
    totalDocuments,
    averageRiskScore: avgRiskAgg[0] ? Math.round(avgRiskAgg[0].avgRisk) : 0,
    riskLevels,
    documentTypes: typeBreakdown.map((t) => ({ type: t._id || "Other", count: t.count })),
    recentDocuments,
  });
});

module.exports = { getDashboardStats };
