/**
 * Tests for Intake Form Validation Schemas
 */
import { describe, it, expect } from 'vitest';
import {
    basicsSchema,
    familySchema,
    habitsSchema,
    lifestyleSchema,
    deepDiveSchema,
    dealbreakersSchema,
    notificationsSchema,
    completeIntakeSchema,
    validateStep,
    INTAKE_STEPS,
} from './intakeSchemas';

describe('basicsSchema', () => {
    const validBasics = {
        display_name: 'John Doe',
        age: 30,
        gender: 'male',
        target_gender: 'female',
        photo_url: 'https://example.com/photo.jpg',
        relationship_type: 'serious',
        age_range_min: 25,
        age_range_max: 40,
    };

    it('should accept valid basics data', () => {
        const result = basicsSchema.safeParse(validBasics);
        expect(result.success).toBe(true);
    });

    it('should reject display_name with fewer than 2 characters', () => {
        const result = basicsSchema.safeParse({ ...validBasics, display_name: 'J' });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toContain('at least 2 characters');
        }
    });

    it('should reject age below 21', () => {
        const result = basicsSchema.safeParse({ ...validBasics, age: 18 });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toContain('at least 21');
        }
    });

    it('should reject age above 100', () => {
        const result = basicsSchema.safeParse({ ...validBasics, age: 150 });
        expect(result.success).toBe(false);
    });

    it('should reject empty gender', () => {
        const result = basicsSchema.safeParse({ ...validBasics, gender: '' });
        expect(result.success).toBe(false);
    });

    it('should reject invalid photo URL', () => {
        const result = basicsSchema.safeParse({ ...validBasics, photo_url: 'not-a-url' });
        expect(result.success).toBe(false);
    });

    it('should allow empty optional social URLs', () => {
        const result = basicsSchema.safeParse({
            ...validBasics,
            linkedin_url: '',
            instagram_url: '',
        });
        expect(result.success).toBe(true);
    });

    it('should accept valid social URLs', () => {
        const result = basicsSchema.safeParse({
            ...validBasics,
            linkedin_url: 'https://linkedin.com/in/johndoe',
            instagram_url: 'https://instagram.com/johndoe',
        });
        expect(result.success).toBe(true);
    });
});

describe('familySchema', () => {
    const validFamily = {
        has_children: false,
        wants_children: 'someday',
        been_married: false,
    };

    it('should accept valid family data', () => {
        const result = familySchema.safeParse(validFamily);
        expect(result.success).toBe(true);
    });

    it('should reject empty wants_children', () => {
        const result = familySchema.safeParse({ ...validFamily, wants_children: '' });
        expect(result.success).toBe(false);
    });

    it('should allow optional children_details when has_children is true', () => {
        const result = familySchema.safeParse({
            ...validFamily,
            has_children: true,
            children_details: '2 kids, ages 5 and 8',
        });
        expect(result.success).toBe(true);
    });
});

describe('habitsSchema', () => {
    const validHabits = {
        smoking_status: 'never',
        drinking_status: 'socially',
    };

    it('should accept valid habits data', () => {
        const result = habitsSchema.safeParse(validHabits);
        expect(result.success).toBe(true);
    });

    it('should reject empty smoking_status', () => {
        const result = habitsSchema.safeParse({ ...validHabits, smoking_status: '' });
        expect(result.success).toBe(false);
    });

    it('should reject empty drinking_status', () => {
        const result = habitsSchema.safeParse({ ...validHabits, drinking_status: '' });
        expect(result.success).toBe(false);
    });

    it('should allow optional exercise and diet fields', () => {
        const result = habitsSchema.safeParse({
            ...validHabits,
            exercise_frequency: 'daily',
            diet_preference: 'vegetarian',
        });
        expect(result.success).toBe(true);
    });
});

describe('lifestyleSchema', () => {
    const validLifestyle = {
        tuesday_night_test: 'Quiet evening at home with a good book and some tea.',
    };

    it('should accept valid lifestyle data', () => {
        const result = lifestyleSchema.safeParse(validLifestyle);
        expect(result.success).toBe(true);
    });

    it('should reject tuesday_night_test with fewer than 10 characters', () => {
        const result = lifestyleSchema.safeParse({ tuesday_night_test: 'Netflix' });
        expect(result.success).toBe(false);
    });
});

