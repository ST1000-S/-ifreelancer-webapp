"use client";

import { useState } from "react";
import { JobType } from "@prisma/client";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface JobSearchFilters {
  query: string;
  type?: JobType;
  minBudget?: number;
  maxBudget?: number;
}

interface JobSearchProps {
  onSearch: (filters: JobSearchFilters) => void;
}

export function JobSearch({ onSearch }: JobSearchProps) {
  const [filters, setFilters] = useState<JobSearchFilters>({
    query: "",
    type: undefined,
    minBudget: undefined,
    maxBudget: undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="query">Search</Label>
        <Input
          id="query"
          type="text"
          placeholder="Search jobs..."
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          className="bg-white/10 border-gray-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Job Type</Label>
        <SelectRoot
          value={filters.type}
          onValueChange={(value) =>
            setFilters({ ...filters, type: value as JobType })
          }
        >
          <SelectTrigger className="bg-white/10 border-gray-700 text-white">
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All Types</SelectItem>
              {(Object.values(JobType) as JobType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </SelectRoot>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
        Search
      </Button>
    </form>
  );
}
