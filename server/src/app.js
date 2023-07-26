// Whole express code
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const api = require('./routes/api');

const app = express();

app.use(cors({ // function that returns the cors middleware - security related feature
    origin: 'http://localhost:3000'
})) 
app.use(morgan('combined'));

app.use(express.json()); // JSON parsing middleware
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/v1', api); // allows you to support multiple versions of your API at the same time
// if you wanted to add version two of your API - you could create another router and mount it under app.use('/v2', v2Routher)

app.get('/*', (req, res) => { // match any enpoint thats not mentioned above --> passes it of to your react application
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
})

module.exports = app;