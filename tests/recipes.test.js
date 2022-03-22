const { validateRecipeName, validateRecipeInstructions, 
  validateRecipeTags, validateRecipeIngredients} = require ('../server/templates/recipes.js');
const request = require("supertest");//("http://localhost:5000");
const app = require('../server/app.js'); //reference to server.js
const sqlite = require('better-sqlite3');
const expect = require("chai").expect;
const { Ingredient } = require ('../server/templates/ingredients');
test('Empty word is invalid name', () => {
    expect(validateRecipeName("")).to.eql(false);
});

test("Name : 'Recipe for apple pie' is valid", () =>{
    expect(validateRecipeName("Recipe for apple pie")).to.eql(true);
});

test("Invalid name", () =>{
  var longName = 'x';
  i = 0;
  while(i<100)
  {
    longName +='x'
    i++;
  }
  expect(validateRecipeName(longName)).to.eql(false);
});

test('Valid recipe instructions', () => {
  expect(validateRecipeInstructions("Mix and serve :)")).to.eql(true);
});

test('Too long recipe instructions', () => {
  var tooLongInstruction = 'x';
  i = 0;
  while(i<=1001)
  {
    tooLongInstruction +='x'
    i++;
  }
  expect(validateRecipeInstructions(tooLongInstruction)).to.eql(false);
});

test('Too short Recipe Tag', () => {
  expect(validateRecipeTags('xy')).to.eql(false);
});

test('Too long Recipe Tag', () => {
  var tooLongtag = 'x';
  i = 0;
  while(i<=26)
  {
    tooLongtag +='x'
    i++;
  }
  expect(validateRecipeTags(tooLongtag)).to.eql(false);
});

test('Valid Recipe Tag', () => {
  expect(validateRecipeTags('Vege/Bio')).to.eql(true);
});

test('Invalid recipe ingredients', ()=> {
  let v = new Ingredient();
  v.id = '0';
  v.name = '';
  var quantity = 2;
  var x = [[v,quantity]];
  expect(validateRecipeIngredients(x)).to.eql(false);
});

test('Invalid recipe ingredients', ()=> {
  let v = new Ingredient();
  v.id = '0';
  v.name = '';
  var quantity = 2;
  var x = [[v,quantity]];
  expect(validateRecipeIngredients(x)).to.eql(false);
});

test('Valid recipe ingredients ', ()=> {
  let v = new Ingredient();
  v.id = '1';
  v.name = 'Milk';
  var quantity = '3';
  var x = [[v,quantity]];
  expect(validateRecipeIngredients(x)).to.eql(true);
});


// describe("POST /recipe", function () {

//   it("Returns 200 for valid recipe", async function () {
//     let v = new Ingredient();
//     v.id = '0';
//     v.name = 'Milk';
//     var quantity = '3';
//     var x = [[v,quantity]];
//     var jsonIngredient = JSON.stringify(x);
//     const response = await request(app).post("/api/recipes").send({
//       "name": "Apple pie",
//       "instructions" : "Cut, Mix, Put",
//       "tags" : "Good",
//       "ingredients" : x
//     });
//     expect(response.status).to.eql(200);
//   });

  // it("Returns 400 for invalid recipe", async function () {
  //   const response = await request(app).post("/api/recipes").send({
  //     "name": "",
  //     "instructions" : "",
  //     "tags" : "",
  //     "ingredients" : ""
  //   });
  //   expect(response.status).to.eql(400);
  // });
// });