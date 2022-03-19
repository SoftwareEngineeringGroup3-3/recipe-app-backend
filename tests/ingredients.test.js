const request = require("supertest");//("http://localhost:5000");
const expect = require("chai").expect;
const { Ingredient } = require ('../server/templates/ingredients.js');
const sqlite = require('better-sqlite3');
const app = require('../server/app.js'); //reference to server.js

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

// // const { ingredientsAPI } = require("../endpoints/ingredients");

// // describe("Ingredients test", function () {
// //     describe("Add Ingredient", function () {
// //       it("should successfully delete an ingredient if one with given id exists", function(){
// //         const ingredientId = 9;
// //         const name = "Akshay";
// //         const dob = "2020-12-12";
// //         const experience = [{ years: 2, organizationName: "ABCD" }];
// //         const returnedUser = await ingredientsAPI.  ()
// //         expect(returnedUser.name).to.equal(name);
// //         expect(returnedUser.dob.toString()).to.equal((new Date(dob)).toString());
// //         experience.map((exp, index) => {
// //           expect(returnedUser.experience[index].years).to.equal(exp.years);
// //           expect(returnedUser.experience[index].organizationName).to.equal(exp.organizationName);  
  
// //       });
// //       it("should throw an error if the number of users with the same profileId is not zero", async function () {
// //       });
// //     });
// //   });

// let should = require('chai').should(),
//   expect = require('chai').expect,
//   supertest = require('supertest'),
//   api = supertest('http://localhost:5000')

// const { faker } = require('@faker-js/faker');


// let token_id = 0;
// let result

// describe('IngredientsPostTest', function () {
//   beforeEach(function (done) {
//     api
//       .delete('/api/ingredients')
//       .set('Accept', 'application/json')
//       .send({
//         id: token_id,
//         name: faker.lorem.word(),
//         photo: faker.image.imageUrl()
//     })
//       .expect('Content-Type', /json/)
//       .expect(200)
//       .end(function (err, res) {
//         done()
//       })
//   })

//   it('should return a 200 response', function (done) {
//     api
//       .delete(`/api/tokens`)
//       .set('Accept', 'application/json')
//       .expect(200, done)
//   })

//   it('should return a 400 response', function (done) {
//     api
//       .delete('/api/tokens')
//       .set('Accept', 'application/json')
//       .expect(400, done)
//   })
// })
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
