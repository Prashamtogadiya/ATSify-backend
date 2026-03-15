import Analysis from "../models/Analysis";
import JobRequest from "../models/JobRequest";
import Resume from "../models/Resume.model";
import User, { type UserRole } from "../models/User.model";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const sanitizePaginationNumber = (
  value: unknown,
  fallback: number,
  max?: number
) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  const safeValue = Math.max(1, Math.trunc(parsedValue));
  return max ? Math.min(safeValue, max) : safeValue;
};

export const getAdminDashboardStats = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    totalAdmins,
    totalAnalyses,
    totalJobRequests,
    totalResumes,
    analysesLast7Days,
    newUsersLast30Days,
    scoreSummary,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    Analysis.countDocuments(),
    JobRequest.countDocuments(),
    Resume.countDocuments(),
    Analysis.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Analysis.aggregate<{
      averageOverallScore: number;
      highestOverallScore: number;
    }>([
      {
        $group: {
          _id: null,
          averageOverallScore: { $avg: "$overallScore" },
          highestOverallScore: { $max: "$overallScore" },
        },
      },
    ]),
  ]);

  const averageOverallScore = Number(
    (scoreSummary[0]?.averageOverallScore ?? 0).toFixed(1)
  );
  const highestOverallScore = scoreSummary[0]?.highestOverallScore ?? 0;

  return {
    totalUsers,
    totalAdmins,
    totalAnalyses,
    totalJobRequests,
    totalResumes,
    analysesLast7Days,
    newUsersLast30Days,
    averageOverallScore,
    highestOverallScore,
  };
};

export const getPaginatedUsersForAdmin = async (
  pageInput?: unknown,
  limitInput?: unknown
) => {
  const page = sanitizePaginationNumber(pageInput, DEFAULT_PAGE);
  const limit = sanitizePaginationNumber(limitInput, DEFAULT_LIMIT, MAX_LIMIT);
  const skip = (page - 1) * limit;

  const [users, totalUsers] = await Promise.all([
    User.find({}, { password: 0, refreshToken: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(),
  ]);

  const userIds = users.map((user) => user._id);

  const [analysisCounts, jobRequestCounts, resumeCounts] = userIds.length
    ? await Promise.all([
        Analysis.aggregate<{ _id: string; count: number }>([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]),
        JobRequest.aggregate<{ _id: string; count: number }>([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]),
        Resume.aggregate<{ _id: string; count: number }>([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: "$userId", count: { $sum: 1 } } },
        ]),
      ])
    : [[], [], []];

  const analysisCountMap = new Map(
    analysisCounts.map((entry) => [String(entry._id), entry.count])
  );
  const jobRequestCountMap = new Map(
    jobRequestCounts.map((entry) => [String(entry._id), entry.count])
  );
  const resumeCountMap = new Map(
    resumeCounts.map((entry) => [String(entry._id), entry.count])
  );

  const enrichedUsers = users.map((user) => ({
    ...user,
    analysisCount: analysisCountMap.get(String(user._id)) ?? 0,
    jobRequestCount: jobRequestCountMap.get(String(user._id)) ?? 0,
    resumeCount: resumeCountMap.get(String(user._id)) ?? 0,
  }));

  const totalPages = totalUsers === 0 ? 1 : Math.ceil(totalUsers / limit);

  return {
    users: enrichedUsers,
    pagination: {
      page,
      limit,
      totalUsers,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export const updateUserRoleByAdmin = async (
  userId: string,
  role: UserRole
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.role = role;
  user.refreshToken = null;
  await user.save();

  const { password: _password, refreshToken: _refreshToken, ...safeUser } =
    user.toObject();

  return safeUser;
};