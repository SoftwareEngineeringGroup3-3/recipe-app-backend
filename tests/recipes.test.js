const {Recipe, validateRecipeName, validateRecipeInstructions, 
  validateRecipeTags, validateRecipeIngredients, convertDataIngredients, convertDataTags} = require ('../server/templates/recipes.js');
const request = require("supertest");//("http://localhost:5000");
const app = require('../server/app.js'); //reference to server.js
const sqlite = require('better-sqlite3');
const expect = require("chai").expect;
const { Ingredient } = require ('../server/templates/ingredients.js');
const { sha256 } = require('js-sha256');


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
    const response = await request(app).post("/recipes").send({
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
    ingredient.delete(db);
    expect(response.status).to.eql(401);
  });

  it("Returns 401 for user not admin", async function () {
    await request(app).post("/registration").send({
        "username": "Matt",
        "password": sha256("matt1"),
        "repPassword": sha256("matt1"),
        "email": "mail1@mail.pl"
    });

    const token = await request(app).post("/login").send({
            "username": "Matt",
            "password": sha256("matt1")
        }).then((response) => response.token);

    const security_header = `security_header=${token}`;
    const headers = {
      cookies: `${security_header}; path=/`
    }

    const db = new sqlite('database.db');
    let ingredient = new Ingredient();
    ingredient.name = "Tomato";
    ingredient.insert(db);
    const response = await request(app).post("/recipes").set(headers).send({
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
    ingredient.delete(db);
    expect(response.status).to.eql(401);
  });

  it("Returns 200 for valid recipe", async function () {
    const res_login = await request(app).post("/login").send({
        "username": "Matthew",
        "password": sha256("Mateusz")
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const db = new sqlite('database.db');
    let ingredient = new Ingredient();
    ingredient.name = "Tomato";
    ingredient.insert(db);
    const response = await request(app).post("/recipes").set(headers).send({
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
    ingredient.delete(db);
    expect(response.status).to.eql(200);
  });

  it("Returns 403 for invalid recipe 1", async function () {
    const res_login = await request(app).post("/login").send({
        "username": "Matthew",
        "password": sha256("Mateusz")
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const db = new sqlite('database.db');
    let ingredient = new Ingredient();
    ingredient.name = "Tomato";
    ingredient.insert(db);
    const response = await request(app).post("/recipes").set(headers).send({
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
    ingredient.delete(db);
    expect(response.status).to.eql(403);
  });

  it("Returns 403 for invalid recipe 2", async function () {
    const res_login = await request(app).post("/login").send({
        "username": "Matthew",
        "password": sha256("Mateusz")
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const db = new sqlite('database.db');
    let ingredient = new Ingredient();
    ingredient.name = "Tomato";
    ingredient.insert(db);
    const response = await request(app).post("/recipes").set(headers).send({
      "name": "Spaghetti",
      "instructions": "1. Boil water.\n2. Throw pasta into the boiling water.\n3.Add tomatoes.",
      "ingredients": [],
      "tags": [
          "vegetarian",
          "low calorie"
      ]
    });
    ingredient.delete(db);
    expect(response.status).to.eql(403);
  });

  it("Returns 403 for invalid recipe 3", async function () {
    const res_login = await request(app).post("/login").send({
        "username": "Matthew",
        "password": sha256("Mateusz")
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const db = new sqlite('database.db');
    let ingredient = new Ingredient();
    ingredient.name = "Tomato";
    ingredient.insert(db);
    const response = await request(app).post("/recipes").set(headers).send({
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
    ingredient.delete(db);
    expect(response.status).to.eql(403);
  });

  it("Returns 403 for invalid recipe 4", async function () {
    const res_login = await request(app).post("/login").send({
        "username": "Matthew",
        "password": sha256("Mateusz")
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const response = await request(app).post("/recipes").set(headers).send({
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

//recpes/{id} - delete testing:
describe("DELETE /recipes/{id}", function () {
  it("should return 401 on delete when user not logged in", async function () {
    const response = await request(app).delete("/ingredients");
    
    expect(response.status).to.eql(401);
  });

  it("should return 401 on delete when user not admin", async function () {
      await request(app).post("/registration").send({
          "username": "Matt",
          "password": sha256("matt1"),
          "repPassword": sha256("matt1"),
          "email": "mail1@mail.pl"
      });

      const token = await request(app).post("/login").send({
              "username": "Matt",
              "password": sha256("matt1")
          }).then((response) => response.token);

      const security_header = `security_header=${token}`;
      const headers = {
        cookies: `${security_header}; path=/`
      }

      const response = await request(app).delete("/recipes/1").set(headers);
      
      expect(response.status).to.eql(401);
  });

  it("should return 403 on delete ingredient without id parameter (validation exception)", async function () {
    const res_login = await request(app).post("/login").send({
        "username": "Matthew",
        "password": sha256("Mateusz")
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const response = await request(app).delete("/recipes/").set(headers);
    
    expect(response.status).to.eql(403);
  });

  it("should return 404 for wrong id",async function () {
      const res_login = await request(app).post("/login").send({
          "username": "Matthew",
          "password": sha256("Mateusz")
      });

      const headers = {
          Cookie: `security_header=${res_login._body.security_header}; path=/`
      }

      const response= await request(app).delete("/recipes/0").set(headers).send({
        "id": 0
      });
      expect(response.status).to.eql(404);
  })

  it("should return 200 for exisitng id",async function () {
    const res_login = await request(app).post("/login").send({
        "username": "Matthew",
        "password": sha256("Mateusz")
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const db = new sqlite('database.db');

    var test = new Recipe();
    test.name="DELETION_TEST_RESERVED_silica_gel";
    test.instructions = "Integration testing knows da wae.";
    test.tags = "OILY AF; MIGHT AS WELL BE POISON; non-vegetarion; EXTRAA calories"
    test.ingredients = "58:11g;409:11;"
    test.insert(db);

    const response= await request(app).delete("/recipes/"+test.id).set(headers).send({
      "id": test.id
    });
    test.delete(db);
    expect(response.status).to.eql(200);
   })
});

//Next time, using describe nesting and beforeall/beforeeach and afterall/aftereach we can remove the need for repetitions of logging in everytime and other boilerplate code like that.
//because try-catches don't work.