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
app.use(express.static('build'))

let persons = [];

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  let date = new Date();

  response.send(`Phonebook has info for ${persons.length} people <br/> ${date}`)
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(res => {
    persons = res;
    response.json(persons);
  });  
})

app.get('/api/persons/:id', (request, response) => {
  let id = parseInt(request.params.id);
  Person.findById(id).then(reP => {
    return response.status(200).json(reP);
  }).catch(error => {
    console.log('Error: ', error.message);
    return response.status(404).send('Not found....');
  });
});

app.delete('/api/persons/:id', (req, res) => {
  let id = parseInt(req.params.id);
  persons = persons.filter(person => person.id !== id);

  res.status(204).end();
});

app.post('/api/persons', (req, res) => {
  let data = req.body;
  if (!data.name || !data.number) {
    return res.status(400).json({error: 'The name or number is missing...'});
  }

  if (persons.find(p => p.name === data.name)) {
    return res.status(400).json({error: 'The name already exists in the phonebook...'});
  }

  let newPerson = new Person({
    'name': data.name,
    'number': data.number
  })

  newPerson.save().then(savedPerson => {
    res.status(200).json(savedPerson);
  })
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
