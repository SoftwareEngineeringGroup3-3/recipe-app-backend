const { validateUsername, validatePassword, User, hashPassword } = require ('../server/templates/user.js');
const request = require("supertest");
const expect = require("chai").expect;
const sqlite = require('better-sqlite3');
const app = require('../server/app.js');
const crypto = require('crypto');
const cheerio = require('cheerio');

test('Is validate username working', () => {
    expect(validateUsername("Mam")).eql(false);
});

test('Is validate password working', () => {
    expect(validatePassword("123 45")).eql(false);
});

test('Is validate username working', () => {
    expect(validateUsername("gagfagaf")).eql(true);
});

test('Is validate password working', () => {
    expect(validatePassword("12345")).eql(true);
});

describe("POST /login", function () {
    it("Returns 400 if username format invalid", async function () {
        const response = await request(app).post("/api/login").send({
            "username": "user!name",
            "password": "password1"
        });
        expect(response.status).to.eql(403);
    });

    it("Returns 'Parameter username has invalid format' error message if username format invalid", async function () {
        const response = await request(app).post("/api/login").send({
            "username": "user!name",
            "password": "password1"
        });
        expect(JSON.parse(response.error.text).message).to.eql('Parameter username has invalid format');
    });

    it("Return 401 if username not found", async function () {
        const response= await request(app).post("/api/login").send(
            {
                "username": 'testUserName',
                "password": "pass123"
            });
       
        expect(response.status).to.eql(401);
     });

     it("Return 'Incorrect username or password' error message if username not found", async function () {
        const response= await request(app).post("/api/login").send(
            {
                "username": 'testUserName',
                "password": "pass123"
            });
        expect(JSON.parse(response.error.text).message).to.eql('Incorrect username or password');
     });

     it("Return 401 if password doesn't match", async function () {  
        const db = new sqlite('database.db');

        let test = new User(null, true);
        test.username='testUserName';
        test.password= await hashPassword('password21321');
        test.email='email@testEmail.pl';
        test.created=Date.now();
        test.isAdmin="0";
        test.insert(db);

        const response= await request(app).post("/api/login").send(
            {
                "username": test.username,
                "password": "pass123"
            });
        expect(response.status).to.eql(401);

        test.delete(db);
     });

     it("Return 'Incorrect username or password' error message if password doesn't match", async function () {  
        const db = new sqlite('database.db');

        let test = new User(null, true);
        test.username='testUserName';
        test.password= await hashPassword('password21321');
        test.email='email@testEmail.pl';
        test.created=Date.now();
        test.isAdmin="0";
        test.insert(db);

        const response= await request(app).post("/api/login").send(
            {
                "username": test.username,
                "password": "pass123"
            });
        expect(JSON.parse(response.error.text).message).to.eql('Incorrect username or password');

        test.delete(db);
     });
});