// const nodemailerMock = require('nodemailer-mock');
// const notificationHandler = require('../../helper/NotificationHandler');
// const emailTemplates = require('../../emailTemplates.json');

// process.env.SHARESETTLE_EMAIL = 'sharesettle@outlook.com';
// process.env.CONTACTUS_PASSWORD = 'Group1asdc';

// jest.mock('../../emailTemplates.json', () => ({
//   userSignin: {
//     subject: 'Sign-in Notification',
//     text: 'Hello {userName},\n\nYou have successfully signed in.'
//   }
// }));

// describe('notificationHandler', () => {
//   beforeAll(() => {
//     nodemailerMock.mock.reset();
//   });

//   afterAll(() => {
//     nodemailerMock.mock.reset();
//   });

//   it('should send an email successfully', async () => {
//     const params = {
//       email: 'snehpatel903@gmail.com',
//       user1: 'Test User',
//       groupName: 'Test Group',
//       action: 'userSignin',
//       user2: 'Another User',
//       status: 'Some Status',
//       amount: '100',
//       date: '2023-11-22'
//     };

//     const result = await notificationHandler(params);

//     expect(result.success).toBe(true);
//     expect(result.message).toBe('Email sent successfully');
//   }, 10000);
// });
