const processor = require('../../PaymentProcessor/processor');
const userModel = require('../../Models/userModel');
const bankModel = require('../../PaymentProcessor/bankModel');

// Mocking the userModel
jest.mock('../../Models/userModel');
const mockedUserModel = require('../../Models/userModel');

// Mocking the bankModel
jest.mock('../../PaymentProcessor/bankModel');
const mockedBankModel = require('../../PaymentProcessor/bankModel');

describe('processPayment', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create mock card details
  const createMockCardDetails = (cardNumber, cardHolderName, expiryDate, cvv) => ({
    cardNumber,
    cardHolderName,
    expiryDate,
    cvv,
  });

  // Test case 1: Successful payment
  it('should process payment successfully', async () => {
    cardDetails = createMockCardDetails(
      '1234567890123456', 
      'John Doe', 
      "2025-01-01", 
      123);
    
    mockedUserModel.findOne.mockResolvedValue({
      email: 'sender@example.com',
      creditCardDetails: cardDetails,
    });

    // Mocking bank model functions
    mockedBankModel.validCard.mockResolvedValue(true);
    mockedBankModel.fetchCardBalance.mockResolvedValue(1000);
    mockedBankModel.debitAmountFromCard.mockResolvedValue(true);
    mockedBankModel.creditAmountToCard.mockResolvedValue(true);

    const req = {
      body: {
        sender: 'sender@example.com',
        receiver: 'receiver@example.com',
        amount: 500,
      },
    };

    const result = await processor.processPayment(req);

    expect(result).toEqual({
      message: 'payment processed successfully',
      sender: 'sender@example.com',
      receiver: 'receiver@example.com',
    });

    // Check that mocked functions were called with the correct parameters
    expect(mockedUserModel.findOne).toHaveBeenCalledWith({ email: 'sender@example.com' });
    expect(mockedBankModel.validCard).toHaveBeenCalledWith(cardDetails);
    expect(mockedBankModel.fetchCardBalance).toHaveBeenCalledWith(cardDetails);
    expect(mockedBankModel.debitAmountFromCard).toHaveBeenCalledWith(cardDetails, 500);
    expect(mockedBankModel.creditAmountToCard).toHaveBeenCalledWith(cardDetails, 500);
  });

  // Test case 2: Insufficient balance
  it('should return error for insufficient balance', async () => {
    cardDetails = createMockCardDetails(
      '1234567890123456', 
      'John Doe', 
      "2025-01-01", 
      123);

    // Mocking user data
    mockedUserModel.findOne.mockResolvedValue({
      email: 'sender@example.com',
      creditCardDetails: cardDetails
    });

    // Mocking bank model functions
    mockedBankModel.validCard.mockResolvedValue(true);
    mockedBankModel.fetchCardBalance.mockResolvedValue(200); // Set a lower balance than the amount to be sent

    const req = {
      body: {
        sender: 'sender@example.com',
        receiver: 'receiver@example.com',
        amount: 500,
      },
    };

    const result = await processor.processPayment(req);

    expect(result).toEqual({
      sender: 'sender@example.com',
      receiver: 'receiver@example.com',
      error: {
        errorCode: '40004',
        errorMessage: 'insufficient balance',
      },
    });

    // Check that mocked functions were called with the correct parameters
    expect(mockedUserModel.findOne).toHaveBeenCalledWith({ email: 'sender@example.com' });
    expect(mockedBankModel.validCard).toHaveBeenCalledWith(cardDetails);
    expect(mockedBankModel.fetchCardBalance).toHaveBeenCalledWith(cardDetails);
    // Ensure that debitAmountFromCard and creditAmountToCard were not called
    expect(mockedBankModel.debitAmountFromCard).not.toHaveBeenCalled();
    expect(mockedBankModel.creditAmountToCard).not.toHaveBeenCalled();
  });

  // Test case 3: Invalid sender card
  it('should return error for invalid sender card', async () => {
    cardDetails = createMockCardDetails(
      '1234567890123456', 
      'John Doe', 
      "2025-01-01", 
      123);

    mockedUserModel.findOne.mockResolvedValue({
      email: 'sender@example.com',
      creditCardDetails: cardDetails
    });

    // Mocking bank model functions
    mockedBankModel.validCard.mockResolvedValue(false);

    const req = {
      body: {
        sender: 'sender@example.com',
        receiver: 'receiver@example.com',
        amount: 500,
      },
    };

    const result = await processor.processPayment(req);

    expect(result).toEqual({
      sender: 'sender@example.com',
      receiver: 'receiver@example.com',
      error: {
        errorCode: '40002',
        errorMessage: 'invalid sender card',
      },
    });

    // Check that mocked functions were called with the correct parameters
    expect(mockedUserModel.findOne).toHaveBeenCalledWith({ email: 'sender@example.com' });
    expect(mockedBankModel.validCard).toHaveBeenCalledWith(cardDetails);
    // Ensure that fetchCardBalance, debitAmountFromCard, and creditAmountToCard were not called
    expect(mockedBankModel.fetchCardBalance).not.toHaveBeenCalled();
    expect(mockedBankModel.debitAmountFromCard).not.toHaveBeenCalled();
    expect(mockedBankModel.creditAmountToCard).not.toHaveBeenCalled();
  });

  // Test case 4: Error in fetchCard function
  it('should return error when there is an error fetching sender card', async () => {
    mockedUserModel.findOne.mockRejectedValue(new Error('Some error occurred'));

    const req = {
      body: {
        sender: 'sender@example.com',
        receiver: 'receiver@example.com',
        amount: 500,
      },
    };

    const result = await processor.processPayment(req);

    expect(result).toEqual({
      sender: 'sender@example.com',
      receiver: 'receiver@example.com',
      error: {
        errorCode: '40002',
        errorMessage: 'invalid sender card',
      },
    });

    // Check that mocked functions were called with the correct parameters
    expect(mockedUserModel.findOne).toHaveBeenCalledWith({ email: 'sender@example.com' });
    // Ensure that fetchCardBalance, debitAmountFromCard, validCard, and creditAmountToCard were not called
    expect(mockedBankModel.fetchCardBalance).not.toHaveBeenCalled();
    expect(mockedBankModel.debitAmountFromCard).not.toHaveBeenCalled();
    expect(mockedBankModel.creditAmountToCard).not.toHaveBeenCalled();
  });

  // Test case 5: Invalid receiver card
it('should return error for invalid receiver card', async () => {
  cardDetails = createMockCardDetails(
    '1234567890123456', 
    'John Doe', 
    "2025-01-01", 
    123);

  mockedUserModel.findOne.mockResolvedValue({
    email: 'sender@example.com',
    creditCardDetails: cardDetails,
  });

  // sender card is valid
  mockedBankModel.validCard.mockReturnValueOnce(true);
  // receiver card is invalid
  mockedBankModel.validCard.mockReturnValueOnce(false);

  // Receiver card is invalid
  mockedBankModel.fetchCardBalance.mockResolvedValue(null);

  const req = {
    body: {
      sender: 'sender@example.com',
      receiver: 'receiver@example.com',
      amount: 500,
    },
  };

  const result = await processor.processPayment(req);

  expect(result).toEqual({
    sender: 'sender@example.com',
    receiver: 'receiver@example.com',
    error: {
      errorCode: '40003',
      errorMessage: 'invalid receiver card',
    },
  });

  // Check that mocked functions were called with the correct parameters
  expect(mockedUserModel.findOne).toHaveBeenCalledWith({ email: 'sender@example.com' });
  expect(mockedBankModel.validCard).toHaveBeenCalledWith(cardDetails);
  expect(mockedBankModel.fetchCardBalance).not.toHaveBeenCalledWith();
  // Ensure that debitAmountFromCard and creditAmountToCard were not called
  expect(mockedBankModel.debitAmountFromCard).not.toHaveBeenCalled();
  expect(mockedBankModel.creditAmountToCard).not.toHaveBeenCalled();
});

// Test case 6: Error in debitAmountFromCard function
it('should return error when there is an error debiting amount', async () => {
  cardDetails = createMockCardDetails(
    '1234567890123456', 
    'John Doe', 
    "2025-01-01", 
    123);

  mockedUserModel.findOne.mockResolvedValue({
    email: 'sender@example.com',
    creditCardDetails: cardDetails
  });

  // Mocking bank model functions
  mockedBankModel.validCard.mockResolvedValue(true);
  mockedBankModel.fetchCardBalance.mockResolvedValue(1000);
  
  // Simulating an error during debit operation
  mockedBankModel.debitAmountFromCard.mockResolvedValue(false);

  const req = {
    body: {
      sender: 'sender@example.com',
      receiver: 'receiver@example.com',
      amount: 500,
    },
  };

  const result = await processor.processPayment(req);

  expect(result).toEqual({
    sender: 'sender@example.com',
    receiver: 'receiver@example.com',
    error: {
      errorCode: '50003',
      errorMessage: 'error debiting amount',
    },
  });

  // Check that mocked functions were called with the correct parameters
  expect(mockedUserModel.findOne).toHaveBeenCalledWith({ email: 'sender@example.com' });
  expect(mockedBankModel.validCard).toHaveBeenCalledWith(cardDetails);
  expect(mockedBankModel.fetchCardBalance).toHaveBeenCalledWith(cardDetails);
  expect(mockedBankModel.debitAmountFromCard).toHaveBeenCalledWith(cardDetails, 500);
  // Ensure that creditAmountToCard was not called
  expect(mockedBankModel.creditAmountToCard).not.toHaveBeenCalled();
});

// Test case 7: Error in creditAmountToCard function
it('should return error when there is an error crediting amount', async () => {
  cardDetails = createMockCardDetails(
    '1234567890123456', 
    'John Doe', 
    "2025-01-01", 
    123);

  mockedUserModel.findOne.mockResolvedValue({
    email: 'sender@example.com',
    creditCardDetails: cardDetails
  });

  // Mocking bank model functions
  mockedBankModel.validCard.mockResolvedValue(true);
  mockedBankModel.fetchCardBalance.mockResolvedValue(1000);
  mockedBankModel.debitAmountFromCard.mockResolvedValue(true);

  // Simulating an error during credit operation
  mockedBankModel.creditAmountToCard.mockReturnValueOnce(false);
  mockedBankModel.creditAmountToCard.mockReturnValueOnce(true);

  const req = {
    body: {
      sender: 'sender@example.com',
      receiver: 'receiver@example.com',
      amount: 500,
    },
  };

  const result = await processor.processPayment(req);

  expect(result).toEqual({
    sender: 'sender@example.com',
    receiver: 'receiver@example.com',
    error: {
      errorCode: '50002',
      errorMessage: 'error crediting amount',
    },
  });

  // Check that mocked functions were called with the correct parameters
  expect(mockedUserModel.findOne).toHaveBeenCalledWith({ email: 'sender@example.com' });
  expect(mockedBankModel.validCard).toHaveBeenCalledWith(cardDetails);
  expect(mockedBankModel.fetchCardBalance).toHaveBeenCalledWith(cardDetails);
  expect(mockedBankModel.debitAmountFromCard).toHaveBeenCalledWith(cardDetails, 500);
  expect(mockedBankModel.creditAmountToCard).toHaveBeenCalledWith(cardDetails, 500);
});
});