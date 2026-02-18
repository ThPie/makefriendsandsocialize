import { Link } from 'react-router-dom';
import { Utensils, Ticket, Calendar, Headphones } from 'lucide-react';

export function ConciergeGrid() {
    return (
        <section className="mb-6">
            <h3 className="font-display text-xl font-semibold text-white mb-4">Concierge Services</h3>
            <div className="grid grid-cols-2 gap-3">

                <Link to="/portal/concierge/dining" className="flex flex-col items-start p-4 rounded-xl bg-[#1e2b21] hover:bg-white/5 border border-white/5 transition-colors group text-left">
                    <div className="mb-3 p-2 rounded-lg bg-[#1a5b2a]/20 text-[#1a5b2a] group-hover:bg-[#1a5b2a] group-hover:text-white transition-colors">
                        <Utensils className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">Book Dining</span>
                    <span className="text-[10px] text-slate-400 mt-1">Reserve a table</span>
                </Link>

                <Link to="/portal/events" className="flex flex-col items-start p-4 rounded-xl bg-[#1e2b21] hover:bg-white/5 border border-white/5 transition-colors group text-left">
                    <div className="mb-3 p-2 rounded-lg bg-[#1a5b2a]/20 text-[#1a5b2a] group-hover:bg-[#1a5b2a] group-hover:text-white transition-colors">
                        <Ticket className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">Guest List</span>
                    <span className="text-[10px] text-slate-400 mt-1">Manage access</span>
                </Link>

                <Link to="/portal/events" className="flex flex-col items-start p-4 rounded-xl bg-[#1e2b21] hover:bg-white/5 border border-white/5 transition-colors group text-left">
                    <div className="mb-3 p-2 rounded-lg bg-[#1a5b2a]/20 text-[#1a5b2a] group-hover:bg-[#1a5b2a] group-hover:text-white transition-colors">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">Events</span>
                    <span className="text-[10px] text-slate-400 mt-1">Upcoming galas</span>
                </Link>

                <Link to="/portal/concierge" className="flex flex-col items-start p-4 rounded-xl bg-[#1e2b21] hover:bg-white/5 border border-white/5 transition-colors group text-left">
                    <div className="mb-3 p-2 rounded-lg bg-[#1a5b2a]/20 text-[#1a5b2a] group-hover:bg-[#1a5b2a] group-hover:text-white transition-colors">
                        <Headphones className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">Concierge</span>
                    <span className="text-[10px] text-slate-400 mt-1">Direct request</span>
                </Link>

            </div>
        </section>
    );
}
