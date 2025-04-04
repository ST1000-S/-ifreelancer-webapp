import React from "react";
("use client");

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const { title, description, budget, skills } = job;

  return (
    <Card
      className="w-full p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      data-testid="job-card"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Budget: ${budget}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}

JobCard.displayName = "JobCard";
