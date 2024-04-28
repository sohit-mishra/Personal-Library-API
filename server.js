const express = require('express');
const app = express();
require('dotenv').config();
app.use(express.json());
const connectToDatabase = require('./config/db');
const User = require('./model/User');
const Book = require('./model/Book');
const Review = require('./model/Reviews');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


connectToDatabase();

app.get('/', (req, res)=>{
    res.status(200).send("Hello World");
});

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) return res.status(401).json({ message: 'Authorization failed' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Authorization failed' });
    }
};

app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/read', authenticate, async(req, res)=>{
    try {
        let { page, limit, status, search } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        const query = {};
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } }
            ];
        }

        const books = await Book.find(query)
                                .skip((page - 1) * limit)
                                .limit(limit);

        const totalCount = await Book.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            currentPage: page,
            totalPages,
            totalCount,
            books
        }); 
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.listen(process.env.PORT, ()=>{
    console.log("Server is Working");
});
