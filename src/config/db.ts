import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection established successfully");
    connection.release();
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
}

export { pool, testConnection };
