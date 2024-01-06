const phonesRouter = require('express').Router()
const Phone = require('../models/phone')

phonesRouter.get('/', (request, response) => {
  Phone.find({}).then((result) => {
    response.json(result)
  })
})

phonesRouter.get('/:id', (request, response, next) => {
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

phonesRouter.get('/info', (request, response) => {
  Phone.find({}).then((result) => {
    response.send(
      `<div><p>Phonebook has info for ${
        Object.keys(result).length
      } people</p><p>${new Date()}</p></div>`
    )
  })
})

phonesRouter.delete('/:id', (request, response, next) => {
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

phonesRouter.post('/', (request, response, next) => {
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

phonesRouter.patch('/:id', (request, response, next) => {
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

module.exports = phonesRouter