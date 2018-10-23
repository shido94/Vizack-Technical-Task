const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const Registration = new Schema({
  name: String,
  email: String,
  password: String,
  role: {type: String, default: 'user'},
  Profession: { type: String, default: 'student' }
});

module.exports = mongoose.model('register', Registration);
