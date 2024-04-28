const mongoose = require('mongoose');
require('dotenv').config();

const URL = process.env.MONGODBURL;
console.log(URL);
const connectToDatabase = ()=>{
    mongoose.connect(URL).then(()=>{
        console.log("Connect to Mongodb");
    }).catch((error)=>{
        console.log(error);
    })
}

module.exports = connectToDatabase;