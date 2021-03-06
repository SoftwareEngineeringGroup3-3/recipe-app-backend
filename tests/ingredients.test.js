const request = require("supertest");//("http://localhost:5000");
const expect = require("chai").expect;
const { Ingredient } = require ('../server/templates/ingredients.js');
const sqlite = require('better-sqlite3');
const app = require('../server/app.js'); //reference to server.js
const { sha256 } = require('js-sha256');

// Integration/API tests:

describe("POST /ingredients", function () {
    it("Returns 401 for not authorized user when user not logged", async function () {
      const response = await request(app).post("/ingredients").send({
        "name": "0",
      });
      
      expect(response.status).to.eql(401);
    });

    it("Returns 401 for not authorized user when user is not an admin", async function () {
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

      const response = await request(app).post("/ingredients").set(headers).send({
        "name": "0",
      });
      
      expect(response.status).to.eql(401);
    });


    it("Returns 400 for 0 as name(invalid name)", async function () {
      const res_login = await request(app).post("/login").send({
                                                              "username": "Matthew",
                                                              "password": sha256("Mateusz")
                                                          });

      const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
      }

      const response = await request(app).post("/ingredients").set(headers).send({
        "name": "0",
      });
      
      expect(response.status).to.eql(400);
    });

    it("Returns 400 for invalid body", async function () {
        const res_login = await request(app).post("/login").send({
                                                                "username": "Matthew",
                                                                "password": sha256("Mateusz")
                                                            });
  
        const headers = {
          Cookie: `security_header=${res_login._body.security_header}; path=/`
        }
  
        const response = await request(app).post("/ingredients").set(headers).send({
          "lol": "0",
        });
        
        expect(response.status).to.eql(400);
      });

    it("should return 403 for ingredient with existing name",async function () {
      const res_login = await request(app).post("/login").send({
          "username": "Matthew",
          "password": sha256("Mateusz")
      });

      const headers = {
          Cookie: `security_header=${res_login._body.security_header}; path=/`
      }


      const db = new sqlite('database.db');
  
      var test = new Ingredient();
      test.name="INSERTION_TEST_RESERVED";
      test.photo="";
      test.insert(db);
  
      const response= await request(app).post("/ingredients").set(headers).send({
          "name": test.name
      });
      test.delete(db);
      expect(response.status).to.eql(403);
     })

    it("Should return 200 for non-pre-existing name with correct data and user is an admin",async function () {
        const res_login = await request(app).post("/login").send({
            "username": "Matthew",
            "password": sha256("Mateusz")
        });

        const headers = {
            Cookie: `security_header=${res_login._body.security_header}; path=/`
        }

        const response= await request(app).post("/ingredients").set(headers).send({
            "name": "CorrectInsertionTestReserved"
        });
        try
        {
            expect(response.status).to.eql(200);
        }
        finally //always runs cleanup now :)
        {
            var respParsBody= JSON.parse(response.text);
            var rem = new Ingredient(respParsBody.ingredient_id);
            const db = new sqlite('database.db');
            rem.delete(db);
        }
    });
});
  

describe("DELETE /ingredients", function () {
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

      const response = await request(app).delete("/ingredients").set(headers);
      
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

    const response = await request(app).delete("/ingredients/").set(headers);
    
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

      const response= await request(app).delete("/ingredients/0").set(headers).send({
        "id": 0
      });
      expect(response.status).to.eql(404);
  });

  it("should return 200 for exisitng id",async function () {
    const res_login = await request(app).post("/login").send({
        "username": "Matthew",
        "password": sha256("Mateusz")
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const db = new sqlite('database.db');

    var test = new Ingredient();
    test.name="DELETION_TEST_RESERVED";
    test.photo="";
    test.insert(db);

    const response= await request(app).delete("/ingredients/"+test.id).set(headers).send({
      "id": test.id
    });
    try
    {
        expect(response.status).to.eql(200);
    }
    catch(error)
    {
        test.delete(db);
        throw error;
    }
   })
});


describe("PUT /ingredients/{id}", function () { //ID and Packet validation is done seperately after these in the unit tests, so I won't repeat any which would require that for now (unlike the ones before this in the current file)
  it("Returns 401 for user not logged in", async function () { 
    const response = await request(app).put("/ingredients").send({
      "id": 0,
      "name": "NOW_BETTER_THAN_EVER",
      "photo": ""
    });
    
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

    const response = await request(app).put("/ingredients/{id}").set(headers).send({
      "id": 0,
      "name": "NOW_BETTER_THAN_EVER",
      "photo": ""
    });
    
    expect(response.status).to.eql(401);
  });
  
  it("Returns 404 for id with no corresponding ingredient (in our case, 0 is always unused/reserved)", async function () { 

    const res_login = await request(app).post("/login").send({
        "username": "Matthew",
        "password": sha256("Mateusz")
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }

    const response = await request(app).put("/ingredients/0").set(headers).send({
      "id": 0,
      "name": "NOWBETTERTHANEVER",
      "photo": ""
    });
    
    expect(response.status).to.eql(404);
  });

  it("should return 200 for ingredient with existing id",async function () {

    const res_login = await request(app).post("/login").send({
        "username": "Matthew",
        "password": sha256("Mateusz")
    });

    const headers = {
        Cookie: `security_header=${res_login._body.security_header}; path=/`
    }
    
    const db = new sqlite('database.db');

    var test = new Ingredient();
    test.name="UPDATETESTRESERVED";
    test.photo="";
    test.insert(db);

    const response= await request(app).put("/ingredients/"+test.id).set(headers).send(
        {"id": test.id,
        "name": "NOWBETTERTHANEVERVTWO",
        "photo":""});
    test.delete(db);
    expect(response.status).to.eql(200);
    //Here, we can additionally compare parsed response to var test to see if the changes did take place. Maybe later?
    
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
