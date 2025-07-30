// import mysql from "mysql2/promise";

// // Database connection configuration
// const dbConfig = {
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   connectionLimit: 3,
// };

// // Create a connection pool
// const pool = mysql.createPool(dbConfig);

// // Export pool as default
// export default pool;

import mysql from "mysql2/promise";

let pool;

if (!global._mysqlPool) {
  global._mysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
  });
}

pool = global._mysqlPool;

export default pool;