import pool from '../db/pool'
import { UserRole } from '@beautypass/shared'

export async function writeAuditLog(opts: {
  actorId: string
  actorRole: UserRole
  action: string
  resourceType: string
  resourceId?: string
  ip?: string
}): Promise<void> {
  await pool.query(
    `INSERT INTO audit_log (actor_id, actor_role, action, resource_type, resource_id, ip)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [opts.actorId, opts.actorRole, opts.action, opts.resourceType, opts.resourceId ?? null, opts.ip ?? null]
  )
}
