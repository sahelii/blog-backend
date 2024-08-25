const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const admin= require("firebase-admin")

const cors= require("cors")
var serviceAccount = require("./blog-app-150fc-firebase-adminsdk-q4n0z-3fff830f3f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


require('dotenv').config();

const app = express();

// Connect Database
connectDB();


app.use(cors())
// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts',postRoutes);
app.use('/api/comments', commentRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
