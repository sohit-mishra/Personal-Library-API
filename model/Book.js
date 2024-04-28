const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    Author: { type: String, required: true, unique: true },
    publicationDate: { type: Date, required: true },
    genre: { type: String },
    description: { type: String }
})

const Book = mongoose.model('Book', BookSchema);

module.exports = Book;
