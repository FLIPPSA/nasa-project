const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planets = require('./planets.mongo');

function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData(){
    return new Promise((resolve, reject) => { // use promise so that you know when your promise data has been successfully loaded
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    savePlanet(data);
                }
            })
            .on('error', (err) => {
                console.log(err);
                reject(err);
            })
            .on('end', async () => {
                const countPlanets = (await getAllPlanets()).length; // returns array 
                console.log(`${countPlanets} habitable planets found!`);
                resolve()
            });
    })
}

async function getAllPlanets(){
    return await planets.find({}, {
        '_id': 0,
        '__v': 0
    }); // excludes ObjectID and __v
}

async function savePlanet(planet){
    try {
        // insert + update = upsert
        await planets.updateOne({ // takes a filter as its first argument 
            keplerName: planet.kepler_name // finding all of the documents with a kepler name matching the current planet (only planets that don't already exist)
        }, { // if it does exist it will update it with the following:
            keplerName: planet.kepler_name
        }, {
            upsert: true
        }); // Planets are only going to be added if they don't already exist otherwise they just get updated
    } catch(err) {
        console.error('Could not save planet due to', err);
    }
}

module.exports = {
    loadPlanetsData,
    getAllPlanets // only export data access and any loading functions from your models without worrying how the data is stored
}