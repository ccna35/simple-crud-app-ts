import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (
  schema: ZodSchema,
  property: "body" | "params" | "query" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[property];
      const validatedData = schema.parse(data);

      // Replace the request data with the validated data
      req[property] = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format the Zod error for better client feedback
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
          code: err.code
        }));

        // Create a user-friendly error response
        const errorMessage =
          formattedErrors.length === 1
            ? formattedErrors[0].message
            : "Validation failed. Please check your input.";

        res.status(400).json({
          success: false,
          error: {
            message: errorMessage,
            details: formattedErrors,
            // Add a description of expected fields when appropriate
            expectedFields:
              property === "body" && "shape" in schema
                ? Object.keys((schema as any).shape || {}).map((key) => ({
                    field: key,
                    type: (schema as any).shape[key].description || "unknown"
                  }))
                : undefined
          }
        });
        return;
      }
      next(error);
    }
  };
};
