"use client";

import { useState } from "react";
import { JobCard } from "./JobCard";
import { JobWithCreator } from "@/types/job";
import { toast } from "react-hot-toast";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import these directly to avoid the issue
enum JobType {
  REMOTE = "REMOTE",
  ONSITE = "ONSITE",
  HYBRID = "HYBRID",
}

enum JobCategory {
  WEB_DEVELOPMENT = "WEB_DEVELOPMENT",
  MOBILE_DEVELOPMENT = "MOBILE_DEVELOPMENT",
  UI_UX_DESIGN = "UI_UX_DESIGN",
  DATA_SCIENCE = "DATA_SCIENCE",
  MACHINE_LEARNING = "MACHINE_LEARNING",
  BLOCKCHAIN = "BLOCKCHAIN",
  DEVOPS = "DEVOPS",
  QA_TESTING = "QA_TESTING",
  CYBER_SECURITY = "CYBER_SECURITY",
  CONTENT_WRITING = "CONTENT_WRITING",
  OTHER = "OTHER",
}

interface JobSearchSectionProps {
  initialJobs: JobWithCreator[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalJobs: number;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalJobs: number;
}

export function JobSearchSection({
  initialJobs,
  pagination,
}: JobSearchSectionProps) {
  const [jobs, setJobs] = useState<JobWithCreator[]>(initialJobs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    query: "",
    type: "all",
    minBudget: "",
    maxBudget: "",
    category: "all",
    experienceLevel: "all",
    skills: "",
    sortBy: "recent",
    location: "",
    duration: "",
  });
  const [paginationState, setPaginationState] = useState<PaginationInfo>(
    pagination || {
      currentPage: 1,
      totalPages: 1,
      totalJobs: initialJobs.length,
    }
  );

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Reset to first page when filters change
    setPaginationState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const validateFilters = () => {
    const minBudget = Number(filters.minBudget);
    const maxBudget = Number(filters.maxBudget);

    if (filters.minBudget && isNaN(minBudget)) {
      throw new Error("Minimum budget must be a number");
    }

    if (filters.maxBudget && isNaN(maxBudget)) {
      throw new Error("Maximum budget must be a number");
    }

    if (minBudget > maxBudget && maxBudget > 0) {
      throw new Error("Minimum budget cannot be greater than maximum budget");
    }
  };

  // Helper function to convert JobWithCreator to the format expected by JobCard
  const formatJobForCard = (job: JobWithCreator, index: number) => {
    return {
      job: {
        ...job,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      },
      index,
    };
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      validateFilters();

      const queryParams = new URLSearchParams();
      if (filters.query) queryParams.append("query", filters.query);
      if (filters.type !== "all") queryParams.append("type", filters.type);
      if (filters.minBudget) queryParams.append("minBudget", filters.minBudget);
      if (filters.maxBudget) queryParams.append("maxBudget", filters.maxBudget);
      if (filters.category !== "all")
        queryParams.append("category", filters.category);
      if (filters.experienceLevel !== "all")
        queryParams.append("experienceLevel", filters.experienceLevel);
      if (filters.skills) queryParams.append("skills", filters.skills);
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
      if (filters.location) queryParams.append("location", filters.location);
      if (filters.duration) queryParams.append("duration", filters.duration);
      queryParams.append("page", paginationState.currentPage.toString());
      queryParams.append("limit", "10");

      const response = await fetch(`/api/jobs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data.jobs);
      setPaginationState({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalJobs: data.total,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (
      filters.query ||
      filters.type !== "all" ||
      filters.category !== "all" ||
      filters.minBudget ||
      filters.maxBudget ||
      filters.skills ||
      filters.experienceLevel !== "all" ||
      filters.location ||
      filters.duration
    ) {
      // If there are active filters, use client-side pagination via API
      setPaginationState((prev) => ({ ...prev, currentPage: newPage }));
      // Then call the search API with the new page
      handleSearch();
    } else {
      // For basic pagination without filters, use server-side navigation
      window.location.href = `/jobs?page=${newPage}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {/* Basic Search Section */}
        <div className="flex gap-4">
          <input
            type="text"
            name="query"
            placeholder="Search jobs..."
            value={filters.query}
            onChange={handleFilterChange}
            className="flex-1 border rounded-lg p-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            aria-label="Search jobs"
          />
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
          >
            {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg">
            {/* Existing Filters */}
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full border rounded-lg p-2 bg-gray-700 border-gray-600 text-white"
              aria-label="Job type"
            >
              <option value="all">All Types</option>
              {(Object.values(JobType) as JobType[]).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full border rounded-lg p-2 bg-gray-700 border-gray-600 text-white"
              aria-label="Job category"
            >
              <option value="all">All Categories</option>
              {(Object.values(JobCategory) as JobCategory[]).map((category) => (
                <option key={category} value={category}>
                  {category
                    .split("_")
                    .map(
                      (word: string) =>
                        word.charAt(0) + word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </option>
              ))}
            </select>

            {/* Duration Filter */}
            <select
              name="duration"
              value={filters.duration}
              onChange={handleFilterChange}
              className="w-full border rounded-lg p-2 bg-gray-700 border-gray-600 text-white"
              aria-label="Project duration"
            >
              <option value="">Any Duration</option>
              <option value="30">Up to 1 month</option>
              <option value="90">1-3 months</option>
              <option value="180">3-6 months</option>
              <option value="181">More than 6 months</option>
            </select>

            <button
              onClick={handleSearch}
              className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
              disabled={loading}
              aria-label="Search"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-6">
        {jobs.length === 0 ? (
          <div className="text-center p-8 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">No jobs found</h2>
            <p className="text-gray-400">
              Try adjusting your search criteria or check back later for new
              opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <JobCard key={job.id} {...formatJobForCard(job, index)} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginationState.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(paginationState.currentPage - 1)}
              disabled={paginationState.currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1">
              {Array.from(
                { length: paginationState.totalPages },
                (_, i) => i + 1
              )
                .filter(
                  (page) =>
                    page === 1 ||
                    page === paginationState.totalPages ||
                    Math.abs(page - paginationState.currentPage) <= 1
                )
                .map((page, i, arr) => {
                  // Add ellipsis when there are skipped pages
                  if (i > 0 && page - arr[i - 1] > 1) {
                    return (
                      <span
                        key={`ellipsis-${page}`}
                        className="px-4 py-2 text-gray-500"
                      >
                        ...
                      </span>
                    );
                  }
                  return (
                    <Button
                      key={page}
                      variant={
                        page === paginationState.currentPage
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handlePageChange(page)}
                      className="min-w-[40px]"
                      aria-label={`Page ${page}`}
                      aria-current={
                        page === paginationState.currentPage
                          ? "page"
                          : undefined
                      }
                    >
                      {page}
                    </Button>
                  );
                })}
            </div>
            <Button
              variant="outline"
              onClick={() => handlePageChange(paginationState.currentPage + 1)}
              disabled={
                paginationState.currentPage === paginationState.totalPages
              }
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
