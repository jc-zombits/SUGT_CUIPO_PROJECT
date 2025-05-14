// knexfile.js

require('dotenv').config();

module.exports = {
  development: {
    client: 'postgresql',  // Cambié 'sqlite3' a 'postgresql'
    connection: {
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'sugt',
      user:     process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    },
    searchPath: ['sis_cuipo'],
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/db/migrations',
    },
    seed: {
      directory: './src/db/seeds',
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'sugt',
      user:     process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    },
    searchPath: ['sis_cuipo'],
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/db/migrations',
    },
    seed: {
      directory: './src/db/seeds',
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'sugt',
      user:     process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    },
    searchPath: ['sis_cuipo'],
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/db/migrations'
    },
    seed: {
      directory: './src/db/seeds',
    }
  }
};
