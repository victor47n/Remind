const request = require('supertest');
const app = require('../../../src/app');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');

describe('Register', () => {
    it('Should receive JWT token when register', async () => {
        const response = await request(app)
        .post('/register')
        .set('Content-Type', 'application/json')
        .send({
            name: "TDD02",
            email: "tdd05@gmail.com",
            password: "12345678"
        });
        //expect(response.status).toBe(200);
        //console.log(response.body);
        
    });
});

describe('Authentication', () => {
    it('Should receive JWT token when authenticated', async () => {
        const response = await request(app)
            .post('/auth')
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNTIyMGFjOTQ5ODZiMTQ5Y2M1YThmMCIsImlhdCI6MTU5OTIyMjI3MiwiZXhwIjoxNTk5MzA4NjcyfQ.S50o1WVhLi0IolTc1uzd_DrPoyXkvbVHt1EeIILnNEo')
            .send({
                email: "tdd05@gmail.com",
                password: "12345678"
            });
       
    });
});

describe('ForgotPassword', () => {
    it('Send recovery password to email', async () => {
        const response = await request(app)
        .post('/forgot_password')
        .set('Content-Type', 'application/json')
        .send({
            email: "tdd03@gmail.com"
        });
        console.log(response.body);
    });
});

describe('ResetPassword', () => {
    it('Reset email password', async () => {
        const response = await request(app)
        .post('/reset_password')
        .set('Content-Type', 'application/json')
        .send({
            email: "tdd02@gmail.com",
            token: "425c75b1b2156847a1107b26104fa07876a36de1",
            password: "2020202020"
        });
        console.log(response.body);
    });
});

describe('ProfileList', () => {
    it('Profile show List', async () => {
        const response = await request(app)
        .get('/profile_list/5f6e310fac55d33c2c171fdb') // ID user 04
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNTIyMGFjOTQ5ODZiMTQ5Y2M1YThmMCIsImlhdCI6MTU5OTIyMjI3MiwiZXhwIjoxNTk5MzA4NjcyfQ.S50o1WVhLi0IolTc1uzd_DrPoyXkvbVHt1EeIILnNEo')
        //console.log(response.body);
      
    });
});

describe('ProfileEdit', () => {
    it('Edit profile user', async () => {
        const response = await request(app)
        .put('/profile_edit/5f6e310fac55d33c2c171fdb') // ID user 02
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNTIyMGFjOTQ5ODZiMTQ5Y2M1YThmMCIsImlhdCI6MTU5OTIyMjI3MiwiZXhwIjoxNTk5MzA4NjcyfQ.S50o1WVhLi0IolTc1uzd_DrPoyXkvbVHt1EeIILnNEo')
        .send({
            name: "TDD02",
            email: "teste@gmail.com",
            password: "12345678910"
        });
        //console.log(response.body);
        expect(response.status).toBe(200);
        
    });
});