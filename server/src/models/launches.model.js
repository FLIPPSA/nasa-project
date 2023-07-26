const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

async function populateLaunches(){
    console.log('Downloading launch data...')
    const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: 'name'
                },
                {
                    path: 'payloads',
                    select: 'customers'
                }
            ]
        }
    })
    if(response.status !== 200){
        console.log('Problem downloading launch data');
        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs //where axios puts the body of the response form the server
    for(const launchDoc of launchDocs){
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => { //nested customers inside of the payload are going to be turned into a single customers list for this entire launch
            return payload['customers'];
        })

        const launch = {
            flightNumber: launchDoc['flight_number'], 
            mission: launchDoc['name'], 
            rocket: launchDoc['rocket']['name'], 
            launchDate: new Date(launchDoc['date_local']),
            customers, //shorthand 
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'] 
        }
        console.log(`${launch.flightNumber} ${launch.mission}`)

        // populate launches collection...
        await saveLaunchToMongoDB(launch);
    }
}

async function loadLaunchData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    })  
    if(firstLaunch){
        console.log('Launch data already loaded!');
    } else {
        await populateLaunches();
    } 
}

async function findLaunch(filter){
    return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId){
    return await findLaunch({
        flightNumber: launchId
    });
}

async function getLatesFlightNumber(){
    const latestLaunch = await launchesDatabase.findOne({}).sort('-flightNumber');

    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit){ // returns the launches needed by the controller
    return await launchesDatabase
    .find({}, {'_id': 0, '__v': 0})
    .sort({ flightNumber: 1 }) //sorts by flightNumber by ascending values
    .skip(skip) //how many documents you skip over in the result from your database 
    .limit(limit); //limit how many documents are shown on a page
} 

async function saveLaunchToMongoDB(launch){ 
    await launchesDatabase.findOneAndUpdate({ // only returns the properties that you set in your update (in the launch object)
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    })
}

async function scheduleNewLaunch(launch){
    const planet = await planets.findOne({
        keplerName: launch.target
    });
    // Maintaining referential integrety: check if target planets exist in the database
    if(!planet){
        throw new Error('no matching planet was found');
    }

    const newFlightNumber = await getLatesFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA'],
        flightNumber: newFlightNumber
    })
    
    await saveLaunchToMongoDB(newLaunch)
}

async function abordLaunchById(launchId){
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false
    });
    return aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchData,
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abordLaunchById
};