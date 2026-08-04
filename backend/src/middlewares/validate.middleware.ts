import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export const validate = (
  schema: z.ZodType,
  source: "body" | "params" | "query" = "body"
) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {

    // Run the clean, preprocessed data payload structure against your Zod Schema
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const flattened = z.flattenError(result.error);

      //console.log(flattened)

      const messages = Object.values(flattened.fieldErrors)
        .flat()
        .join(", ");

      throw new ApiError(400, "Invalid request data");
    }

    // Assign the clean parsed data back to the request object
    req[source] = result.data;
    next();
  };