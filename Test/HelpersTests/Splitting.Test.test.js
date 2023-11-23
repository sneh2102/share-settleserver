const simplifyDebts = require('../../helper/spliting');

describe('simplifyDebts', () => {
  it('should simplify debts with two transactions that cancel each other', () => {
    const transactions = {
      'A': 50,
      'B': -50,
    };
    const result = simplifyDebts(transactions);
    expect(result).toEqual([
      ['B', 'A', 50],
    ]);
  });

  it('should simplify debts with multiple transactions', () => {
    const transactions = {
      'A': 30,
      'B': -20,
      'C': -10,
    };
    const result = simplifyDebts(transactions);
    expect(result).toEqual([
      ['B', 'A', 20],
      ['C', 'A', 10],
    ]);
  });

  it('should handle complex debts with multiple transactions', () => {
    const transactions = {
      'A': 30,
      'B': -20,
      'C': 10,
      'D': -10,
    };
    const result = simplifyDebts(transactions);
    expect(result).toEqual([
      ['D', 'C', 10], 
      ['B', 'A', 20],
    ]);
  });
    
  

  it('should handle empty transactions', () => {
    const transactions = {};
    const result = simplifyDebts(transactions);
    expect(result).toEqual([]);
  });

  it('should handle transactions with non-zero values', () => {
    const transactions = {
      'A': 30,
      'B': -20,
      'C': -5,
    };
    const result = simplifyDebts(transactions);
    expect(result).toEqual([
      ['B', 'A', 20],
      ['C', 'A', 5],
    ]);
  });
});

