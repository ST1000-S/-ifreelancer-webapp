"use client";

import * as React from "react";
import { Paperclip, Calendar, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApplicationFormProps {
  jobId: string;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export function ApplicationForm({
  jobId,
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      formData.append("jobId", jobId);
      await onSubmit(formData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit application"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Submit Your Application</CardTitle>
        <CardDescription>
          Please fill out the form below to apply for this position.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                name="coverLetter"
                placeholder="Tell us why you're a good fit for this position..."
                className="min-h-[200px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Proposed Rate (USD/hr)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="rate"
                    name="rate"
                    type="number"
                    placeholder="Hourly rate"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select name="availability" required>
                  <SelectTrigger id="availability" className="w-full">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="1week">1 Week Notice</SelectItem>
                    <SelectItem value="2weeks">2 Weeks Notice</SelectItem>
                    <SelectItem value="1month">1 Month Notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Preferred Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Paperclip className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="attachments"
                    name="attachments"
                    type="file"
                    multiple
                    className="pl-9"
                    accept=".pdf,.doc,.docx"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload your resume, portfolio, or any other relevant documents
                (PDF, DOC, DOCX)
              </p>
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
