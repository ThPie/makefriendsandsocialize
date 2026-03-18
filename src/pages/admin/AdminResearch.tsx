import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Search,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  Archive,
  RefreshCw,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

type ResearchItem = {
  id: string;
  topic: string;
  circle: string | null;
  source_platform: string;
  trend_summary: string;
  key_insights: string[] | null;
  suggested_title: string | null;
  suggested_angle: string | null;
  relevance_score: number | null;
  status: string;
  used_in_post_id: string | null;
  created_at: string;
};

const AdminResearch = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("new");
  const [isResearching, setIsResearching] = useState(false);

  const { data: research, isLoading } = useQuery({
    queryKey: ["content-research", activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_research")
        .select("*")
        .eq("status", activeTab)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ResearchItem[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("content_research")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-research"] });
      toast.success("Status updated");
    },
  });

  const triggerResearch = async () => {
    setIsResearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("trend-researcher");
      if (error) throw error;
      toast.success(`Research complete: ${data.findings_count} new findings`);
      queryClient.invalidateQueries({ queryKey: ["content-research"] });
    } catch (err) {
      toast.error("Failed to run research");
      console.error(err);
    } finally {
      setIsResearching(false);
    }
  };

  const generatePost = async (item: ResearchItem) => {
    try {
      toast.info("Generating blog post from research...");
      const { data, error } = await supabase.functions.invoke("content-agent", {
        body: { researchId: item.id, topic: item.suggested_title, angle: item.suggested_angle },
      });
      if (error) throw error;
      
      // Mark research as used
      await supabase
        .from("content_research")
        .update({ status: "used", used_in_post_id: data.post?.id })
        .eq("id", item.id);

      queryClient.invalidateQueries({ queryKey: ["content-research"] });
      toast.success(`Blog post created: "${data.post?.title}"`);
    } catch (err) {
      toast.error("Failed to generate post");
      console.error(err);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-muted text-muted-foreground";
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Research</h1>
          <p className="text-muted-foreground">
            AI-powered trend research from Reddit, LinkedIn, Google & more
          </p>
        </div>
        <Button onClick={triggerResearch} disabled={isResearching}>
          {isResearching ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Run Research Now
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new" className="gap-2">
            <Lightbulb className="h-4 w-4" /> New
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="h-4 w-4" /> Approved
          </TabsTrigger>
          <TabsTrigger value="used" className="gap-2">
            <Sparkles className="h-4 w-4" /> Used
          </TabsTrigger>
          <TabsTrigger value="archived" className="gap-2">
            <Archive className="h-4 w-4" /> Archived
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !research?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {activeTab === "new"
                    ? "No new research yet. Click 'Run Research Now' to start."
                    : `No ${activeTab} research items.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {research.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                          {item.topic}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {item.circle && (
                            <Badge variant="outline">{item.circle}</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {item.source_platform}
                          </Badge>
                          <Badge className={getScoreColor(item.relevance_score)}>
                            Score: {item.relevance_score}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.trend_summary}
                    </p>

                    {item.key_insights && item.key_insights.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Key Insights</h4>
                        <ul className="space-y-1">
                          {item.key_insights.slice(0, 5).map((insight, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary">•</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {item.suggested_title && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <h4 className="text-sm font-semibold mb-1">Suggested Post</h4>
                        <p className="text-sm font-medium">{item.suggested_title}</p>
                        {item.suggested_angle && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Angle: {item.suggested_angle}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {activeTab === "new" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus.mutate({ id: item.id, status: "approved" })}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => generatePost(item)}
                          >
                            <Sparkles className="h-3 w-3 mr-1" /> Generate Post
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus.mutate({ id: item.id, status: "archived" })}
                          >
                            <Archive className="h-3 w-3 mr-1" /> Archive
                          </Button>
                        </>
                      )}
                      {activeTab === "approved" && (
                        <Button
                          size="sm"
                          onClick={() => generatePost(item)}
                        >
                          <Sparkles className="h-3 w-3 mr-1" /> Generate Post
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminResearch;
