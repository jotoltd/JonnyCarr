import { X, Ticket, Brain, CheckCircle, Trophy, HelpCircle, PoundSterling, Users } from 'lucide-react';

interface HowToPlayProps {
  onClose: () => void;
}

export function HowToPlay({ onClose }: HowToPlayProps) {
  const steps = [
    {
      icon: Users,
      title: "Create an Account",
      description: "Register with your name and email address. You'll need an account to participate in raffles."
    },
    {
      icon: Ticket,
      title: "Choose Your Tickets",
      description: "Browse available raffles and select your lucky ticket numbers from the grid. Each ticket gives you one entry."
    },
    {
      icon: Brain,
      title: "Answer the Skill Question",
      description: "Every raffle includes a skill-based question. You must answer correctly to purchase tickets - this makes it a legal competition of skill, not chance."
    },
    {
      icon: PoundSterling,
      title: "Pay for Tickets",
      description: "Complete payment securely via PayPal. Once confirmed, your ticket numbers are locked in."
    },
    {
      icon: CheckCircle,
      title: "Receive Confirmation",
      description: "You'll get an email with your ticket numbers. Watch the raffle progress - you can see how many tickets are sold in real-time."
    },
    {
      icon: Trophy,
      title: "Wait for the Draw",
      description: "When all tickets are sold or the raffle ends, a winning ticket number is drawn. If it's yours, you win the handmade cue!"
    }
  ];

  const faqs = [
    {
      q: "Is this a lottery?",
      a: "No. This is a skill-based competition. You must answer a skill question correctly to enter, making it a competition of skill rather than chance."
    },
    {
      q: "How are winners drawn?",
      a: "The admin selects the winning ticket number from all sold tickets. The winner is the person who purchased that specific ticket number."
    },
    {
      q: "What if I get the skill question wrong?",
      a: "You must answer correctly to complete your ticket purchase. You can try again with a new answer."
    },
    {
      q: "Can I buy multiple tickets?",
      a: "Yes! You can buy as many tickets as are available. Each ticket is a separate entry with its own number."
    },
    {
      q: "When do I get my prize?",
      a: "Winners are notified by email immediately after the draw. Prizes are handmade cues crafted by Jonny Carr and will be shipped to you."
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-brand-cream-light rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-brand-cream-border">
        <div className="h-1 bg-brand-gold" />
        
        {/* Header */}
        <div className="p-6 border-b border-brand-cream-border flex items-center justify-between sticky top-0 bg-brand-cream-light z-10">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-brand-gold" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-green-dark">How to Play</h2>
              <p className="text-sm text-brand-green">Your guide to winning a handmade cue</p>
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
              Welcome to Jonny Carr Cue Raffles! Our competitions are skill-based, meaning you'll need to answer a question correctly to enter. This keeps everything legal and fair. Here's how it works:
            </p>
          </section>

          {/* Steps */}
          <section>
            <h3 className="text-lg font-bold text-brand-green-dark mb-4">The Process</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 bg-brand-cream rounded-lg p-4 border border-brand-cream-border">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-brand-gold font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <step.icon className="w-4 h-4 text-brand-gold" />
                      <h4 className="font-semibold text-brand-green-dark">{step.title}</h4>
                    </div>
                    <p className="text-sm text-brand-green">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skill Competition Notice */}
          <section className="bg-brand-green/10 rounded-lg p-4 border border-brand-green/20">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">Why Skill Questions?</h3>
            </div>
            <p className="text-sm text-brand-green-dark leading-relaxed">
              In the UK, competitions that rely entirely on chance (like lotteries) require special licenses and are heavily regulated. By adding a skill element - requiring you to answer a question correctly - our competitions become legal <strong>prize competitions</strong>. This means we can offer exciting prizes like handmade snooker cues while staying fully compliant with UK law.
            </p>
          </section>

          {/* FAQs */}
          <section>
            <h3 className="text-lg font-bold text-brand-green-dark mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-gold" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-brand-cream rounded-lg p-4 border border-brand-cream-border">
                  <h4 className="font-semibold text-brand-green-dark mb-1">{faq.q}</h4>
                  <p className="text-sm text-brand-green">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="bg-brand-cream rounded-lg p-4 border border-brand-cream-border">
            <h3 className="text-lg font-bold text-brand-green-dark mb-2">Need More Help?</h3>
            <p className="text-sm text-brand-green-dark">
              Contact us at <strong>jonathan@jonnycarr.co.uk</strong> for any questions about how raffles work.
            </p>
          </section>
        </div>

        {/* Footer Close Button */}
        <div className="p-4 border-t border-brand-cream-border bg-brand-cream sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full bg-brand-green text-brand-cream py-3 rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
