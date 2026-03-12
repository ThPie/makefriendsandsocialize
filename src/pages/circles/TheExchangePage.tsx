import CirclePageTemplate from "@/components/circles/CirclePageTemplate";

const TheExchangePage = () => (
  <CirclePageTemplate
    config={{
      circleTag: "the-exchange",
      heroImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2940&auto=format&fit=crop",
      heroImageAlt: "The Exchange - community workshop and skills sharing",
      title: (
        <>
          The <span className="text-primary italic font-serif">Exchange</span>
        </>
      ),
      tagline: "Learn. Teach. Share.",
      heroDescription:
        "A circle where members share knowledge, teach skills, and learn from one another — from technology and business to cooking classes and bike repair workshops.",
      quoteText: (
        <>
          "Everyone has something to teach,{" "}
          <span className="text-primary italic">everyone has something to learn.</span>"
        </>
      ),
      missionText:
        "The Exchange exists to unlock the collective expertise of our community. Every member brings unique skills and knowledge — this circle creates the space to share them.",
      features: [
        { id: "01", title: "Skill Workshops", description: "Hands-on sessions led by members — from coding to cooking to carpentry." },
        { id: "02", title: "Teach What You Know", description: "Step up as a host and share your expertise with fellow members." },
        { id: "03", title: "Community Learning", description: "Small-group classes designed for real skill-building, not passive lectures." },
        { id: "04", title: "Cross-Industry Exchange", description: "Learn from professionals across every field — tech, arts, trades, wellness, and more." },
      ],
      ctaDescription: "The Exchange is open to all members. Join us and start learning — or teaching — today.",
    }}
  />
);

export default TheExchangePage;
