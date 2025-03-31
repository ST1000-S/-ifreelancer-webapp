import { useState } from "react";
import { Education } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EducationSectionProps {
  educations: Education[];
  onAdd: (education: Omit<Education, "id" | "createdAt" | "updatedAt">) => void;
  onDelete: (id: string) => void;
}

export default function EducationSection({
  educations,
  onAdd,
  onDelete,
}: EducationSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newEducation, setNewEducation] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
    grade: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    description: "",
    current: false,
    profileId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...newEducation,
      startDate: new Date(newEducation.startDate),
      endDate: newEducation.endDate ? new Date(newEducation.endDate) : null,
    });
    setNewEducation({
      school: "",
      degree: "",
      fieldOfStudy: "",
      grade: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      description: "",
      current: false,
      profileId: "",
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Education</h3>
        <Button onClick={() => setIsAdding(!isAdding)} variant="outline">
          {isAdding ? "Cancel" : "Add Education"}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="school">School/Institution</Label>
            <Input
              id="school"
              value={newEducation.school}
              onChange={(e) =>
                setNewEducation({ ...newEducation, school: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="degree">Degree</Label>
            <Input
              id="degree"
              value={newEducation.degree}
              onChange={(e) =>
                setNewEducation({ ...newEducation, degree: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="fieldOfStudy">Field of Study</Label>
            <Input
              id="fieldOfStudy"
              value={newEducation.fieldOfStudy}
              onChange={(e) =>
                setNewEducation({
                  ...newEducation,
                  fieldOfStudy: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="grade">Grade</Label>
            <Input
              id="grade"
              value={newEducation.grade}
              onChange={(e) =>
                setNewEducation({ ...newEducation, grade: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={newEducation.startDate}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    startDate: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={newEducation.endDate}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, endDate: e.target.value })
                }
                disabled={newEducation.current}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="current"
              checked={newEducation.current}
              onChange={(e) =>
                setNewEducation({
                  ...newEducation,
                  current: e.target.checked,
                  endDate: e.target.checked ? "" : newEducation.endDate,
                })
              }
              aria-label="Currently studying here"
            />
            <Label htmlFor="current">Currently studying here</Label>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newEducation.description}
              onChange={(e) =>
                setNewEducation({
                  ...newEducation,
                  description: e.target.value,
                })
              }
            />
          </div>
          <Button type="submit">Save Education</Button>
        </form>
      )}

      <div className="space-y-4">
        {educations.map((education) => (
          <div
            key={education.id}
            className="p-4 border rounded-lg space-y-2 relative"
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => onDelete(education.id)}
            >
              Delete
            </Button>
            <h4 className="font-medium">{education.school}</h4>
            <p className="text-sm text-gray-600">
              {education.degree} in {education.fieldOfStudy}
              {education.grade && ` - Grade: ${education.grade}`}
            </p>
            <p className="text-sm text-gray-600">
              {education.startDate.toLocaleDateString()} -{" "}
              {education.current
                ? "Present"
                : education.endDate?.toLocaleDateString()}
            </p>
            {education.description && (
              <p className="text-sm">{education.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
