
import React from 'react';
import * as Sentry from '@sentry/react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}

class WidgetErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Report to Sentry but don't show dialog
        Sentry.withScope((scope) => {
            scope.setExtras({ componentStack: errorInfo.componentStack });
            Sentry.captureException(error);
        });
        console.error('WidgetErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Card className={`border-destructive/20 bg-destructive/5 ${this.props.className}`}>
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[200px]">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>

                        <h3 className="font-semibold text-foreground mb-1">
                            {this.props.title || 'Content Unavailable'}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-4 max-w-[250px]">
                            We couldn't load this section.
                        </p>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={this.handleRetry}
                            className="gap-2 bg-background"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

export const WidgetErrorBoundary = Sentry.withErrorBoundary(WidgetErrorBoundaryClass, {
    showDialog: false,
});
