import { RowDataPacket } from "mysql2";

// Full user interface with all properties including hashedPassword
export interface User extends RowDataPacket {
  id: string;
  firstName: string;
  lastName: string;
  createdAt?: Date;
  updatedAt?: Date;
  username: string;
  email: string;
  password: string;
}

// User response object that excludes hashedPassword
export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface UserModel {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(user: CreateUserDTO): Promise<string>;
  update(id: string, user: Partial<CreateUserDTO>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
