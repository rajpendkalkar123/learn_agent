"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  Award,
  TrendingUp,
  BookOpen,
  Code,
  CheckCircle,
  Target,
  ArrowLeft,
} from "lucide-react";

interface DashboardData {
  totalProjects: number;
  totalModulesLearned: number;
  totalTimeSpent: number;
  avgCheckpointScore: number;
  completedPaths: number;
  inProgressPaths: number;
  badges: string[];
  recentActivity: any[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from API
    // For now, using mock data
    setTimeout(() => {
      setDashboardData({
        totalProjects: 3,
        totalModulesLearned: 12,
        totalTimeSpent: 840, // minutes
        avgCheckpointScore: 87,
        completedPaths: 1,
        inProgressPaths: 2,
        badges: ["Fast Learner", "Code Master", "Architecture Pro"],
        recentActivity: [
          {
            type: "completed",
            module: "User Authentication",
            project: "E-Commerce Platform",
            timestamp: "2 hours ago",
          },
          {
            type: "checkpoint",
            module: "Product API",
            score: 95,
            timestamp: "5 hours ago",
          },
          {
            type: "started",
            module: "Shopping Cart",
            project: "E-Commerce Platform",
            timestamp: "1 day ago",
          },
        ],
      });
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">No data available</div>
      </div>
    );
  }

  const stats = [
    {
      icon: <Code className="w-6 h-6" />,
      label: "Projects",
      value: dashboardData.totalProjects,
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: "Modules Learned",
      value: dashboardData.totalModulesLearned,
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: "Hours Spent",
      value: Math.floor(dashboardData.totalTimeSpent / 60),
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: "Avg Score",
      value: `${dashboardData.avgCheckpointScore}%`,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Learning Dashboard</h1>
              <p className="text-slate-400 mt-1">
                Track your progress and achievements
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Knowledge Level</div>
            <div className="text-lg font-semibold text-blue-400 capitalize">
              {(session?.user as any)?.knowledgeLevel || "Intermediate"}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-xl"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-4`}
              >
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Learning Paths */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 rounded-xl"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Learning Paths
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Completed</span>
                  <span className="text-green-400 font-semibold">
                    {dashboardData.completedPaths}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-1/3" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">In Progress</span>
                  <span className="text-blue-400 font-semibold">
                    {dashboardData.inProgressPaths}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-2/3" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-6 rounded-xl"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Badges Earned
            </h2>
            <div className="space-y-3">
              {dashboardData.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20"
                >
                  <Award className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span className="text-sm text-white">{badge}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass p-6 rounded-xl"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Performance
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Checkpoint Success Rate</span>
                  <span className="text-green-400 font-semibold">
                    {dashboardData.avgCheckpointScore}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${dashboardData.avgCheckpointScore}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <div className="text-sm text-slate-400 mb-2">Total Learning Time</div>
                <div className="text-2xl font-bold text-white">
                  {Math.floor(dashboardData.totalTimeSpent / 60)}h{" "}
                  {dashboardData.totalTimeSpent % 60}m
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass p-6 rounded-xl"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {dashboardData.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === "completed"
                      ? "bg-green-500/20"
                      : activity.type === "checkpoint"
                      ? "bg-yellow-500/20"
                      : "bg-blue-500/20"
                  }`}
                >
                  {activity.type === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : activity.type === "checkpoint" ? (
                    <Award className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium mb-1">
                    {activity.type === "completed" && `Completed ${activity.module}`}
                    {activity.type === "checkpoint" &&
                      `Scored ${activity.score}% on ${activity.module}`}
                    {activity.type === "started" && `Started ${activity.module}`}
                  </div>
                  {activity.project && (
                    <div className="text-sm text-slate-400">{activity.project}</div>
                  )}
                  <div className="text-xs text-slate-500 mt-1">
                    {activity.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
