const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const { loadPlanetsData } = require('../../models/planets.model');

describe('Launches API', () => {
    beforeAll(async () => {
        await mongoConnect();
        await loadPlanetsData();
    });

    describe('Test GET /launches', () => { // tests are defined in those callbacks that you pass in the describe function
        test('It should respond with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        })
    });
    
    describe('Test POST /launches', () => { // Test group
        const completeLaunchData = {
            mission: 'USS Enterprise',
            rocket: 'Big Kosi 461',
            target: 'Kepler-452 b',
            launchDate: 'August 12, 2045'
        };
    
        const launchDataWithoutDate = {
            mission: 'USS Enterprise',
            rocket: 'Big Kosi 461',
            target: 'Kepler-452 b',
        }
    
        const launchDataWithInvalidDate = {
            mission: 'USS Enterprise',
            rocket: 'Big Kosi 461',
            target: 'Kepler-452 b',
            launchDate: 'Hello'
        };
    
        test('It should respond with 201 created', async () => { // Test case
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
    
            expect(response.body).toMatchObject(launchDataWithoutDate);
        });
    
        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: 'Missing required launch property'
            })
        });
    
        test('It should catch invalid dates', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);
                
            expect(response.body).toStrictEqual({
                error: 'Invalid Date'
            });
        });
    });

    afterAll(async () => {
        await mongoDisconnect();
    })
})
