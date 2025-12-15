import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const OfficialRules = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Official Giveaway Rules | Skill Stacker"
        description="Read the official rules for Skill Stacker Giveaway promotions including eligibility, entry methods, and prize details."
      />
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Official Giveaway Rules
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">
                SKILL STACKER GIVEAWAY® OFFICIAL RULES
              </h2>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                NO PURCHASE NECESSARY TO ENTER OR WIN. A PURCHASE WILL NOT INCREASE YOUR CHANCES OF WINNING.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-semibold mb-3">1. Eligibility</h3>
              <p className="text-muted-foreground leading-relaxed">
                Open to legal residents of the 50 United States, the District of Columbia, and Canada where permitted by law. Void where prohibited. Participants must be the age of majority in their state or province of residence at the time of entry. Employees, officers, and directors of Skill Stacker, its parent companies, subsidiaries, affiliates, advertising and promotion agencies, and their immediate family members are not eligible to participate.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-semibold mb-3">2. Promotion Period</h3>
              <p className="text-muted-foreground leading-relaxed">
                Promotion dates, entry periods, and deadlines are disclosed on individual giveaway pages. All times are stated in Mountain Standard Time (MST) unless otherwise noted.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-semibold mb-3">3. How to Enter</h3>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p><strong className="text-foreground">Purchase Entry:</strong> Make a qualifying purchase from the Skill Stacker Shop. Each purchase earns entries based on the product's designated entry value. Entries are automatically credited to your account upon order fulfillment.</p>
                <p><strong className="text-foreground">Non-Purchase Entry (Free Entry):</strong> To enter without making a purchase, send a hand-written 3" x 5" card with your full name, complete mailing address, email address, and date of birth to: Skill Stacker Giveaway Entry, [Address to be provided]. Each mail-in entry receives one (1) entry. Limit one (1) free entry per envelope. Mechanically reproduced entries will not be accepted.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-semibold mb-3">4. Entry Redemption</h3>
              <p className="text-muted-foreground leading-relaxed">
                Accumulated entries may be redeemed for giveaway participation through the Skill Stacker website. Once entries are redeemed for a specific giveaway, they cannot be transferred, refunded, or applied to other promotions. Entry costs per giveaway are disclosed on the respective giveaway page.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-semibold mb-3">5. Prize Descriptions</h3>
              <p className="text-muted-foreground leading-relaxed">
                Prize descriptions, approximate retail values (ARV), and quantities are disclosed on individual giveaway pages. Prizes are non-transferable and no substitution or cash equivalent is permitted except at Sponsor's sole discretion. Sponsor reserves the right to substitute a prize of equal or greater value if the advertised prize becomes unavailable.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-semibold mb-3">6. Odds of Winning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Odds of winning depend upon the total number of eligible purchase and non-purchase entries received during the promotion period.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-semibold mb-3">7. Winner Selection and Notification</h3>
              <p className="text-muted-foreground leading-relaxed">
                Winners will be selected in a random drawing from all eligible entries received. Winners will be notified via email and/or phone within five (5) business days of the drawing. Potential winners must respond within seven (7) days of notification or an alternate winner may be selected. Winners may be required to complete and return an Affidavit of Eligibility, Liability Release, and where permitted, a Publicity Release within fourteen (14) days of notification.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-semibold mb-3">8. Canadian Residents</h3>
              <p className="text-muted-foreground leading-relaxed">
                If a Canadian resident is selected as a potential winner, they must correctly answer a time-limited mathematical skill-testing question administered by phone or email before being declared a winner.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-semibold mb-3">9. Taxes</h3>
              <p className="text-muted-foreground leading-relaxed">
                All federal, state, provincial, and local taxes on prizes are the sole responsibility of the winner. Winners may be required to provide a valid Social Security Number or Tax Identification Number for tax reporting purposes.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-semibold mb-3">10. General Conditions</h3>
              <p className="text-muted-foreground leading-relaxed">
                By participating, entrants agree to be bound by these Official Rules and the decisions of the Sponsor, which are final and binding. Sponsor reserves the right to cancel, suspend, or modify the promotion if fraud, technical failures, or any other factor beyond Sponsor's reasonable control impairs the integrity of the promotion. Sponsor is not responsible for lost, late, misdirected, damaged, incomplete, or illegible entries.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-semibold mb-3">11. Privacy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Personal information collected from entrants will be used for the administration of the promotion and in accordance with Sponsor's Privacy Policy.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-semibold mb-3">12. Sponsor</h3>
              <p className="text-muted-foreground leading-relaxed">
                Skill Stacker LLC
              </p>
            </section>

            <section className="pt-8 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                These rules were last updated on December 15, 2025. Sponsor reserves the right to modify these rules at any time.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OfficialRules;
