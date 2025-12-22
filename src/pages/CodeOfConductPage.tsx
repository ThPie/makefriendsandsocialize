const CodeOfConductPage = () => (
  <main className="py-12 md:py-20 px-4 w-full max-w-[960px] mx-auto">
    <h1 className="text-primary text-4xl md:text-5xl font-black leading-tight tracking-tight font-display text-center">Code of Conduct</h1>
    <p className="text-muted-foreground text-center mt-4 mb-10">Guidelines that uphold the spirit and traditions of The Gathering Society.</p>
    <div className="space-y-4">
      {[
        { title: "General Decorum", content: "Members are expected to interact with fellow members and staff with respect and courtesy." },
        { title: "Dress Code", content: "A smart and elegant dress code is maintained at all times. Athletic wear is not permitted." },
        { title: "Guest Policy", content: "Members may invite guests but are responsible for their guests' conduct." },
        { title: "Electronic Devices", content: "Mobile conversations are restricted to designated areas. Photography requires prior consent." },
        { title: "Privacy", content: "All matters concerning the Society and its members are to be kept confidential." }
      ].map((item, i) => (
        <details key={i} className="bg-card border border-border rounded-lg p-5 group cursor-pointer" open={i === 0}>
          <summary className="flex items-center justify-between font-bold text-lg list-none text-foreground font-display">
            {item.title}
            <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-muted-foreground">expand_more</span>
          </summary>
          <p className="text-muted-foreground mt-4">{item.content}</p>
        </details>
      ))}
    </div>
  </main>
);
export default CodeOfConductPage;
