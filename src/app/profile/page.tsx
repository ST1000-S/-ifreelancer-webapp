"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ProfileCompletionTracker } from "@/components/profile/ProfileCompletionTracker";
import { SkillVerification } from "@/components/profile/SkillVerification";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pencil,
  MapPin,
  Mail,
  Calendar,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { logger } from "@/lib/logger";

// Define proper types
interface Skill {
  name: string;
  level?: "beginner" | "intermediate" | "expert";
  verificationStatus?: "pending" | "verified" | "none";
  endorsements?: number;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

interface ProfileSection {
  name: string;
  completed: boolean;
  url: string;
  description: string;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  location: string;
  joinDate: string;
  bio: string;
  skills: Skill[];
  experience: Experience[];
  completedSections: ProfileSection[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // In a real app, fetch actual user profile data from API
        // For demo purposes, we're using mock data
        setUserProfile({
          name: session?.user?.name || "John Doe",
          email: session?.user?.email || "john@example.com",
          role: session?.user?.role || "freelancer",
          location: "New York, USA",
          joinDate: "January 2023",
          bio: "Experienced developer with 5+ years in web and mobile application development. Passionate about creating clean, efficient code and solving complex problems.",
          skills: [
            {
              name: "React",
              level: "expert",
              verificationStatus: "verified",
              endorsements: 12,
            },
            {
              name: "TypeScript",
              level: "expert",
              verificationStatus: "verified",
              endorsements: 8,
            },
            {
              name: "Next.js",
              level: "intermediate",
              verificationStatus: "pending",
              endorsements: 5,
            },
            {
              name: "Node.js",
              level: "intermediate",
              verificationStatus: "none",
              endorsements: 3,
            },
            {
              name: "Tailwind CSS",
              level: "expert",
              verificationStatus: "verified",
              endorsements: 7,
            },
            {
              name: "GraphQL",
              level: "beginner",
              verificationStatus: "none",
              endorsements: 1,
            },
          ],
          experience: [
            {
              title: "Senior Frontend Developer",
              company: "TechCorp Inc.",
              period: "2020 - Present",
              description:
                "Lead development of multiple web applications using React and TypeScript.",
            },
            {
              title: "Web Developer",
              company: "Digital Solutions",
              period: "2018 - 2020",
              description:
                "Developed responsive websites and implemented new features for client projects.",
            },
          ],
          completedSections: [
            {
              name: "Basic Information",
              completed: true,
              url: "/profile/basic",
              description: "Your name, title, and contact info",
            },
            {
              name: "Skills",
              completed: true,
              url: "/profile/skills",
              description: "Your technical and professional skills",
            },
            {
              name: "Experience",
              completed: true,
              url: "/profile/experience",
              description: "Your work history and achievements",
            },
            {
              name: "Portfolio",
              completed: false,
              url: "/profile/portfolio",
              description: "Examples of your previous work",
            },
            {
              name: "Education",
              completed: true,
              url: "/profile/education",
              description: "Your educational background",
            },
            {
              name: "Verification",
              completed: false,
              url: "/profile/verification",
              description: "Verify your identity and credentials",
            },
          ],
        });
        setLoading(false);
      } catch (error) {
        logger.error("Error fetching profile data:", error as Error);
        setLoading(false);
      }
    };

    if (session) {
      fetchProfileData();
    }
  }, [session]);

  // Calculate profile completion percentage
  const calculateCompletionPercentage = () => {
    if (!userProfile?.completedSections) return 0;
    const completed = userProfile.completedSections.filter(
      (section) => section.completed
    ).length;
    const total = userProfile.completedSections.length;
    return Math.round((completed / total) * 100);
  };

  const handleAddSkill = () => {
    // In a real app, this would open a modal or navigate to skill addition page
    alert("Add skill functionality would open here");
  };

  const handleRemoveSkill = (skillName: string) => {
    // In a real app, this would call an API to remove the skill
    if (confirm(`Are you sure you want to remove the skill: ${skillName}?`)) {
      setUserProfile({
        ...userProfile!,
        skills: userProfile!.skills.filter((skill) => skill.name !== skillName),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading profile...
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Profile not found
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Profile info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() =>
                alert("Edit profile functionality would open here")
              }
            >
              <Pencil size={16} />
            </Button>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={session?.user?.image || ""}
                  alt={userProfile.name}
                />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">{userProfile.name}</h1>
              <p className="text-gray-600 capitalize">{userProfile.role}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <MapPin size={16} className="mr-2 text-gray-500" />
                <span>{userProfile.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail size={16} className="mr-2 text-gray-500" />
                <span>{userProfile.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar size={16} className="mr-2 text-gray-500" />
                <span>Member since {userProfile.joinDate}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold mb-2 flex items-center">
                <BookOpen size={16} className="mr-2" />
                About
              </h3>
              <p className="text-sm text-gray-600">{userProfile.bio}</p>
            </div>
          </Card>

          <ProfileCompletionTracker
            completionPercentage={calculateCompletionPercentage()}
            sections={userProfile.completedSections}
          />
        </div>

        {/* Right column - Tabs and content */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="profile">
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1">
                Profile
              </TabsTrigger>
              <TabsTrigger value="experience" className="flex-1">
                Experience
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex-1">
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 mt-6">
              <SkillVerification
                skills={userProfile.skills}
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
              />

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Briefcase size={18} className="mr-2" />
                    Experience
                  </h3>
                  <Button variant="outline" size="sm">
                    Add Experience
                  </Button>
                </div>

                <div className="space-y-4">
                  {userProfile.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                    >
                      <h4 className="font-medium">{exp.title}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {exp.company} • {exp.period}
                      </div>
                      <p className="text-sm mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="experience">
              <div className="p-8 text-center text-gray-500">
                Experience content would be displayed here
              </div>
            </TabsContent>

            <TabsContent value="portfolio">
              <div className="p-8 text-center text-gray-500">
                Portfolio content would be displayed here
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="p-8 text-center text-gray-500">
                Reviews content would be displayed here
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
