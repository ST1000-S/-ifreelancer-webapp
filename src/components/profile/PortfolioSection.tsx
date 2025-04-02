"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Portfolio, PortfolioFormData } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PortfolioCard } from "./PortfolioCard";

interface PortfolioSectionProps {
  items: Portfolio[];
  isOwner?: boolean;
}

export default function PortfolioSection({
  items,
  isOwner = false,
}: PortfolioSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState<PortfolioFormData>({
    title: "",
    description: "",
    imageUrl: "",
    projectUrl: "",
    skills: [],
    startDate: new Date(),
    endDate: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add portfolio item");
      }

      toast.success("Portfolio item added successfully");
      router.refresh();
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        projectUrl: "",
        skills: [],
        startDate: new Date(),
        endDate: null,
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
      const response = await fetch(`/api/profile/portfolio?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete portfolio item");
      }

      toast.success("Portfolio item deleted successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (skills: string[]) => {
    setFormData((prev) => ({ ...prev, skills }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? new Date(value) : null,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold">Portfolio Projects</h3>
        {isOwner && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Portfolio Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. E-commerce Website"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your project..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="skills">Skills Used</Label>
                  <MultiSelect
                    value={formData.skills}
                    onChange={handleSkillsChange}
                    options={[
                      "JavaScript",
                      "TypeScript",
                      "React",
                      "Node.js",
                      "Python",
                      "Java",
                      "C++",
                      "AWS",
                      "Docker",
                      "Kubernetes",
                    ]}
                    placeholder="Select skills used in the project"
                  />
                </div>

                <div>
                  <Label htmlFor="projectUrl">Project URL</Label>
                  <Input
                    id="projectUrl"
                    name="projectUrl"
                    type="url"
                    value={formData.projectUrl || ""}
                    onChange={handleChange}
                    placeholder="e.g. https://project.com"
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    value={formData.imageUrl || ""}
                    onChange={handleChange}
                    placeholder="e.g. https://image.com/preview.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={
                        formData.startDate
                          ? new Date(formData.startDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={handleDateChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={
                        formData.endDate
                          ? new Date(formData.endDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={handleDateChange}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Project"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No portfolio projects added yet.
            {isOwner && " Click the Add Project button to showcase your work."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <PortfolioCard
              key={item.id}
              item={item}
              onDelete={isOwner ? handleDelete : undefined}
              isOwner={isOwner}
            />
          ))}
        </div>
      )}
    </div>
  );
}
