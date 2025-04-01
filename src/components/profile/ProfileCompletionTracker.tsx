"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { TechCard } from "@/components/ui/TechCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface ProfileSection {
  name: string;
  completed: boolean;
  url: string;
  description: string;
}

interface ProfileCompletionTrackerProps {
  completionPercentage: number;
  sections: ProfileSection[];
}

export function ProfileCompletionTracker({
  completionPercentage,
  sections,
}: ProfileCompletionTrackerProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const completedSections = sections.filter(
    (section) => section.completed
  ).length;
  const totalSections = sections.length;

  return (
    <TechCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Profile Completion</h3>
        <Badge
          variant={completionPercentage === 100 ? "success" : "secondary"}
          className={
            completionPercentage === 100 ? "bg-green-100 text-green-800" : ""
          }
        >
          {completionPercentage}%
        </Badge>
      </div>

      <div className="mb-4">
        <Progress value={completionPercentage} className="h-2" />
        <p className="text-sm text-gray-500 mt-2">
          {completedSections} of {totalSections} sections completed
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="ghost"
          className="w-full justify-between text-left font-normal p-2"
          onClick={toggleExpanded}
        >
          <span>What&apos;s left to complete</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>

        {expanded && (
          <div className="space-y-2 pl-2 animate-in fade-in duration-200">
            {sections.map((section) => (
              <div key={section.name} className="flex items-start gap-2 py-1">
                {section.completed ? (
                  <CheckCircle size={18} className="text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="text-amber-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-medium ${section.completed ? "text-gray-600" : "text-gray-900"}`}
                    >
                      {section.name}
                    </p>
                    {!section.completed && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary"
                        asChild
                      >
                        <a href={section.url}>Complete</a>
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {completionPercentage === 100 && (
        <div className="mt-4 bg-green-50 border border-green-100 rounded-md p-3 flex items-center gap-3">
          <CheckCircle className="text-green-500" />
          <div>
            <p className="text-green-800 font-medium">Profile complete!</p>
            <p className="text-green-700 text-sm">
              Your profile is now fully optimized.
            </p>
          </div>
        </div>
      )}
    </TechCard>
  );
}
