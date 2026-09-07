import {FirstUpperPipe} from './first-upper';

describe('FirstUpperPipe', () => {
  const pipe = new FirstUpperPipe();

  it('should capitalize the first character only', () => {
    expect(pipe.transform('bonjour')).toBe('Bonjour');
  });

  it('should leave an already capitalized string unchanged', () => {
    expect(pipe.transform('Bonjour')).toBe('Bonjour');
  });

  it('should handle a single character', () => {
    expect(pipe.transform('a')).toBe('A');
  });

  it('should return an empty string for empty input', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return an empty string for null input', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return an empty string for undefined input', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
