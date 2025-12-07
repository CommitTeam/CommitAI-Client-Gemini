// ============================================
// CommitAI Mobile - Constants Unit Tests
// ============================================

import {
  COLORS,
  WORKOUT_TYPES,
  WORKOUT_TARGETS,
  WORKOUT_TIMES,
  STORE_CATALOG,
  MOCK_NAMES,
  MOCK_GYMS,
  TIMING,
  APP_CONFIG,
} from '../../src/constants';

describe('COLORS', () => {
  it('should have all brand colors defined', () => {
    expect(COLORS.acidGreen).toBe('#FFEE32');
    expect(COLORS.hotPink).toBe('#ff00ff');
    expect(COLORS.punchBlue).toBe('#0033ff');
    expect(COLORS.black).toBe('#000000');
    expect(COLORS.white).toBe('#ffffff');
  });

  it('should have voting colors', () => {
    expect(COLORS.voteRed).toBeDefined();
    expect(COLORS.voteOrange).toBeDefined();
    expect(COLORS.voteIce).toBeDefined();
  });

  it('should have system grays', () => {
    expect(COLORS.systemGray1).toBeDefined();
    expect(COLORS.systemGray2).toBeDefined();
    expect(COLORS.systemGray3).toBeDefined();
    expect(COLORS.systemGray4).toBeDefined();
    expect(COLORS.systemGray5).toBeDefined();
    expect(COLORS.systemGray6).toBeDefined();
    expect(COLORS.systemBg).toBeDefined();
  });

  it('should have valid hex color format', () => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    Object.entries(COLORS).forEach(([key, value]) => {
      if (value !== 'transparent') {
        expect(value).toMatch(hexRegex);
      }
    });
  });
});

describe('WORKOUT_TYPES', () => {
  it('should include all exercise types', () => {
    expect(WORKOUT_TYPES).toContain('Pushups');
    expect(WORKOUT_TYPES).toContain('Squats');
    expect(WORKOUT_TYPES).toContain('Jumping Jacks');
    expect(WORKOUT_TYPES).toContain('Steps');
    expect(WORKOUT_TYPES).toContain('Distance Walk');
    expect(WORKOUT_TYPES).toContain('Calories');
  });

  it('should have 6 workout types', () => {
    expect(WORKOUT_TYPES.length).toBe(6);
  });
});

describe('WORKOUT_TARGETS', () => {
  it('should have targets for each workout type', () => {
    WORKOUT_TYPES.forEach((type) => {
      expect(WORKOUT_TARGETS[type]).toBeDefined();
      expect(Array.isArray(WORKOUT_TARGETS[type])).toBe(true);
      expect(WORKOUT_TARGETS[type].length).toBeGreaterThan(0);
    });
  });

  it('should have numeric targets for reps-based exercises', () => {
    const repsExercises = ['Pushups', 'Squats', 'Jumping Jacks', 'Steps', 'Calories'];
    repsExercises.forEach((exercise) => {
      WORKOUT_TARGETS[exercise as keyof typeof WORKOUT_TARGETS].forEach((target) => {
        expect(parseInt(target)).not.toBeNaN();
      });
    });
  });

  it('should have distance format for Distance Walk', () => {
    WORKOUT_TARGETS['Distance Walk'].forEach((target) => {
      expect(target).toMatch(/km$/);
    });
  });
});

describe('WORKOUT_TIMES', () => {
  it('should have multiple time options', () => {
    expect(WORKOUT_TIMES.length).toBeGreaterThan(0);
  });

  it('should include common durations', () => {
    const hasMinutes = WORKOUT_TIMES.some((t) => t.includes('min'));
    const hasHours = WORKOUT_TIMES.some((t) => t.includes('hour'));
    expect(hasMinutes || hasHours).toBe(true);
  });
});

describe('STORE_CATALOG', () => {
  it('should have items', () => {
    expect(STORE_CATALOG.length).toBeGreaterThan(0);
  });

  it('should have valid item structure', () => {
    STORE_CATALOG.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.description).toBeDefined();
      expect(item.price).toBeDefined();
      expect(typeof item.price).toBe('number');
      expect(item.price).toBeGreaterThanOrEqual(0);
      expect(item.rarity).toBeDefined();
      expect(['common', 'rare', 'epic', 'legendary']).toContain(item.rarity);
    });
  });

  it('should have unique IDs', () => {
    const ids = STORE_CATALOG.map((item) => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have variety of rarities', () => {
    const rarities = new Set(STORE_CATALOG.map((item) => item.rarity));
    expect(rarities.size).toBeGreaterThan(1);
  });
});

describe('MOCK_NAMES', () => {
  it('should have names for mock users', () => {
    expect(MOCK_NAMES.length).toBeGreaterThan(10);
  });

  it('should have unique names', () => {
    const uniqueNames = new Set(MOCK_NAMES);
    expect(uniqueNames.size).toBe(MOCK_NAMES.length);
  });
});

describe('MOCK_GYMS', () => {
  it('should have gyms', () => {
    expect(MOCK_GYMS.length).toBeGreaterThan(0);
  });

  it('should have valid gym structure', () => {
    MOCK_GYMS.forEach((gym) => {
      expect(gym.id).toBeDefined();
      expect(gym.name).toBeDefined();
      expect(typeof gym.isPartner).toBe('boolean');
      expect(typeof gym.memberCount).toBe('number');
    });
  });
});

describe('TIMING', () => {
  it('should have animation timings', () => {
    expect(TIMING).toBeDefined();
    expect(typeof TIMING.CAROUSEL_AUTO_SCROLL).toBe('number');
    expect(typeof TIMING.FEED_REFRESH_INTERVAL).toBe('number');
  });

  it('should have reasonable timing values', () => {
    // Auto scroll should be at least 3 seconds
    expect(TIMING.CAROUSEL_AUTO_SCROLL).toBeGreaterThanOrEqual(3000);
    // Feed refresh should be at least 5 seconds
    expect(TIMING.FEED_REFRESH_INTERVAL).toBeGreaterThanOrEqual(5000);
  });
});

describe('APP_CONFIG', () => {
  it('should have app name', () => {
    expect(APP_CONFIG.name).toBe('CommitAI');
  });

  it('should have version', () => {
    expect(APP_CONFIG.version).toBeDefined();
    expect(APP_CONFIG.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should have tagline', () => {
    expect(APP_CONFIG.tagline).toBeDefined();
    expect(APP_CONFIG.tagline.length).toBeGreaterThan(0);
  });
});
