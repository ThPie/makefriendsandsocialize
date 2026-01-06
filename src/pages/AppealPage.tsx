import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Send, Shield, Users, Calendar, Heart, Upload, CheckCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const appealSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  appealType: z.enum(["membership", "suspension", "match", "event"], {
    required_error: "Please select an appeal type",
  }),
  referenceId: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  description: z.string().min(50, "Please provide at least 50 characters explaining your appeal").max(2000),
  supportingInfo: z.string().max(1000).optional(),
});

type AppealFormData = z.infer<typeof appealSchema>;

const appealTypes = [
  {
    value: "membership",
    label: "Membership Application",
    description: "Appeal a rejected membership application",
    icon: Users,
  },
  {
    value: "suspension",
    label: "Account Suspension",
    description: "Appeal an account suspension or restriction",
    icon: Shield,
  },
  {
    value: "match",
    label: "Match Decision",
    description: "Appeal a Slow Dating match outcome",
    icon: Heart,
  },
  {
    value: "event",
    label: "Event Access",
    description: "Appeal denied access to an event",
    icon: Calendar,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const AppealPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppealFormData>({
    resolver: zodResolver(appealSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  const selectedAppealType = watch("appealType");

  const onSubmit = async (data: AppealFormData) => {
    setIsSubmitting(true);
    
    try {
      // Insert appeal into notification_queue for admin review
      const { error } = await supabase.from("notification_queue").insert({
        user_id: user?.id || "00000000-0000-0000-0000-000000000000",
        notification_type: "appeal_submission",
        payload: {
          full_name: data.fullName,
          email: data.email,
          appeal_type: data.appealType,
          reference_id: data.referenceId,
          subject: data.subject,
          description: data.description,
          supporting_info: data.supportingInfo,
          submitted_at: new Date().toISOString(),
        },
        status: "pending",
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Appeal Submitted",
        description: "We've received your appeal and will review it within 5-7 business days.",
      });
    } catch (error) {
      console.error("Error submitting appeal:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your appeal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <section className="min-h-screen flex items-center justify-center py-20 relative overflow-hidden">
          {/* Floating elements */}
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md mx-auto px-4 relative z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-display font-bold mb-4">Appeal Submitted</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for submitting your appeal. Our team will review your case and respond within 5-7 business days. You'll receive an email confirmation shortly.
            </p>
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Submit Another Appeal
            </Button>
          </motion.div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        
        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FileText className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Submit an <span className="text-gradient">Appeal</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We believe in fair processes. If you feel a decision was made in error, 
              submit your appeal and our team will review your case carefully.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Appeal Form Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-3xl mx-auto"
          >
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl font-display">Appeal Form</CardTitle>
                <CardDescription>
                  Please provide as much detail as possible to help us review your case.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Appeal Type Selection */}
                  <motion.div variants={itemVariants} className="space-y-4">
                    <Label className="text-base font-medium">What are you appealing?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {appealTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selectedAppealType === type.value;
                        return (
                          <motion.div
                            key={type.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setValue("appealType", type.value as AppealFormData["appealType"])}
                            className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                                <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                              </div>
                              <div>
                                <p className="font-medium">{type.label}</p>
                                <p className="text-sm text-muted-foreground">{type.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    {errors.appealType && (
                      <p className="text-sm text-destructive">{errors.appealType.message}</p>
                    )}
                  </motion.div>

                  {/* Contact Information */}
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="Your full name"
                        {...register("fullName")}
                        className={errors.fullName ? "border-destructive" : ""}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        {...register("email")}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </motion.div>

                  {/* Reference ID */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="referenceId">Reference ID (Optional)</Label>
                    <Input
                      id="referenceId"
                      placeholder="Application ID, Event ID, or Match ID if applicable"
                      {...register("referenceId")}
                    />
                    <p className="text-sm text-muted-foreground">
                      If you have a reference number from a previous communication, please include it.
                    </p>
                  </motion.div>

                  {/* Subject */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief summary of your appeal"
                      {...register("subject")}
                      className={errors.subject ? "border-destructive" : ""}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </motion.div>

                  {/* Description */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="description">Describe Your Appeal</Label>
                    <Textarea
                      id="description"
                      placeholder="Please explain in detail why you believe the decision should be reconsidered. Include any relevant context, dates, and circumstances..."
                      rows={6}
                      {...register("description")}
                      className={errors.description ? "border-destructive" : ""}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </motion.div>

                  {/* Supporting Information */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="supportingInfo">Supporting Information (Optional)</Label>
                    <Textarea
                      id="supportingInfo"
                      placeholder="Any additional information, references, or context that might help us review your appeal..."
                      rows={3}
                      {...register("supportingInfo")}
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants} className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Appeal
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4">
                      By submitting this appeal, you confirm that all information provided is accurate and truthful.
                      Appeals are typically reviewed within 5-7 business days.
                    </p>
                  </motion.div>
                </form>
              </CardContent>
            </Card>

            {/* Process Info */}
            <motion.div
              variants={itemVariants}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  step: "1",
                  title: "Submit",
                  description: "Fill out the form with all relevant details",
                },
                {
                  step: "2",
                  title: "Review",
                  description: "Our team carefully reviews your case",
                },
                {
                  step: "3",
                  title: "Decision",
                  description: "Receive our decision via email within 5-7 days",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">{item.step}</span>
                  </div>
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AppealPage;
