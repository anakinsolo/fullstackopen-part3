const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

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

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  let date = new Date();

  response.send(`Phonebook has info for ${persons.length} people <br/> ${date}`)
});

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  let id = parseInt(request.params.id);
  let person = persons.find(p => p.id === id);

  if (person) {
    return response.json(person);
  }

  return response.status(404).send('Not found....');
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

  data.id = Math.floor(Math.random() * 1000);
  persons = persons.concat(data);
  res.status(200).json(data);
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
