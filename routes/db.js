var mongoose = require('mongoose');
var dotenv = require('dotenv');

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL).then(() => {
    console.log("database is connected successfully");
}).catch((error) => console.log("error connected to mongodb", error))



