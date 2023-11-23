const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../../index'); 
const { describe, before, it } = require('mocha');

const { expect } = chai;
chai.use(chaiHttp);


const User = require('../../Models/userModel');

describe('User Routes', () => {
  before(async () => {
  
    await mongoose.connect('mongodb://localhost:27017/testDB', { useNewUrlParser: true, useUnifiedTopology: true });
  });

  after(async () => {
   
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    
    await User.deleteMany({});
  });

  describe('POST /signup', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@Password123',
      };

      const res = await chai.request(app).post('/signup').send(userData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('email', userData.email);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');

      const user = await User.findOne({ email: userData.email });
      expect(user).to.exist;
      expect(user.name).to.equal(userData.name);
    });

    it('should handle invalid input', async () => {
      const invalidUserData = {
        
        name: 'Test User',
        password: 'TestPassword123',
      };

      const res = await chai.request(app).post('/signup').send(invalidUserData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  describe('POST /login', () => {
    it('should log in an existing user', async () => {
      // Create a user for testing
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@Password123',
      };
      await User.create(userData);

      const loginData = {
        email: userData.email,
        password: userData.password,
      };

      const res = await chai.request(app).post('/login').send(loginData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('email', userData.email);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
    });

    it('should handle invalid login credentials', async () => {
      const invalidLoginData = {
        email: 'nonexistent@example.com',
        password: 'InvalidPassword123',
      };

      const res = await chai.request(app).post('/login').send(invalidLoginData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  describe('POST /forgot-password', () => {
    it('should send a password reset email for a valid user', async () => {
      const existingUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
      };
      await User.create(existingUser);

      const forgotPasswordData = {
        email: existingUser.email,
      };

      const res = await chai.request(app).post('/forgot-password').send(forgotPasswordData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('response');
    });

    it('should handle invalid email for password reset', async () => {
      const invalidEmailData = {
        email: 'nonexistent@example.com',
      };

      const res = await chai.request(app).post('/forgot-password').send(invalidEmailData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  describe('POST /reset-password/:id/:token', () => {
    it('should reset the password for a valid user', async () => {
     
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
      };
      const user = await User.create(userData);

      const resetPasswordData = {
        password: 'NewTestPassword456',
      };

      const res = await chai.request(app).post(`/reset-password/${user._id}/someValidToken`).send(resetPasswordData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('email', userData.email);
      expect(res.body).to.have.property('user');
    });

    it('should handle invalid token for password reset', async () => {
      const invalidTokenData = {
        password: 'NewTestPassword456',
      };

      const res = await chai.request(app).post(`/reset-password/invalidUserId/invalidToken`).send(invalidTokenData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  describe('POST /change-username', () => {
    it('should change the username for a valid user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
      };
      const user = await User.create(userData);

      const changeUsernameData = {
        id: user._id,
        name: 'NewTestUser',
      };

      const res = await chai.request(app).post('/change-username').send(changeUsernameData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('email', userData.email);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('name', 'NewTestUser');
    });

    it('should handle invalid input for changing username', async () => {
      const invalidData = {
        // Missing id
        name: 'NewTestUser',
      };

      const res = await chai.request(app).post('/change-username').send(invalidData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  describe('POST /change-password', () => {
    it('should change the password for a valid user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
      };
      const user = await User.create(userData);

      const changePasswordData = {
        email: user.email,
        oldPassword: userData.password,
        newPassword: 'NewTestPassword456',
        newConfirmPassword: 'NewTestPassword456',
      };

      const res = await chai.request(app).post('/change-password').send(changePasswordData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('user');
    });

    it('should handle invalid input for changing password', async () => {
      const invalidData = {

        oldPassword: 'TestPassword123',
        newPassword: 'NewTestPassword456',
        newConfirmPassword: 'NewTestPassword456',
      };

      const res = await chai.request(app).post('/change-password').send(invalidData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  describe('POST /add-card-details', () => {
    it('should add card details for a valid user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
      };
      const user = await User.create(userData);

      const cardDetailsData = {
        id: user._id,
        cardNumber: '1234567890123456',
        cardHolderName: 'Test User',
        expiryDate: new Date(),
        cvv: 123,
      };

      const res = await chai.request(app).post('/add-card-details').send(cardDetailsData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Card details added successfully');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('creditCardDetails');
    });

    it('should handle invalid input for adding card details', async () => {
      const invalidData = {
        cardNumber: '1234567890123456',
        cardHolderName: 'Test User',
        expiryDate: new Date(),
        cvv: 123,
      };

      const res = await chai.request(app).post('/add-card-details').send(invalidData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });before(async () => {
    // Connect to the database before running tests
    await mongoose.connect('mongodb://localhost:27017/your-test-database', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  });

  after(async () => {
    // Disconnect from the database after running tests
    await mongoose.disconnect();
  });

  describe('POST /api/signup', () => {
    it('should sign up a new user', async () => {
      const res = await chai
        .request(app)
        .post('/api/signup')
        .send({
          name: 'TestUser',
          email: 'test@example.com',
          password: 'Test@Password123!',
        });

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('email', 'test@example.com');
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
    });

    it('should handle signup validation errors', async () => {
      const res = await chai
        .request(app)
        .post('/api/signup')
        .send({
          // Missing required fields
        });

      expect(res).to.have.status(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('error');
    });
  });
});

