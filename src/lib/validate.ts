import { NextResponse } from "next/server";
import { z } from "zod";

export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): Promise<
  { success: true; data: z.infer<T> } | { success: false; error: string }
> {
  try {
    const result = schema.parse(data);
    return Promise.resolve({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Promise.resolve({
        success: false,
        error: error.errors[0].message,
      });
    }
    return Promise.resolve({
      success: false,
      error: "Invalid request data",
    });
  }
}

export async function validateRequestMiddleware<T extends z.ZodType>(
  req: Request,
  schema: T
) {
  try {
    const body = await req.json();
    const result = await validateRequest(schema, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return { success: true, data: result.data };
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}
