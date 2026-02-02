import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Plus, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ConciergeSlot {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    location_name: string | null;
    location_address: string | null;
    max_slots: number;
    is_active: boolean;
}

export default function ConciergeAvailabilityManager() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [newSlot, setNewSlot] = useState({
        date: "",
        start_time: "",
        end_time: "",
        location_name: "",
        location_address: "",
        max_slots: 1,
    });

    const { data: slots = [], isLoading } = useQuery({
        queryKey: ['concierge-availability-admin'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('concierge_availability')
                .select('*')
                .order('date', { ascending: true })
                .order('start_time', { ascending: true });

            if (error) throw error;
            return data as ConciergeSlot[];
        },
    });

    const addMutation = useMutation({
        mutationFn: async (slot: typeof newSlot) => {
            const { error } = await supabase
                .from('concierge_availability')
                .insert([slot]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['concierge-availability-admin'] });
            toast.success("Availability slot added");
            setIsAdding(false);
            setNewSlot({
                date: "",
                start_time: "",
                end_time: "",
                location_name: "",
                location_address: "",
                max_slots: 1,
            });
        },
        onError: (error) => {
            toast.error("Failed to add slot");
            console.error(error);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('concierge_availability')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['concierge-availability-admin'] });
            toast.success("Slot deleted");
        },
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
            const { error } = await supabase
                .from('concierge_availability')
                .update({ is_active })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['concierge-availability-admin'] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSlot.date || !newSlot.start_time || !newSlot.end_time) {
            toast.error("Please fill in all required fields");
            return;
        }
        addMutation.mutate(newSlot);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl text-foreground">Concierge Availability</h1>
                    <p className="text-muted-foreground text-sm">Manage the days and times available for member meetings.</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "ghost" : "default"}>
                    {isAdding ? "Cancel" : <><Plus className="h-4 w-4 mr-2" /> Add Slot</>}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg">Add New Availability Slot</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={newSlot.date}
                                    onChange={(e) => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">Start Time *</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={newSlot.start_time}
                                        onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_time">End Time *</Label>
                                    <Input
                                        id="end_time"
                                        type="time"
                                        value={newSlot.end_time}
                                        onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location_name">Location Name</Label>
                                <Input
                                    id="location_name"
                                    value={newSlot.location_name}
                                    onChange={(e) => setNewSlot(prev => ({ ...prev, location_name: e.target.value }))}
                                    placeholder="e.g., The Grand Hotel Lounge"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location_address">Location Address</Label>
                                <Input
                                    id="location_address"
                                    value={newSlot.location_address}
                                    onChange={(e) => setNewSlot(prev => ({ ...prev, location_address: e.target.value }))}
                                    placeholder="e.g., 123 Luxury Ave"
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                                <Button type="submit" disabled={addMutation.isPending}>
                                    {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Save Availability Slot
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : slots.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed border-border/50">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">No availability slots defined yet.</p>
                    </div>
                ) : (
                    slots.map((slot) => (
                        <Card key={slot.id} className={slot.is_active ? "" : "opacity-60 grayscale"}>
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-foreground">
                                                {format(new Date(slot.date + 'T00:00:00'), 'EEEE, MMMM do, yyyy')}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {slot.start_time} - {slot.end_time}
                                                </span>
                                                {slot.location_name && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {slot.location_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleMutation.mutate({ id: slot.id, is_active: !slot.is_active })}
                                            className={slot.is_active ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-muted-foreground"}
                                        >
                                            {slot.is_active ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                            {slot.is_active ? "Active" : "Disabled"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                            onClick={() => {
                                                if (confirm("Are you sure you want to delete this slot? Existing bookings will be disconnected.")) {
                                                    deleteMutation.mutate(slot.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
