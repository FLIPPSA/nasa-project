const mongoose = require('mongoose');

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => { // check if there is a connection to MongoDB
    console.log('Connected to MongoDB');
}) 

mongoose.connection.on('error', (err) => {
    console.error('Fix this error:', err)
})

async function mongoConnect() {
    await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect(){
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect
};