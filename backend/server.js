const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pdf = require('html-pdf'); // Import html-pdf for generating PDF slips

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  title: String,
  details: String,
  price: Number,
  image: String,
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cycles: [{
    cycle: { type: mongoose.Schema.Types.ObjectId, ref: 'Cycle' },
    quantity: { type: Number, default: 1 }
  }]
});

const slipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    title: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  date: { type: Date, default: Date.now },
  file: String
});

const User = mongoose.model('User', userSchema);
const Cycle = mongoose.model('Cycle', cycleSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Slip = mongoose.model('Slip', slipSchema);

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send('Access denied');
  }
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send('Invalid token');
  }
};

app.post('/api/cycles', authenticate, upload.single('image'), async (req, res) => {
  const { title, details, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  const cycle = new Cycle({ title, details, price, image, addedBy: req.user.userId });
  await cycle.save();
  res.status(201).send(cycle);
});

app.put('/api/cycles/:id', authenticate, upload.single('image'), async (req, res) => {
  const { title, details, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;
  const updateData = { title, details, price };
  if (image) updateData.image = image;
  const cycle = await Cycle.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.send(cycle);
});

app.delete('/api/cycles/:id', authenticate, async (req, res) => {
  await Cycle.findByIdAndDelete(req.params.id);
  res.send({ message: 'Cycle deleted' });
});

app.get('/api/cycles', async (req, res) => {
  const cycles = await Cycle.find().populate('addedBy', 'username');
  res.send(cycles);
});

app.get('/api/cycles/:id', async (req, res) => {
  const cycle = await Cycle.findById(req.params.id).populate('addedBy', 'username');
  res.send(cycle);
});

app.post('/api/cart', authenticate, async (req, res) => {
  const { cycleId } = req.body;
  let cart = await Cart.findOne({ userId: req.user.userId });
  if (!cart) {
    cart = new Cart({ userId: req.user.userId, cycles: [{ cycle: cycleId, quantity: 1 }] });
  } else {
    const cycleIndex = cart.cycles.findIndex(item => item.cycle && item.cycle.toString() === cycleId);
    if (cycleIndex > -1) {
      cart.cycles[cycleIndex].quantity += 1;
    } else {
      cart.cycles.push({ cycle: cycleId, quantity: 1 });
    }
  }
  await cart.save();
  res.status(201).send(cart);
});

app.put('/api/cart', authenticate, async (req, res) => {
  const { cycleId, quantity } = req.body;
  let cart = await Cart.findOne({ userId: req.user.userId });
  if (cart) {
    const cycleIndex = cart.cycles.findIndex(item => item.cycle && item.cycle.toString() === cycleId);
    if (cycleIndex > -1) {
      if (quantity > 0) {
        cart.cycles[cycleIndex].quantity = quantity;
      } else {
        cart.cycles.splice(cycleIndex, 1);
      }
      await cart.save();
    }
  }
  res.send(cart);
});

app.get('/api/cart', authenticate, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.userId }).populate('cycles.cycle');
  res.send(cart);
});

app.post('/api/slips', authenticate, async (req, res) => {
  const { cardDetails, cartItems } = req.body;
  const user = await User.findById(req.user.userId); // Fetch the user details
  const slip = new Slip({
    userId: req.user.userId,
    items: cartItems.map(item => ({
      title: item.cycle.title,
      price: item.cycle.price,
      quantity: item.quantity
    })),
    total: cartItems.reduce((total, item) => total + (item.cycle ? item.cycle.price * item.quantity : 0), 0)
  });
  await slip.save();

  const slipHtml = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { width: 100%; max-width: 800px; margin: auto; padding: 20px; border: 1px solid #ddd; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; }
        .items { margin-bottom: 20px; }
        .items ul { list-style: none; padding: 0; }
        .items ul li { padding: 10px; border-bottom: 1px solid #ddd; }
        .total { text-align: right; font-size: 1.2em; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Shopping Slip</h1>
          <p>User: ${user.username}</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="items">
          <h2>Items:</h2>
          <ul>
            ${slip.items.map(item => `<li>${item.title} - $${item.price} x ${item.quantity}</li>`).join('')}
          </ul>
        </div>
        <div class="total">
          Total: $${slip.total}
        </div>
      </div>
    </body>
    </html>
  `;

  pdf.create(slipHtml).toFile(path.join(uploadDir, `slip_${slip._id}.pdf`), async (err, result) => {
    if (err) return res.status(500).send('Error generating slip');
    slip.file = `slip_${slip._id}.pdf`;
    await slip.save();
    res.send({ slipUrl: `/uploads/slip_${slip._id}.pdf` });
  });
});

app.get('/api/slips', authenticate, async (req, res) => {
  const slips = await Slip.find({ userId: req.user.userId });
  res.send(slips);
});

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

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
