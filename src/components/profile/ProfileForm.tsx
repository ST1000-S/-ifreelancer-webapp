import { useState } from "react";
import { useRouter } from "next/navigation";
import { Profile, ProfileFormData } from "@/types/profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "sonner";

interface ProfileFormProps {
  initialData: Profile | null;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    bio: initialData?.bio || "",
    skills: initialData?.skills || [],
    hourlyRate: initialData?.hourlyRate || 0,
    location: initialData?.location || "",
    website: initialData?.website || "",
    github: initialData?.github || "",
    linkedin: initialData?.linkedin || "",
    title: initialData?.title || "",
    availability: initialData?.availability || true,
    languages: initialData?.languages || [],
    phoneNumber: initialData?.phoneNumber || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
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

  const handleLanguagesChange = (languages: string[]) => {
    setFormData((prev) => ({ ...prev, languages }));
  };

  const handleAvailabilityChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, availability: checked }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Professional Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Your professional title"
            value={formData.title ?? ""}
            onChange={(e) => handleChange(e)}
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio || ""}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="skills">Skills</Label>
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
            placeholder="Select your skills"
          />
        </div>

        <div>
          <Label htmlFor="languages">Languages</Label>
          <MultiSelect
            id="languages"
            value={formData.languages}
            onChange={handleLanguagesChange}
            options={[
              "English",
              "Sinhala",
              "Tamil",
              "Hindi",
              "Chinese",
              "Japanese",
              "Korean",
              "French",
              "German",
              "Spanish",
            ]}
            placeholder="Select languages you know"
          />
        </div>

        <div>
          <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
          <Input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            value={formData.hourlyRate || ""}
            onChange={handleChange}
            placeholder="e.g. 50"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
            placeholder="e.g. Colombo, Sri Lanka"
          />
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber || ""}
            onChange={handleChange}
            placeholder="e.g. +94 71 234 5678"
          />
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            value={formData.website || ""}
            onChange={handleChange}
            placeholder="e.g. https://yourwebsite.com"
          />
        </div>

        <div>
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            name="github"
            value={formData.github || ""}
            onChange={handleChange}
            placeholder="e.g. https://github.com/username"
          />
        </div>

        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            name="linkedin"
            value={formData.linkedin || ""}
            onChange={handleChange}
            placeholder="e.g. https://linkedin.com/in/username"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="availability"
            checked={formData.availability}
            onCheckedChange={handleAvailabilityChange}
          />
          <Label htmlFor="availability">Available for hire</Label>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
