import pool from '../db/pool'

export async function hasPermission(clientId: string, granteeId: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT id FROM permissions
     WHERE client_id = $1
       AND grantee_id = $2
       AND revoked_at IS NULL
       AND (expires_at IS NULL OR expires_at > now())
     LIMIT 1`,
    [clientId, granteeId]
  )
  return rows.length > 0
}

export async function requirePermission(clientId: string, granteeId: string): Promise<void> {
  const ok = await hasPermission(clientId, granteeId)
  if (!ok) {
    const err = new Error('Permission denied') as Error & { status: number }
    err.status = 403
    throw err
  }
}
