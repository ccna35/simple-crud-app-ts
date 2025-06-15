import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { testConnection } from "./config/db";

const app = express();

app.use(cors());
app.use(express.json());

// Test database connection
testConnection();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
