"use client";

import { useState } from "react";
import { TechCard } from "@/components/ui/TechCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, Star, Award, AlertCircle, Clock } from "lucide-react";

interface SkillVerificationProps {
  skills: {
    name: string;
    level?: "beginner" | "intermediate" | "expert";
    verified?: boolean;
    endorsements?: number;
    verificationStatus?: "pending" | "verified" | "none";
  }[];
  onAddSkill?: () => void;
  onRemoveSkill?: (skill: string) => void;
}

export function SkillVerification({
  skills,
  onAddSkill,
  onRemoveSkill,
}: SkillVerificationProps) {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const getSkillLevelIcon = (level?: string) => {
    switch (level) {
      case "beginner":
        return <Star size={14} className="text-yellow-500" />;
      case "intermediate":
        return (
          <div className="flex">
            <Star size={14} className="text-yellow-500" />
            <Star size={14} className="text-yellow-500" />
          </div>
        );
      case "expert":
        return (
          <div className="flex">
            <Star size={14} className="text-yellow-500" />
            <Star size={14} className="text-yellow-500" />
            <Star size={14} className="text-yellow-500" />
          </div>
        );
      default:
        return null;
    }
  };

  const getVerificationIcon = (status?: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle size={14} className="text-green-500" />;
      case "pending":
        return <Clock size={14} className="text-orange-500" />;
      default:
        return null;
    }
  };

  const sortedSkills = [...skills].sort((a, b) => {
    // Sort by verification status first (verified > pending > none)
    const statusOrder = { verified: 0, pending: 1, none: 2 };
    const statusA = statusOrder[a.verificationStatus || "none"];
    const statusB = statusOrder[b.verificationStatus || "none"];

    if (statusA !== statusB) {
      return statusA - statusB;
    }

    // Then sort by skill level (expert > intermediate > beginner > undefined)
    const levelOrder = {
      expert: 0,
      intermediate: 1,
      beginner: 2,
      undefined: 3,
    };
    const levelA = levelOrder[a.level || "undefined"];
    const levelB = levelOrder[b.level || "undefined"];

    if (levelA !== levelB) {
      return levelA - levelB;
    }

    // Finally sort alphabetically
    return a.name.localeCompare(b.name);
  });

  return (
    <TechCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Skills</h3>
        {onAddSkill && (
          <Button variant="outline" size="sm" onClick={onAddSkill}>
            Add Skills
          </Button>
        )}
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-md">
          <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <p className="text-gray-500 mb-2">No skills added yet</p>
          {onAddSkill && (
            <Button
              variant="link"
              onClick={onAddSkill}
              className="text-primary"
            >
              Add your first skill
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sortedSkills.map((skill) => (
            <TooltipProvider key={skill.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`relative group ${
                      onRemoveSkill ? "cursor-pointer" : ""
                    }`}
                    onMouseEnter={() => setHoveredSkill(skill.name)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    onClick={() => onRemoveSkill && onRemoveSkill(skill.name)}
                  >
                    <Badge
                      variant="secondary"
                      className={`px-3 py-1 flex items-center gap-1 ${
                        skill.verificationStatus === "verified"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      } ${hoveredSkill === skill.name && onRemoveSkill ? "bg-red-50 text-red-800 border-red-200" : ""}`}
                    >
                      {skill.name}
                      {getSkillLevelIcon(skill.level)}
                      {getVerificationIcon(skill.verificationStatus)}
                      {skill.endorsements && skill.endorsements > 0 && (
                        <span className="ml-1 bg-gray-200 text-gray-700 text-xs px-1 rounded-sm">
                          {skill.endorsements}
                        </span>
                      )}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs p-1">
                    <div className="font-semibold">{skill.name}</div>
                    {skill.level && (
                      <div className="flex items-center gap-1 mt-1">
                        <span>Level:</span>
                        <span className="capitalize">{skill.level}</span>
                      </div>
                    )}
                    {skill.verificationStatus === "verified" && (
                      <div className="flex items-center gap-1 mt-1 text-green-600">
                        <CheckCircle size={12} />
                        <span>Verified skill</span>
                      </div>
                    )}
                    {skill.verificationStatus === "pending" && (
                      <div className="flex items-center gap-1 mt-1 text-orange-600">
                        <Clock size={12} />
                        <span>Verification pending</span>
                      </div>
                    )}
                    {skill.endorsements && skill.endorsements > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Award size={12} className="text-blue-500" />
                        <span>
                          {skill.endorsements}{" "}
                          {skill.endorsements === 1
                            ? "endorsement"
                            : "endorsements"}
                        </span>
                      </div>
                    )}
                    {onRemoveSkill && (
                      <div className="text-red-500 mt-1">Click to remove</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </TechCard>
  );
}
