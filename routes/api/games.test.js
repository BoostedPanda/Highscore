const request = require('supertest')
const app = require('../../app.js')

describe('/api/games', () => {

    describe('when fetching games', () => {

        test('should respond with a 200 status code', async () => {

            const response = await request(app)
                .get("/api/games")
                .send();

            expect(response.statusCode)
                .toBe(200);
        });

        test('should specify application/json in the content type header', async () => {

            const response = await request(app)
                .get("/api/games")
                .send();

            expect(response.headers['content-type'])
                .toEqual(expect.stringContaining('application/json'));
        });

        test('should return array of games', async () => {

            const response = await request(app)
                .get("/api/games")
                .send();

            expect(Array.isArray(response.body))
                .toBe(true);

            const game = response.body[0];

            expect(game).toHaveProperty("title");
            expect(game).toHaveProperty("description");
            expect(game).toHaveProperty("image_url");
            expect(game).toHaveProperty("release_date");
            expect(game).toHaveProperty("genre");
        });
    });



});