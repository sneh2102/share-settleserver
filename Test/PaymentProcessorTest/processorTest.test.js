// const {
//     processPayment,
//   } = require('../../PaymentProcessor/processor');
//   const {
//     validCard,
//     fetchCardBalance,
//     debitAmountFromCard,
//     creditAmountToCard,
//   } = require('../../PaymentProcessor/bankModel');
  
//   jest.mock('../../PaymentProcessor/bankModel', () => ({
//     validCard: jest.fn(),
//     fetchCardBalance: jest.fn(),
//     debitAmountFromCard: jest.fn(),
//     creditAmountToCard: jest.fn(),
//   }));
  
//   jest.mock('../../Models/userModel', () => ({
//     findOne: jest.fn(),
//   }));
  
//   describe('processPayment', () => {
//     afterEach(() => {
//       jest.clearAllMocks();
//     });
  
//     test('should return 400 if request body is missing required fields', async () => {
//       const req = {};
//       const res = {
//         status: jest.fn(() => res),
//         json: jest.fn(),
//       };
  
//       await processPayment(req, res);
  
//       expect(res.status).toHaveBeenCalledWith(400);
//       expect(res.json).toHaveBeenCalledWith({
//         error: {
//           errorCode: '40001',
//           errorMessage: 'request body is missing required fields',
//         },
//       });
//     });
  
//     test('should return 200 with error for invalid sender card', async () => {
//       const req = {
//         body: {
//           sender: 'sender@example.com',
//           receiver: 'receiver@example.com',
//           amount: 100,
//         },
//       };
//       const res = {
//         status: jest.fn(() => res),
//         json: jest.fn(),
//       };
  
//       validCard.mockResolvedValue(false);
  
//       await processPayment(req, res);
  
//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith({
//         sender: req.body.sender,
//         receiver: req.body.receiver,
//         error: {
//           errorCode: '40002',
//           errorMessage: 'invalid sender card',
//         },
//       });
//     });
  
//     test('should return 200 with error for invalid receiver card', async () => {
//       const req = {
//         body: {
//           sender: 'sender@example.com',
//           receiver: 'receiver@example.com',
//           amount: 100,
//         },
//       };
//       const res = {
//         status: jest.fn(() => res),
//         json: jest.fn(),
//       };
  
//       validCard.mockReturnValueOnce(true).mockReturnValueOnce(false);
  
//       await processPayment(req, res);
  
//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith({
//         sender: req.body.sender,
//         receiver: req.body.receiver,
//         error: {
//           errorCode: '40003',
//           errorMessage: 'invalid receiver card',
//         },
//       });
//     });
  
//     test('should return 200 with error for insufficient balance', async () => {
//       const req = {
//         body: {
//           sender: 'sender@example.com',
//           receiver: 'receiver@example.com',
//           amount: 100,
//         },
//       };
//       const res = {
//         status: jest.fn(() => res),
//         json: jest.fn(),
//       };
  
//       validCard.mockReturnValueOnce(true).mockReturnValueOnce(true);
//       fetchCardBalance.mockResolvedValue(50);
  
//       await processPayment(req, res);
  
//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith({
//         sender: req.body.sender,
//         receiver: req.body.receiver,
//         error: {
//           errorCode: '40004',
//           errorMessage: 'insufficient balance',
//         },
//       });
//     });
  
//     test('should return 200 with error for debit failure', async () => {
//       const req = {
//         body: {
//           sender: 'sender@example.com',
//           receiver: 'receiver@example.com',
//           amount: 100,
//         },
//       };
//       const res = {
//         status: jest.fn(() => res),
//         json: jest.fn(),
//       };
  
//       validCard.mockReturnValueOnce(true).mockReturnValueOnce(true);
//       fetchCardBalance.mockResolvedValue(200);
//       debitAmountFromCard.mockResolvedValue(false);
  
//       await processPayment(req, res);
  
//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.json).toHaveBeenCalledWith({
//         sender: req.body.sender,
//         receiver: req.body.receiver,
//         error: {
//           errorCode: '50003',
//           errorMessage: 'error debiting amount',
//         },
//       });
//     });

//     test('should return 500 with error for credit failure', async () => {
//         const req = {
//           body: {
//             sender: 'sender@example.com',
//             receiver: 'receiver@example.com',
//             amount: 100,
//           },
//         };
//         const res = {
//           status: jest.fn(() => res),
//           json: jest.fn(),
//         };
      
//         validCard.mockReturnValueOnce(true).mockReturnValueOnce(true);
//         fetchCardBalance.mockResolvedValue(200);
//         debitAmountFromCard.mockResolvedValue(true);
//         creditAmountToCard.mockResolvedValue(false); // Simulate a credit failure
      
//         await processPayment(req, res);
      
//         expect(res.status).toHaveBeenCalledWith(500);
//         expect(res.json).toHaveBeenCalledWith({
//           sender: req.body.sender,
//           receiver: req.body.receiver,
//           error: {
//             errorCode: '50002',
//             errorMessage: 'error crediting amount',
//           },
//         });
//       });

//     // simulate a successful payment
//     test('should return 200 with success message for a successful payment', async () => {
//       const req = {
//         body: {
//           sender: 'sender@example.com',
//           receiver: 'receiver@example.com',
//           amount: 100,
//         },
//       };
//       const res = {
//         status: jest.fn(() => res),
//         json: jest.fn(),
//       };
  
//       validCard.mockReturnValueOnce(true).mockReturnValueOnce(true);
//       fetchCardBalance.mockResolvedValue(200);
//       debitAmountFromCard.mockResolvedValue(true);
//       creditAmountToCard.mockResolvedValue(true);
  
//       await processPayment(req, res);
  
//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith({
//         message: 'payment processed successfully',
//         sender: req.body.sender,
//         receiver: req.body.receiver,
//       });
//     });
// });