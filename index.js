const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(express.json())

//  Note: 'tiny' is the same as using pre-defined tokens as below:
// 'tiny' == ':method :url :status :res[content-length] - :response-time ms'
const morganGet = morgan('tiny')
const morganPost = morgan(':method :url :status :res[content-length] - :response-time ms :body')
const morganDelete = morgan(':method :url :status :response-time ms')

app.use(function setMorgan(request, response, next) {
  if (request.method == 'POST') { // POST will show the body - BUT! I have no PUT yet! tbd...
    morganPost(request, response, next)
  } else if (request.method == 'DELETE') { // DELETE has no *body* or *content-length* to show
    morganDelete(request, response, next)
  } else { // GET, will use 'tiny' log setting
    morganGet(request, response, next)
  }
})

let persons = [
  { 
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  { 
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  { 
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  { 
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122"
  }
]

// // requestLogger must be placed up here to be the first route
// // in a file so that it can log all routes below!
// const requestLogger = (request, response, next) => {
//   console.log('Method:', request.method)
//   console.log('Path:  ', request.path)
//   console.log('Body:  ', request.body)
//   console.log('---')
//   next()
// }

// app.use(requestLogger)

// Prevent favicon.ico 404 error
// Catch the favicon.ico request and send a 204 'No Content' status:
app.get('/favicon.ico', (req, res) => {
  res.status(204).end()
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  const people = persons.length
  console.log(persons.length + new Date())
  response.send(200, "Phonebook has info for " + people + " people" + "<br>" + new Date())
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  // console.log("Deleting id: " + request.params.id)
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const randomId = () => {
  while (true) {
    // id:0 is not used. Set of 1000 random id's
    const randId = (Math.floor(Math.random() * 999) + 1)
    // check that id is not in use
    if (!persons.find(person => Number(person.id) === randId)) {
      console.log("Using available id: " + randId)
      return randId
    }
  }
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  // console.log(body)

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name or number is missing'
    })
  }

  if (persons.find(person => person.name === body.name)) {
    return response.status(403).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {
    id: randomId(),
    name: body.name,
    number: body.number
  }

  morgan.token('body', function (request) {
    return `${JSON.stringify(request.body)}`
  })

  persons = persons.concat(person)

  response.json(person)

})

// unknownEndpoint must be placed down here
// in a file. It will then send response
// if none of the routes above didn't respond!
const unknownEndpoint = (request, response) => {
  response.status(404).send({
    error: 'unknown endpoint'
})
}

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})