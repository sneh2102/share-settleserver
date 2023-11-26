const request = require('supertest');
const app = require('../../index'); 
const nodemailer = require('nodemailer');

// Mock dependencies
jest.mock('../../Models/userModel');
jest.mock('../../helper/NotificationHandler');
jest.mock('../../PaymentProcessor/bankModel');
jest.mock('nodemailer')

// Import modules after mocking
const User = require('../../Models/userModel');
const notificationHandler = require('../../helper/NotificationHandler');
const bankModel = require('../../PaymentProcessor/bankModel');
const UserController = require('../../Controller/userController');


describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signupUser', () => {
    it('should create a new user and return user details and token', async () => {
      User.signup.mockResolvedValueOnce({
        _id: 'someUserId',
        name: 'John Doe',
        email: 'john@example.com',
      });
    
      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password@123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    
      await UserController.signupUser(req, res);
    
      expect(User.signup).toHaveBeenCalledWith('John Doe', 'john@example.com', 'Password@123');
      expect(res.status).toHaveBeenCalledWith(200); // This is expecting a 200 status code
      expect(res.json).toHaveBeenCalledWith({
        email: 'john@example.com',
        token: expect.any(String),
        user: {
          _id: 'someUserId',
          name: 'John Doe',
          email: 'john@example.com',
        },
      });
    });
    

    it('should handle signup errors and return a 400 status with an error message', async () => {
      User.signup.mockRejectedValueOnce(new Error('Invalid email'));

      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password@123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.signupUser(req, res);

      expect(User.signup).toHaveBeenCalledWith('John Doe', 'john@example.com', 'Password@123');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email' });
    });
  });

  describe('loginUser', () => {
    it('should log in a user and return user details and token', async () => {
      User.login.mockResolvedValueOnce({
        _id: 'someUserId',
        name: 'John Doe',
        email: 'john@example.com',
      });

      const req = {
        body: {
          email: 'john@example.com',
          password: 'Password@123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.loginUser(req, res);

      expect(User.login).toHaveBeenCalledWith('john@example.com', 'Password@123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        email: 'john@example.com',
        token: expect.any(String),
        user: {
          _id: 'someUserId',
          name: 'John Doe',
          email: 'john@example.com',
        },
      });
    });

    it('should handle login errors and return a 400 status with an error message', async () => {
      User.login.mockRejectedValueOnce(new Error('Invalid credentials'));

      const req = {
        body: {
          email: 'john@example.com',
          password: 'Password@123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.loginUser(req, res);

      expect(User.login).toHaveBeenCalledWith('john@example.com', 'Password@123');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
  });

  describe('forgotPassUser', () => {

    it('should handle forgot password errors and return a 400 status with an error message', async () => {
      User.forgotpass.mockRejectedValueOnce(new Error('User not found'));

      const req = {
        body: {
          email: 'john@example.com',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.forgotPassUser(req, res);

      expect(User.forgotpass).toHaveBeenCalledWith('john@example.com');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });
  describe('changeUsername', () => {
    it('should change the username and return user details', async () => {
      const userMock = {
        _id: 'someUserId',
        name: 'John Doe',
        email: 'john@example.com',
        token: 'someToken',
      };

      jest.spyOn(User, 'changeUsername').mockResolvedValueOnce(userMock);

      const req = {
        body: {
          id: 'someUserId',
          name: 'NewUsername',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.changeUsername(req, res);

      expect(User.changeUsername).toHaveBeenCalledWith('someUserId', 'NewUsername');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ email: 'john@example.com', token: 'someToken', user: userMock });
    });

    it('should handle errors and return a 500 status with an error message', async () => {
      jest.spyOn(User, 'changeUsername').mockRejectedValueOnce(new Error('Internal server error'));

      const req = {
        body: {
          id: 'someUserId',
          name: 'NewUsername',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.changeUsername(req, res);

      expect(User.changeUsername).toHaveBeenCalledWith('someUserId', 'NewUsername');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
  describe('addCardDetailsToUser', () => {
    it('should handle errors and return a 500 status with an error message', async () => {
      jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('User not found'));

      const req = {
        body: {
          id: 'someUserId',
          cardNumber: '1234567890123456',
          cardHolderName: 'John Doe',
          expiryDate: '12/23',
          cvv: '123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserController.addCardDetailsToUser(req, res);

      expect(User.findById).toHaveBeenCalledWith('someUserId');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
  const request = require('supertest');
const app = require('../../index'); // Import your Express app

jest.mock('../../Models/userModel');
jest.mock('../../helper/NotificationHandler');

const User = require('../../Models/userModel');
const notificationHandler = require('../../helper/NotificationHandler');
const UserController = require('../../Controller/userController');

describe('changePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should change the password and send notification on success', async () => {
    const userMock = {
      _id: 'someUserId',
      name: 'John Doe',
      email: 'john@example.com',
    };

    jest.spyOn(User, 'changePassword').mockResolvedValueOnce(userMock);
    

    const req = {
      body: {
        email: 'john@example.com',
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword456',
        newConfirmPassword: 'newPassword456',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await UserController.changePassword(req, res);

    expect(User.changePassword).toHaveBeenCalledWith(
      'john@example.com',
      'oldPassword123',
      'newPassword456',
      'newPassword456'
    );
   
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: userMock });
  });


  it('should handle token expired error', async () => {
    jest.spyOn(User, 'changePassword').mockRejectedValueOnce({ name: 'TokenExpiredError' });

    const req = {
      body: {
        email: 'john@example.com',
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword456',
        newConfirmPassword: 'newPassword456',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await UserController.changePassword(req, res);

    expect(User.changePassword).toHaveBeenCalledWith(
      'john@example.com',
      'oldPassword123',
      'newPassword456',
      'newPassword456'
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' });
  });

  it('should handle server error', async () => {
    jest.spyOn(User, 'changePassword').mockRejectedValueOnce(new Error('Some server error'));

    const req = {
      body: {
        email: 'john@example.com',
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword456',
        newConfirmPassword: 'newPassword456',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await UserController.changePassword(req, res);

    expect(User.changePassword).toHaveBeenCalledWith(
      'john@example.com',
      'oldPassword123',
      'newPassword456',
      'newPassword456'
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
  });
});


});




