const { validateRecipeName, validateRecipeInstructions, 
  validateRecipeTags, validateRecipeIngredients, convertDataIngredients, convertDataTags} = require ('../server/templates/recipes.js');
const request = require("supertest");//("http://localhost:5000");
const app = require('../server/app.js'); //reference to server.js
const sqlite = require('better-sqlite3');
const expect = require("chai").expect;
const { Ingredient } = require ('../server/templates/ingredients.js');


test('Empty word is invalid name', () => {
    expect(validateRecipeName("")).to.eql(false);
});

test("Name : 'Recipe for apple pie' is valid", () =>{
    expect(validateRecipeName("Recipe for apple pie")).to.eql(true);
});

test("Invalid name", () =>{
  let longName = 'x';
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
  let tooLongInstruction = 'x';
  i = 0;
  while(i<=1001)
  {
    tooLongInstruction +='x'
    i++;
  }
  expect(validateRecipeInstructions(tooLongInstruction)).to.eql(false);
});

test('Wrong tag', () => {
  expect(validateRecipeTags(["sweet"])).to.eql(false);
});

test('Wrong tag 2', () => {
  expect(validateRecipeTags(["sweet", "vegetarian"])).to.eql(false);
});


test('Valid Recipe Tag', () => {
  expect(validateRecipeTags(["vegetarian"])).to.eql(true);
});

test('Valid Recipe Tag 2', () => {
  expect(validateRecipeTags(["vegetarian", "gluten free"])).to.eql(true);
});

test('Invalid recipe ingredients (empty)', ()=> {
  expect(validateRecipeIngredients([])).to.eql(false);
});

test('Invalid recipe ingredients (invalid ID)', ()=> {
  let v = new Ingredient();
  v.id = null;
  v.name = 'Apple';
  let quant = "2kg";
  let x = [{ ingredient: v, quantity: quant}];
  expect(validateRecipeIngredients(x)).to.eql(false);
});

test('Invalid recipe ingredients (not in the db)', ()=> {
  let v = new Ingredient();
  v.id = 431241423;
  v.name = 'Apple';
  let quant = "2kg";
  let x = [{ ingredient: v, quantity: quant}];
  expect(validateRecipeIngredients(x)).to.eql(false);
});

test('Invalid recipe ingredients (invalid quantity)', ()=> {
  const db = new sqlite('database.db');
  let v = new Ingredient();
  v.name = 'Apple';
  let quant = "";
  let x = [{ ingredient: v, quantity: quant}];
  v.insert(db);
  expect(validateRecipeIngredients(x)).to.eql(false);
  v.delete(db);
});

test('Invalid recipe ingredients (invalid quantity 2)', ()=> {
  const db = new sqlite('database.db');
  let v = new Ingredient();
  v.name = 'Apple';
  let quant = 2;
  let x = [{ ingredient: v, quantity: quant}];
  v.insert(db);
  expect(validateRecipeIngredients(x)).to.eql(false);
  v.delete(db);
});

test('Invalid recipe ingredients (invalid quantity 3)', ()=> {
  const db = new sqlite('database.db');
  let v = new Ingredient();
  v.name = 'Apple';
  let quant = "-1";
  let x = [{ ingredient: v, quantity: quant}];
  v.insert(db);
  expect(validateRecipeIngredients(x)).to.eql(false);
  v.delete(db);
});

test('Valid convert of ingredients', ()=> {
  let v = new Ingredient();
  v.id = '1';
  v.name = 'Milk';
  let quant = '3';
  let x = [{ ingredient: v, quantity: quant}];
  let result = convertDataIngredients(x);

  expect(result).to.eql('1:3');
});

test('Valid convert of ingredients ', ()=> {
  let v = new Ingredient();
  v.id = '1';
  v.name = 'Milk';
  let quant = '3';
  let v2 = new Ingredient();
  v2.id = '2';
  v2.name = 'Milk2';
  let quant2 = '2';
  let x = [{ ingredient: v, quantity: quant}, { ingredient: v2, quantity: quant2}];
  let result = convertDataIngredients(x);

  expect(result).to.eql('1:3;2:2');
});

