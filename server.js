const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.set('strictQuery', true); // Suppress the warning

mongoose.connect('mongodb://localhost:27017/awesomeCycles', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Error connecting to MongoDB:', error));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const cycleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
});

const User = mongoose.model('User', userSchema);
const Cycle = mongoose.model('Cycle', cycleSchema);

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    console.log('User created:', user);
    res.status(201).send('User created');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).send('Error creating user: ' + error.message);
  }
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found:', email);
    return res.status(400).send('User not found');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log('Invalid credentials for user:', email);
    return res.status(400).send('Invalid credentials');
  }
  const token = jwt.sign({ userId: user._id }, 'secretkey');
  console.log('User signed in:', user);
  res.send({ token, username: user.username });
});

app.post('/addCycle', async (req, res) => {
  const { name, type, price } = req.body;
  try {
    const cycle = new Cycle({ name, type, price });
    await cycle.save();
    console.log('Cycle added:', cycle);
    res.status(201).send('Cycle added');
  } catch (error) {
    console.error('Error adding cycle:', error);
    res.status(400).send('Error adding cycle: ' + error.message);
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
