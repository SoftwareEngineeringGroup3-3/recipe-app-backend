const request = require("supertest");
const expect = require("chai").expect;
const { Ingredient } = require ('../server/templates/recipe.js');
const sqlite = require('better-sqlite3');
const app = require('../server/app.js'); 


describe("POST /recipe", function () {
    it("Should returns 200 - New recipe created", async function () {
      const response = await request(app).post("/api/recipe").send({
        "id": 0,
        "name": "0",
        "intructions" : "Mix salad",
        "tags": "vege",
        "ingredients" : "1:1"
      });
      expect(response.status).to.eql(200);
    });
});
