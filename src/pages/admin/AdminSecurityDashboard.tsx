import { useState } from 'react';
import {
  Shield,
  Check,
  Smartphone,
  Laptop,
  Monitor,
  LogOut,
  Menu,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function AdminSecurityDashboard() {
  const [mfaEnabled, setMfaEnabled] = useState(true);

  return (
    <div className="flex flex-col h-full bg-[#0a120d] min-h-screen text-slate-100 font-display">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-[#f8f8f5]/95 dark:bg-[#0a120d]/95 backdrop-blur-md border-b border-gray-200 dark:border-[#2a3b30] px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="-ml-2 text-gray-300 hover:text-[#f2d00d]">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold tracking-tight flex-1 text-center pr-8">Security Overview</h1>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto p-4 space-y-6">
        {/* Status Indicator */}
        <div className="flex items-center justify-between bg-[#16211b]/50 border border-[#2a3b30] rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-[#f2d00d]/20 p-2 rounded-full">
              <Shield className="h-5 w-5 text-[#f2d00d]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Security Status</p>
              <p className="text-white font-bold tracking-wide">Secure</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-900/30 border border-green-800 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f2d00d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f2d00d]"></span>
            </span>
            <span className="text-xs font-bold text-[#f2d00d] uppercase">Good</span>
          </div>
        </div>

        {/* MFA Card */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1">Authentication</h2>
          <div className="bg-[#16211b] border border-[#2a3b30] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-400 leading-snug">Protect your admin account with an extra security layer.</p>
              </div>
              <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
            </div>
            <div className="mt-4 pt-4 border-t border-[#2a3b30] flex items-center text-xs text-gray-400">
              <Shield className="mr-1.5 h-4 w-4 text-[#f2d00d]" />
              Last verified 2 days ago via Authenticator App
            </div>
          </div>
        </section>

        {/* Active Sessions */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1">Active Sessions</h2>
          <div className="bg-[#16211b] border border-[#2a3b30] rounded-xl overflow-hidden shadow-sm divide-y divide-[#2a3b30]">
            {/* Current Session */}
            <div className="p-4 flex items-center justify-between gap-3 bg-[#f2d00d]/5">
              <div className="flex items-center gap-3">
                <div className="bg-black/40 h-10 w-10 flex items-center justify-center rounded-lg text-gray-300">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white flex items-center gap-2">
                    iPhone 14 Pro
                    <span className="bg-[#f2d00d]/20 text-[#f2d00d] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Current</span>
                  </p>
                  <p className="text-xs text-gray-400">London, UK • Online now</p>
                </div>
              </div>
            </div>
            {/* Other Session 1 */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-black/40 h-10 w-10 flex items-center justify-center rounded-lg text-gray-300">
                  <Laptop className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">MacBook Pro M1</p>
                  <p className="text-xs text-gray-400">New York, USA • 2h ago</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded transition-colors">
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* Recent Activity Logs */}
        <section className="space-y-3 pb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1">Recent Activity</h2>
          <div className="bg-[#16211b] border border-[#2a3b30] rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-2 p-3 bg-black/20 text-xs font-semibold text-gray-500 uppercase border-b border-[#2a3b30]">
              <div className="col-span-6">Event</div>
              <div className="col-span-3">IP Addr</div>
              <div className="col-span-3 text-right">Time</div>
            </div>
            {/* Log Item: Success */}
            <div className="grid grid-cols-12 gap-2 p-3 items-center border-b border-[#2a3b30]/50 hover:bg-white/5 transition-colors">
              <div className="col-span-6 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]"></div>
                <span className="text-sm font-medium text-gray-200">Login Success</span>
              </div>
              <div className="col-span-3 text-xs text-gray-400 font-mono">192.168.1.1</div>
              <div className="col-span-3 text-xs text-gray-400 text-right">10:42 AM</div>
            </div>
            {/* Log Item: Warning */}
            <div className="grid grid-cols-12 gap-2 p-3 items-center border-b border-[#2a3b30]/50 hover:bg-white/5 transition-colors">
              <div className="col-span-6 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#f2d00d] shadow-[0_0_4px_rgba(242,208,13,0.6)]"></div>
                <span className="text-sm font-medium text-gray-200">Password Change</span>
              </div>
              <div className="col-span-3 text-xs text-gray-400 font-mono">192.168.1.1</div>
              <div className="col-span-3 text-xs text-gray-400 text-right">Yesterday</div>
            </div>
          </div>
          <div className="text-center pt-2">
            <button className="text-xs font-semibold text-[#f2d00d] hover:text-[#f2d00d]/80 transition-colors uppercase tracking-wide">
              View Full Logs
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
