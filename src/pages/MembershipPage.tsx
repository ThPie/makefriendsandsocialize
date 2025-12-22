import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const MembershipPage = () => {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-[1440px] px-4 sm:px-10 md:px-0 py-5">
        <div className="p-4">
          <div 
            className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-4 text-center" 
            style={{
              backgroundImage: 'linear-gradient(rgba(20, 57, 59, 0.4) 0%, rgba(20, 57, 59, 0.7) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuA1LPDNLmTM3QdP2Pr0_KuoEX2ABfPK8uOWYED8mrY7Vm_PWmos6JzhSkimaZ6s4lDEw-_pnBlX4nJbSAAMUJJrDg5sVnr05RQtaY2O0PShRnO4btK8Y248sf2ZXAIAx6DnGZIL388TKe51HP_Wwbt_2LkZ9FisLlXFm4XbwcttGVEcwEsoaIbo_T4KcuNryiU09AJ5jR-ds4q_z8noYp2Ga4TC-heUZNwTIoeTOsAJ5Xl7lsGhw4vlFiN2rW9ANb9IZSoxFaCWsxtA")'
            }}
          >
            <div className="flex flex-col gap-2">
              <h1 className="text-white text-4xl font-black font-display leading-tight tracking-tight md:text-5xl">
                Join an Inner Circle of Distinction
              </h1>
              <p className="text-white/90 text-sm font-normal leading-normal md:text-base max-w-2xl mx-auto">
                Cultivate connections and celebrate moments through our exclusive community and curated events.
              </p>
            </div>
            <Button size="lg">Apply Now</Button>
          </div>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="flex flex-col gap-10 px-4 py-16 w-full max-w-[1440px]">
        <div className="flex flex-col gap-4 text-center items-center">
          <h2 className="text-foreground tracking-tight text-3xl font-bold leading-tight md:text-4xl font-display max-w-[720px]">
            A Legacy of Connection
          </h2>
          <p className="text-muted-foreground text-base font-normal leading-normal max-w-[720px]">
            MakeFriends Socialize is founded on the principle that the most meaningful moments are shared. We provide a private, curated environment for leaders, innovators, and connoisseurs to connect, inspire, and create lasting relationships.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <div 
              className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg" 
              style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDruggrnBN-9qTOe1Fc9qMF_JtiW_VnADSmII4S2ux8MqT6fOs2HG-ghWwtzWWHqkDaTAmD4LSpx6E1Hm-sS0Zl0P8VefX-D5Etk3lO-dk0r-NPEcPKRUOBu-2UdNaKofKZFu5q8ho1Fl3MglVTEqdi6uRMGWJ9_6kBmYVGB1jvjTPhvJuXwwTTesD0I1g-PsBP4RwCkV1vaqccSNY-5TXH6oF1728qjz6PlerqNSYPtnIdaWjHcaH5T-JfK_fO9GunPtHGxtXhJY3C")'}}
            />
            <div>
              <p className="text-foreground text-base font-medium leading-normal">Exclusive Events</p>
              <p className="text-muted-foreground text-sm font-normal leading-normal">
                Access a calendar of private gatherings, from intimate soirées to grand galas.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div 
              className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg" 
              style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDB4GSC6Jo5fw67mSMHAPEJFdrOGuo0YWScMlid-EMsl053fi94hxzLQ8Gr2YRsYR2xZGZv3UIXwrM1WpGe8ugpoAv-7Px5WKpOsLDczUkvB7yCVf7gZssUxy7wEBOhd78EareiANb92XxNzKtQSoAxWjQ0CdI2DdoWkLuMOsVHXKvf9qwBFAhSfiXgI1tZ5k__18haE_z-XAzllweTDSNcZEad7ucCeinEDHN5ftXsXCEMDuS2_Z3ofrUh-vEyWcFG3oMIK2NqS4Ho")'}}
            />
            <div>
              <p className="text-foreground text-base font-medium leading-normal">Curated Community</p>
              <p className="text-muted-foreground text-sm font-normal leading-normal">
                Join a vetted network of peers who share a passion for culture and elevated experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers Header */}
      <section className="text-center w-full max-w-[1440px]">
        <h2 className="text-foreground text-2xl font-bold leading-tight tracking-tight px-4 pb-3 pt-5 font-display md:text-3xl">
          Discover Your Place
        </h2>
        <p className="text-muted-foreground px-4 text-base">
          Select the tier of membership that best aligns with your vision.
        </p>
      </section>

      {/* Pricing Tiers */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-10 w-full max-w-[1440px]">
        {/* Patron */}
        <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary transition-colors">
          <div className="flex flex-col gap-1">
            <h3 className="text-foreground text-base font-bold leading-tight font-display tracking-tight">Patron</h3>
            <p className="flex items-baseline gap-1.5 text-foreground">
              <span className="text-4xl font-black leading-tight tracking-tight font-display">$5,000</span>
              <span className="text-muted-foreground text-sm font-bold leading-tight">Per Annum</span>
            </p>
          </div>
          <Button variant="secondary" className="w-full">Select Tier</Button>
          <div className="flex flex-col gap-3 pt-2">
            {['Access to all seasonal gatherings', 'Quarterly digital newsletter', 'Member-rate for special events', 'Spouse/partner privileges'].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-foreground">
                <span className="material-symbols-outlined text-primary text-base leading-tight">check</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fellow (Featured) */}
        <div className="flex flex-1 flex-col gap-4 rounded-xl border-2 border-primary bg-primary/5 p-6 relative shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <p className="text-primary-foreground text-xs font-medium leading-normal tracking-wide rounded-full bg-primary px-3 py-1 text-center">Most Popular</p>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-foreground text-base font-bold leading-tight font-display tracking-tight">Fellow</h3>
            <p className="flex items-baseline gap-1.5 text-foreground">
              <span className="text-4xl font-black leading-tight tracking-tight font-display">$15,000</span>
              <span className="text-muted-foreground text-sm font-bold leading-tight">Per Annum</span>
            </p>
          </div>
          <Button className="w-full">Select Tier</Button>
          <div className="flex flex-col gap-3 pt-2">
            {['All Patron benefits', 'Priority invitations to premier events', 'Four complimentary guest passes', 'Access to our private concierge'].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-foreground">
                <span className="material-symbols-outlined text-primary text-base leading-tight">check</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Founder */}
        <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary transition-colors">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-base font-bold leading-tight font-display tracking-tight">Founder</h3>
              <p className="text-primary-foreground text-xs font-medium leading-normal tracking-wide rounded-full bg-primary/70 px-3 py-1 text-center">By Invitation</p>
            </div>
            <p className="flex items-baseline gap-1.5 text-foreground">
              <span className="text-4xl font-black leading-tight tracking-tight font-display">$50,000</span>
              <span className="text-muted-foreground text-sm font-bold leading-tight">Per Annum</span>
            </p>
          </div>
          <Button variant="secondary" className="w-full">Inquire Now</Button>
          <div className="flex flex-col gap-3 pt-2">
            {['All Fellow benefits', 'Seat on the advisory committee', "Annual Founder's Retreat invitation", 'Unlimited guest privileges'].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-foreground">
                <span className="material-symbols-outlined text-primary text-base leading-tight">check</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="px-4 py-16 w-full max-w-[1440px]">
        <div className="text-center mb-12">
          <h2 className="text-foreground text-2xl font-bold leading-tight tracking-tight font-display md:text-3xl">The Path to Membership</h2>
          <p className="text-muted-foreground mt-2 text-base">Our application process is designed to be as thoughtful as our community.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {step: 1, title: 'Submit Application', desc: 'Begin by completing our private online application to express your interest.'},
            {step: 2, title: 'Committee Review', desc: "Each application is carefully reviewed by our membership committee."},
            {step: 3, title: 'Invitation', desc: 'Successful candidates will receive a formal invitation to join.'}
          ].map(item => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center size-12 mb-4 rounded-full bg-muted border border-primary/50 text-primary font-bold text-lg">
                {item.step}
              </div>
              <h3 className="font-bold mb-2 font-display text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted rounded-xl my-16 p-10 flex flex-col items-center text-center w-full max-w-[1440px] mx-4">
        <h2 className="text-foreground text-3xl font-bold leading-tight tracking-tight font-display">Begin Your Journey</h2>
        <p className="text-muted-foreground mt-3 mb-6 max-w-lg">Take the first step towards joining a distinguished community of peers.</p>
        <Button size="lg" asChild>
          <Link to="/contact">Begin Your Application</Link>
        </Button>
      </section>
    </div>
  );
};

export default MembershipPage;
