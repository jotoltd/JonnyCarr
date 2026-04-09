import { useEffect, useState } from 'react';
import { Eye, UserCheck } from 'lucide-react';

interface SocialProofProps {
  raffleId: string;
  ticketsSold: number;
}

const RECENT_BUYERS = [
  'Someone from London',
  'A player from Manchester',
  'A fan from Birmingham',
  'Someone from Glasgow',
  'A player from Liverpool',
  'Someone from Leeds',
  'A fan from Bristol',
  'Someone from Sheffield',
];

export function SocialProof({ raffleId, ticketsSold }: SocialProofProps) {
  const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * 8) + 3);
  const [recentActivity, setRecentActivity] = useState<string | null>(null);

  useEffect(() => {
    // Update viewer count every 30 seconds
    const viewerInterval = setInterval(() => {
      setViewerCount(Math.floor(Math.random() * 8) + 3);
    }, 30000);

    // Show recent purchase activity occasionally
    const activityTimeout = setTimeout(() => {
      if (ticketsSold > 5) {
        const randomBuyer = RECENT_BUYERS[Math.floor(Math.random() * RECENT_BUYERS.length)];
        setRecentActivity(`${randomBuyer} just bought tickets`);
      }
    }, 5000);

    // Rotate activity messages
    const activityInterval = setInterval(() => {
      if (ticketsSold > 5 && Math.random() > 0.3) {
        const randomBuyer = RECENT_BUYERS[Math.floor(Math.random() * RECENT_BUYERS.length)];
        setRecentActivity(`${randomBuyer} just bought tickets`);
      } else {
        setRecentActivity(null);
      }
    }, 15000);

    return () => {
      clearInterval(viewerInterval);
      clearTimeout(activityTimeout);
      clearInterval(activityInterval);
    };
  }, [raffleId, ticketsSold]);

  return (
    <div className="space-y-2">
      {/* Live viewer count */}
      <div className="flex items-center justify-center gap-2 text-sm text-brand-green bg-brand-cream-light rounded-lg py-2 px-4 border border-brand-cream-border">
        <Eye className="w-4 h-4 text-brand-gold" />
        <span>
          <strong className="text-brand-green-dark">{viewerCount}</strong> people viewing this raffle right now
        </span>
      </div>

      {/* Recent activity ticker */}
      {recentActivity && (
        <div className="flex items-center justify-center gap-2 text-sm text-brand-green-dark bg-brand-green/10 rounded-lg py-2 px-4 border border-brand-green/20 animate-pulse">
          <UserCheck className="w-4 h-4 text-brand-green" />
          <span>{recentActivity}</span>
        </div>
      )}
    </div>
  );
}
