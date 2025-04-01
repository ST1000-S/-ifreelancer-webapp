"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TechBackground } from "@/components/ui/TechBackground";
import { TechCard } from "@/components/ui/TechCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Calendar, DollarSign, Clock } from "lucide-react";
import { logger } from "@/lib/logger";
import Link from "next/link";
import { motion } from "framer-motion";

// Define types
interface Skill {
  id: string;
  name: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  duration: string;
  skills: Skill[];
  createdAt: string;
  postedBy: {
    name: string;
    id: string;
  };
}

// Mock popular skills for initial display
const popularSkills = [
  "React",
  "JavaScript",
  "Web Development",
  "Node.js",
  "UI/UX",
  "Python",
  "Mobile Development",
  "Data Analysis",
  "Graphic Design",
  "Content Writing",
];

export default function JobSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [durationFilter, setDurationFilter] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [visibleSkillsCount, setVisibleSkillsCount] = useState(10);

  // Duration options
  const durationOptions = [
    { value: "lessThan1Week", label: "Less than 1 week" },
    { value: "1To2Weeks", label: "1-2 weeks" },
    { value: "1To3Months", label: "1-3 months" },
    { value: "3To6Months", label: "3-6 months" },
    { value: "moreThan6Months", label: "More than 6 months" },
  ];

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        // This would be replaced with actual API call
        // const response = await fetch("/api/skills");
        // const data = await response.json();

        // Using mock data for now
        const mockSkills = popularSkills.map((skill, index) => ({
          id: `skill-${index + 1}`,
          name: skill,
        }));

        setSkills(mockSkills);
      } catch (error) {
        logger.error("Error fetching skills:", error as Error);
      }
    };

    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (searchTerm) params.append("q", searchTerm);
        if (selectedSkills.length)
          params.append("skills", selectedSkills.join(","));
        params.append("minBudget", budgetRange[0].toString());
        params.append("maxBudget", budgetRange[1].toString());
        if (durationFilter.length)
          params.append("duration", durationFilter.join(","));

        // This would be replaced with actual API call
        // const response = await fetch(`/api/jobs/search?${params.toString()}`);
        // const data = await response.json();

        // Using mock data for now
        const mockJobs: Job[] = Array.from({ length: 10 }).map((_, index) => ({
          id: `job-${index + 1}`,
          title: `${searchTerm ? searchTerm + " " : ""}Job Project ${index + 1}`,
          description:
            "This is a sample job description for a frontend developer with experience in React and Next.js.",
          budget: Math.floor(
            Math.random() * (budgetRange[1] - budgetRange[0]) + budgetRange[0]
          ),
          duration:
            durationOptions[Math.floor(Math.random() * durationOptions.length)]
              .value,
          skills: selectedSkills.length
            ? selectedSkills.map((skill, i) => ({
                id: `skill-${i}`,
                name: skill,
              }))
            : [
                { id: "skill-1", name: "React" },
                { id: "skill-2", name: "JavaScript" },
              ],
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 10) * 86400000
          ).toISOString(),
          postedBy: {
            name: `Client ${index + 1}`,
            id: `client-${index + 1}`,
          },
        }));

        setJobs(mockJobs);
      } catch (error) {
        logger.error("Error fetching jobs:", error as Error);
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Find the Perfect Job
          </h1>
          <p className="text-gray-300">
            Search through thousands of projects and find your next opportunity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Section */}
          <div className="lg:col-span-1">
            <TechCard className="sticky top-24 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Filter size={18} className="mr-2" />
                  Filters
                </h2>

                {/* Search form */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                    >
                      <Search size={18} />
                    </Button>
                  </div>
                </form>

                {/* Budget Range */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    <DollarSign size={16} className="mr-1" />
                    Budget Range
                  </h3>
                  <div className="mb-2">
                    <Slider
                      defaultValue={[0, 10000]}
                      max={10000}
                      step={100}
                      value={budgetRange}
                      onValueChange={setBudgetRange}
                      className="my-6"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatBudget(budgetRange[0])}</span>
                    <span>{formatBudget(budgetRange[1])}</span>
                  </div>
                </div>

                {/* Duration Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    <Clock size={16} className="mr-1" />
                    Project Duration
                  </h3>
                  <div className="space-y-2">
                    {durationOptions.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <Checkbox
                          id={option.value}
                          checked={durationFilter.includes(option.value)}
                          onCheckedChange={() => toggleDuration(option.value)}
                        />
                        <Label
                          htmlFor={option.value}
                          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20"
                      >
                        {skill}
                        <X
                          size={14}
                          className="cursor-pointer"
                          onClick={() => toggleSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="max-h-60 overflow-y-auto pr-2">
                    <div className="space-y-2">
                      {skills.slice(0, visibleSkillsCount).map((skill) => (
                        <div key={skill.id} className="flex items-center">
                          <Checkbox
                            id={skill.id}
                            checked={selectedSkills.includes(skill.name)}
                            onCheckedChange={() => toggleSkill(skill.name)}
                          />
                          <Label
                            htmlFor={skill.id}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {skill.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {skills.length > visibleSkillsCount && (
                      <Button
                        variant="link"
                        onClick={() =>
                          setVisibleSkillsCount((prev) => prev + 10)
                        }
                        className="mt-2 p-0 h-auto text-primary"
                      >
                        Show more skills
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSkills([]);
                  setBudgetRange([0, 10000]);
                  setDurationFilter([]);
                  router.push("/jobs/search");
                }}
              >
                Reset Filters
              </Button>
            </TechCard>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {isLoading ? "Searching..." : `Found ${jobs.length} jobs`}
              </h2>
              <div className="flex items-center space-x-2">
                <Label htmlFor="sort" className="text-sm text-white">
                  Sort by:
                </Label>
                <select
                  id="sort"
                  className="p-2 rounded-md border border-gray-300 text-sm bg-white/90"
                  aria-label="Sort jobs by"
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highestBudget">Highest Budget</option>
                  <option value="lowestBudget">Lowest Budget</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : jobs.length === 0 ? (
              <TechCard className="p-8 text-center">
                <div className="mb-4">
                  <Search size={48} className="mx-auto text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search filters or explore different skills
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSkills([]);
                    setBudgetRange([0, 10000]);
                    setDurationFilter([]);
                    router.push("/jobs/search");
                  }}
                >
                  Clear Filters
                </Button>
              </TechCard>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link href={`/jobs/${job.id}`}>
                      <TechCard
                        className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        glowIntensity="low"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {job.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {job.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills.map((skill) => (
                                <Badge
                                  key={skill.id}
                                  variant="outline"
                                  className="bg-gray-100"
                                >
                                  {skill.name}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center text-sm text-gray-500">
                              <div className="flex items-center mr-4">
                                <DollarSign
                                  size={16}
                                  className="mr-1 text-primary"
                                />
                                <span>{formatBudget(job.budget)}</span>
                              </div>
                              <div className="flex items-center mr-4">
                                <Clock
                                  size={16}
                                  className="mr-1 text-primary"
                                />
                                <span>
                                  {durationOptions.find(
                                    (d) => d.value === job.duration
                                  )?.label || job.duration}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Calendar
                                  size={16}
                                  className="mr-1 text-primary"
                                />
                                <span>Posted {formatDate(job.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                            >
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </TechCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {jobs.length > 0 && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" className="mx-2">
                  Previous
                </Button>
                <Button variant="outline" className="mx-2">
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </TechBackground>
  );
}
