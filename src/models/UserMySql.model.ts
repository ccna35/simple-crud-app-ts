import pool from "../db/connection";
import { User, UserModel, CreateUserDTO } from "./User.model";

export class UserMySqlModel implements UserModel {
  tableName = "users";

  async findAll(): Promise<User[]> {
    const [rows] = await pool.query<User[]>(`
      SELECT 
        id, 
        first_name AS firstName, 
        last_name AS lastName, 
        username, 
        email, 
        created_at AS createdAt, 
        updated_at AS updatedAt 
      FROM ${this.tableName}
    `);
    return rows;
  }

  async findById(id: string): Promise<User | null> {
    const [rows] = await pool.query<User[]>(
      `SELECT 
        id, 
        first_name AS firstName, 
        last_name AS lastName, 
        username, 
        email, 
        created_at AS createdAt, 
        updated_at AS updatedAt 
      FROM ${this.tableName} WHERE id = ?`,
      [id]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<User[]>(
      `SELECT 
        id, 
        first_name AS firstName, 
        last_name AS lastName, 
        username, 
        email,
        created_at AS createdAt, 
        updated_at AS updatedAt 
      FROM ${this.tableName} WHERE email = ?`,
      [email]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.query<User[]>(
      `SELECT 
        id, 
        first_name AS firstName, 
        last_name AS lastName, 
        username, 
        email, 
        hashed_password AS password,
        created_at AS createdAt, 
        updated_at AS updatedAt 
      FROM ${this.tableName} WHERE username = ?`,
      [username]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  async create(user: CreateUserDTO): Promise<string> {
    const [result] = await pool.query(
      `INSERT INTO ${this.tableName} (username, email, hashed_password, first_name, last_name) 
       VALUES (?, ?, ?, ?, ?)`,
      [user.username, user.email, user.password, user.firstName, user.lastName]
    );

    return (result as any).insertId.toString();
  }

  async update(id: string, user: Partial<CreateUserDTO>): Promise<boolean> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (user.firstName !== undefined) {
      updateFields.push("first_name = ?");
      values.push(user.firstName);
    }

    if (user.lastName !== undefined) {
      updateFields.push("last_name = ?");
      values.push(user.lastName);
    }

    if (user.username !== undefined) {
      updateFields.push("username = ?");
      values.push(user.username);
    }

    if (user.email !== undefined) {
      updateFields.push("email = ?");
      values.push(user.email);
    }

    if (user.password !== undefined) {
      updateFields.push("hashed_password = ?");
      values.push(user.password);
    }

    if (updateFields.length === 0) {
      return false;
    }

    // Add updated_at timestamp
    updateFields.push("updated_at = NOW()");

    values.push(id);

    const [result] = await pool.query(
      `UPDATE ${this.tableName} SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    return (result as any).affectedRows > 0;
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await pool.query(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );

    return (result as any).affectedRows > 0;
  }

  async markAsVerified(id: string, verifiedAt: Date): Promise<boolean> {
    const [result] = await pool.query(
      `UPDATE ${this.tableName} SET is_verified = TRUE, verified_at = ? WHERE id = ?`,
      [verifiedAt, id]
    );
    return (result as any).affectedRows > 0;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const [rows] = await pool.query<User[]>(
      `SELECT u.id, u.first_name AS firstName, u.last_name AS lastName, 
            u.username, u.email, u.hashed_password AS password, 
            u.is_verified AS isVerified, u.verified_at AS verifiedAt,
            u.created_at AS createdAt, u.updated_at AS updatedAt 
     FROM ${this.tableName} u 
     JOIN verification_tokens vt ON u.id = vt.user_id 
     WHERE vt.token = ? AND vt.expires_at > NOW()`,
      [token]
    );
    return rows.length > 0 ? rows[0] : null;
  }
}
