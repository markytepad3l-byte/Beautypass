exports.up = (pgm) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true })

  // Auth
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'text', notNull: true },
    role: { type: 'varchar(20)', notNull: true },
    email_verified_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  })

  pgm.createTable('refresh_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    token_hash: { type: 'varchar(64)', notNull: true, unique: true },
    family_id: { type: 'uuid', notNull: true },
    device_meta: { type: 'jsonb' },
    revoked_at: { type: 'timestamptz' },
    expires_at: { type: 'timestamptz', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  })

  pgm.createTable('password_reset_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    token_hash: { type: 'varchar(64)', notNull: true, unique: true },
    used_at: { type: 'timestamptz' },
    expires_at: { type: 'timestamptz', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  })

  pgm.createTable('email_verifications', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    token_hash: { type: 'varchar(64)', notNull: true, unique: true },
    expires_at: { type: 'timestamptz', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  })

  // Profiles
  pgm.createTable('client_profiles', {
    user_id: { type: 'uuid', primaryKey: true, references: 'users', onDelete: 'CASCADE' },
    full_name: { type: 'varchar(255)', notNull: true },
    dob: { type: 'date' },
    skin_type: { type: 'varchar(100)' },
    allergies: { type: 'text' },  // encrypted at app layer
    avatar_url: { type: 'text' },
    consent_ai_processing: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  })

  pgm.createTable('doctor_profiles', {
    user_id: { type: 'uuid', primaryKey: true, references: 'users', onDelete: 'CASCADE' },
    full_name: { type: 'varchar(255)', notNull: true },
    license_number: { type: 'varchar(100)' },
    specialization: { type: 'varchar(255)' },
    avatar_url: { type: 'text' },
  })

  pgm.createTable('clinic_profiles', {
    user_id: { type: 'uuid', primaryKey: true, references: 'users', onDelete: 'CASCADE' },
    name: { type: 'varchar(255)', notNull: true },
    address: { type: 'text' },
    phone: { type: 'varchar(50)' },
    logo_url: { type: 'text' },
  })

  pgm.createTable('clinic_members', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    clinic_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    role: { type: 'varchar(50)', notNull: true, default: 'doctor' },
    status: { type: 'varchar(20)', notNull: true, default: 'active' },
    joined_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  })
  pgm.addConstraint('clinic_members', 'clinic_members_unique', 'UNIQUE (clinic_id, user_id)')

  // Treatments
  pgm.createTable('treatments', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    client_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    doctor_id: { type: 'uuid', references: 'users' },
    clinic_id: { type: 'uuid', references: 'users' },
    title: { type: 'varchar(255)', notNull: true },
    type: { type: 'varchar(100)', notNull: true },
    date: { type: 'date', notNull: true },
    notes: { type: 'text' },  // encrypted at app layer
    status: { type: 'varchar(20)', notNull: true, default: 'planned' },
    deleted_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  })
  pgm.createIndex('treatments', 'client_id')

  pgm.createTable('photos', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    treatment_id: { type: 'uuid', notNull: true, references: 'treatments', onDelete: 'CASCADE' },
    client_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    phase: { type: 'varchar(20)', notNull: true },
    storage_key: { type: 'text', notNull: true },
    area_tag: { type: 'varchar(100)' },
    consent_clinical: { type: 'boolean', notNull: true, default: false },
    exif_stripped: { type: 'boolean', notNull: true, default: false },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  })
  pgm.createIndex('photos', 'treatment_id')

  pgm.createTable('professional_notes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    treatment_id: { type: 'uuid', notNull: true, references: 'treatments', onDelete: 'CASCADE' },
    author_id: { type: 'uuid', notNull: true, references: 'users' },
    content: { type: 'text', notNull: true },  // encrypted at app layer
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  })

  // Access control
  pgm.createTable('permissions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    client_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    grantee_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    grantee_type: { type: 'varchar(20)', notNull: true },
    access_level: { type: 'varchar(20)', notNull: true, default: 'readonly' },
    granted_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    expires_at: { type: 'timestamptz' },
    revoked_at: { type: 'timestamptz' },
  })
  pgm.createIndex('permissions', ['client_id', 'grantee_id'])

  pgm.createTable('qr_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    client_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    token_hash: { type: 'varchar(64)', notNull: true, unique: true },
    access_level: { type: 'varchar(20)', notNull: true },
    used_at: { type: 'timestamptz' },
    expires_at: { type: 'timestamptz', notNull: true },
    resulting_permission_id: { type: 'uuid', references: 'permissions' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  })

  pgm.createTable('audit_log', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    actor_id: { type: 'uuid', notNull: true },
    actor_role: { type: 'varchar(20)', notNull: true },
    action: { type: 'varchar(100)', notNull: true },
    resource_type: { type: 'varchar(50)', notNull: true },
    resource_id: { type: 'uuid' },
    ip: { type: 'varchar(45)' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  })
  pgm.createIndex('audit_log', ['actor_id', 'created_at'])

  // AI
  pgm.createTable('ai_insights', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    client_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    prompt_hash: { type: 'varchar(64)', notNull: true },
    input_summary: { type: 'text', notNull: true },
    output_content: { type: 'text', notNull: true },
    model_version: { type: 'varchar(100)', notNull: true },
    generated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  })
  pgm.createIndex('ai_insights', 'client_id')
}

exports.down = (pgm) => {
  pgm.dropTable('ai_insights')
  pgm.dropTable('audit_log')
  pgm.dropTable('qr_tokens')
  pgm.dropTable('permissions')
  pgm.dropTable('professional_notes')
  pgm.dropTable('photos')
  pgm.dropTable('treatments')
  pgm.dropTable('clinic_members')
  pgm.dropTable('clinic_profiles')
  pgm.dropTable('doctor_profiles')
  pgm.dropTable('client_profiles')
  pgm.dropTable('email_verifications')
  pgm.dropTable('password_reset_tokens')
  pgm.dropTable('refresh_tokens')
  pgm.dropTable('users')
}
