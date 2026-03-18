/**
 * Intake Form Custom Hook
 * Manages form state, validation, draft persistence, and submission.
 * Auto-saves to the database (dating_intake_drafts) on step change and field edits,
 * with debouncing to avoid excessive writes. Falls back to localStorage.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
    CompleteIntakeData,
    validateStep,
    INTAKE_STEPS
} from './intakeSchemas';

const DRAFT_STORAGE_KEY = 'dating_application_draft';
const DB_SAVE_DEBOUNCE_MS = 1500; // debounce DB writes by 1.5 s

const initialFormData: CompleteIntakeData = {
    display_name: '',
    age: 28,
    gender: '',
    target_gender: '',
    age_range_min: 25,
    age_range_max: 40,
    location: '',
    occupation: '',
    bio: '',
    photo_url: '',
    linkedin_url: '',
    instagram_url: '',
    facebook_url: '',
    twitter_url: '',
    relationship_type: '',
    marriage_timeline: '',
    has_children: null as boolean | null,
    children_details: '',
    wants_children: '',
    been_married: null as boolean | null,
    marriage_history: '',
    family_relationship: '',
    family_involvement_expectation: '',
    open_to_partner_children: '',
    smoking_status: '',
    drinking_status: '',
    drug_use: '',
    exercise_frequency: '',
    diet_preference: '',
    screen_time_habits: '',
    tuesday_night_test: '',
    financial_philosophy: '',
    current_curiosity: '',
    debt_status: '',
    career_ambition: '',
    conflict_resolution: '',
    emotional_connection: '',
    support_style: '',
    vulnerability_check: '',
    core_values: '',
    core_values_ranked: [],
    love_language: '',
    attachment_style: '',
    introvert_extrovert: '',
    morning_night_person: '',
    communication_style: '',
    repair_attempt_response: '',
    stress_response: '',
    past_relationship_learning: '',
    dealbreakers: '',
    politics_stance: '',
    religion_stance: '',
    future_goals: '',
    trust_fidelity_views: '',
    political_issues: [],
    religious_practice: '',
    raise_children_faith: '',
    geographic_flexibility: '',
    ten_year_vision: '',
    accountability_reflection: '',
    ex_admiration: '',
    growth_work: '',
    search_radius: 25,
    phone_number: '',
    email_notifications_enabled: true,
    push_notifications_enabled: true,
    sms_notifications_enabled: false,
    intimacy_expectations: '',
    finding_love_fear: '',
};

interface UseIntakeFormOptions {
    onSuccess?: () => void;
}

export const useIntakeForm = (options?: UseIntakeFormOptions) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<CompleteIntakeData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasDraft, setHasDraft] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const dbSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Track whether the initial DB draft has been loaded to avoid overwriting it
    const dbDraftLoaded = useRef(false);

    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const totalSteps = INTAKE_STEPS.length;
    const progress = (step / totalSteps) * 100;

    // ── Draft loading: DB first, fall back to localStorage ──────────────────
    useEffect(() => {
        if (!user) {
            // Not authenticated yet — try localStorage fallback
            const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (savedDraft) {
                try {
                    const { step: savedStep, formData: savedFormData } = JSON.parse(savedDraft);
                    setStep(savedStep || 1);
                    setFormData(prev => ({ ...prev, ...savedFormData }));
                    setHasDraft(true);
                } catch (e) {
                    console.error('Failed to parse local draft:', e);
                    localStorage.removeItem(DRAFT_STORAGE_KEY);
                }
            }
            return;
        }

        // Authenticated: load from DB
        const loadDbDraft = async () => {
            const { data, error } = await supabase
                .from('dating_intake_drafts' as any)
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Failed to load DB draft:', error);
                return;
            }

            if (data) {
                const draft = (data as unknown) as { current_step: number; completed_steps: number[]; form_data: Record<string, unknown> };
                setStep(draft.current_step || 1);
                setFormData(prev => ({ ...prev, ...(draft.form_data || {}) }));
                setCompletedSteps(new Set(draft.completed_steps || []));
                setHasDraft(true);
                dbDraftLoaded.current = true;
                // Mirror to localStorage for offline fallback
                localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
                    step: draft.current_step,
                    formData: draft.form_data,
                }));
            } else {
                // No DB draft — try localStorage (e.g. filled before login)
                const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
                if (savedDraft) {
                    try {
                        const { step: savedStep, formData: savedFormData } = JSON.parse(savedDraft);
                        setStep(savedStep || 1);
                        setFormData(prev => ({ ...prev, ...savedFormData }));
                        setHasDraft(true);
                    } catch (e) {
                        console.error('Failed to parse local draft:', e);
                        localStorage.removeItem(DRAFT_STORAGE_KEY);
                    }
                }
                dbDraftLoaded.current = true;
            }
        };

        loadDbDraft();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // Pre-fill data from profile
    useEffect(() => {
        if (!profile) return;

        setFormData(prev => {
            const updates: Partial<CompleteIntakeData> = {};
            let hasUpdates = false;

            // Helper to only update if field is empty/default
            const shouldUpdate = (key: keyof CompleteIntakeData, value: any) => {
                const currentValue = prev[key];
                // Check if current value is empty string, default number, or null/undefined
                const isEmpty = currentValue === '' || currentValue === null || currentValue === undefined ||
                    (typeof currentValue === 'number' && currentValue === initialFormData[key] && key !== 'age'); // Don't overwrite modified age unless it's default

                return isEmpty && value;
            };

            // 1. Basic Info
            const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
            if (shouldUpdate('display_name', fullName)) {
                updates.display_name = fullName;
                hasUpdates = true;
            }

            if (profile.date_of_birth && prev.age === initialFormData.age) {
                const birthDate = new Date(profile.date_of_birth);
                const age = new Date().getFullYear() - birthDate.getFullYear();
                // Adjust if birthday hasn't occurred this year yet
                const m = new Date().getMonth() - birthDate.getMonth();
                const actualAge = (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) ? age - 1 : age;

                if (actualAge >= 18) {
                    updates.age = actualAge;
                    hasUpdates = true;
                }
            }

            if (shouldUpdate('occupation', profile.job_title)) {
                updates.occupation = profile.job_title;
                hasUpdates = true;
            }

            if (shouldUpdate('bio', profile.bio)) {
                updates.bio = profile.bio;
                hasUpdates = true;
            }

            // 2. Photo
            // Profile interface uses avatar_urls (array), form uses photo_url (string)
            const profilePhoto = profile.avatar_urls && profile.avatar_urls.length > 0 ? profile.avatar_urls[0] : null;
            if (shouldUpdate('photo_url', profilePhoto)) {
                updates.photo_url = profilePhoto!;
                hasUpdates = true;
            }

            // 3. Location
            if (!prev.location) {
                const locationParts = [profile.city, profile.state, profile.country].filter(Boolean);
                if (locationParts.length > 0) {
                    updates.location = locationParts.join(', ');
                    hasUpdates = true;
                }
            }

            // 4. Socials
            // Only linkedin_url is present in the Profile interface currently
            if (shouldUpdate('linkedin_url', profile.linkedin_url)) {
                updates.linkedin_url = profile.linkedin_url!;
                hasUpdates = true;
            }

            return hasUpdates ? { ...prev, ...updates } : prev;
        });
    }, [profile]);

    // ── Save draft to localStorage (always) + DB (debounced) ───────────────
    const saveDraftToDb = useCallback(async (
        currentStep: number,
        data: CompleteIntakeData,
        doneSteps: Set<number>,
    ) => {
        if (!user) return;
        setIsSaving(true);
        try {
            await (supabase.from('dating_intake_drafts' as any) as any).upsert(
                {
                    user_id: user.id,
                    current_step: currentStep,
                    completed_steps: Array.from(doneSteps),
                    form_data: data as unknown as Record<string, unknown>,
                    last_saved_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' }
            );
        } catch (err) {
            console.error('DB draft save failed:', err);
        } finally {
            setIsSaving(false);
        }
    }, [user]);

    const saveDraft = useCallback((
        currentStep: number,
        data: CompleteIntakeData,
        doneSteps: Set<number>,
    ) => {
        // Always persist to localStorage immediately
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ step: currentStep, formData: data }));

        // Debounce DB writes
        if (dbSaveTimer.current) clearTimeout(dbSaveTimer.current);
        dbSaveTimer.current = setTimeout(() => {
            saveDraftToDb(currentStep, data, doneSteps);
        }, DB_SAVE_DEBOUNCE_MS);
    }, [saveDraftToDb]);

    useEffect(() => {
        // Skip until the initial DB/localStorage load is done to avoid overwriting it
        if (!dbDraftLoaded.current && user) return;
        if (formData.display_name || step > 1) {
            saveDraft(step, formData, completedSteps);
        }
    }, [formData, step, completedSteps, saveDraft, user]);

    // Update a single field
    const updateField = useCallback(<K extends keyof CompleteIntakeData>(
        field: K,
        value: CompleteIntakeData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setValidationErrors([]);
        setFieldErrors(prev => {
            if (prev[field as string]) {
                const next = { ...prev };
                delete next[field as string];
                return next;
            }
            return prev;
        });
    }, []);

    // Update multiple fields at once
    const updateFields = useCallback((updates: Partial<CompleteIntakeData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        setValidationErrors([]);
        setFieldErrors({});
    }, []);

    // Toggle an item in an array field
    const toggleArrayItem = useCallback(<K extends keyof CompleteIntakeData>(
        field: K,
        item: string
    ) => {
        setFormData(prev => {
            const currentArray = (prev[field] as string[]) || [];
            return {
                ...prev,
                [field]: currentArray.includes(item)
                    ? currentArray.filter(i => i !== item)
                    : [...currentArray, item]
            };
        });
    }, []);

    // Clear draft and reset form (both localStorage and DB)
    const clearDraft = useCallback(async () => {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        if (user) {
            await (supabase.from('dating_intake_drafts' as any) as any)
                .delete()
                .eq('user_id', user.id);
        }
        setFormData(initialFormData);
        setStep(1);
        setCompletedSteps(new Set());
        setHasDraft(false);
        toast({ title: 'Draft cleared', description: 'Your application draft has been deleted.' });
    }, [toast, user]);

    // Validate current step and navigate
    const goToStep = useCallback((targetStep: number) => {
        if (targetStep < 1 || targetStep > totalSteps) return;

        // Only validate when going forward
        if (targetStep > step) {
            const validation = validateStep(step, formData);
            if (!validation.success) {
                setValidationErrors(validation.errors);
                setFieldErrors(validation.fieldErrors);
                toast({
                    title: 'Missing Information',
                    description: validation.errors[0],
                    variant: 'destructive'
                });
                return;
            }
            // Mark current step as completed when moving forward
            setCompletedSteps(prev => new Set([...prev, step]));
        }

        // Only clear errors when moving forward to a fresh step
        // (not when going backward to a previously completed step)
        if (targetStep > step || !completedSteps.has(targetStep)) {
            setValidationErrors([]);
            setFieldErrors({});
        } else {
            // Going backward to completed step — just clear top-level errors
            setValidationErrors([]);
        }
        setStep(targetStep);
    }, [step, formData, totalSteps, toast, completedSteps]);

    const nextStep = useCallback(() => goToStep(step + 1), [step, goToStep]);
    const prevStep = useCallback(() => goToStep(step - 1), [step, goToStep]);

    // Handle photo upload with AI validation
    const uploadPhoto = useCallback(async (file: File): Promise<string | null> => {
        if (!file.type.startsWith('image/')) {
            toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' });
            return null;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({ title: 'File too large', description: 'Please upload an image under 5MB.', variant: 'destructive' });
            return null;
        }

        setIsUploading(true);
        try {
            // Step 1: AI validation — reject AI-generated or non-human photos before upload
            const validationForm = new FormData();
            validationForm.append('photo', file);

            const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
            const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

            const validationRes = await fetch(
                `${SUPABASE_URL}/functions/v1/validate-dating-photo`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${SUPABASE_KEY}` },
                    body: validationForm,
                }
            );

            if (validationRes.ok) {
                const { valid, reason } = await validationRes.json() as { valid: boolean; reason: string };
                if (!valid) {
                    toast({
                        title: 'Photo not accepted',
                        description: reason || 'Please upload a real photo of yourself.',
                        variant: 'destructive',
                    });
                    return null;
                }
            }
            // If validation call itself fails, we fail open and continue to upload

            // Step 2: Upload to storage
            const fileExt = file.name.split('.').pop();
            const fileName = `dating-${Date.now()}.${fileExt}`;
            const filePath = `${user?.id || 'temp'}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(filePath);

            updateField('photo_url', publicUrl);
            toast({ title: 'Photo uploaded', description: 'Your photo has been uploaded successfully.' });
            return publicUrl;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            console.error('Upload error:', error);
            toast({ title: 'Upload failed', description: errorMessage, variant: 'destructive' });
            return null;
        } finally {
            setIsUploading(false);
        }
    }, [user?.id, toast, updateField]);

    // Submit the form
    const submit = useCallback(async () => {
        if (!user) {
            toast({ title: 'Authentication Required', description: 'Please sign in to submit your profile.', variant: 'destructive' });
            navigate('/auth');
            return;
        }

        setIsSubmitting(true);

        try {
            const { data: insertedProfile, error } = await supabase.from('dating_profiles').insert({
                user_id: user.id,
                display_name: formData.display_name,
                age: formData.age,
                gender: formData.gender,
                target_gender: formData.target_gender,
                age_range_min: formData.age_range_min,
                age_range_max: formData.age_range_max,
                location: formData.location || null,
                occupation: formData.occupation || null,
                photo_url: formData.photo_url || null,
                bio: formData.bio || null,
                linkedin_url: formData.linkedin_url || null,
                instagram_url: formData.instagram_url || null,
                facebook_url: formData.facebook_url || null,
                twitter_url: formData.twitter_url || null,
                social_verification_status: 'pending',
                relationship_type: formData.relationship_type || null,
                marriage_timeline: formData.marriage_timeline || null,
                has_children: formData.has_children,
                children_details: formData.children_details || null,
                wants_children: formData.wants_children || null,
                been_married: formData.been_married,
                marriage_history: formData.marriage_history || null,
                family_relationship: formData.family_relationship || null,
                family_involvement_expectation: formData.family_involvement_expectation || null,
                smoking_status: formData.smoking_status || null,
                drinking_status: formData.drinking_status || null,
                drug_use: formData.drug_use || null,
                exercise_frequency: formData.exercise_frequency || null,
                diet_preference: formData.diet_preference || null,
                screen_time_habits: formData.screen_time_habits || null,
                tuesday_night_test: formData.tuesday_night_test,
                financial_philosophy: formData.financial_philosophy || null,
                current_curiosity: formData.current_curiosity || null,
                debt_status: formData.debt_status || null,
                career_ambition: formData.career_ambition || null,
                conflict_resolution: formData.conflict_resolution,
                emotional_connection: formData.emotional_connection,
                support_style: formData.support_style || null,
                vulnerability_check: formData.vulnerability_check || null,
                core_values: formData.core_values_ranked.length > 0 ? formData.core_values_ranked.join(', ') : formData.core_values,
                core_values_ranked: formData.core_values_ranked.length > 0 ? formData.core_values_ranked : null,
                love_language: formData.love_language || null,
                attachment_style: formData.attachment_style || null,
                introvert_extrovert: formData.introvert_extrovert || null,
                morning_night_person: formData.morning_night_person || null,
                communication_style: formData.communication_style || null,
                repair_attempt_response: formData.repair_attempt_response || null,
                stress_response: formData.stress_response || null,
                past_relationship_learning: formData.past_relationship_learning || null,
                dealbreakers: formData.dealbreakers,
                politics_stance: formData.politics_stance || null,
                religion_stance: formData.religion_stance || null,
                future_goals: formData.future_goals || null,
                trust_fidelity_views: formData.trust_fidelity_views || null,
                political_issues: formData.political_issues && formData.political_issues.length > 0 ? formData.political_issues : null,
                religious_practice: formData.religious_practice || null,
                raise_children_faith: formData.raise_children_faith || null,
                geographic_flexibility: formData.geographic_flexibility || null,
                ten_year_vision: formData.ten_year_vision || null,
                accountability_reflection: formData.accountability_reflection || null,
                ex_admiration: formData.ex_admiration || null,
                growth_work: formData.growth_work || null,
                intimacy_expectations: formData.intimacy_expectations || null,
                finding_love_fear: formData.finding_love_fear || null,
                search_radius: formData.search_radius,
                phone_number: formData.phone_number || null,
                email_notifications_enabled: formData.email_notifications_enabled,
                push_notifications_enabled: formData.push_notifications_enabled,
                sms_notifications_enabled: formData.sms_notifications_enabled,
                status: 'active',
            }).select().single();

            if (error) throw error;

            // Clear the draft after successful submission (both localStorage and DB)
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            if (user) {
                await (supabase.from('dating_intake_drafts' as any) as any)
                    .delete()
                    .eq('user_id', user.id);
            }

            // Trigger background processes
            if (insertedProfile) {
                // Social verification
                if (formData.linkedin_url || formData.instagram_url || formData.facebook_url || formData.twitter_url) {
                    supabase.functions.invoke('verify-social-profiles', {
                        body: { profileId: insertedProfile.id }
                    }).catch(err => console.error('Social verification error:', err));
                }

                // Profile preprocessing for AI matching
                supabase.functions.invoke('preprocess-dating-profile', {
                    body: { profileId: insertedProfile.id }
                }).catch(err => console.error('Profile preprocessing error:', err));
            }

            // Fire-and-forget confirmation email with AI dating coach message
            supabase.functions.invoke('send-dating-application-email', {
                body: { userId: user.id, displayName: formData.display_name }
            }).catch(err => console.error('Confirmation email error:', err));

            options?.onSuccess?.();
            setIsSubmitted(true);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'There was an error submitting your profile.';
            console.error('Error submitting dating profile:', error);
            toast({
                title: 'Submission Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [user, formData, navigate, toast, options]);

    // Adaptive helpers based on form state
    const isSeekingSerious = formData.relationship_type && ['serious', 'marriage', 'open'].includes(formData.relationship_type);
    const isCasualOnly = formData.relationship_type === 'casual';

    return {
        // State
        step,
        formData,
        isSubmitting,
        isSubmitted,
        isUploading,
        isSaving,
        hasDraft,
        validationErrors,
        fieldErrors,
        completedSteps,
        progress,
        totalSteps,

        // Actions
        updateField,
        updateFields,
        toggleArrayItem,
        nextStep,
        prevStep,
        goToStep,
        clearDraft,
        uploadPhoto,
        submit,

        // Derived state
        isSeekingSerious,
        isCasualOnly,
        currentStepConfig: INTAKE_STEPS.find(s => s.number === step),
    };
};

export type IntakeFormContext = ReturnType<typeof useIntakeForm>;
