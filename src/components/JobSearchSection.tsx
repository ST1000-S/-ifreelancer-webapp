"use client";

import { useState } from "react";
import { JobCard } from "./JobCard";
import { JobWithCreator } from "@/types/job";
import { toast } from "react-hot-toast";
import { JobType, JobCategory } from "@prisma/client";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface JobSearchSectionProps {
  initialJobs: JobWithCreator[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalJobs: number;
}

export function JobSearchSection({ initialJobs }: JobSearchSectionProps) {
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
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalJobs: initialJobs.length,
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
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
      queryParams.append("page", pagination.currentPage.toString());
      queryParams.append("limit", "10");

      const response = await fetch(`/api/jobs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data.jobs);
      setPagination({
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
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
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
                    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
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

            <div className="flex gap-2">
              <input
                type="number"
                name="minBudget"
                placeholder="Min Budget"
                value={filters.minBudget}
                onChange={handleFilterChange}
                className="w-full border rounded-lg p-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                min="0"
                aria-label="Minimum budget"
              />
              <input
                type="number"
                name="maxBudget"
                placeholder="Max Budget"
                value={filters.maxBudget}
                onChange={handleFilterChange}
                className="w-full border rounded-lg p-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                min="0"
                aria-label="Maximum budget"
              />
            </div>

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full border rounded-lg p-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              aria-label="Job location"
            />

            <input
              type="text"
              name="skills"
              placeholder="Required skills (comma separated)"
              value={filters.skills}
              onChange={handleFilterChange}
              className="w-full border rounded-lg p-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              aria-label="Required skills"
            />

            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full border rounded-lg p-2 bg-gray-700 border-gray-600 text-white"
              aria-label="Sort by"
            >
              <option value="recent">Most Recent</option>
              <option value="budget_high">Highest Budget</option>
              <option value="budget_low">Lowest Budget</option>
              <option value="applications">Most Applications</option>
            </select>
          </div>
        )}

        <Button onClick={handleSearch} disabled={loading} className="w-full">
          {loading ? "Searching..." : "Search Jobs"}
        </Button>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {jobs.length === 0 && !loading && (
          <div className="text-center text-gray-400 py-8">
            No jobs found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
}
