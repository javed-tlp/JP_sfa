const mongoose = require('mongoose');
require('dotenv').config();

const connectionString = process.env.mongoURL

mongoose.connect(connectionString).then(()=>{
    console.log("Database Connected Sucessfully")
}).
catch((error)=>{
    console.log("Database Connection failed")
})