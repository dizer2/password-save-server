const mongoose = require('mongoose');
require('dotenv').config();

console.log(process.env.DB_URL);
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to database:', err);
  });

const UserSchema = new mongoose.Schema({
	login: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
		unique: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
	savePassword: {
		type: Array,
		required: true,
	},
});
const User = mongoose.model('users', UserSchema);
User.createIndexes();

const express = require('express');
const app = express();
const cors = require("cors");
console.log("App listen at port 5000");
app.use(express.json());
app.use(cors());
app.get("/", (req, resp) => {

	resp.send("App is Working");
});

app.post('/register', async (req, resp) => {
	try {
	  const user = new User(req.body);
	  let result = await user.save();
	  result = result.toObject();
	  if (result) {
		delete result.password;
		console.log(result);
		console.log(result._id);
  
		// Send a success response
		return resp.send(result);
	  } else {
		console.log('User already registered');
		// Send an error response if needed
		return resp.status(400).send('User already registered');
	  }
	} catch (e) {
	  console.error('Error:', e);
	  // Send an error response
	  return resp.status(500).send('Something Went Wrong');
	}
  });
  
  app.get('/get-users', async (req, res) => {
	try {
	  const users = await User.find({});
	  res.json(users);
	} catch (error) {
	  console.log(`Error: ${error}`);
	  res.status(500).json({ error: 'Error getting users' });
	}
  });
  

app.listen(5000);
