const request = require("supertest");//("http://localhost:5000");
const expect = require("chai").expect;
const { Ingredient } = require ('../server/templates/ingredients.js');
const sqlite = require('better-sqlite3');
const app = require('../server/app.js'); //reference to server.js


// Integration/API tests:

describe("POST /ingredients", function () {
    it("Returns 400 for 0 as name(invalid name)", async function () {
      const response = await request(app).post("/api/ingredients").send({
        "id": 0,
        "name": "0",
        "photo": ""
      });
      
      expect(response.status).to.eql(400);
    });

    it("should return 403 for ingredient with existing name",async function () {
      
      const db = new sqlite('database.db');
  
      var test = new Ingredient();
      test.name="INSERTION_TEST_RESERVED";
      test.photo="";
      test.insert(db);
  
      const response= await request(app).post("/api/ingredients").send(
          {"id": 0,
          "name": test.name,
          "photo":""});
      expect(response.status).to.eql(403);

      test.delete(db);
     })

    it("Should return 200 for non-pre-existing name with correct data",async function () {
        const response= await request(app).post("/api/ingredients").send(
            {"id": 0,
            "name": "Correct_InsertionTestReserved",
            "photo":""});
        expect(response.status).to.eql(200);
        var respParsBody= JSON.parse(response.text);
        var rem = new Ingredient(respParsBody.ingredient_id);
        const db = new sqlite('database.db');
        rem.delete(db);
    })
  });
  

describe("DELETE /ingredients", function () {
  it("should return 400 on delete ingredient without id parameter", async function () {
    const response = await request(app).delete("/api/ingredients");
    
    expect(response.status).to.eql(400);
  });
  it("should return 404 for wrong id",async function () {
      const response= await request(app).delete("/api/ingredients").send({"id": 90});
      expect(response.status).to.eql(404);
  })
  it("should return 200 for exisitng id",async function () {
    
    const db = new sqlite('database.db');

    var test = new Ingredient();
    // test.id="0";
    // await test.delete(db);
    test.name="DELETION_TEST_RESERVED";
    test.photo="";
    test.insert(db);

    const response= await request(app).delete("/api/ingredients").send({"id": test.id});
    expect(response.status).to.eql(200);
   })
});



//Validation function tests:
const { validateName } = require ('../server/templates/ingredients.js');


test('99 as ingredient name is invalid:', () => {
    expect(validateName("99")).eql(false);
});

test('"bs l@l" as ingredient name is invalid:', () => {
    expect(validateName("bs l@l")).eql(false);
});

test('Cheese as ingredient name is valid:', () => {
    expect(validateName("Cheese")).eql(true);
});
