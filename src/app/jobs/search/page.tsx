"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TechBackground } from "@/components/ui/TechBackground";
import { TechCard } from "@/components/ui/TechCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { popularSkills } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { Search, Filter, DollarSign, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import "@/styles/jobs.css";

// Move duration options outside component to avoid recreation
const DURATION_OPTIONS = [
  { value: "LESS_THAN_1_MONTH", label: "Less than 1 month" },
  { value: "ONE_TO_THREE_MONTHS", label: "1-3 months" },
  { value: "THREE_TO_SIX_MONTHS", label: "3-6 months" },
  { value: "MORE_THAN_6_MONTHS", label: "More than 6 months" },
] as const;

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  duration: string;
  skills: string[];
  createdAt: string;
  type: string;
  status: string;
  creator: {
    name: string;
    id: string;
  };
}

export default function JobSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [durationFilter, setDurationFilter] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("query", searchTerm);
        if (selectedSkills.length)
          params.append("skills", selectedSkills.join(","));
        params.append("minBudget", budgetRange[0].toString());
        params.append("maxBudget", budgetRange[1].toString());
        if (durationFilter.length)
          params.append("duration", durationFilter.join(","));

        const response = await fetch(`/api/jobs?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }

        const data = await response.json();
        setJobs(data.jobs);
      } catch (error) {
        logger.error("Error fetching jobs:", error as Error);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [searchTerm, selectedSkills, budgetRange, durationFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    router.push(`/jobs/search?${params.toString()}`);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleDuration = (duration: string) => {
    setDurationFilter((prev) =>
      prev.includes(duration)
        ? prev.filter((d) => d !== duration)
        : [...prev, duration]
    );
  };

  const formatBudget = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <TechBackground>
      <div className="job-search-container">
        <div className="job-search-header">
          <h1 className="job-search-title">Find the Perfect Job</h1>
          <p className="job-search-description">
            Search through thousands of projects and find your next opportunity
          </p>
        </div>

        <div className="job-search-grid">
          {/* Filters Section */}
          <div className="lg:col-span-1">
            <TechCard className="job-filters p-6">
              <div className="job-filter-section">
                <h2 className="job-filter-title">
                  <Filter size={18} className="job-filter-icon" />
                  Filters
                </h2>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="search-form">
                  <Input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <Button type="submit">
                    <Search size={18} />
                  </Button>
                </form>

                {/* Budget Range */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    <DollarSign size={18} className="inline mr-1" />
                    Budget Range
                  </h3>
                  <div className="budget-range">
                    <Slider
                      value={budgetRange}
                      onValueChange={setBudgetRange}
                      min={0}
                      max={10000}
                      step={100}
                    />
                    <div className="budget-labels">
                      <span>{formatBudget(budgetRange[0])}</span>
                      <span>{formatBudget(budgetRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Duration Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    <Clock size={18} className="inline mr-1" />
                    Duration
                  </h3>
                  <div className="duration-options">
                    {DURATION_OPTIONS.map((option) => (
                      <div key={option.value} className="duration-option">
                        <Checkbox
                          id={option.value}
                          checked={durationFilter.includes(option.value)}
                          onCheckedChange={() => toggleDuration(option.value)}
                        />
                        <Label htmlFor={option.value}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Skills
                  </h3>
                  <div className="skills-grid">
                    {popularSkills.map((skill) => (
                      <div key={skill} className="skill-checkbox">
                        <Checkbox
                          id={skill}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                        />
                        <Label htmlFor={skill}>{skill}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TechCard>
          </div>

          {/* Jobs List */}
          <div className="job-list">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="job-card job-card-skeleton">
                  <div className="skeleton-title loading-skeleton" />
                  <div className="skeleton-description loading-skeleton" />
                  <div className="skeleton-meta loading-skeleton" />
                </div>
              ))
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : jobs.length === 0 ? (
              <div className="no-results">
                No jobs found matching your criteria
              </div>
            ) : (
              jobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/jobs/${job.id}`}>
                    <div className="job-card">
                      <div className="job-card-header">
                        <h3 className="job-card-title">{job.title}</h3>
                        <span className="job-card-budget">
                          {formatBudget(job.budget)}
                        </span>
                      </div>
                      <p className="job-card-description">
                        {job.description.length > 200
                          ? `${job.description.slice(0, 200)}...`
                          : job.description}
                      </p>
                      <div className="job-card-footer">
                        <div className="job-card-meta">
                          <Calendar size={16} />
                          {formatDate(job.createdAt)}
                        </div>
                        <div className="job-card-meta">
                          <Clock size={16} />
                          {job.duration}
                        </div>
                        <div className="job-card-skills">
                          {job.skills.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="skill-badge"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 3 && (
                            <Badge
                              variant="secondary"
                              className="skill-badge"
                            >{`+${job.skills.length - 3}`}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </TechBackground>
  );
}
