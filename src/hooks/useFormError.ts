import { useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import { toast } from "@/components/ui/use-toast";
import { ZodError } from "zod";

interface APIErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: Array<{
      code: string;
      message: string;
      path: string[];
    }>;
  };
}

export function useFormError() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleError = useCallback((error: unknown) => {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      toast({
        title: "Validation Error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
      return;
    }

    if (error instanceof Response || error instanceof Error) {
      const isResponseError = error instanceof Response;

      // Log the error
      logger.error("Form submission error:", error);

      // Handle API error responses
      if (isResponseError) {
        error
          .json()
          .then((data: APIErrorResponse) => {
            if (data.error.details) {
              // Handle validation errors from API
              const fieldErrors: Record<string, string> = {};
              data.error.details.forEach((detail) => {
                const path = detail.path.join(".");
                fieldErrors[path] = detail.message;
              });
              setErrors(fieldErrors);
            }

            toast({
              title: "Error",
              description: data.error.message,
              variant: "destructive",
            });
          })
          .catch(() => {
            toast({
              title: "Error",
              description: "An unexpected error occurred. Please try again.",
              variant: "destructive",
            });
          });
      } else {
        // Handle other errors
        toast({
          title: "Error",
          description:
            error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    // Handle unknown errors
    logger.error("Unknown form error:", error as Error);
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive",
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    handleError,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0,
    getFieldError: (field: string) => errors[field],
  };
}
