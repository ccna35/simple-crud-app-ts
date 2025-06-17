import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate, authorizeUser } from "../middlewares/auth.middleware";
import {
  createUserSchema,
  updateUserSchema,
  idParamSchema
} from "../validators/user.validator";

const router = Router();
const userController = new UserController();

// GET /api/users - Get all users (protected)
router.get("/", authenticate, userController.getUsers);

// GET /api/users/:id - Get a single user by ID (protected)
router.get(
  "/:id",
  authenticate,
  validate(idParamSchema, "params"),
  userController.getUserById
);

// POST /api/users - Create a new user (public for registration)
router.post("/", validate(createUserSchema), userController.createUser);

// PUT /api/users/:id - Update a user (protected + owner only)
router.put(
  "/:id",
  authenticate,
  validate(idParamSchema, "params"),
  validate(updateUserSchema),
  authorizeUser,
  userController.updateUser
);

// DELETE /api/users/:id - Delete a user (protected + owner only)
router.delete(
  "/:id",
  authenticate,
  validate(idParamSchema, "params"),
  authorizeUser,
  userController.deleteUser
);

export default router;
