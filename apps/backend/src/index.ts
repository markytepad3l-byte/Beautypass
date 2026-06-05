import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { config } from './utils/config'
import { errorHandler } from './middleware/errorHandler'

import authRouter from './routes/auth'
import treatmentsRouter from './routes/treatments'
import photosRouter from './routes/photos'
import permissionsRouter from './routes/permissions'
import qrRouter from './routes/qr'
import insightsRouter from './routes/insights'
import notesRouter from './routes/notes'
import accountRouter from './routes/account'
import professionalRouter from './routes/professional'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/api/auth', authRouter)
  app.use('/api/treatments', treatmentsRouter)
  app.use('/api/treatments/:treatmentId/photos', photosRouter)
  app.use('/api/treatments/:treatmentId/notes', notesRouter)
  app.use('/api/photos', photosRouter)
  app.use('/api/permissions', permissionsRouter)
  app.use('/api/qr', qrRouter)
  app.use('/api/insights', insightsRouter)
  app.use('/api/account', accountRouter)
  app.use('/api/professional', professionalRouter)

  app.use(errorHandler)

  return app
}

if (require.main === module) {
  const app = createApp()
  app.listen(config.port, () => {
    console.log(`BeautyPass API running on port ${config.port}`)
  })
}
