import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import { BackendAssistantServer } from './src/services/backendAssistantServer.ts'

function assistantBackendPlugin(): Plugin {
  return {
    name: 'assistant-backend-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/assistant')) {
          return next()
        }

        const url = new URL(req.url, 'http://localhost:5173')
        res.setHeader('Content-Type', 'application/json')

        // Parse JSON body helper
        const parseBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let body = ''
            req.on('data', (chunk) => (body += chunk))
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {})
              } catch {
                resolve({})
              }
            })
          })
        }

        if (url.pathname === '/api/assistant/tasks' && req.method === 'GET') {
          res.end(JSON.stringify({ tasks: BackendAssistantServer.getTasks() }))
          return
        }

        if (url.pathname === '/api/assistant/start' && req.method === 'POST') {
          const body = await parseBody()
          const result = BackendAssistantServer.startTask(body)
          res.end(JSON.stringify(result))
          return
        }

        if (url.pathname === '/api/assistant/stop' && req.method === 'POST') {
          const body = await parseBody()
          const result = BackendAssistantServer.stopTask(body.id)
          res.end(JSON.stringify(result))
          return
        }

        if (url.pathname === '/api/assistant/verify' && req.method === 'POST') {
          const body = await parseBody()
          const result = BackendAssistantServer.solveVerification(body.id, body.solution)
          res.end(JSON.stringify(result))
          return
        }

        if (url.pathname === '/api/assistant/approve-booking' && req.method === 'POST') {
          const body = await parseBody()
          const result = BackendAssistantServer.approveBooking(body.id)
          res.end(JSON.stringify(result))
          return
        }

        res.statusCode = 404
        res.end(JSON.stringify({ error: 'Endpoint not found' }))
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), assistantBackendPlugin()],
  resolve: {
    alias: {
      'lucide-react': path.resolve(import.meta.dirname, 'src/components/icons.tsx')
    }
  }
})

