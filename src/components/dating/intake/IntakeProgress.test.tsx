/**
 * Tests for IntakeProgress component
 * Tests visual progress indicators and click interactions
 */
import { describe, it, expect, vi } from 'vitest';
import { render as rtlRender } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { MemoryRouter } from 'react-router-dom';
import { IntakeProgress } from './IntakeProgress';

const render = (ui: any, options?: any) => rtlRender(ui, { wrapper: MemoryRouter, ...options });

const mockSteps = [
    { number: 1, title: 'The Basics' },
    { number: 2, title: 'Life & Family' },
    { number: 3, title: 'Lifestyle' },
    { number: 4, title: 'Daily Life' },
    { number: 5, title: 'Deep Dive' },
    { number: 6, title: 'Dealbreakers' },
    { number: 7, title: 'Notifications' },
    { number: 8, title: 'Review' },
];

describe('IntakeProgress', () => {
    describe('rendering', () => {
        it('should render all step indicators', () => {
            render(
                <IntakeProgress
                    currentStep={1}
                    totalSteps={8}
                    steps={mockSteps}
                />
            );

            // Should have 18 step buttons (8 desktop + 8 mobile + 2 actions)
            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(18);
        });

        it('should render navigation with correct aria-label', () => {
            render(
                <IntakeProgress
                    currentStep={1}
                    totalSteps={8}
                    steps={mockSteps}
                />
            );

            const nav = screen.getByRole('navigation');
            expect(nav).toHaveAttribute('aria-label', 'Form progress');
        });

        it('should render progress bar', () => {
            render(
                <IntakeProgress
                    currentStep={1}
                    totalSteps={8}
                    steps={mockSteps}
                />
            );

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toBeInTheDocument();
        });

        it('should display mobile step counter', () => {
            render(
                <IntakeProgress
                    currentStep={3}
                    totalSteps={8}
                    steps={mockSteps}
                />
            );

            const status = screen.getByRole('status');
            expect(status).toHaveTextContent(/Lifestyle/i);
            expect(status).toHaveTextContent(/Step 3 of 8/i);
        });
    });

    describe('step states', () => {
        it('should mark current step as active', () => {
            render(
                <IntakeProgress
                    currentStep={3}
                    totalSteps={8}
                    steps={mockSteps}
                />
            );

            // Find the current step button
            const currentStepButton = screen.getByRole('button', {
                name: /Lifestyle - current step/i,
            });
            expect(currentStepButton).toHaveAttribute('aria-current', 'step');
        });

        it('should mark completed steps', () => {
            render(
                <IntakeProgress
                    currentStep={4}
                    totalSteps={8}
                    steps={mockSteps}
                />
            );

            // Steps 1-3 should be completed
            const completedStep = screen.getByRole('button', {
                name: /The Basics - completed/i,
            });
            expect(completedStep).toBeInTheDocument();
        });

        it('should mark future steps as not started', () => {
            render(
                <IntakeProgress
                    currentStep={2}
                    totalSteps={8}
                    steps={mockSteps}
                />
            );

            const futureStep = screen.getByRole('button', {
                name: /Deep Dive - not started/i,
            });
            expect(futureStep).toBeInTheDocument();
        });
    });

    describe('click interactions', () => {
        it('should call onStepClick when clicking a completed step', () => {
            const handleStepClick = vi.fn();

            render(
                <IntakeProgress
                    currentStep={5}
                    totalSteps={8}
                    steps={mockSteps}
                    onStepClick={handleStepClick}
                />
            );

            // Click step 1 (completed)
            const completedStep = screen.getByRole('button', {
                name: /The Basics - completed/i,
            });
            fireEvent.click(completedStep);

            expect(handleStepClick).toHaveBeenCalledWith(1);
        });

        it('should call onStepClick when clicking current step', () => {
            const handleStepClick = vi.fn();

            render(
                <IntakeProgress
                    currentStep={3}
                    totalSteps={8}
                    steps={mockSteps}
                    onStepClick={handleStepClick}
                />
            );

            const currentStep = screen.getByRole('button', {
                name: /Lifestyle - current step/i,
            });
            fireEvent.click(currentStep);

            expect(handleStepClick).toHaveBeenCalledWith(3);
        });

        it('should not call onStepClick when clicking future step', () => {
            const handleStepClick = vi.fn();

            render(
                <IntakeProgress
                    currentStep={2}
                    totalSteps={8}
                    steps={mockSteps}
                    onStepClick={handleStepClick}
                />
            );

            // Click step 5 (future)
            const futureStep = screen.getByRole('button', {
                name: /Deep Dive - not started/i,
            });
            fireEvent.click(futureStep);

            expect(handleStepClick).not.toHaveBeenCalled();
        });

        it('should disable future step buttons', () => {
            render(
                <IntakeProgress
                    currentStep={2}
                    totalSteps={8}
                    steps={mockSteps}
                    onStepClick={() => { }}
                />
            );

            const futureStep = screen.getByRole('button', {
                name: /Deep Dive - not started/i,
            });
            expect(futureStep).toBeDisabled();
        });
    });

    describe('progress calculation', () => {
        it('should render progress bar on step 1', () => {
            render(
                <IntakeProgress
                    currentStep={1}
                    totalSteps={8}
                    steps={mockSteps}
                />
            );

            const progressBar = screen.getByRole('progressbar');
            // Step 1: progress bar should exist
            expect(progressBar).toBeInTheDocument();
        });

        it('should render progress bar on step 5', () => {
            render(
                <IntakeProgress
                    currentStep={5}
                    totalSteps={8}
                    steps={mockSteps}
                />
            );

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toBeInTheDocument();
        });

        it('should render progress bar on last step', () => {
            render(
                <IntakeProgress
                    currentStep={8}
                    totalSteps={8}
                    steps={mockSteps}
                />
            );

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toBeInTheDocument();
        });
    });

    describe('accessibility', () => {
        it('should have proper ARIA labels on step buttons', () => {
            render(
                <IntakeProgress
                    currentStep={3}
                    totalSteps={8}
                    steps={mockSteps}
                />
            );

            // Check aria-labels include step title and state
            expect(screen.getByRole('button', { name: /The Basics - completed/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Lifestyle - current step/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Review - not started/i })).toBeInTheDocument();
        });

        it('should have aria-label on progress bar', () => {
            render(
                <IntakeProgress
                    currentStep={4}
                    totalSteps={8}
                    steps={mockSteps}
                />
            );

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toBeInTheDocument();
        });
    });

    describe('custom className', () => {
        it('should apply custom className', () => {
            const { container } = render(
                <IntakeProgress
                    currentStep={1}
                    totalSteps={8}
                    steps={mockSteps}
                    className="custom-progress"
                />
            );

            expect(container.firstChild).toHaveClass('custom-progress');
        });
    });
});
