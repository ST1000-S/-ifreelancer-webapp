"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, MapPin, Briefcase, Calendar } from "lucide-react";

// Define the interface directly in this file to avoid serialization issues
interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    budget: number;
    budgetType: string;
    type: string;
    status: string;
    category: string;
    experienceLevel: string;
    availability: string;
    location?: string;
    duration?: string;
    skills: string[];
    createdAt: string; // ISO string format for dates
    updatedAt: string; // ISO string format for dates
    creatorId: string;
    creator: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
    _count: {
      applications: number;
    };
  };
}

export function JobCard({ job }: JobCardProps) {
  const skills = job.skills || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-500/20 text-green-400";
      case "IN_PROGRESS":
        return "bg-blue-500/20 text-blue-400";
      case "COMPLETED":
        return "bg-gray-500/20 text-gray-400";
      case "CANCELLED":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-gray-800 hover:bg-white/10 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-white">{job.title}</h3>
            <p className="text-sm text-gray-400">
              Posted by {job.creator.name} •{" "}
              {format(new Date(job.createdAt), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={job.type === "REMOTE" ? "default" : "secondary"}>
              {job.type}
            </Badge>
            <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-300 line-clamp-3">{job.description}</p>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="font-medium text-white">
                ${job.budget}
                {job.budgetType === "HOURLY" ? "/hr" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>{job.availability}</span>
            </div>
            {job.duration && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{job.duration}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location || "Remote"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-medium text-white">
              {job._count.applications} applications
            </span>
            <span>•</span>
            <span>{job.category}</span>
            <span>•</span>
            <span>{job.experienceLevel}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="border-blue-500/50 text-blue-400"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/jobs/${job.id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
