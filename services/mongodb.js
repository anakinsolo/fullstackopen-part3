// require and connection
const mongoose = require('mongoose')
const url = process.env.MONGODB_URI;

console.log(url);
mongoose.connect(url)
  .then(res => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.log('Error connecting to Mongodb:', err.message);
  });

//Create Schema
const personSchema = new mongoose.Schema({
  'name': {
    type: String,
    minLength: 3,
    required: [true, 'name required']
  },
  'number': {
    type: String,
    minLength: 8,
    validate: {
      validator: (v) => {
        return /(^\d{2,3}-\d{3,})/.test(v);
      },
      message: 'Person validation failed: number: phone number must be XX-XXXXX or XXX-XXXX'
    },
    required: [true, 'number required']
  }
});

//Schema config
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

//Create model
module.exports = mongoose.model('Person', personSchema);
