require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./services/mongodb');

const app = express();
app.use(express.json());
app.use(morgan((tokens, req, res) => {
  return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      `${JSON.stringify(req.body)}`
  ].join(' ')
}));
app.use(cors());
app.use(express.static('build'));


let persons = [];

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  let date = new Date();
  Person.find({}).then(res => {
    response.send(`Phonebook has info for ${res.length} people <br/> ${date}`)
  });  
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(res => {
    response.status(200).json(res);
  });  
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(reP => {
    return response.status(200).json(reP);
  }).catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id).then(result => {
    console.log(result);
    res.status(204).end();
  }).catch(err => next(err));
});

app.post('/api/persons', (req, res, next) => {
  let data = req.body;

  if (persons.find(p => p.name === data.name)) {
    return res.status(400).json({error: 'The name already exists in the phonebook...'});
  }

  let newPerson = new Person({
    'name': data.name,
    'number': data.number
  })

  newPerson.save().then(savedPerson => {
    res.status(200).json(savedPerson);
  }).catch(err => next(err));
});

app.put('/api/persons/:id', (request, response, next) => {
  let data = request.body;
  let person = {
    'name': data.name,
    'number': data.number
  }
  
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.status(200).json(updatedPerson);
    })
    .catch(err => next(err));
});


app.use((err, req, res, next) => {
  if (err.name === 'CastError') {
    return res.status(400).json({'error': 'wrong ID type or format...'});
  }

  if (err.name === 'ValidationError') {
    console.log(err.message);
    return res.status(400).send({'error': err.message});
  }

  next(err);
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
