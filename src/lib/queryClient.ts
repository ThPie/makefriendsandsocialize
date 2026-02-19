import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const handleError = (error: Error) => {
    // Cast to any to access potential Supabase/Postgrest error properties
    const err = error as any;

    // RLS Policy Violation (Postgres code 42501) or HTTP 403
    if (err.code === '42501' || err.status === 403 || err.statusCode === 403) {
        toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You do not have permission to perform this action.",
        });
    }
};

export const appQueryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: handleError,
    }),
    mutationCache: new MutationCache({
        onError: handleError,
    }),
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});
