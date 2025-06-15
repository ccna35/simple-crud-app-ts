export interface User {
  id?: string;
  username: string;
  email: string;
  hashedPassword: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
