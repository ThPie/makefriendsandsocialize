/**
 * Tests for useIntakeForm hook
 * Tests state management, navigation, draft persistence, and validation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { useIntakeForm } from './useIntakeForm';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'test-user-id' },
        profile: { city: 'Denver', state: 'CO', country: 'USA' },
    }),
}));

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        storage: {
            from: () => ({
                upload: vi.fn().mockResolvedValue({ error: null }),
                getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/photo.jpg' } }),
            }),
        },
        from: () => ({
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            single: vi.fn().mockResolvedValue({ data: { id: 'new-profile-id' }, error: null }),
        }),
        functions: {
            invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
        },
    },
}));

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

// Wrapper for hook testing with Router
const wrapper = ({ children }: { children: ReactNode }) => (
    <BrowserRouter>{ children } </BrowserRouter>
);

describe('useIntakeForm', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('initial state', () => {
        it('should initialize with step 1', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });
            expect(result.current.step).toBe(1);
        });

        it('should have 8 total steps', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });
            expect(result.current.totalSteps).toBe(8);
        });

        it('should initialize with default form data', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });
            expect(result.current.formData.display_name).toBe('');
            expect(result.current.formData.age).toBe(28);
            expect(result.current.formData.search_radius).toBe(25);
        });

        it('should not be submitting initially', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });
            expect(result.current.isSubmitting).toBe(false);
        });
    });

    describe('updateField', () => {
        it('should update a single field', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            act(() => {
                result.current.updateField('display_name', 'John Doe');
            });

            expect(result.current.formData.display_name).toBe('John Doe');
        });

        it('should update numeric fields correctly', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            act(() => {
                result.current.updateField('age', 35);
            });

            expect(result.current.formData.age).toBe(35);
        });

        it('should update boolean fields correctly', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            act(() => {
                result.current.updateField('has_children', true);
            });

            expect(result.current.formData.has_children).toBe(true);
        });

        it('should clear validation errors when updating a field', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            // Force some validation errors first by trying to navigate
            act(() => {
                result.current.nextStep();
            });

            // Update a field
            act(() => {
                result.current.updateField('display_name', 'John Doe');
            });

            expect(result.current.validationErrors).toHaveLength(0);
        });
    });

    describe('toggleArrayItem', () => {
        it('should add item to empty array', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            act(() => {
                result.current.toggleArrayItem('core_values_ranked', 'honesty');
            });

            expect(result.current.formData.core_values_ranked).toContain('honesty');
        });

        it('should add additional items to array', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            act(() => {
                result.current.toggleArrayItem('core_values_ranked', 'honesty');
                result.current.toggleArrayItem('core_values_ranked', 'loyalty');
            });

            expect(result.current.formData.core_values_ranked).toHaveLength(2);
            expect(result.current.formData.core_values_ranked).toContain('honesty');
            expect(result.current.formData.core_values_ranked).toContain('loyalty');
        });

        it('should remove item if already in array', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            act(() => {
                result.current.toggleArrayItem('core_values_ranked', 'honesty');
                result.current.toggleArrayItem('core_values_ranked', 'honesty');
            });

            expect(result.current.formData.core_values_ranked).not.toContain('honesty');
        });
    });

    describe('navigation', () => {
        it('should not navigate to step 0', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            act(() => {
                result.current.prevStep();
            });

            expect(result.current.step).toBe(1);
        });

        it('should go back one step with prevStep', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            // First, set up valid data and navigate forward
            act(() => {
                result.current.updateField('display_name', 'Jane Doe');
                result.current.updateField('age', 28);
                result.current.updateField('gender', 'female');
                result.current.updateField('target_gender', 'male');
                result.current.updateField('photo_url', 'https://example.com/photo.jpg');
                result.current.updateField('relationship_type', 'serious');
            });

            // Use goToStep to set step without validation
            act(() => {
                result.current.goToStep(3);
            });

            act(() => {
                result.current.prevStep();
            });

            expect(result.current.step).toBe(2);
        });

        it('should navigate to specific step with goToStep', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            // Going backwards should work without validation
            act(() => {
                result.current.goToStep(3);
            });

            act(() => {
                result.current.goToStep(1);
            });

            expect(result.current.step).toBe(1);
        });
    });

    describe('draft persistence', () => {
        it('should load draft from localStorage on mount', async () => {
            const savedDraft = {
                step: 3,
                formData: {
                    display_name: 'Saved User',
                    age: 32,
                },
            };
            localStorage.setItem('dating_application_draft', JSON.stringify(savedDraft));

            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(result.current.step).toBe(3);
            expect(result.current.formData.display_name).toBe('Saved User');
            expect(result.current.formData.age).toBe(32);
            expect(result.current.hasDraft).toBe(true);
        });

        it('should handle invalid draft data gracefully', async () => {
            localStorage.setItem('dating_application_draft', 'invalid-json');

            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            await new Promise(resolve => setTimeout(resolve, 50));

            // Should fall back to defaults
            expect(result.current.step).toBe(1);
            expect(result.current.hasDraft).toBe(false);
        });

        it('should save draft to localStorage on field update', async () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            // Wait for the initial draft load to finish setting dbDraftLoaded
            await new Promise(resolve => setTimeout(resolve, 50));

            act(() => {
                result.current.updateField('display_name', 'New Name');
            });

            // Wait for useEffect to run
            await new Promise(resolve => setTimeout(resolve, 100));

            const saved = localStorage.getItem('dating_application_draft');
            expect(saved).toBeTruthy();
            if (saved) {
                const parsed = JSON.parse(saved);
                expect(parsed.formData.display_name).toBe('New Name');
            }
        });

        it('should clear draft with clearDraft', () => {
            localStorage.setItem('dating_application_draft', JSON.stringify({
                step: 2,
                formData: { display_name: 'Old' },
            }));

            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            act(() => {
                result.current.clearDraft();
            });

            expect(localStorage.getItem('dating_application_draft')).toBeNull();
            expect(result.current.step).toBe(1);
            expect(result.current.formData.display_name).toBe('');
        });
    });

    describe('derived state', () => {
        it('should calculate progress correctly', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            // Step 1 of 8 = 12.5% progress
            expect(result.current.progress).toBe(12.5);
        });

        it('should identify serious relationship seekers', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            act(() => {
                result.current.updateField('relationship_type', 'serious');
            });

            expect(result.current.isSeekingSerious).toBe(true);
            expect(result.current.isCasualOnly).toBe(false);
        });

        it('should identify casual daters', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            act(() => {
                result.current.updateField('relationship_type', 'casual');
            });

            expect(result.current.isSeekingSerious).toBe(false);
            expect(result.current.isCasualOnly).toBe(true);
        });

        it('should provide current step config', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            expect(result.current.currentStepConfig).toBeDefined();
            expect(result.current.currentStepConfig?.number).toBe(1);
            expect(result.current.currentStepConfig?.title).toBe('The Basics');
        });
    });

    describe('updateFields', () => {
        it('should update multiple fields at once', () => {
            const { result } = renderHook(() => useIntakeForm(), { wrapper });

            act(() => {
                result.current.updateFields({
                    display_name: 'Jane Doe',
                    age: 30,
                    gender: 'female',
                });
            });

            expect(result.current.formData.display_name).toBe('Jane Doe');
            expect(result.current.formData.age).toBe(30);
            expect(result.current.formData.gender).toBe('female');
        });
    });
});
