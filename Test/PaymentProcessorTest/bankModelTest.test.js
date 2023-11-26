const bankModel = require('../../PaymentProcessor/bankModel');
const userAccountModel = require('../../Models/userAccountModel');

jest.mock('../../Models/userAccountModel', () => ({
  findOne: jest.fn(),
  updateOne: jest.fn(),
}));

describe('Bank Functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validCard', () => {
    test('should return false if card is not found in the database', async () => {
      userAccountModel.findOne.mockResolvedValue(null);

      const result = await bankModel.validCard({ cardNumber: '1234567890123456' });

      expect(result).toBe(false);
    });

    test('should return false if card has expired', async () => {
      userAccountModel.findOne.mockResolvedValue({
        cardDetails: {
          cardNumber: '1234567890123456',
          expiryDate: '2022-01-01',
        },
      });

      const result = await bankModel.validCard({ cardNumber: '1234567890123456' });

      expect(result).toBe(false);
    });

    test('should return true if card is valid', async () => {
      userAccountModel.findOne.mockResolvedValue({
        cardDetails: {
          cardNumber: '1234567890123456',
          expiryDate: '2025-01-01',
        },
      });

      const result = await bankModel.validCard({ cardNumber: '1234567890123456' });

      expect(result).toBe(true);
    });
  });

  describe('fetchCardBalance', () => {
    test('should return balance if card is found in the database', async () => {
      userAccountModel.findOne.mockResolvedValue({
        cardDetails: {
          cardNumber: '1234567890123456',
          expiryDate: '2025-01-01',
        },
        balance: 5000,
      });

      const result = await bankModel.fetchCardBalance({ cardNumber: '1234567890123456' });

      expect(result).toBe(5000);
    });

    test('should return -1 if card is not found in the database', async () => {
      userAccountModel.findOne.mockResolvedValue(null);

      const result = await bankModel.fetchCardBalance({ cardNumber: '1234567890123456' });

      expect(result).toBe(-1);
    });
  });

  describe('debitAmountFromCard', () => {
    test('should update balance and return true if debit is successful', async () => {
      userAccountModel.findOne.mockResolvedValue({
        cardDetails: {
          cardNumber: '1234567890123456',
          expiryDate: '2025-01-01',
        },
        balance: 1000,
      });
      userAccountModel.updateOne.mockResolvedValue({});

      const inputCard = { cardNumber: '1234567890123456' };
      const inputAmount = 500;
      const result = await bankModel.debitAmountFromCard(inputCard, inputAmount);

      expect(result).toBe(true);
      expect(userAccountModel.updateOne).toHaveBeenCalledWith(
        { 'cardDetails.cardNumber': '1234567890123456' },
        { balance: 500 }
      );
    });

    test('should return false if an error occurs during debit', async () => {
      userAccountModel.updateOne.mockResolvedValue({error: 'Test Debit error'});

      const result = await bankModel.debitAmountFromCard({ cardNumber: '1234567890123456' }, 500);

      expect(result).toBe(false);
    });
  });

  describe('creditAmountToCard', () => {
    test('should update balance and return true if credit is successful', async () => {
      userAccountModel.findOne.mockResolvedValue({
        cardDetails: {
          cardNumber: '1234567890123456',
          expiryDate: '2025-01-01',
        },
        balance: 1000,
      });

      userAccountModel.updateOne.mockResolvedValue({});

      const result = await bankModel.creditAmountToCard({ cardNumber: '1234567890123456' }, 500);

      expect(result).toBe(true);
      expect(userAccountModel.updateOne).toHaveBeenCalledWith(
        { 'cardDetails.cardNumber': '1234567890123456' },
        { balance: 1500 }
      );
    });

    test('should return false if an error occurs during credit', async () => {
      userAccountModel.updateOne.mockResolvedValue({error: 'Test Credit error'});

      const result = await bankModel.creditAmountToCard({ cardNumber: '1234567890123456' }, 500);

      expect(result).toBe(false);
    });
  });
});