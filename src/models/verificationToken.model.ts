import { RowDataPacket } from "mysql2";

export interface VerificationToken extends RowDataPacket {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
}

export interface VerificationTokenModel {
  create(userId: string, token: string, expiresAt: Date): Promise<string>;
  findByToken(token: string): Promise<VerificationToken | null>;
  deleteByToken(token: string): Promise<boolean>;
  deleteByUserId(userId: string): Promise<boolean>;
  deleteExpired(): Promise<number>; // Returns number of deleted tokens
}