import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Ticket as TicketIcon, Users, Award, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getAllRaffles, getTicketsByRaffleId } from '../lib/api';
import type { Raffle, Ticket } from '../types';

interface RaffleStats {
  raffle: Raffle;
  tickets: Ticket[];
  revenue: number;
  conversionRate: number;
}

export function AdminAnalytics() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [raffleStats, setRaffleStats] = useState<RaffleStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const allRaffles = await getAllRaffles();
      setRaffles(allRaffles);

      // Load tickets for each raffle
      const stats: RaffleStats[] = [];
      for (const raffle of allRaffles) {
        const tickets = await getTicketsByRaffleId(raffle.id);
        const revenue = tickets.length * raffle.price_per_ticket;
        const conversionRate = (raffle.tickets_sold / raffle.total_tickets) * 100;
        
        stats.push({
          raffle,
          tickets,
          revenue,
          conversionRate
        });
      }
      
      setRaffleStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const totalRevenue = raffleStats.reduce((sum, stat) => sum + stat.revenue, 0);
  const totalTicketsSold = raffleStats.reduce((sum, stat) => sum + stat.tickets.length, 0);
  const totalRaffles = raffles.length;
  const activeRaffles = raffles.filter(r => r.status === 'active').length;
  const completedRaffles = raffles.filter(r => r.status === 'drawn' || r.status === 'closed').length;
  const averageConversion = raffleStats.length > 0 
    ? raffleStats.reduce((sum, stat) => sum + stat.conversionRate, 0) / raffleStats.length 
    : 0;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-brand-green mx-auto"></div>
        <p className="text-brand-green mt-4 font-medium">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-brand-gold" />
        <h2 className="text-2xl font-bold text-brand-green-dark">Analytics Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="bg-brand-cream-light border-2 border-brand-cream-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-brand-gold font-semibold">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-brand-gold" />
          </div>
          <p className="text-2xl font-bold text-brand-green-dark">£{totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-brand-green mt-1">All time sales</p>
        </div>

        <div className="bg-brand-cream-light border-2 border-brand-cream-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-brand-gold font-semibold">Tickets Sold</p>
            <TicketIcon className="w-5 h-5 text-brand-gold" />
          </div>
          <p className="text-2xl font-bold text-brand-green-dark">{totalTicketsSold}</p>
          <p className="text-xs text-brand-green mt-1">Across all raffles</p>
        </div>

        <div className="bg-brand-cream-light border-2 border-brand-cream-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-brand-gold font-semibold">Total Raffles</p>
            <Calendar className="w-5 h-5 text-brand-gold" />
          </div>
          <p className="text-2xl font-bold text-brand-green-dark">{totalRaffles}</p>
          <p className="text-xs text-brand-green mt-1">{activeRaffles} active, {completedRaffles} completed</p>
        </div>

        <div className="bg-brand-cream-light border-2 border-brand-cream-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-brand-gold font-semibold">Avg Sell-Through</p>
            <TrendingUp className="w-5 h-5 text-brand-gold" />
          </div>
          <p className="text-2xl font-bold text-brand-green-dark">{averageConversion.toFixed(1)}%</p>
          <p className="text-xs text-brand-green mt-1">Average conversion rate</p>
        </div>
      </div>

      {/* Raffle Performance Table */}
      <div className="bg-white rounded-xl border-2 border-brand-cream-border overflow-hidden">
        <div className="p-4 border-b border-brand-cream-border bg-brand-cream-light">
          <h3 className="font-bold text-brand-green-dark flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-gold" />
            Raffle Performance
          </h3>
        </div>
        
        {raffleStats.length === 0 ? (
          <div className="p-8 text-center text-brand-green">
            No raffles yet. Create your first raffle to see analytics.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-cream">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-brand-green-dark uppercase tracking-wider">Raffle</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-brand-green-dark uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-brand-green-dark uppercase tracking-wider">Tickets</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-brand-green-dark uppercase tracking-wider">Revenue</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-brand-green-dark uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-border">
                {raffleStats.map((stat) => (
                  <tr key={stat.raffle.id} className="hover:bg-brand-cream-light">
                    <td className="px-4 py-3">
                      <p className="font-medium text-brand-green-dark text-sm">{stat.raffle.title}</p>
                      <p className="text-xs text-brand-green">£{stat.raffle.price_per_ticket} per ticket</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        stat.raffle.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : stat.raffle.status === 'drawn'
                            ? 'bg-brand-gold/20 text-brand-gold-dark'
                            : 'bg-gray-100 text-gray-700'
                      }`}>
                        {stat.raffle.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="font-semibold text-brand-green-dark">{stat.raffle.tickets_sold} / {stat.raffle.total_tickets}</p>
                      <p className="text-xs text-brand-green">{stat.conversionRate.toFixed(0)}% sold</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="font-semibold text-brand-green-dark">£{stat.revenue.toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-brand-cream-border rounded-full h-2">
                        <div 
                          className="bg-brand-green h-2 rounded-full" 
                          style={{ width: `${stat.conversionRate}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="bg-brand-green rounded-xl p-4 text-brand-cream">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-brand-gold" />
            <p className="text-sm font-medium">Unique Buyers</p>
          </div>
          <p className="text-2xl font-bold">
            {new Set(raffleStats.flatMap(s => s.tickets.map(t => t.buyer_email))).size}
          </p>
          <p className="text-xs text-brand-cream-dark mt-1">Unique email addresses</p>
        </div>

        <div className="bg-brand-gold rounded-xl p-4 text-brand-green-dark">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-5 h-5" />
            <p className="text-sm font-medium">Best Performing</p>
          </div>
          <p className="text-2xl font-bold">
            {raffleStats.length > 0 
              ? `${Math.max(...raffleStats.map(s => s.conversionRate)).toFixed(0)}%` 
              : '0%'}
          </p>
          <p className="text-xs text-brand-green mt-1">Highest sell-through rate</p>
        </div>

        <div className="bg-brand-cream-dark rounded-xl p-4 text-brand-green-dark">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight className="w-5 h-5" />
            <p className="text-sm font-medium">Avg Tickets / Buyer</p>
          </div>
          <p className="text-2xl font-bold">
            {totalTicketsSold > 0 && raffleStats.length > 0
              ? (totalTicketsSold / new Set(raffleStats.flatMap(s => s.tickets.map(t => t.buyer_email))).size).toFixed(1)
              : '0'}
          </p>
          <p className="text-xs text-brand-green mt-1">Average purchase size</p>
        </div>
      </div>
    </div>
  );
}
