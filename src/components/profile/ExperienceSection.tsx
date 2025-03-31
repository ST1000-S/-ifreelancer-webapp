"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { WorkExperience, WorkExperienceFormData } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ExperienceSectionProps {
  items: WorkExperience[];
}

export default function ExperienceSection({ items }: ExperienceSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<WorkExperienceFormData>({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    description: "",
    startDate: new Date(),
    endDate: undefined,
    current: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add experience");
      }

      toast.success("Experience added successfully");
      router.refresh();
      setFormData({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        description: "",
        startDate: new Date(),
        endDate: undefined,
        current: false,
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/profile/experience?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete experience");
      }

      toast.success("Experience deleted successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? new Date(value) : undefined,
    }));
  };

  const handleCurrentChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      current: checked,
      endDate: checked ? undefined : prev.endDate,
    }));
  };

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Experience</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Work Experience</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Google"
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                placeholder="e.g. Mountain View, CA"
              />
            </div>

            <div>
              <Label htmlFor="type">Employment Type</Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required
                aria-label="Employment Type"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your role and achievements..."
                required
              />
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={
                  formData.startDate
                    ? format(formData.startDate, "yyyy-MM-dd")
                    : ""
                }
                onChange={handleDateChange}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="current"
                checked={formData.current}
                onCheckedChange={handleCurrentChange}
              />
              <Label htmlFor="current">I currently work here</Label>
            </div>

            {!formData.current && (
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={
                    formData.endDate
                      ? format(formData.endDate, "yyyy-MM-dd")
                      : ""
                  }
                  onChange={handleDateChange}
                />
              </div>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Experience"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col space-y-2 rounded-lg border p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.company} • {item.type}
                </p>
                {item.location && (
                  <p className="text-sm text-muted-foreground">
                    {item.location}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {format(new Date(item.startDate), "MMM yyyy")} -{" "}
                  {item.current
                    ? "Present"
                    : format(new Date(item.endDate!), "MMM yyyy")}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </Button>
            </div>
            <p className="text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
