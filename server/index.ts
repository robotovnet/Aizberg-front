import express from 'express'
import { createPageRender } from 'vite-plugin-ssr'
import cookieParser from 'cookie-parser'

require('dotenv').config()

const isProduction = process.env.NODE_ENV === 'production'
const isHttps = process.env.https && process.env.https == 'true'
const root = `${__dirname}/..`
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
let host = '0.0.0.0'
let httpPort = 8080
let httpsPort = 443

startServer()

async function startServer() {
  const app = express()
  app.use(cookieParser())
  let viteDevServer
  if (isProduction) {
    app.use(express.static(`${root}/dist/client`, { index: false }))
  } else {
    console.info("DEV MODE")
    const vite = require('vite')
    viteDevServer = await vite.createServer({
      root,
      server: { middlewareMode: true, https: isHttps, }
    })
    app.use(viteDevServer.middlewares)
  }
  const renderPage = createPageRender({ viteDevServer, isProduction, root })
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl
    const pageContext = {
      url,
      cookies: req.cookies,
      headers: []
    }

    //res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    //res.setHeader('Pragma', 'no-cache');
    //res.setHeader('Expires', '0');
    
    const result = await renderPage(pageContext) 
    if (result.nothingRendered)
      return next()
    else if ((result.renderResult as any)?.redirectTo) {
      if(pageContext.headers && pageContext.headers.length > 0) {
        for(let header of pageContext.headers) 
          res.setHeader((header as any).name, (header as any).value)
      }
      res.redirect(307, (result.renderResult as any).redirectTo)
    }
    else {
        res.status(result.statusCode).send(result.renderResult)
      }
  })

  // Функция для создания HTTP сервера
  const createHttpServer = () => {
    const httpServer = http.createServer(app)
    httpServer.listen(httpPort, host, () => {
      console.log(`✅ HTTP Server running at http://${host}:${httpPort}`)
    })
    return httpServer
  }

  // Функция для создания HTTPS сервера
  const createHttpsServer = () => {
    try {
      // Поддержка различных путей к сертификатам через переменные окружения
      const certPath = process.env.SSL_CERT_PATH || path.resolve(__dirname, 'ssl/server.cert')
      const keyPath = process.env.SSL_KEY_PATH || path.resolve(__dirname, 'ssl/server.key')
      const caPath = process.env.SSL_CA_PATH
      
      // Проверяем существование файлов сертификатов
      if (!fs.existsSync(certPath)) {
        console.warn(`⚠️  SSL сертификат не найден: ${certPath}`)
        console.warn('HTTPS сервер не будет запущен.')
        return null
      }
      
      if (!fs.existsSync(keyPath)) {
        console.warn(`⚠️  SSL приватный ключ не найден: ${keyPath}`)
        console.warn('HTTPS сервер не будет запущен.')
        return null
      }

      const cert = fs.readFileSync(certPath)
      const key = fs.readFileSync(keyPath)
      
      const httpsOptions: any = {
        cert,
        key
      }
      
      // Добавляем CA сертификат, если он указан
      if (caPath && fs.existsSync(caPath)) {
        httpsOptions.ca = fs.readFileSync(caPath)
      }
      
      const httpsServer = https.createServer(httpsOptions, app)
      
      httpsServer.listen(httpsPort, host, () => {
        console.log(`🔒 HTTPS Server running at https://${host}:${httpsPort}`)
      })
      
      return httpsServer
    } catch (error) {
      console.error('❌ Ошибка при создании HTTPS сервера:', error)
      return null
    }
  }

  if(isProduction) {
    host = '0.0.0.0'
    httpPort = (process.env.PORT) ? parseInt(process.env.PORT) : 8080
    httpsPort = (process.env.HTTPS_PORT) ? parseInt(process.env.HTTPS_PORT) : 443
    
    console.log('🚀 Starting production servers...')
    
    // Всегда запускаем HTTP сервер
    createHttpServer()
    
    // Пытаемся запустить HTTPS сервер, если доступны сертификаты
    createHttpsServer()
    
  } else {
    host = '0.0.0.0'
    httpPort = 8080
    httpsPort = 443
    
    console.log('🚀 Starting development servers...')
    
    // В режиме разработки запускаем оба сервера
    createHttpServer()
    
    // Пытаемся запустить HTTPS сервер, если доступны сертификаты
    createHttpsServer()
  }
}
