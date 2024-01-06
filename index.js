const app = require('./app')
const config = require('./utils/config')
const logger = require('./utils/logger')


const morgan = require('morgan')

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens['body'](req),
    ].join(' ')
  })
)

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
