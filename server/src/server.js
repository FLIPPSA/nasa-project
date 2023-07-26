const http = require('http');

require('dotenv').config(); //populate process.env object with the values in your environment file

const { mongoConnect } = require('./services/mongo'); 
const app = require('./app.js');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000; // checks if there is a PORT specified in the environment (if not it goes to the default 8000)

const server = http.createServer(app);

async function startServer(){
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();

    server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
}

startServer();