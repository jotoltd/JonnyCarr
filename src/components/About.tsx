import { X, User, Award, Target, Cog, Mail, MapPin, Star } from 'lucide-react';

interface AboutProps {
  onClose: () => void;
}

export function About({ onClose }: AboutProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-brand-cream-light rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-brand-cream-border animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
        <div className="h-1 bg-brand-gold" />
        
        {/* Header */}
        <div className="p-6 border-b border-brand-cream-border flex items-center justify-between sticky top-0 bg-brand-cream-light">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-brand-gold" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-green-dark">About Jonny Carr</h2>
              <p className="text-sm text-brand-green">Master Cue Maker</p>
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
              Jonny Carr is a master cue maker with years of experience crafting 
              <strong> bespoke snooker and pool cues</strong>. Formerly known as Excel Cues, 
              Jonny has built a reputation for creating high-quality, handcrafted cues 
              tailored to each player's unique style and requirements.
            </p>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-brand-cream rounded-lg p-4 text-center border border-brand-cream-border">
              <div className="text-2xl font-bold text-brand-gold">98%</div>
              <div className="text-xs text-brand-green">Customer Recommend</div>
            </div>
            <div className="bg-brand-cream rounded-lg p-4 text-center border border-brand-cream-border">
              <div className="text-2xl font-bold text-brand-gold">264+</div>
              <div className="text-xs text-brand-green">Reviews</div>
            </div>
            <div className="bg-brand-cream rounded-lg p-4 text-center border border-brand-cream-border">
              <div className="text-2xl font-bold text-brand-gold">Custom</div>
              <div className="text-xs text-brand-green">Made to Order</div>
            </div>
            <div className="bg-brand-cream rounded-lg p-4 text-center border border-brand-cream-border">
              <div className="text-2xl font-bold text-brand-gold">UK</div>
              <div className="text-xs text-brand-green">Crafted</div>
            </div>
          </section>

          {/* What We Do */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Cog className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">Bespoke Cue Making</h3>
            </div>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>
                Every cue is <strong>handcrafted to order</strong>, ensuring the perfect feel 
                and balance for each individual player. Jonny works closely with customers 
                to understand their playing style, preferences, and requirements.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Custom butt and shaft specifications</li>
                <li>Premium exotic woods and materials</li>
                <li>Personalized weight and balance</li>
                <li>Professional finishing and detailing</li>
              </ul>
            </div>
          </section>

          {/* Why Choose Us */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">Why Choose Jonny Carr Cues</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-brand-cream rounded-lg p-3 border border-brand-cream-border">
                <Star className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-brand-green-dark text-sm">Exceptional Quality</h4>
                  <p className="text-xs text-brand-green">Premium materials and meticulous craftsmanship</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-brand-cream rounded-lg p-3 border border-brand-cream-border">
                <Award className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-brand-green-dark text-sm">Personalized Service</h4>
                  <p className="text-xs text-brand-green">Each cue tailored to your exact specifications</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-brand-cream rounded-lg p-3 border border-brand-cream-border">
                <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-brand-green-dark text-sm">UK Based</h4>
                  <p className="text-xs text-brand-green">Crafted in the United Kingdom</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-brand-cream rounded-lg p-3 border border-brand-cream-border">
                <Mail className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-brand-green-dark text-sm">Direct Contact</h4>
                  <p className="text-xs text-brand-green">Work directly with the cue maker</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cue Raffles */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">About Our Cue Raffles</h3>
            </div>
            <div className="bg-gradient-to-r from-brand-green-muted/30 to-brand-cream rounded-lg p-4 border border-brand-cream-border">
              <p className="text-sm text-brand-green-dark leading-relaxed">
                Our skill-based cue raffles give players the opportunity to win premium 
                Jonny Carr cues at a fraction of the cost. Each raffle includes a 
                <strong> skill question</strong> to ensure compliance with UK gambling regulations, 
                making it a game of skill, not chance.
              </p>
              <p className="text-sm text-brand-green mt-3">
                By participating, you're supporting a UK-based craftsman and getting 
                a chance to own a truly exceptional cue.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">Get In Touch</h3>
            </div>
            <div className="space-y-2 text-sm text-brand-green-dark">
              <p>Interested in a custom cue or have questions about our raffles?</p>
              <a 
                href="mailto:jonny89carr@googlemail.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-brand-cream rounded-lg font-medium hover:bg-brand-green-dark transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Jonny
              </a>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-4 border-t border-brand-cream-border text-center">
            <p className="text-xs text-brand-green">
              © {new Date().getFullYear()} Jonny Carr Cues. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
