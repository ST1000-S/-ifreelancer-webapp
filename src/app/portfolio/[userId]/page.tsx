import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { getInitials } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default async function PublicPortfolioPage({
  params,
}: {
  params: { userId: string };
}) {
  const profile = await prisma.profile.findUnique({
    where: { userId: params.userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
      portfolio: {
        orderBy: { startDate: "desc" },
      },
      experience: {
        orderBy: { startDate: "desc" },
      },
      education: {
        orderBy: { startDate: "desc" },
      },
      certifications: {
        orderBy: { issueDate: "desc" },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              {profile.user.image ? (
                <Image
                  src={profile.user.image}
                  alt={profile.user.name || "User"}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <AvatarFallback>
                  {getInitials(profile.user.name || "")}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{profile.user.name}</h1>
              <p className="text-xl text-gray-400">{profile.title}</p>
              <div className="flex space-x-4 mt-2">
                {profile.github && (
                  <Link
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      GitHub
                    </Button>
                  </Link>
                )}
                {profile.linkedin && (
                  <Link
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      LinkedIn
                    </Button>
                  </Link>
                )}
                {profile.website && (
                  <Link
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      Website
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* About Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">About</h2>
            <p className="text-gray-300">{profile.bio}</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>

          {/* Portfolio Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.portfolio.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-800 rounded-lg overflow-hidden"
                >
                  {project.imageUrl && (
                    <div className="aspect-video rounded-md overflow-hidden mb-4">
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(project.startDate), "MMM yyyy")} -{" "}
                      {project.endDate
                        ? format(new Date(project.endDate), "MMM yyyy")
                        : "Present"}
                    </div>
                    {project.projectUrl && (
                      <Link
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block"
                      >
                        <Button variant="outline" size="sm">
                          View Project
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Experience Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Experience</h2>
            <div className="space-y-6">
              {profile.experience.map((exp) => (
                <div key={exp.id} className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-xl font-semibold">{exp.title}</h3>
                  <p className="text-gray-400">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(exp.startDate), "MMM yyyy")} -{" "}
                    {exp.endDate
                      ? format(new Date(exp.endDate), "MMM yyyy")
                      : "Present"}
                  </p>
                  <p className="mt-2 text-gray-300">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Education Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Education</h2>
            <div className="space-y-6">
              {profile.education.map((edu) => (
                <div key={edu.id} className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-xl font-semibold">{edu.degree}</h3>
                  <p className="text-gray-400">{edu.school}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(edu.startDate), "MMM yyyy")} -{" "}
                    {edu.endDate
                      ? format(new Date(edu.endDate), "MMM yyyy")
                      : "Present"}
                  </p>
                  {edu.description && (
                    <p className="mt-2 text-gray-300">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Certifications Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Certifications</h2>
            <div className="space-y-6">
              {profile.certifications.map((cert) => (
                <div key={cert.id} className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-xl font-semibold">{cert.name}</h3>
                  <p className="text-gray-400">{cert.issuingBody}</p>
                  <p className="text-sm text-gray-500">
                    Issued: {format(new Date(cert.issueDate), "MMM yyyy")}
                    {cert.expiryDate && (
                      <>
                        {" "}
                        · Expires:{" "}
                        {format(new Date(cert.expiryDate), "MMM yyyy")}
                      </>
                    )}
                  </p>
                  {cert.credentialUrl && (
                    <Link
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block"
                    >
                      <Button variant="outline" size="sm">
                        View Credential
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
