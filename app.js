const express = require('express');
const bodyParser = require('body-parser');
const Book = require("./models").Book;
const favicon = require('serve-favicon');
const path = require('path');

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({extended: false}));
app.use('/static', express.static('public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


app.set('view engine', 'pug');

// Home redirects to books
app.get('/', (req, res) => {
  res.redirect('/books');
});

// List all books
app.get('/books', (req, res, next) => {
  Book.findAll().then((books) => {
    res.render('books', {
      books: books, 
      title: "Books"
    });
  }).catch((err) => {
    res.send(500);
  });
});

// Form to create new book
app.get('/books/new', (req, res, next) => {
  res.render('book_new', {
    book: {},
    title: "New Book"
  });
});

// Create new book
app.post('/books/new', (req, res) => {
  Book.create(req.body).then((book) => {
    res.redirect(`/books`);
  }).catch((err) => {
    if(err.name === "SequelizeValidationError"){
      res.render('book_new', {
        book: req.body,
        title: "New Book",
        errors: err.errors
      });
    } else {
      throw err;
    }
  }).catch((err) => {
    res.send(500);
  });
});

// Show book details/update form
app.get('/books/:id', (req, res, next) => {
  Book.findByPk(req.params.id).then((book) => {
    if (book) {
      res.render('book_detail', {
        book: book,
        title: book.title
      });
    } else {
      next();
    }
  }).catch((err) => {
    res.send(500);
  });
});

// Update book
app.post('/books/:id', (req, res) => {
  Book.findByPk(req.params.id).then( (book) => {
    return book.update(req.body);
  }).then( (book) => {
    res.redirect(`/books`);
  }).catch((err) => {
    if(err.name === "SequelizeValidationError"){
      const book = req.body;
      book.id = req.params.id;
      // render same page with errors and previous info
      res.render('book_detail', {
        book: book,
        title: book.title,
        errors: err.errors
      })
    } else {
      throw err;
    }
  }).catch((err) => {
    res.send(500);
  });
});

// Delete book
app.post('/books/:id/delete', (req, res) => {
  Book.findByPk(req.params.id).then( (book) => {
    return book.destroy();
  }).then( (book) => {
    res.redirect(`/books`);
  }).catch((err) => {
    res.send(500);
  });
});

// Create 404 if no route used
app.use((req, res, next) => {
  const err = new Error('Sorry! That page doesnt exist.');
  err.status = 404;
  next(err);
});

// Show error
app.use((err, req, res, next) => {
  console.log("That webpage doesn't exist.")
  res.locals.error = err;
  res.status(err.status);
  res.render('error', err);
});


app.listen(port, ()=> {});