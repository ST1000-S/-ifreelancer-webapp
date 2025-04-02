"use client";

import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, MapPin, Briefcase, DollarSign } from "lucide-react";
import { memo, useMemo } from "react";
import { motion } from "framer-motion";

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
  index: number;
}

const JobCard = memo(function JobCard({ job, index }: JobCardProps) {
  // Ensure all data has proper defaults to prevent rendering errors
  const {
    title = "",
    description = "",
    budget = 0,
    budgetType = "FIXED",
    type = "REMOTE",
    status = "OPEN",
    category = "",
    experienceLevel = "",
    availability = "",
    createdAt = new Date().toISOString(),
    skills = [],
    _count = { applications: 0 },
    creator = { name: "Anonymous", email: "", id: "" },
  } = job || {};

  const formattedBudget = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(budget);
  }, [budget]);

  const timeAgo = useMemo(() => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  }, [createdAt]);

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: index * 0.1,
      },
    },
  };

  const skillBadges = useMemo(() => {
    return skills.map((skill) => (
      <Badge
        key={skill}
        variant="outline"
        className="border-blue-500/50 text-blue-400"
      >
        {skill}
      </Badge>
    ));
  }, [skills]);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="mb-4"
    >
      <Link href={`/jobs/${job.id}`}>
        <Card className="p-6 hover:shadow-lg transition-shadow duration-200 bg-white/5 backdrop-blur-lg hover:bg-white/10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white hover:text-blue-400 transition-colors">
                {title}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Posted by {creator.name} • {timeAgo}
              </p>
            </div>
            <div className="text-green-400 font-semibold">
              {formattedBudget}
              <span className="text-gray-400 text-sm ml-1">
                {budgetType.toLowerCase()}
              </span>
            </div>
          </div>

          <p className="text-gray-300 mb-4 line-clamp-2">{description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 mr-2" />
              <Badge variant={type === "REMOTE" ? "default" : "secondary"}>
                {type}
              </Badge>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{experienceLevel}</span>
            </div>
            {location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{location}</span>
              </div>
            )}
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>{_count.applications} applications</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">{skillBadges}</div>
        </Card>
      </Link>
    </motion.div>
  );
});

JobCard.displayName = "JobCard";

export default JobCard;
