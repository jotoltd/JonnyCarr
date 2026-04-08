import { X, FileText, Scale, AlertTriangle, Gift, Gavel, HelpCircle } from 'lucide-react';

interface TermsConditionsProps {
  onClose: () => void;
}

export function TermsConditions({ onClose }: TermsConditionsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-brand-cream-light rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-brand-cream-border">
        <div className="h-1 bg-brand-gold" />
        
        {/* Header */}
        <div className="p-6 border-b border-brand-cream-border flex items-center justify-between sticky top-0 bg-brand-cream-light z-10">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-brand-gold" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-green-dark">Terms & Conditions</h2>
              <p className="text-sm text-brand-green">Jonny Carr Cue Raffles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-green hover:text-brand-green-dark p-2 hover:bg-brand-cream rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Introduction */}
          <section className="bg-brand-cream rounded-lg p-4 border border-brand-cream-border">
            <p className="text-brand-green-dark text-sm leading-relaxed">
              These Terms and Conditions govern your participation in Jonny Carr Cue skill-based competitions. By entering any competition, you agree to be bound by these terms. Please read them carefully.
            </p>
          </section>

          {/* Competition Nature */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">1. Nature of Competitions</h3>
            </div>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>1.1 All competitions operated by Jonny Carr Cues are <strong>skill-based prize competitions</strong>, not lotteries or games of chance.</p>
              <p>1.2 To enter, participants must successfully answer a skill-based question. The requirement to exercise skill or judgment ensures compliance with UK gambling and lottery legislation.</p>
              <p>1.3 Entry fees are charged for participation. The fee covers the cost of entry and contributes to the prize fund.</p>
              <p>1.4 Competitions are open to residents of the United Kingdom aged 18 years or over.</p>
            </div>
          </section>

          {/* Eligibility */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">2. Eligibility</h3>
            </div>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>2.1 You must be 18 years of age or older to enter any competition.</p>
              <p>2.2 You must be a resident of the United Kingdom.</p>
              <p>2.3 Employees of Jonny Carr Cues, their immediate family members, and anyone professionally connected with the competitions are not eligible to enter.</p>
              <p>2.4 We reserve the right to verify the age and identity of any participant. Entry may be voided if eligibility requirements are not met.</p>
            </div>
          </section>

          {/* How to Enter */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">3. How to Enter</h3>
            </div>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>3.1 Entries are made via our website at jonny-carr-cue-raffle.vercel.app</p>
              <p>3.2 To enter: (a) Create an account, (b) Select available ticket numbers, (c) Answer the skill question correctly, (d) Complete payment.</p>
              <p>3.3 Multiple entries are permitted up to the maximum ticket limit per competition.</p>
              <p>3.4 Entry fees are non-refundable except in the case of competition cancellation.</p>
              <p>3.5 We reserve the right to refuse entry or cancel tickets if we suspect fraud, cheating, or breach of these terms.</p>
            </div>
          </section>

          {/* Skill Questions */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">4. Skill Questions</h3>
            </div>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>4.1 Each competition includes a skill-based question that must be answered correctly to complete your entry.</p>
              <p>4.2 The skill element satisfies the requirements of the Gambling Act 2005 (UK) for a prize competition.</p>
              <p>4.3 Answers are verified at the point of entry. An incorrect answer will prevent ticket purchase.</p>
              <p>4.4 Participants may research answers using any available resources.</p>
            </div>
          </section>

          {/* Winner Selection */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Gavel className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">5. Winner Selection & Prizes</h3>
            </div>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>5.1 When all tickets are sold or the competition end date is reached, a winning ticket number will be selected by the promoter.</p>
              <p>5.2 The winner is the participant who purchased the ticket matching the winning number.</p>
              <p>5.3 Winners will be contacted via email within 48 hours of the draw using the contact details provided at entry.</p>
              <p>5.4 Prizes are non-transferable and non-exchangeable. No cash alternative is offered.</p>
              <p>5.5 The promoter reserves the right to substitute the prize with an item of equal or greater value if the advertised prize becomes unavailable.</p>
            </div>
          </section>

          {/* Prize Delivery */}
          <section>
            <h3 className="text-lg font-bold text-brand-green-dark mb-3">6. Prize Delivery</h3>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>6.1 Winners must provide a valid UK delivery address within 14 days of being contacted.</p>
              <p>6.2 Prizes will be dispatched within 28 days of the winner providing delivery details.</p>
              <p>6.3 Delivery is free of charge to UK mainland addresses.</p>
              <p>6.4 The promoter accepts no responsibility for prizes lost, damaged, or delayed in transit once dispatched.</p>
            </div>
          </section>

          {/* Cancellation */}
          <section>
            <h3 className="text-lg font-bold text-brand-green-dark mb-3">7. Cancellation & Refunds</h3>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>7.1 If a competition fails to sell a minimum of 75% of tickets within the timeframe set, the promoter reserves the right to cancel the competition.</p>
              <p>7.2 In the event of cancellation, participants will receive a full refund of their entry fees to their original payment method within 14 days.</p>
              <p>7.3 Participants may not cancel their entry once the skill question has been answered correctly and payment completed.</p>
            </div>
          </section>

          {/* Liability */}
          <section>
            <h3 className="text-lg font-bold text-brand-green-dark mb-3">8. Limitation of Liability</h3>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>8.1 The promoter does not accept liability for any loss, damage, or injury arising from participation in competitions or use of prizes, except where caused by negligence.</p>
              <p>8.2 The promoter is not responsible for technical failures, network issues, or other circumstances beyond reasonable control that prevent entry.</p>
              <p>8.3 The promoter's total liability shall not exceed the value of the prize or the entry fee paid, whichever is greater.</p>
            </div>
          </section>

          {/* Data Protection */}
          <section>
            <h3 className="text-lg font-bold text-brand-green-dark mb-3">9. Data Protection</h3>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>9.1 Personal data collected during entry is processed in accordance with our Privacy Policy.</p>
              <p>9.2 By entering, you consent to the processing of your personal data for competition administration, winner notification, and marketing (where opted in).</p>
            </div>
          </section>

          {/* General */}
          <section>
            <h3 className="text-lg font-bold text-brand-green-dark mb-3">10. General</h3>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>10.1 These terms are governed by the laws of England and Wales.</p>
              <p>10.2 The promoter's decision on all matters is final and binding.</p>
              <p>10.3 We reserve the right to amend these terms at any time. Changes will be posted on the website.</p>
              <p>10.4 Promoter: Jonny Carr Cues, jonathan@jonnycarr.co.uk</p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-brand-cream rounded-lg p-4 border border-brand-cream-border">
            <h3 className="text-lg font-bold text-brand-green-dark mb-2">Contact</h3>
            <p className="text-sm text-brand-green-dark">
              For queries about these Terms & Conditions, contact:<br />
              <strong>Email:</strong> jonathan@jonnycarr.co.uk
            </p>
          </section>

          {/* Last Updated */}
          <div className="text-center pt-4 border-t border-brand-cream-border">
            <p className="text-xs text-brand-green">
              Last updated: April 2026
            </p>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="p-4 border-t border-brand-cream-border bg-brand-cream sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full bg-brand-green text-brand-cream py-3 rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
          >
            I Agree to Terms & Conditions
          </button>
        </div>
      </div>
    </div>
  );
}
