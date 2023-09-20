const mongoose = require('mongoose');
require('dotenv').config();
const db = mongoose.connection;

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
	savePassword: [{
		id: String, // or whatever type your id is
		name: String,
		password: String,
		hidePassword: String,
		date: String,
	  }],
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
	
app.post('/register', async (req, res) => {
	try {
	  const { login, password, savePassword } = req.body;
  
	  const existingUser = await User.findOne({ login });
  
	  if (existingUser) {
		return res.status(400).json({ error: 'User with this login already exists' });
	  }
  
	  const user = new User({ login, password, savePassword });
	  let result = await user.save();
  
	  result = result.toObject();
  
	  if (result) {
		// delete result.password; // Remove the password from the response
		console.log(result);
		return res.send(result);
	  } else {
		console.log('User already registered');
		return res.status(400).send('User already registered');
	  }
	} catch (e) {
	  console.error('Error:', e);
	  return res.status(500).send('Something Went Wrong');
	}
  });

 app.get('/get-user', async (req, res) => {
  try {
    const { login, password } = req.query;

    const user = await User.findOne({ login, password });

    if (user) {
      const sanitizedUser = user.toObject();
    //   delete sanitizedUser.password;
      res.json(sanitizedUser);
    } else {
      console.log('User not found or incorrect password');
      res.status(404).json({ error: 'User not found or incorrect password' });
    }
  } catch (error) {
    console.log(`Error: ${error}`);
    res.status(500).json({ error: 'Error getting user' });
  }
});

app.post('/add-password', async (req, res) => {
	try {
	  const { login, password, newPassword } = req.body;
  
	  // Find the user based on their login
	  const user = await User.findOne({ login });
  
	  if (!user) {
		return res.status(404).json({ error: 'User not found' });
	  }
  
	  // Add the new password to the user's savePassword array
	  user.savePassword.push(newPassword);
  
	  // Save the updated user document
	  await user.save();
  
	  // Return the updated user object with the new password
	  res.json(user);
	} catch (error) {
	  console.error('Error:', error);
	  res.status(500).json({ error: 'Something Went Wrong' });
	}
  });

  app.delete('/delete-password', async (req, res) => {
	try {
	const { id } = req.query; 
	  const { login, password } = req.body;
  
	  // Find the user by login and password to verify authentication
	  const user = await User.findOne({ login, password });
  
	  if (!user) {
		return res.status(404).json({ error: 'User not found or incorrect password' });
	  }
  
	  // Log the ID here after it's defined
	  console.log(id);
  
	  // Remove the specified password ID from the user's savePassword array
	  user.savePassword = user.savePassword.filter((passwordObj) => passwordObj.id !== id);
  
	  console.log(user.savePassword.filter((passwordObj) => passwordObj.id !== id));
	  console.log(user);
  
	  // Save the updated user object to the database
	  await user.save(); // This line is crucial to update the database!
  
	  res.json({ success: true });
	} catch (error) {
	  console.error('Error:', error);
	  res.status(500).json({ error: 'Something Went Wrong' });
	}
  });
  
  

app.listen(5000);
