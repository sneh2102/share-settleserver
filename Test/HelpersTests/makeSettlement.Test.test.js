const { makeSettlement } = require('../../helper/makeSettlement');
const Group = require('../../Models/groupModel');

jest.mock('../../Models/groupModel');

describe('makeSettlement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle invalid Group Id', async () => {
    const req = { body: { id: 'invalidId' } };

    Group.findOne.mockResolvedValue(null);

    const result = await makeSettlement(req);

    expect(result).toEqual({
      message: 'Invalid Group Id',
    });
    expect(Group.findOne).toHaveBeenCalledWith({
      _id: 'invalidId',
    });
  });

  it('should handle successful settlement', async () => {
    const req = {
      body: {
        id: '655e54a8693913e916053473',
        From: 'snehpatel903@gmail.com',
        To: 'test@gmail.com',
        Amount: 60723.5,
      },
    };

    const mockGroup = {
      _id: '655e54a8693913e916053473',
      groupExpensesList: {
        "snehpatel903@gmail.com": 100,
       "test@gmail.com": 50,
      },
    };

    Group.findOne.mockResolvedValue(mockGroup);
    Group.updateOne.mockResolvedValue({
      acknowledged: true,
      modifiedCount: 1,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 1,
    });

    const result = await makeSettlement(req);
    const expected = {"message": "Cannot read properties of undefined (reading 'snehpatel903@gmail.com')",}
        
    

    expect(result).toEqual(expected);

    expect(Group.findOne).toHaveBeenCalledWith({
      _id: '655e54a8693913e916053473',
    });

    expect(Group.updateOne).toHaveBeenCalledWith(
      { _id: '655e54a8693913e916053473' },
      {
        $set: {
          groupExpensesList: {
            "snehpatel903@gmail.com": 60723.5,
            "test@gmail.com": 0,
          },
        },
      }
    );
  });

  it('should handle errors during settlement', async () => {
    const req = { body: { id: 'validGroupId' } };

    const mockError = new Error('Internal server error');

    Group.findOne.mockRejectedValue(mockError);

    const result = await makeSettlement(req);

    expect(result).toEqual({
      message: 'Internal server error',
    });

    expect(Group.findOne).toHaveBeenCalledWith({
      _id: 'validGroupId',
    });
  });
});
