
import { describe, it, expect } from 'vitest';
import { validatePassword, getPasswordStrength } from '@/components/ui/password-input';

describe('validatePassword', () => {
    it('should reject short passwords', () => {
        const result = validatePassword('Short1!');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('At least 10 characters');
    });

    it('should reject passwords without uppercase', () => {
        const result = validatePassword('longpassword1!');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('One uppercase letter');
    });

    it('should reject passwords without numbers', () => {
        const result = validatePassword('LongPassword!');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('One number');
    });

    it('should reject passwords without special characters', () => {
        const result = validatePassword('LongPassword1');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('One special character');
    });

    it('should accept valid strong passwords', () => {
        const result = validatePassword('CorrectHorseBatteryStaple1!');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
});

describe('getPasswordStrength', () => {
    it('should return score 0 for empty password', () => {
        const { score } = getPasswordStrength('');
        expect(score).toBe(0);
    });

    it('should return score 100 for strong password', () => {
        const { score, label } = getPasswordStrength('StrongP@ssw0rd');
        expect(score).toBe(100);
        expect(label).toBe('Strong');
    });

    it('should calculate partial strength correctly', () => {
        // Length (fail), Upper (pass), Number (pass), Special (pass) -> 3/4 passed -> 75
        // Wait, let's check exact logic:
        // P@1 -> Length(fail), Upper(pass), Number(pass), Special(pass)
        const { score } = getPasswordStrength('P@1');
        // Logic: passed items count. 
        // passed: Upper, Number, Special. = 3.
        // Score should be 75.
        expect(score).toBe(75);
    });
});
