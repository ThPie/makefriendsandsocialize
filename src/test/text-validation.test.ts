
import { describe, it, expect } from 'vitest';
import { isGibberish, validateBio } from '@/lib/text-validation';

describe('isGibberish', () => {
    it('should allow normal text', () => {
        const text = 'I am a software engineer looking for friends.';
        expect(isGibberish(text).isGibberish).toBe(false);
    });

    it('should detect keyboard smashing (consonant clusters)', () => {
        const text = 'sdfghjklmnbvcxz'; // 15 chars, might be too short for some checks, but hits consonant cluster check
        // Logic: length < 20 returns false immediately.
        // Let's make it longer.
        const longSmash = 'asdfghjklmnbvcxzqwertyuiop';
        expect(isGibberish(longSmash).isGibberish).toBe(true);
    });

    it('should detect repeated characters', () => {
        const text = 'I loooveeeeeeeeeeeeeee coding';
        expect(isGibberish(text).isGibberish).toBe(true);
    });

    it('should allow short texts (skipped check)', () => {
        const text = 'Hi!';
        expect(isGibberish(text).isGibberish).toBe(false);
    });
});

describe('validateBio', () => {
    it('should reject short bios', () => {
        const bio = 'Too short';
        const result = validateBio(bio, 50);
        expect(result).toContain('at least 50 characters');
    });

    it('should reject gibberish bios', () => {
        const bio = 'asdf ghjk lmnb vcxz qwer tyui opas dfgh asdf'; // Looks random-ish
        // Let's ensure it hits a specific trigger.
        const obviousGibberish = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
        const result = validateBio(obviousGibberish);
        expect(result).not.toBeNull();
    });

    it('should accept valid bios', () => {
        const bio = 'I am really excited to meet new people and explore the city together. I love hiking and coffee.';
        const result = validateBio(bio);
        expect(result).toBeNull();
    });
});
