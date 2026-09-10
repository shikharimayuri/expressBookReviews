const express = require('express');
const axios = require('axios').default;

let books = require("./booksdb.js");
let users = require("./auth_users.js").users;

const public_users = express.Router();


// ==================== REGISTER ====================

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Unable to register user."
        });
    }

    if (users.find(user => user.username === username)) {
        return res.status(400).json({
            message: "User already exists!"
        });
    }

    users.push({ username, password });

    res.status(200).json({
        message: "User successfully registered. Now you can login"
    });
});


// ==================== GET ALL BOOKS ====================

public_users.get('/', function (req, res) {
    res.json(books);
});


// ==================== GET BOOK BY ISBN ====================

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.json(books[isbn]);
});


// ==================== GET BOOKS BY AUTHOR ====================

public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    const result = Object.values(books).filter(
        book => book.author === author
    );

    res.json(result);
});


// ==================== GET BOOKS BY TITLE ====================

public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    const result = Object.values(books).filter(
        book => book.title === title
    );

    res.json(result);
});


// ==================== GET REVIEWS ====================

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.json(books[isbn].reviews);
});


// ============================================================
// AXIOS + ASYNC/AWAIT IMPLEMENTATION
// ============================================================


// Task 10 - Retrieve all books using Axios

const connectToURL = async (url) => {
    try {
        const response = await axios.get(url);
        console.log(response.data);
    } catch (error) {
        console.error(error.message);
    }
};

connectToURL('http://localhost:5000/');


// Task 11 - Retrieve book by ISBN using Axios

const getBookWithISBN = async (isbn) => {
    try {
        const response = await axios.get(
            `http://localhost:5000/isbn/${isbn}`
        );

        console.log(response.data);
    } catch (error) {
        console.error(error.message);
    }
};

getBookWithISBN('1');


// Task 12 - Retrieve books by author using Axios

const getDetailsOfBookforAuthor = async (author) => {
    try {
        const response = await axios.get(
            `http://localhost:5000/author/${encodeURIComponent(author)}`
        );

        console.log(response.data);
    } catch (error) {
        console.error(error.message);
    }
};

getDetailsOfBookforAuthor('Samuel Beckett');


// Task 13 - Retrieve books by title using Axios

const getDetailsOfBookforTitle = async (title) => {
    try {
        const response = await axios.get(
            `http://localhost:5000/title/${encodeURIComponent(title)}`
        );

        console.log(response.data);
    } catch (error) {
        console.error(error.message);
    }
};

getDetailsOfBookforTitle('The Divine Comedy');


module.exports.general = public_users;