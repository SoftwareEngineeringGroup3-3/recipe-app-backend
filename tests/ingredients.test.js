const request = require("supertest");//("http://localhost:5000");
const expect = require("chai").expect;
const { Ingredient } = require ('../server/templates/ingredients.js');
const sqlite = require('better-sqlite3');
const app = require('../server/app.js'); //reference to server.js


// Integration/API tests:

// describe("POST /ingredients", function () {
//     it("should return 400 on delete ingredient without id parameter", async function () {
//       const response = await request(app).delete("/api/ingredients");
      
//       expect(response.status).to.eql(400);
//     });
//     it("should return 404 for wrong id",async function () {
//         const response= await request.delete("/api/ingredients").send({"id": 90});
//         expect(response.status).to.eql(404);
//     })
//     it("should return 200 for exisitng id",async function () {
      
//       const db = new sqlite('database.db');
  
//       var test = new Ingredient();
//       // test.id="0";
//       // await test.delete(db);
//       test.name="DELETION_TEST_RESERVED";
//       test.photo="";
//       test.insert(db);
  
//       const response= await request.delete("/api/ingredients").send({"id": test.id});
//       expect(response.status).to.eql(200);
//      })
//   });
  

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
    expect(validateName("99")).toBe(false);
});

test('"bs l@l" as ingredient name is invalid:', () => {
    expect(validateName("bs l@l")).toBe(false);
});

test('Cheese as ingredient name is valid:', () => {
    expect(validateName("Cheese")).toBe(true);
});