describe('deepDiveSchema', () => {
    const validDeepDive = {
        conflict_resolution: 'I prefer to talk things through calmly',
        emotional_connection: 'Quality time and deep conversations',
        core_values_ranked: ['honesty', 'loyalty', 'growth', 'family', 'adventure'],
    };

    it('should accept valid deep dive data', () => {
        const result = deepDiveSchema.safeParse(validDeepDive);
        expect(result.success).toBe(true);
    });

    it('should reject empty conflict_resolution', () => {
        const result = deepDiveSchema.safeParse({ ...validDeepDive, conflict_resolution: '' });
        expect(result.success).toBe(false);
    });

    it('should reject fewer than 5 core values', () => {
        const result = deepDiveSchema.safeParse({
            ...validDeepDive,
            core_values_ranked: ['honesty', 'loyalty'],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toContain('5 core values');
        }
    });
});

describe('dealbreakersSchema', () => {
    const validDealbreakers = {
        dealbreakers: 'Dishonesty, lack of ambition, disrespectful behavior',
    };

    it('should accept valid dealbreakers data', () => {
        const result = dealbreakersSchema.safeParse(validDealbreakers);
        expect(result.success).toBe(true);
    });

    it('should reject dealbreakers with fewer than 10 characters', () => {
        const result = dealbreakersSchema.safeParse({ dealbreakers: 'None' });
        expect(result.success).toBe(false);
    });
});

describe('notificationsSchema', () => {
    it('should use default values when not provided', () => {
        const result = notificationsSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.search_radius).toBe(25);
            expect(result.data.email_notifications_enabled).toBe(true);
            expect(result.data.push_notifications_enabled).toBe(true);
            expect(result.data.sms_notifications_enabled).toBe(false);
        }
    });

    it('should reject search_radius below 5', () => {
        const result = notificationsSchema.safeParse({ search_radius: 2 });
        expect(result.success).toBe(false);
    });

    it('should reject search_radius above 100', () => {
        const result = notificationsSchema.safeParse({ search_radius: 200 });
        expect(result.success).toBe(false);
    });
});

describe('INTAKE_STEPS', () => {
    it('should have 8 steps', () => {
        expect(INTAKE_STEPS.length).toBe(8);
    });

    it('should have steps numbered 1 through 8', () => {
        INTAKE_STEPS.forEach((step, index) => {
            expect(step.number).toBe(index + 1);
        });
    });

    it('should have each step with a title and schema', () => {
        INTAKE_STEPS.forEach((step) => {
            expect(step.title).toBeDefined();
            expect(typeof step.title).toBe('string');
            expect(step.schema).toBeDefined();
        });
    });
});

describe('validateStep', () => {
    it('should return success for valid step 1 data', () => {
        const result = validateStep(1, {
            display_name: 'John Doe',
            age: 30,
            gender: 'male',
            target_gender: 'female',
            photo_url: 'https://example.com/photo.jpg',
            relationship_type: 'serious',
            age_range_min: 25,
            age_range_max: 40,
        });
        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid step 1 data', () => {
        const result = validateStep(1, {
            display_name: 'J',
            age: 15,
            gender: '',
            target_gender: '',
            photo_url: 'invalid',
            relationship_type: '',
        });
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return success for invalid step number', () => {
        const result = validateStep(99, {});
        expect(result.success).toBe(true);
    });

    it('should return success for step 8 (Review) with any data', () => {
        const result = validateStep(8, {});
        expect(result.success).toBe(true);
    });
});

describe('completeIntakeSchema', () => {
    const completeValidData = {
        // Basics
        display_name: 'John Doe',
        age: 30,
        gender: 'male',
        target_gender: 'female',
        photo_url: 'https://example.com/photo.jpg',
        relationship_type: 'serious',
        age_range_min: 25,
        age_range_max: 40,
        // Family
        has_children: false,
        wants_children: 'someday',
        been_married: false,
        // Habits
        smoking_status: 'never',
        drinking_status: 'socially',
        // Lifestyle
        tuesday_night_test: 'Enjoying a quiet evening with a good book.',
        // Deep Dive
        conflict_resolution: 'I talk things through calmly and try to understand the other person.',
        emotional_connection: 'Quality time and meaningful conversations.',
        core_values_ranked: ['honesty', 'loyalty', 'growth', 'family', 'adventure'],
        // Dealbreakers
        dealbreakers: 'Dishonesty, lack of ambition, and disrespect.',
        // Notifications
        search_radius: 25,
        email_notifications_enabled: true,
        push_notifications_enabled: true,
        sms_notifications_enabled: false,
    };

    it('should accept complete valid data', () => {
        const result = completeIntakeSchema.safeParse(completeValidData);
        expect(result.success).toBe(true);
    });

    it('should merge all step schemas correctly', () => {
        // Test that all required fields from each step are included
        const result = completeIntakeSchema.safeParse({
            ...completeValidData,
            core_values: 'honesty, growth', // Legacy field
        });
        expect(result.success).toBe(true);
    });
});
