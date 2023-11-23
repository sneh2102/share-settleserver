// const { calculatePeriodFromString } = require('../../helper/scheduler');
// const CronTime = require('cron-time-generator');

// jest.mock('cron-time-generator');

// describe('calculatePeriodFromString', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   test('should return a valid date for minutes', () => {
//     const result = calculatePeriodFromString('5 minutes');
//     expect(result instanceof Date).toBe(true);
//     expect(CronTime.every).toHaveBeenCalledWith(5).minutes();
//   });

//   test('should return a valid date for days', () => {
//     const result = calculatePeriodFromString('3 days');
//     expect(result instanceof Date).toBe(true);
//     expect(CronTime.every).toHaveBeenCalledWith(3).days();
//   });

//   test('should return a valid date for weeks', () => {
//     const result = calculatePeriodFromString('2 weeks');
//     expect(result instanceof Date).toBe(true);
//     expect(CronTime.every).toHaveBeenCalledWith(14).days();
//   });

//   test('should return a valid date for months', () => {
//     const result = calculatePeriodFromString('4 months');
//     expect(result instanceof Date).toBe(true);
//     expect(CronTime.every).toHaveBeenCalledWith(120).days(); // Assuming 30 days in a month
//   });

//   test('should return a valid date for years', () => {
//     const result = calculatePeriodFromString('1 year');
//     expect(result instanceof Date).toBe(true);
//     expect(CronTime.every).toHaveBeenCalledWith(365).days();
//   });

//   test('should default to daysInWeek when the unit is not recognized', () => {
//     const result = calculatePeriodFromString('10 unknown');
//     expect(result instanceof Date).toBe(true);
//     expect(CronTime.every).toHaveBeenCalledWith(7).days(); // Defaulting to daysInWeek
//   });

//   // Additional test cases for edge scenarios and invalid inputs

//   test('should return a valid date for 0 minutes (edge case)', () => {
//     const result = calculatePeriodFromString('0 minutes');
//     expect(result instanceof Date).toBe(true);
//     expect(CronTime.every).toHaveBeenCalledWith(0).minutes();
//   });

//   test('should default to daysInWeek for negative values (edge case)', () => {
//     const result = calculatePeriodFromString('-3 days');
//     expect(result instanceof Date).toBe(true);
//     expect(CronTime.every).toHaveBeenCalledWith(7).days(); // Defaulting to daysInWeek
//   });

//   test('should default to daysInWeek for invalid input (edge case)', () => {
//     const result = calculatePeriodFromString('invalid input');
//     expect(result instanceof Date).toBe(true);
//     expect(CronTime.every).toHaveBeenCalledWith(7).days(); // Defaulting to daysInWeek
//   });
// });
