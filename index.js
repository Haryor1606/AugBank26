const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
// CORRECTED index.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = express();

dotenv.config();

// 1. Body parser MUST come before your routes
app.use(express.json()); 

// 2. Then import and use your routes
const UserRouter = require("./routes/user.routes");
const connectDB = require('./database/connectDB');
app.use('/api/v1', UserRouter); 

// 3. Database connection
mongoose.connect(process.env.DB_URI)
.then(() => {
    console.log("Database connected")
})
.catch((err) => {
    console.error("Database connection error:", err);
})

// 4. Server creation
let PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
    if(err){
        console.log("cannot connect to server", err);
    }else{
        console.log(`Server started on port ${PORT}`)
    }
})

module.exports=async(req, res)=>{
    await connectDB()

    return app(req, res)
}