import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema, idParamSchema } from '../validators/user.validator';

const router = Router();
const userController = new UserController();

// GET /api/users - Get all users
router.get('/', userController.getUsers);

// GET /api/users/:id - Get a single user by ID
router.get('/:id', validate(idParamSchema, 'params'), userController.getUserById);

// POST /api/users - Create a new user
router.post('/', validate(createUserSchema), userController.createUser);

// PUT /api/users/:id - Update a user
router.put('/:id', 
  validate(idParamSchema, 'params'),
  validate(updateUserSchema),
  userController.updateUser
);

// DELETE /api/users/:id - Delete a user
router.delete('/:id', validate(idParamSchema, 'params'), userController.deleteUser);

export default router;