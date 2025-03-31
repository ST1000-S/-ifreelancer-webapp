import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { JobType } from "@prisma/client";

interface JobFormProps {
  onSubmit: (data: JobFormData) => void;
  error?: string;
  initialData?: JobFormData;
}

export interface JobFormData {
  title: string;
  description: string;
  budget?: number;
  type: JobType;
  location?: string;
  skills: string[];
}

export function JobForm({ onSubmit, error, initialData }: JobFormProps) {
  const [formData, setFormData] = useState<JobFormData>(
    initialData || {
      title: "",
      description: "",
      budget: undefined,
      type: "REMOTE",
      location: "",
      skills: [],
    }
  );

  const [skillInput, setSkillInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Job Title
        </label>
        <Input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Job Description
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="mt-1"
          required
        />
      </div>

      <div>
        <label
          htmlFor="budget"
          className="block text-sm font-medium text-gray-700"
        >
          Budget (LKR)
        </label>
        <Input
          type="number"
          id="budget"
          value={formData.budget || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              budget: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
          className="mt-1"
          placeholder="Optional"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Job Type</Label>
        <SelectRoot
          value={formData.type}
          onValueChange={(value) =>
            setFormData({ ...formData, type: value as JobType })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(Object.values(JobType) as JobType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </SelectRoot>
      </div>

      {(formData.type === "ONSITE" || formData.type === "HYBRID") && (
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <Input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="mt-1"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Skills
        </label>
        <div className="mt-1 flex gap-2">
          <Input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Add a skill"
          />
          <Button type="button" onClick={addSkill}>
            Add
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="pr-1">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2 hover:text-red-500"
                aria-label={`Remove ${skill} skill`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        Submit Job
      </Button>
    </form>
  );
}
