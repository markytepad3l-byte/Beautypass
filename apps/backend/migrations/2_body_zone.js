exports.up = (pgm) => {
  pgm.addColumns('treatments', {
    body_zone: { type: 'text' },
    created_by_id: { type: 'uuid', references: 'users(id)' },
  })
}

exports.down = (pgm) => {
  pgm.dropColumns('treatments', ['body_zone', 'created_by_id'])
}
