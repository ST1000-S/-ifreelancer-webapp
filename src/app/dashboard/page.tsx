"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalJobs?: number;
  activeJobs?: number;
  applications?: number;
  completedJobs?: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Welcome back, {session?.user?.name}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {session?.user?.role === "CLIENT" ? (
          <>
            <StatCard
              title="Total Jobs Posted"
              value={stats.totalJobs || 0}
              description="Jobs you have posted"
            />
            <StatCard
              title="Active Jobs"
              value={stats.activeJobs || 0}
              description="Jobs currently open"
            />
            <StatCard
              title="Total Applications"
              value={stats.applications || 0}
              description="Applications received"
            />
            <StatCard
              title="Completed Jobs"
              value={stats.completedJobs || 0}
              description="Successfully completed jobs"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Available Jobs"
              value={stats.totalJobs || 0}
              description="Jobs matching your skills"
            />
            <StatCard
              title="My Applications"
              value={stats.applications || 0}
              description="Jobs you've applied to"
            />
            <StatCard
              title="Active Jobs"
              value={stats.activeJobs || 0}
              description="Jobs in progress"
            />
            <StatCard
              title="Completed Jobs"
              value={stats.completedJobs || 0}
              description="Successfully completed jobs"
            />
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {session?.user?.role === "CLIENT"
            ? "Recent Job Postings"
            : "Recommended Jobs"}
        </h2>
        <div className="text-gray-500">
          {session?.user?.role === "CLIENT" ? (
            <p>Your recent job postings will appear here.</p>
          ) : (
            <p>Jobs matching your skills will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-3xl font-bold text-primary mt-2">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}