describe("POST /recipe", function () {
  it("Returns 401 for user not logged in", async function () {
    const db = new sqlite('database.db');
    let ingredient = new Ingredient();
    ingredient.name = "Tomato";
    ingredient.insert(db);
    const response = await request(app).post("/api/recipes").send({
      "name": "Spaghetti",
      "instructions": "1. Boil water.\n2. Throw pasta into the boiling water.\n3.Add tomatoes.",
      "ingredients": [
          {
              "ingredient":{
                  "id": ingredient.id,
                  "name": "Tomato"
              },
              "quantity": "150g"
          }
      ],
      "tags": [
          "vegetarian",
          "low calorie"
      ]
    });
    expect(response.status).to.eql(401);
    ingredient.delete(db);
  });

  it("Returns 401 for user not admin", async function () {
    await request(app).post("/api/registration").send({
        "username": "Matt",
        "password": "matt1",
        "repPassword": "matt1",
        "email": "mail1@mail.pl"
    });

    const token = await request(app).post("/api/login").send({
            "username": "Matt",
            "password": "matt1"
        }).then((response) => response.token);

    const security_header = `security_header=${token}`;
    const headers = {
      cookies: `${security_header}; path=/`
    }

    const db = new sqlite('database.db');
    let ingredient = new Ingredient();
    ingredient.name = "Tomato";
    ingredient.insert(db);
    const response = await request(app).post("/api/recipes").set(headers).send({
      "name": "Spaghetti",
      "instructions": "1. Boil water.\n2. Throw pasta into the boiling water.\n3.Add tomatoes.",
      "ingredients": [
          {
              "ingredient":{
                  "id": ingredient.id,
                  "name": "Tomato"
              },
              "quantity": "150g"
          }
      ],
      "tags": [
          "vegetarian",
          "low calorie"
      ]
    });
    expect(response.status).to.eql(401);
    ingredient.delete(db);
  });

  it("Returns 200 for valid recipe", async function () {
    const res_login = await request(app).post("/api/login").send({
        "username": "Matthew",
        "password": "Mateusz"
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const db = new sqlite('database.db');
    let ingredient = new Ingredient();
    ingredient.name = "Tomato";
    ingredient.insert(db);
    const response = await request(app).post("/api/recipes").set(headers).send({
      "name": "Spaghetti",
      "instructions": "1. Boil water.\n2. Throw pasta into the boiling water.\n3.Add tomatoes.",
      "ingredients": [
          {
              "ingredient":{
                  "id": ingredient.id,
                  "name": "Tomato"
              },
              "quantity": "150g"
          }
      ],
      "tags": [
          "vegetarian",
          "low calorie"
      ]
    });
    expect(response.status).to.eql(200);
    ingredient.delete(db);
  });

  it("Returns 403 for invalid recipe 1", async function () {
    const res_login = await request(app).post("/api/login").send({
        "username": "Matthew",
        "password": "Mateusz"
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const db = new sqlite('database.db');
    let ingredient = new Ingredient();
    ingredient.name = "Tomato";
    ingredient.insert(db);
    const response = await request(app).post("/api/recipes").set(headers).send({
      "name": "",
      "instructions": "1. Boil water.\n2. Throw pasta into the boiling water.\n3.Add tomatoes.",
      "ingredients": [
          {
              "ingredient":{
                  "id": 29,
                  "name": "Tomato"
              },
              "quantity": "150g"
          }
      ],
      "tags": [
          "vegetarian",
          "low calorie"
      ]
  });
    expect(response.status).to.eql(403);
    ingredient.delete(db);
  });

  it("Returns 403 for invalid recipe 2", async function () {
    const res_login = await request(app).post("/api/login").send({
        "username": "Matthew",
        "password": "Mateusz"
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const db = new sqlite('database.db');
    let ingredient = new Ingredient();
    ingredient.name = "Tomato";
    ingredient.insert(db);
    const response = await request(app).post("/api/recipes").set(headers).send({
      "name": "Spaghetti",
      "instructions": "1. Boil water.\n2. Throw pasta into the boiling water.\n3.Add tomatoes.",
      "ingredients": [],
      "tags": [
          "vegetarian",
          "low calorie"
      ]
  });
    expect(response.status).to.eql(403);
    ingredient.delete(db);
  });

  it("Returns 403 for invalid recipe 3", async function () {
    const res_login = await request(app).post("/api/login").send({
        "username": "Matthew",
        "password": "Mateusz"
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const db = new sqlite('database.db');
    let ingredient = new Ingredient();
    ingredient.name = "Tomato";
    ingredient.insert(db);
    const response = await request(app).post("/api/recipes").set(headers).send({
      "name": "Spaghetti",
      "instructions": "1. Boil water.\n2. Throw pasta into the boiling water.\n3.Add tomatoes.",
      "ingredients": [
          {
              "ingredient":{
                  "id": 29,
                  "name": "Tomato"
              },
              "quantity": "150g"
          }
      ],
      "tags": [
          "sweet",
          "low calorie"
      ]
  });
    expect(response.status).to.eql(403);
    ingredient.delete(db);
  });

  it("Returns 403 for invalid recipe 4", async function () {
    const res_login = await request(app).post("/api/login").send({
        "username": "Matthew",
        "password": "Mateusz"
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const response = await request(app).post("/api/recipes").set(headers).send({
      "name": "Spaghetti",
      "instructions": "1. Boil water.\n2. Throw pasta into the boiling water.\n3.Add tomatoes.",
      "ingredients": [
          {
              "ingredient":{
                  "id": 432123143,
                  "name": "Tomato"
              },
              "quantity": "150g"
          }
      ],
      "tags": [
          "vegetarian",
          "low calorie"
      ]
  });
    expect(response.status).to.eql(403);
  });
});