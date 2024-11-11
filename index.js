const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 3000;

// Set up storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // Directory for saving files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});
const upload = multer({ storage: storage });

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Static files and EJS setup
app.use(express.static('public'));
app.set('view engine', 'ejs');

// In-memory storage for posts (no database)
let posts = [];

// Route to display all posts
app.get('/', (req, res) => {
    res.render('index', { posts });
});

// Route to handle post creation (with image upload)
app.post('/create', upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // If an image is uploaded, save its path
    const newPost = { id: posts.length, title, content, image };
    posts.push(newPost);
    res.redirect('/');
});

// Route to display the edit page for a specific post
app.get('/edit/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);
    if (!post) {
        return res.status(404).send('Post not found');
    }
    res.render('edit', { post });
});

// Route to handle post edits (including image upload)
app.post('/edit/:id', upload.single('image'), (req, res) => {
    const postId = parseInt(req.params.id);
    const { title, content } = req.body;
    const post = posts.find(p => p.id === postId);

    if (!post) {
        return res.status(404).send('Post not found');
    }

    post.title = title;
    post.content = content;

    if (req.file) { // If an image is uploaded, update the image
        post.image = `/uploads/${req.file.filename}`;
    }

    res.redirect('/');
});

// Route to handle post deletion
app.post('/delete/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    posts = posts.filter(post => post.id !== postId);
    res.redirect('/');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
