require('dotenv').config();

module.exports = {
  development: {
    username: process.env.SQL_USER || 'postgres',
    password: process.env.SQL_PASSWORD || 'Fullstack25',
    database: process.env.SQL_DB || 'skincare',
    host: process.env.SQL_HOST || '127.0.0.1',
    port: parseInt(process.env.SQL_PORT || '5432'),
    dialect: 'postgres',
  },
  production: {
    username: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB,
    host: process.env.SQL_HOST || '127.0.0.1',
    port: parseInt(process.env.SQL_PORT || '5432'),
    dialect: 'postgres',
    pool: { min: 2, max: 10, acquire: 30000, idle: 10000 },
    logging: false,
  },
};
