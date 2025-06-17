import { RowDataPacket } from "mysql2";

export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface User extends RowDataPacket {
  id: string;
  firstName: string;
  lastName: string;
  createdAt?: Date;
  updatedAt?: Date;
  username: string;
  email: string;
  password: string;
  isVerified: boolean; // New field
  verifiedAt?: Date; // New field
}

// Update UserResponse interface
export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isVerified: boolean; // New field
  verifiedAt?: string; // New field
  createdAt?: string;
  updatedAt?: string;
}

// Update UserModel interface to include verification methods
export interface UserModel {
  // Existing methods
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(user: CreateUserDTO): Promise<string>;
  update(id: string, user: Partial<CreateUserDTO>): Promise<boolean>;
  delete(id: string): Promise<boolean>;

  // New methods for verification
  markAsVerified(id: string, verifiedAt: Date): Promise<boolean>;
  findByVerificationToken(token: string): Promise<User | null>;
}
