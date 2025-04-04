"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  BarChart2,
  Briefcase,
  Users,
  Check,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { logger } from "@/lib/logger";
import { TechCard } from "@/components/ui/TechCard";
import { useToast } from "@/components/ui/use-toast";

interface DashboardStats {
  totalJobs?: number;
  activeJobs?: number;
  applications?: number;
  completedJobs?: number;
  pendingReviews?: number;
}

interface RecentActivity {
  id: string;
  type: "application" | "job" | "message" | "review";
  title: string;
  date: string;
  status?: string;
  description?: string;
}

export default function Dashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Don't fetch data until we have session information
    if (sessionStatus === "loading") return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Fetch stats and activity data in parallel
        const [statsResponse, activityResponse] = await Promise.all([
          fetch("/api/dashboard/stats", {
            headers: {
              "Cache-Control": "no-cache",
            },
          }),
          fetch("/api/dashboard/activity", {
            headers: {
              "Cache-Control": "no-cache",
            },
          }),
        ]);

        // Check for errors in the stats response
        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(
            errorData.message || "Failed to fetch dashboard statistics"
          );
        }

        const statsData = await statsResponse.json();
        setStats(statsData);

        // Handle activity data with fallback for development
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData.activities || []);
        } else {
          logger.warn("Using mock activity data due to API error");
          // Mock data for development
          setRecentActivity([
            {
              id: "1",
              type: "application",
              title: "Your application was accepted",
              date: new Date().toISOString(),
              status: "ACCEPTED",
              description: "Web Development Project",
            },
            {
              id: "2",
              type: "job",
              title: "New job matching your skills",
              date: new Date(Date.now() - 86400000).toISOString(),
              description: "Mobile App Developer needed",
            },
            {
              id: "3",
              type: "message",
              title: "New message received",
              date: new Date(Date.now() - 172800000).toISOString(),
              description: "From: John Smith",
            },
          ]);
        }
      } catch (error) {
        logger.error("Error fetching dashboard data:", error as Error);
        setError(
          "Failed to load dashboard data. Please refresh and try again."
        );
        toast({
          title: "Error loading dashboard",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [sessionStatus, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case "application":
        return status === "ACCEPTED" ? (
          <Check className="text-green-500" />
        ) : (
          <Clock className="text-blue-500" />
        );
      case "job":
        return <Briefcase className="text-purple-500" />;
      case "message":
        return <Users className="text-indigo-500" />;
      case "review":
        return <AlertCircle className="text-yellow-500" />;
      default:
        return <Clock className="text-gray-500" />;
    }
  };

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {session?.user?.name || "User"}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with your{" "}
            {session?.user?.role === "CLIENT" ? "projects" : "applications"}{" "}
            today.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          {session?.user?.role === "CLIENT" ? (
            <Link href="/dashboard/post-job">
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2">
                <Briefcase size={18} />
                Post a New Job
              </button>
            </Link>
          ) : (
            <Link href="/jobs">
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2">
                <Briefcase size={18} />
                Find Jobs
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {session?.user?.role === "CLIENT" ? (
          <>
            <StatCard
              title="Total Jobs Posted"
              value={stats.totalJobs || 0}
              description="Jobs you have posted"
              icon={<Briefcase className="text-blue-500" size={24} />}
            />
            <StatCard
              title="Active Jobs"
              value={stats.activeJobs || 0}
              description="Jobs currently open"
              icon={<Clock className="text-green-500" size={24} />}
            />
            <StatCard
              title="Total Applications"
              value={stats.applications || 0}
              description="Applications received"
              icon={<Users className="text-purple-500" size={24} />}
            />
            <StatCard
              title="Completed Jobs"
              value={stats.completedJobs || 0}
              description="Successfully completed jobs"
              icon={<Check className="text-indigo-500" size={24} />}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Applied Jobs"
              value={stats.totalJobs || 0}
              description="Jobs you applied to"
              icon={<Briefcase className="text-blue-500" size={24} />}
            />
            <StatCard
              title="Active Applications"
              value={stats.activeJobs || 0}
              description="Applications in review"
              icon={<Clock className="text-yellow-500" size={24} />}
            />
            <StatCard
              title="Accepted Applications"
              value={stats.applications || 0}
              description="Applications accepted"
              icon={<Check className="text-green-500" size={24} />}
            />
            <StatCard
              title="Completed Jobs"
              value={stats.completedJobs || 0}
              description="Jobs you've completed"
              icon={<CalendarDays className="text-indigo-500" size={24} />}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {session?.user?.role === "CLIENT"
                  ? "Recent Job Postings"
                  : "Recommended Jobs"}
              </h2>
              <Link
                href={
                  session?.user?.role === "CLIENT"
                    ? "/dashboard/my-jobs"
                    : "/jobs"
                }
                className="text-primary hover:text-primary/80 text-sm flex items-center"
              >
                View All <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            {(session?.user?.role === "CLIENT"
              ? stats.totalJobs
              : stats.totalJobs) === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {session?.user?.role === "CLIENT"
                    ? "No jobs posted yet"
                    : "No recommended jobs yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {session?.user?.role === "CLIENT"
                    ? "Start posting jobs to find talented freelancers."
                    : "Complete your profile to get job recommendations."}
                </p>
                <Link
                  href={
                    session?.user?.role === "CLIENT"
                      ? "/dashboard/post-job"
                      : "/profile"
                  }
                >
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                    {session?.user?.role === "CLIENT"
                      ? "Post a Job"
                      : "Update Profile"}
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* This would be replaced with actual job data */}
                <div className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-medium">Web Development Project</h3>
                    <p className="text-gray-500 text-sm">
                      Posted 2 days ago · 5 applications
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      OPEN
                    </span>
                    <Link href={`/jobs/sample-id`}>
                      <button className="text-primary hover:text-primary/80 text-sm">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-medium">UI/UX Designer Needed</h3>
                    <p className="text-gray-500 text-sm">
                      Posted 4 days ago · 3 applications
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      OPEN
                    </span>
                    <Link href={`/jobs/sample-id-2`}>
                      <button className="text-primary hover:text-primary/80 text-sm">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <TechCard className="p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CalendarDays
                  size={48}
                  className="mx-auto text-gray-400 mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No recent activity
                </h3>
                <p className="text-gray-500">
                  Your recent activities will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="bg-gray-100 p-2 rounded-full">
                      {getActivityIcon(activity.type, activity.status)}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{activity.title}</h3>
                      {activity.description && (
                        <p className="text-gray-500 text-xs">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-gray-400 text-xs mt-1">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TechCard>
        </div>
      </div>

      <div className="mt-8">
        <TechCard className="p-6 bg-white/80 backdrop-blur-sm shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {session?.user?.role === "CLIENT"
                ? "Quick Actions"
                : "Tips & Resources"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {session?.user?.role === "CLIENT" ? (
              <>
                <Link href="/dashboard/post-job">
                  <div className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer relative bg-white/70 backdrop-blur-sm">
                    <Briefcase className="text-primary mb-2" size={24} />
                    <h3 className="font-medium">Post a New Job</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Create a new job posting to find freelancers
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity"></div>
                  </div>
                </Link>
                <Link href="/dashboard/my-jobs">
                  <div className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer relative bg-white/70 backdrop-blur-sm">
                    <BarChart2 className="text-primary mb-2" size={24} />
                    <h3 className="font-medium">Manage Jobs</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Review and manage your job postings
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity"></div>
                  </div>
                </Link>
                <Link href="/profile">
                  <div className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer relative bg-white/70 backdrop-blur-sm">
                    <Users className="text-primary mb-2" size={24} />
                    <h3 className="font-medium">Update Profile</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Keep your profile information up to date
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity"></div>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/jobs">
                  <div className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer relative bg-white/70 backdrop-blur-sm">
                    <Briefcase className="text-primary mb-2" size={24} />
                    <h3 className="font-medium">Find Jobs</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Browse available jobs that match your skills
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity"></div>
                  </div>
                </Link>
                <Link href="/profile">
                  <div className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer relative bg-white/70 backdrop-blur-sm">
                    <Users className="text-primary mb-2" size={24} />
                    <h3 className="font-medium">Update Profile</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Improve your profile to attract more clients
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity"></div>
                  </div>
                </Link>
                <Link href="/dashboard/my-applications">
                  <div className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer relative bg-white/70 backdrop-blur-sm">
                    <BarChart2 className="text-primary mb-2" size={24} />
                    <h3 className="font-medium">View Applications</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Check the status of your job applications
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity"></div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </TechCard>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <TechCard className="p-6">
      <div className="flex items-center">
        <div className="bg-white/20 p-4 rounded-full mr-4">{icon}</div>
        <div>
          <h3 className="font-semibold text-lg text-white">{title}</h3>
          <p className="text-sm text-gray-300">{description}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </TechCard>
  );
}
