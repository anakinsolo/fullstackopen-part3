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
  'name': String,
  'number': String
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
