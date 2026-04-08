import { X, Shield, Lock, Eye, Mail, Trash2, ExternalLink } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-brand-cream-light rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-brand-cream-border">
        <div className="h-1 bg-brand-gold" />
        
        {/* Header */}
        <div className="p-6 border-b border-brand-cream-border flex items-center justify-between sticky top-0 bg-brand-cream-light">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-brand-gold" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-green-dark">Privacy Policy</h2>
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
              This Privacy Policy explains how Jonny Carr Cues ("we", "our", or "us") collects, uses, stores, and protects your personal information when you participate in our skill-based cue raffle competitions. By using our service, you agree to the practices described in this policy.
            </p>
          </section>

          {/* What we collect */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">Information We Collect</h3>
            </div>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>We collect the following information when you register and participate in raffles:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Personal Information:</strong> Name, email address, and phone number (optional)</li>
                <li><strong>Account Information:</strong> Login credentials (passwords are securely hashed)</li>
                <li><strong>Payment Information:</strong> Payment details are processed securely through PayPal. We do not store your full card details.</li>
                <li><strong>Raffle Activity:</strong> Tickets purchased, raffle entries, and competition results</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and device information for security purposes</li>
              </ul>
            </div>
          </section>

          {/* How we use */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">How We Use Your Information</h3>
            </div>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>Your information is used for the following purposes:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Processing your raffle entries and ticket purchases</li>
                <li>Contacting winners and delivering prizes</li>
                <li>Sending confirmation emails and raffle updates</li>
                <li>Verifying eligibility for skill-based competitions</li>
                <li>Preventing fraud and ensuring fair play</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Skill Competition Notice */}
          <section className="bg-brand-green/10 rounded-lg p-4 border border-brand-green/20">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">Skill-Based Competition</h3>
            </div>
            <p className="text-sm text-brand-green-dark leading-relaxed">
              Our raffles are <strong>skill-based competitions</strong>, not games of chance. Participants must answer a skill question correctly to purchase tickets. This makes our competitions legal under UK law. Your answers to skill questions are recorded to verify fair participation.
            </p>
          </section>

          {/* Data Storage */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">Data Storage & Security</h3>
            </div>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>We take data protection seriously:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>All data is stored securely using Supabase with encryption</li>
                <li>Passwords are hashed using bcrypt before storage</li>
                <li>Payment processing is handled by PayPal's secure systems</li>
                <li>We never sell or share your personal data with third parties for marketing</li>
                <li>Access to data is restricted to authorised personnel only</li>
              </ul>
            </div>
          </section>

          {/* Retention */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-bold text-brand-green-dark">Data Retention</h3>
            </div>
            <p className="text-sm text-brand-green-dark leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Account information is kept while your account is active. Raffle participation records are retained for 6 years for tax and legal compliance purposes. You may request deletion of your account and associated data by contacting us.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h3 className="text-lg font-bold text-brand-green-dark mb-3">Your Rights</h3>
            <div className="space-y-3 text-sm text-brand-green-dark">
              <p>Under UK data protection laws, you have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Object to certain processing activities</li>
                <li>Request a copy of your data in portable format</li>
              </ul>
              <p className="mt-3">To exercise these rights, contact us at the email below.</p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-brand-cream rounded-lg p-4 border border-brand-cream-border">
            <h3 className="text-lg font-bold text-brand-green-dark mb-2">Contact Us</h3>
            <p className="text-sm text-brand-green-dark">
              If you have questions about this Privacy Policy or your data, please contact:
            </p>
            <p className="text-sm font-semibold text-brand-green mt-2">
              Email: jonathan@jonnycarr.co.uk
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
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
