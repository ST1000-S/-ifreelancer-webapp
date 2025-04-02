"use client";

import { Portfolio } from "@/types/profile";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ExternalLink, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PortfolioCardProps {
  item: Portfolio;
  onDelete?: (id: string) => void;
  isOwner?: boolean;
}

export function PortfolioCard({
  item,
  onDelete,
  isOwner = false,
}: PortfolioCardProps) {
  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-video overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
      </div>
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1">{item.title}</CardTitle>
          {isOwner && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(item.startDate), "MMM yyyy")}
            {item.endDate
              ? ` - ${format(new Date(item.endDate), "MMM yyyy")}`
              : " - Present"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-3">
          {item.description}
        </CardDescription>
        <div className="flex flex-wrap gap-2">
          {item.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      {item.projectUrl && (
        <CardFooter>
          <a
            href={item.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            View Project
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardFooter>
      )}
    </Card>
  );
}
