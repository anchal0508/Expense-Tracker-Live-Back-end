require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
  production: {
  use_env_variable: 'DATABASE_URL', 
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  // Yeh block connections ko sahi se handle karega aur auth fail nahi hone dega
  pool: {
    max: 5,        // Ek baar me maximum 5 connections open honge
    min: 0,        // Jab kaam na ho toh zero ho jayenge
    acquire: 30000, // Connection milne ka max time (30 seconds)
    idle: 10000    // 10 seconds khali rehne par connection band ho jayega
  }
}
};
