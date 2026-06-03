import { Pool } from 'pg'

export default async function globalTeardown() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  await pool.query(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`)
  await pool.end()
}
