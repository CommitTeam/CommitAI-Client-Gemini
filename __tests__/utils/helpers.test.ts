// ============================================
// CommitAI Mobile - Utils/Helpers Unit Tests
// ============================================

import {
  generateId,
  formatCoins,
  formatRelativeTime,
  isValidUsername,
  isValidEmail,
  getRarityColor,
  shuffleArray,
  debounce,
} from '../../src/utils/helpers';

describe('generateId', () => {
  it('should generate a unique ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).toBeDefined();
    expect(typeof id1).toBe('string');
    expect(id1).not.toBe(id2);
  });

  it('should generate ID with prefix', () => {
    const id = generateId('test');
    expect(id.startsWith('test')).toBe(true);
  });
});

describe('formatCoins', () => {
  it('should format small numbers without suffix', () => {
    expect(formatCoins(500)).toBe('500');
    expect(formatCoins(999)).toBe('999');
  });

  it('should format thousands with K suffix', () => {
    expect(formatCoins(1000)).toBe('1.0K');
    expect(formatCoins(1500)).toBe('1.5K');
  });

  it('should format millions with M suffix', () => {
    expect(formatCoins(1000000)).toBe('1.0M');
    expect(formatCoins(2500000)).toBe('2.5M');
  });

  it('should handle zero', () => {
    expect(formatCoins(0)).toBe('0');
  });
});

describe('formatRelativeTime', () => {
  const now = Date.now();

  it('should format recent time as just now', () => {
    const result = formatRelativeTime(now - 30 * 1000);
    expect(result.toLowerCase()).toMatch(/just now|second/);
  });

  it('should format minutes ago', () => {
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const result = formatRelativeTime(fiveMinutesAgo);
    expect(result).toMatch(/5.*m|min/i);
  });

  it('should format hours ago', () => {
    const threeHoursAgo = now - 3 * 60 * 60 * 1000;
    const result = formatRelativeTime(threeHoursAgo);
    expect(result).toMatch(/3.*h|hour/i);
  });
});

describe('isValidUsername', () => {
  it('should accept valid usernames', () => {
    expect(isValidUsername('john123')).toBe(true);
    expect(isValidUsername('CoolUser')).toBe(true);
    expect(isValidUsername('abc')).toBe(true);
  });

  it('should reject too short usernames', () => {
    expect(isValidUsername('ab')).toBe(false);
    expect(isValidUsername('')).toBe(false);
  });

  it('should reject too long usernames', () => {
    expect(isValidUsername('a'.repeat(21))).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('should accept valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('getRarityColor', () => {
  it('should return correct colors for rarities', () => {
    expect(getRarityColor('common')).toBe('#9CA3AF');
    expect(getRarityColor('rare')).toBe('#3B82F6');
    expect(getRarityColor('epic')).toBe('#8B5CF6');
    expect(getRarityColor('legendary')).toBe('#F59E0B');
  });

  it('should return default color for unknown rarity', () => {
    expect(getRarityColor('unknown')).toBe('#9CA3AF');
  });
});

describe('shuffleArray', () => {
  it('should return array of same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray([...arr]);
    expect(shuffled.length).toBe(arr.length);
  });

  it('should contain same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray([...arr]);
    arr.forEach((item) => {
      expect(shuffled).toContain(item);
    });
  });

  it('should handle empty array', () => {
    expect(shuffleArray([])).toEqual([]);
  });
});

describe('debounce', () => {
  jest.useFakeTimers();

  it('should delay function execution', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should only call once for rapid calls', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
