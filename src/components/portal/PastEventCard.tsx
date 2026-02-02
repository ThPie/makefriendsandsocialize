import { Card, CardContent } from '@/components/ui/card';
import { EventPhotoGallery } from './EventPhotoGallery';
import { parseLocalDate } from '@/lib/date-utils';

interface Event {
    id: string;
    title: string;
    date: string;
    image_url: string | null;
}

interface PastEventCardProps {
    event: Event;
}

export const PastEventCard = ({ event }: PastEventCardProps) => {
    const formatDate = (dateStr: string) => {
        return parseLocalDate(dateStr).toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    };

    return (
        <Card className="overflow-hidden">
            <div className="aspect-[16/9] relative overflow-hidden">
                <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-display text-lg text-white mb-1">{event.title}</h3>
                    <p className="text-white/80 text-sm">{formatDate(event.date)}</p>
                </div>
            </div>
            <CardContent className="p-4">
                <EventPhotoGallery eventId={event.id} eventTitle={event.title} isPastEvent={true} />
            </CardContent>
        </Card>
    );
};
