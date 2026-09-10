const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if a username already exists in the records
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Check if username and password match records
const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT access token (valid for 1 hour)
  const accessToken = jwt.sign(
    { username: username },
    'fingerprint_customer',
    { expiresIn: '1h' }
  );

  // Store token in session (standard for this lab's auth middleware)
  if (req.session) {
    req.session.authorization = {
      accessToken,
      username
    };
  }

  return res.status(200).json({ 
    message: "Customer successfully logged in", 
    token: accessToken 
  });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  
  // Extract the authenticated username from session or JWT payload
  const username = req.session?.authorization?.username || req.user?.username;

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  if (!review) {
  return res.status(400).json({ message: "Review content is required" });
}

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Ensure the reviews object exists
  if (!book.reviews) {
    book.reviews = {};
  }

  // Add or update review keyed by username
  book.reviews[username] = review;

  return res.status(200).json({
    message: `Review for ISBN ${isbn} posted/updated successfully by ${username}`,
    reviews: book.reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session?.authorization?.username || req.user?.username;

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ 
      message: `Review for ISBN ${isbn} deleted successfully by ${username}` 
    });
  }

  return res.status(404).json({ message: "No review found for this user under the specified ISBN" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
