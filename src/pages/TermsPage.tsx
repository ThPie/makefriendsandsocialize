const TermsPage = () => (
  <main className="py-12 md:py-20 px-4 w-full max-w-[960px] mx-auto">
    <h1 className="text-primary text-4xl md:text-5xl font-black leading-tight tracking-tight font-display">Terms and Conditions</h1>
    <p className="text-muted-foreground text-sm pb-8 pt-1">Last Updated: October 24, 2024</p>
    <div className="space-y-8 text-muted-foreground leading-relaxed">
      {[
        { title: "1. Introduction", content: "Welcome to The Gathering Society. These terms outline the rules for using our website." },
        { title: "2. Membership Terms", content: "You must be 21+ to become a member. Provide accurate information during registration." },
        { title: "3. Code of Conduct", content: "Members must conduct themselves respectfully. Harassment will not be tolerated." },
        { title: "4. Event Policies", content: "All ticket sales are final. Cancellations 72+ hours prior may receive credit." },
        { title: "5. Contact", content: "Questions? Email legal@thegatheringsociety.com" }
      ].map((s, i) => (
        <div key={i}>
          <h2 className="text-foreground text-xl font-bold pb-3 font-display">{s.title}</h2>
          <p>{s.content}</p>
        </div>
      ))}
    </div>
  </main>
);
export default TermsPage;
