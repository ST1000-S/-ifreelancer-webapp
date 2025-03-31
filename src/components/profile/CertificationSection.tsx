import { useState } from "react";
import { Certification } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CertificationSectionProps {
  certifications: Certification[];
  onAdd: (
    certification: Omit<Certification, "id" | "createdAt" | "updatedAt">
  ) => void;
  onDelete: (id: string) => void;
}

export default function CertificationSection({
  certifications,
  onAdd,
  onDelete,
}: CertificationSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuingBody: "",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    credentialId: "",
    credentialUrl: "",
    profileId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...newCertification,
      issueDate: new Date(newCertification.issueDate),
      expiryDate: newCertification.expiryDate
        ? new Date(newCertification.expiryDate)
        : null,
      credentialId: newCertification.credentialId || null,
      credentialUrl: newCertification.credentialUrl || null,
    });
    setNewCertification({
      name: "",
      issuingBody: "",
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
      profileId: "",
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Certifications</h3>
        <Button onClick={() => setIsAdding(!isAdding)} variant="outline">
          {isAdding ? "Cancel" : "Add Certification"}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Certification Name</Label>
            <Input
              id="name"
              value={newCertification.name}
              onChange={(e) =>
                setNewCertification({
                  ...newCertification,
                  name: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="issuingBody">Issuing Organization</Label>
            <Input
              id="issuingBody"
              value={newCertification.issuingBody}
              onChange={(e) =>
                setNewCertification({
                  ...newCertification,
                  issuingBody: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={newCertification.issueDate}
                onChange={(e) =>
                  setNewCertification({
                    ...newCertification,
                    issueDate: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={newCertification.expiryDate}
                onChange={(e) =>
                  setNewCertification({
                    ...newCertification,
                    expiryDate: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="credentialId">Credential ID</Label>
            <Input
              id="credentialId"
              value={newCertification.credentialId}
              onChange={(e) =>
                setNewCertification({
                  ...newCertification,
                  credentialId: e.target.value,
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="credentialUrl">Credential URL</Label>
            <Input
              id="credentialUrl"
              type="url"
              value={newCertification.credentialUrl}
              onChange={(e) =>
                setNewCertification({
                  ...newCertification,
                  credentialUrl: e.target.value,
                })
              }
            />
          </div>
          <Button type="submit">Save Certification</Button>
        </form>
      )}

      <div className="space-y-4">
        {certifications.map((certification) => (
          <div
            key={certification.id}
            className="p-4 border rounded-lg space-y-2 relative"
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => onDelete(certification.id)}
            >
              Delete
            </Button>
            <h4 className="font-medium">{certification.name}</h4>
            <p className="text-sm text-gray-600">{certification.issuingBody}</p>
            <p className="text-sm text-gray-600">
              Issued: {certification.issueDate.toLocaleDateString()}
              {certification.expiryDate &&
                ` - Expires: ${certification.expiryDate.toLocaleDateString()}`}
            </p>
            {certification.credentialId && (
              <p className="text-sm">ID: {certification.credentialId}</p>
            )}
            {certification.credentialUrl && (
              <a
                href={certification.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View Credential
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
