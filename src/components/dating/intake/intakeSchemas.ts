/**
 * Intake Form Validation Schemas
 * Provides Zod schemas and types for the dating intake form
 */
import { z } from 'zod';

// Step 1: The Basics
export const basicsSchema = z.object({
    display_name: z.string().min(2, 'Display name must be at least 2 characters'),
    age: z.number().min(21, 'You must be at least 21 years old').max(100, 'Please enter a valid age'),
    gender: z.string().min(1, 'Please select your gender'),
    target_gender: z.string().optional().default(''),
    photo_url: z.string().url('Please upload a profile photo'),
    relationship_type: z.string().min(1, 'Please select your relationship intentions'),
    location: z.string().optional(),
    occupation: z.string().optional(),
    bio: z.string().optional(),
    linkedin_url: z.string().url().optional().or(z.literal('')),
    instagram_url: z.string().url().optional().or(z.literal('')),
    facebook_url: z.string().url().optional().or(z.literal('')),
    twitter_url: z.string().url().optional().or(z.literal('')),
    age_range_min: z.number().min(21).max(100).default(25),
    age_range_max: z.number().min(21).max(100).default(40),
});

// Step 2: Life & Family
export const familySchema = z.object({
    has_children: z.boolean().nullable().default(null),
    children_details: z.string().optional(),
    wants_children: z.string().min(1, 'Please answer the children question'),
    been_married: z.boolean().nullable().default(null),
    marriage_history: z.string().optional(),
    marriage_timeline: z.string().optional(),
    family_relationship: z.string().optional(),
    family_involvement_expectation: z.string().optional(),
    open_to_partner_children: z.string().optional(),
});

// Step 3: Habits
export const habitsSchema = z.object({
    smoking_status: z.string().min(1, 'Please select your smoking habits'),
    drinking_status: z.string().min(1, 'Please select your drinking habits'),
    drug_use: z.string().optional(),
    exercise_frequency: z.string().optional(),
    diet_preference: z.string().optional(),
    screen_time_habits: z.string().optional(),
});

// Step 4: Daily Life / Lifestyle
export const lifestyleSchema = z.object({
    tuesday_night_test: z.string().min(10, 'Please describe your ideal Tuesday night'),
    financial_philosophy: z.string().optional(),
    current_curiosity: z.string().optional(),
    debt_status: z.string().optional(),
    career_ambition: z.string().optional(),
});

// Step 5: Deep Dive (Personality & Communication)
export const deepDiveSchema = z.object({
    conflict_resolution: z.string().min(1, 'Please describe how you handle conflict'),
    emotional_connection: z.string().min(1, 'Please answer this question'),
    support_style: z.string().optional(),
    vulnerability_check: z.string().optional(),
    core_values_ranked: z.array(z.string()).min(5, 'Please select 5 core values'),
    love_language: z.string().optional(),
    attachment_style: z.string().optional(),
    introvert_extrovert: z.string().optional(),
    morning_night_person: z.string().optional(),
    communication_style: z.string().optional(),
    repair_attempt_response: z.string().optional(),
    stress_response: z.string().optional(),
    past_relationship_learning: z.string().optional(),
});

// Step 6: Dealbreakers & Values
export const dealbreakersSchema = z.object({
    dealbreakers: z.string().min(10, 'Please share your dealbreakers'),
    politics_stance: z.string().optional(),
    religion_stance: z.string().optional(),
    future_goals: z.string().optional(),
    trust_fidelity_views: z.string().optional(),
    political_issues: z.array(z.string()).optional(),
    religious_practice: z.string().optional(),
    raise_children_faith: z.string().optional(),
    geographic_flexibility: z.string().optional(),
    ten_year_vision: z.string().optional(),
    accountability_reflection: z.string().optional(),
    ex_admiration: z.string().optional(),
    growth_work: z.string().optional(),
    intimacy_expectations: z.string().optional(),
    finding_love_fear: z.string().optional(),
});

// Step 7: Notifications
export const notificationsSchema = z.object({
    search_radius: z.number().min(5).max(500).default(25),
    phone_number: z.string().optional(),
    email_notifications_enabled: z.boolean().default(true),
    push_notifications_enabled: z.boolean().default(true),
    sms_notifications_enabled: z.boolean().default(false),
});

// Complete form schema
export const completeIntakeSchema = basicsSchema
    .merge(familySchema)
    .merge(habitsSchema)
    .merge(lifestyleSchema)
    .merge(deepDiveSchema)
    .merge(dealbreakersSchema)
    .merge(notificationsSchema)
    .extend({
        core_values: z.string().optional(), // Legacy field
    });

// Type exports
export type BasicsFormData = z.infer<typeof basicsSchema>;
export type FamilyFormData = z.infer<typeof familySchema>;
export type HabitsFormData = z.infer<typeof habitsSchema>;
export type LifestyleFormData = z.infer<typeof lifestyleSchema>;
export type DeepDiveFormData = z.infer<typeof deepDiveSchema>;
export type DealbreakersFormData = z.infer<typeof dealbreakersSchema>;
export type NotificationsFormData = z.infer<typeof notificationsSchema>;
export type CompleteIntakeData = z.infer<typeof completeIntakeSchema>;

// Step definitions for progress tracking
export const INTAKE_STEPS = [
    { number: 1, title: 'The Basics', schema: basicsSchema, description: 'Please provide as much detail as possible — the more we know about you, the better we can match you with someone truly compatible.' },
    { number: 2, title: 'Life & Family', schema: familySchema, description: 'Help us understand your family values and what you envision for your future together.' },
    { number: 3, title: 'Lifestyle', schema: habitsSchema, description: 'Your daily habits say a lot about compatibility — share yours honestly.' },
    { number: 4, title: 'Daily Life', schema: lifestyleSchema, description: 'What does your everyday life look like? This helps us find someone who fits naturally into it.' },
    { number: 5, title: 'Deep Dive', schema: deepDiveSchema, description: 'These deeper questions help us understand how you connect, communicate, and love.' },
    { number: 6, title: 'Dealbreakers', schema: dealbreakersSchema, description: 'Be honest about what matters most — it helps us respect your boundaries.' },
    { number: 7, title: 'Notifications', schema: notificationsSchema, description: 'Choose how you\'d like to hear from us about your matches and updates.' },
    { number: 8, title: 'Review', schema: z.object({}), description: 'Review your answers before submitting. You can go back to edit any section.' },
] as const;

// Validation helper
export const validateStep = (stepNumber: number, data: Partial<CompleteIntakeData>): { success: boolean; errors: string[]; fieldErrors: Record<string, string> } => {
    const stepConfig = INTAKE_STEPS.find(s => s.number === stepNumber);
    if (!stepConfig) return { success: true, errors: [], fieldErrors: {} };

    const result = stepConfig.schema.safeParse(data);
    if (result.success) {
        return { success: true, errors: [], fieldErrors: {} };
    }

    const fieldErrors: Record<string, string> = {};
    for (const err of result.error.errors) {
        const field = err.path[0]?.toString();
        if (field && !fieldErrors[field]) {
            fieldErrors[field] = err.message;
        }
    }

    return {
        success: false,
        errors: result.error.errors.map(e => e.message),
        fieldErrors,
    };
};
