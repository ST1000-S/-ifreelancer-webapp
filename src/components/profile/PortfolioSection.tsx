"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

interface PortfolioSectionProps {
  items: Portfolio[];
}

export default function PortfolioSection({ items }: PortfolioSectionProps) {
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Portfolio Projects</h3>
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
                  id="skills"
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
                        ? format(formData.startDate, "yyyy-MM-dd")
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
                        ? format(formData.endDate, "yyyy-MM-dd")
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 relative group hover:shadow-md transition-shadow"
          >
            {item.imageUrl && (
              <div className="aspect-video rounded-md overflow-hidden mb-4">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
            <p className="text-sm text-gray-600 mb-4">{item.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {item.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              {format(new Date(item.startDate), "MMM yyyy")} -{" "}
              {item.endDate
                ? format(new Date(item.endDate), "MMM yyyy")
                : "Present"}
            </div>
            {item.projectUrl && (
              <a
                href={item.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-2 block"
              >
                View Project
              </a>
            )}
            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
