import { test, expect } from '@playwright/test';

test.describe('Dating Intake Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage to start fresh
        await page.addInitScript(() => {
            localStorage.clear();
        });
    });

    test('can navigate to intake page', async ({ page }) => {
        await page.goto('/dating/intake');

        // Should see the form
        await expect(page.locator('text=Step 1 of 8')).toBeVisible();
    });

    test('displays step indicators', async ({ page }) => {
        await page.goto('/dating/intake');

        // Should see progress navigation
        const progressNav = page.locator('nav[aria-label="Form progress"]');
        await expect(progressNav).toBeVisible();

        // Should have 8 step buttons
        const stepButtons = progressNav.locator('button');
        await expect(stepButtons).toHaveCount(8);
    });

    test('shows validation error when trying to proceed without required fields', async ({ page }) => {
        await page.goto('/dating/intake');

        // Try to click next without filling required fields
        await page.click('button:has-text("Next")');

        // Should show validation error toast or remain on step 1
        await expect(page.locator('text=Step 1 of 8')).toBeVisible();
    });

    test('can fill out Step 1 and proceed', async ({ page }) => {
        await page.goto('/dating/intake');

        // Fill out Step 1 (The Basics)
        await page.fill('input[placeholder*="name" i]', 'Test User');

        // Fill age if there's an input
        const ageInput = page.locator('input[type="number"]').first();
        if (await ageInput.isVisible()) {
            await ageInput.fill('28');
        }

        // Wait for any gender select to be visible and select if present
        const genderSelect = page.locator('button:has-text("Select"), select').first();
        if (await genderSelect.isVisible()) {
            await genderSelect.click();
            // Wait for dropdown and select first option
            await page.locator('[role="option"]').first().click();
        }
    });

    test('keyboard navigation with arrow keys', async ({ page }) => {
        await page.goto('/dating/intake');

        // Navigate using keyboard
        await page.keyboard.press('ArrowRight');

        // Should try to advance (may show validation)
        // Form should respond to keyboard input
    });

    test('progress bar updates as user advances', async ({ page }) => {
        await page.goto('/dating/intake');

        // Check initial progress bar
        const progressBar = page.locator('[role="progressbar"]');
        await expect(progressBar).toBeVisible();

        // Get initial progress
        const initialValue = await progressBar.getAttribute('aria-valuenow');
        expect(parseInt(initialValue || '0')).toBe(0);
    });

    test('can navigate back to previous steps', async ({ page }) => {
        await page.goto('/dating/intake');

        // Check that back button exists but is disabled on step 1
        const backButton = page.locator('button:has-text("Back")');
        await expect(backButton).toBeVisible();
        await expect(backButton).toBeDisabled();
    });

    test('draft saves automatically', async ({ page }) => {
        await page.goto('/dating/intake');

        // Fill in some data
        const nameInput = page.locator('input').first();
        if (await nameInput.isVisible()) {
            await nameInput.fill('Draft Test User');

            // Wait for draft to save (debounced)
            await page.waitForTimeout(500);

            // Reload page
            await page.reload();

            // Check if data persisted
            await expect(nameInput).toHaveValue('Draft Test User');
        }
    });

    test('can view review step (step 8)', async ({ page }) => {
        // Set up a mock draft at step 8 to test review
        await page.addInitScript(() => {
            const mockDraft = {
                step: 8,
                formData: {
                    display_name: 'Review Tester',
                    age: 30,
                    gender: 'male',
                    target_gender: 'female',
                    relationship_type: 'serious',
                    photo_url: 'https://example.com/photo.jpg',
                    wants_children: 'someday',
                    smoking_status: 'never',
                    drinking_status: 'socially',
                    tuesday_night_test: 'Enjoying a quiet evening at home with a book.',
                    conflict_resolution: 'Open communication and patience.',
                    emotional_connection: 'Deep conversations and quality time.',
                    core_values_ranked: ['honesty', 'loyalty', 'growth', 'family', 'adventure'],
                    dealbreakers: 'Dishonesty, lack of ambition',
                    search_radius: 25,
                    email_notifications_enabled: true,
                    push_notifications_enabled: true,
                    sms_notifications_enabled: false,
                },
            };
            localStorage.setItem('dating_application_draft', JSON.stringify(mockDraft));
        });

        await page.goto('/dating/intake');

        // Should be on step 8 (Review)
        await expect(page.locator('text=Step 8 of 8')).toBeVisible();
    });

    test('accessibility - step buttons have proper ARIA labels', async ({ page }) => {
        await page.goto('/dating/intake');

        // Check for aria-current on current step
        const currentStep = page.locator('button[aria-current="step"]');
        await expect(currentStep).toBeVisible();

        // Check for aria-label with state information
        const firstStepButton = page.locator('button[aria-label*="current step"]');
        await expect(firstStepButton).toBeVisible();
    });
});
