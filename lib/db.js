// import mysql from 'mysql2/promise';

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// export default pool;

import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Query function to execute SQL queries
export async function query(sql, values) {
  try {
    const [rows] = await pool.query(sql, values);
    return rows;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}
