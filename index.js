require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Phone = require('./models/phone')

function requestLogger(request, response, next) {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

function errorHandler(error, request, response, next) {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

function unknownEndpoint(request, response) {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(requestLogger)

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

app.get('/api/persons', (request, response) => {
  Phone.find({}).then((result) => {
    response.json(result)
    // mongoose.connection.close();
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Phone.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.get('/info', (request, response) => {
  Phone.find({}).then((result) => {
    response.send(
      `<div><p>Phonebook has info for ${
        Object.keys(result).length
      } people</p><p>${new Date()}</p></div>`
    )
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Phone.findByIdAndDelete(request.params.id)
    .then((result) => {
      if (!result) {
        return response.status(400).json({
          error: 'info already deleted from server',
        })
      }
      console.log(`app.delete; Stage:then; result:${result}`)
      response.status(204).end()
    })
    .catch((error) => {
      console.log('app.delete Stage:catch')
      next(error)
    })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'content missing',
    })
  }

  Phone.find({}).then((result) => {
    if (result.find((person) => person.name === body.name)) {
      return response.status(400).json({
        error: 'name must be unique',
      })
    }
    const phone = new Phone({
      name: body.name,
      number: body.number,
    })

    phone
      .save()
      .then((savedPhone) => {
        response.json(savedPhone)
      })
      .catch((error) => next(error))
  })
})

app.patch('/api/persons/:id', (request, response, next) => {
  const body = request.body

  Phone.findByIdAndUpdate(
    request.params.id,
    { number: body.number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPhone) => {
      console.log(`app.patch, stage:then, message:${updatedPhone}`)
      if (!updatedPhone) {
        return response.status(400).json({
          error: 'info already deleted from server',
        })
      }
      response.json(updatedPhone)
    })
    .catch((error) => next(error))
})
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
