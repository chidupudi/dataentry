import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom Vite plugin to handle local file system saving
const localApiPlugin = () => ({
  name: 'configure-server',
  configureServer(server: any) {
    server.middlewares.use('/api/data', (req: any, res: any) => {
      const dataFilePath = path.resolve(__dirname, 'data.json')

      if (req.method === 'GET') {
        if (fs.existsSync(dataFilePath)) {
          const content = fs.readFileSync(dataFilePath, 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.end(content)
        } else {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify([]))
        }
      } else if (req.method === 'POST') {
        let body = ''
        req.on('data', (chunk: string) => { body += chunk })
        req.on('end', () => {
          try {
            // Verify it's valid JSON
            JSON.parse(body)
            fs.writeFileSync(dataFilePath, body, 'utf-8')
            res.statusCode = 200
            res.end(JSON.stringify({ success: true }))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid JSON' }))
          }
        })
      }
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
})
