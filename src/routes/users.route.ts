import { Router } from "express";
import { UserController } from "../controllers/users.controller";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  createUserSchema,
  updateUserSchema
} from "../validators/user.validator";

// Middleware to validate request body
const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        message: "Invalid input",
        error: error instanceof z.ZodError ? error.errors : error
      });
    }
  };
};

// Middleware to validate ID parameter
const validateId = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid ID" });
  }
  next();
};

const router = Router();

// Routes mapped to static UserController methods
router.get("/", UserController.getAllUsers);
router.get("/:id", validateId, UserController.getUserById);
router.post("/", validate(createUserSchema), UserController.createUser);
router.put(
  "/:id",
  validateId,
  validate(updateUserSchema),
  UserController.updateUser
);
router.delete("/:id", validateId, UserController.deleteUser);

export default router;
