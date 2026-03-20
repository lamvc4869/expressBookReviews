const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  //Write your code here
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books[req.params.isbn], null, 4));
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  //Write your code here
  const author = req.params.author;
  const filteredBooks = Object.values(books).filter(
    (book) => book.author === author,
  );
  return res.send(JSON.stringify(filteredBooks, null, 4));
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  //Write your code here
  const title = req.params.title;
  const filteredBooks = Object.values(books).filter(
    (book) => book.title === title,
  );
  return res.send(JSON.stringify(filteredBooks, null, 4));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books[req.params.isbn].reviews, null, 4));
});

const getAllBooksWithCallback = (callback) => {
  setTimeout(() => {
    callback(null, books);
  }, 0);
};

const getBookByISBNWithPromise = (isbn) => {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (!book) {
      return reject(new Error("Book not found"));
    }
    resolve(book);
  });
};

const getBooksByAuthorWithPromise = (author) => {
  return new Promise((resolve) => {
    const authorLower = author.toLowerCase();
    const result = Object.values(books).filter(
      (book) => book.author.toLowerCase() === authorLower,
    );
    resolve(result);
  });
};

const getBooksByTitleWithPromise = (title) => {
  return new Promise((resolve) => {
    const titleLower = title.toLowerCase();
    const result = Object.values(books).filter(
      (book) => book.title.toLowerCase() === titleLower,
    );
    resolve(result);
  });
};

public_users.get("/books", function (req, res) {
  getAllBooksWithCallback((error, allBooks) => {
    if (error) {
      return res.status(500).json({ message: "Failed to fetch books" });
    }
    return res.status(200).json(allBooks);
  });
});

public_users.get("/isbn/:isbn", function (req, res) {
  getBookByISBNWithPromise(req.params.isbn)
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ message: error.message }));
});

public_users.get("/author/:author", async function (req, res) {
  try {
    const result = await getBooksByAuthorWithPromise(req.params.author);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

public_users.get("/title/:title", async function (req, res) {
  try {
    const result = await getBooksByTitleWithPromise(req.params.title);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports.general = public_users;
