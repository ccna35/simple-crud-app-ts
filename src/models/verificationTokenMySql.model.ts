import { v4 as uuidv4 } from "uuid";
import pool from "../db/connection";
import { VerificationToken, VerificationTokenModel } from "./verificationToken.model";

export class VerificationTokenMySqlModel implements VerificationTokenModel {
  tableName = "verification_tokens";

  async create(userId: string, token: string, expiresAt: Date): Promise<string> {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO ${this.tableName} (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
      [id, userId, token, expiresAt]
    );
    return id;
  }

  async findByToken(token: string): Promise<VerificationToken | null> {
    const [rows] = await pool.query<VerificationToken[]>(
      `SELECT id, user_id AS userId, token, expires_at AS expiresAt, created_at AS createdAt
       FROM ${this.tableName} 
       WHERE token = ?`,
      [token]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async deleteByToken(token: string): Promise<boolean> {
    const [result] = await pool.query(
      `DELETE FROM ${this.tableName} WHERE token = ?`,
      [token]
    );
    return (result as any).affectedRows > 0;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const [result] = await pool.query(
      `DELETE FROM ${this.tableName} WHERE user_id = ?`,
      [userId]
    );
    return (result as any).affectedRows > 0;
  }

  async deleteExpired(): Promise<number> {
    const [result] = await pool.query(
      `DELETE FROM ${this.tableName} WHERE expires_at < NOW()`
    );
    return (result as any).affectedRows;
  }
}