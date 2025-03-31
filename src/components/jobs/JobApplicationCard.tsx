import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { JobApplication } from "@prisma/client";

interface JobApplicationCardProps {
  application: JobApplication & {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
  onStatusChange: (applicationId: string, status: string) => void;
}

export default function JobApplicationCard({
  application,
  onStatusChange,
}: JobApplicationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            {application.user.image ? (
              <AvatarImage
                src={application.user.image}
                alt={application.user.name || ""}
              />
            ) : (
              <AvatarFallback>
                {application.user.name?.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{application.user.name}</h3>
            <div className="flex space-x-4">
              <Link href={`/portfolio/${application.user.id}`}>
                <Button variant="ghost" size="sm">
                  View Portfolio
                </Button>
              </Link>
              {application.user.email && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`mailto:${application.user.email}`}>Contact</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
        <div>
          <label htmlFor={`status-${application.id}`} className="sr-only">
            Application Status
          </label>
          <select
            id={`status-${application.id}`}
            value={application.status}
            onChange={(e) => onStatusChange(application.id, e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>
      <p className="text-gray-600">{application.coverLetter}</p>
      {application.attachments && (
        <div className="space-y-2">
          <h4 className="font-medium">Attachments</h4>
          <div className="flex flex-wrap gap-2">
            {application.attachments.map((attachment, index) => (
              <a
                key={index}
                href={attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Attachment {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
