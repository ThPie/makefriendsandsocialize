import CirclePageTemplate from "@/components/circles/CirclePageTemplate";

const TheGentlemenPage = () => (
  <CirclePageTemplate
    config={{
      circleTag: "the-gentlemen",
      heroImage: "/images/gallery/golf-outdoor.jpg",
      heroImageAlt: "The Gentlemen circle",
      title: (
        <>
          The <span className="text-primary italic font-serif">Gentlemen</span>
        </>
      ),
      tagline: "Private Men's Circle",
      heroDescription:
        "A private space for men who seek growth, accountability, and brotherhood — without ego or competition. Just men lifting each other higher.",
      quoteText: (
        <>
          "Strength is built through connection,{" "}
          <span className="text-primary italic">not isolation.</span>"
        </>
      ),
      missionText:
        "The Gentlemen exists to bring together men who are committed to personal growth, honest conversations, and showing up for one another — consistently and without pretense.",
      features: [
        { id: "01", title: "Private Gatherings", description: "Intimate events designed to foster genuine connection and brotherhood." },
        { id: "02", title: "Growth Conversations", description: "Facilitated discussions on personal development, leadership, and life goals." },
        { id: "03", title: "Networking", description: "Connect with driven men across industries in a supportive setting." },
        { id: "04", title: "Wellness", description: "Curated wellness experiences — from fitness challenges to mindfulness sessions." },
      ],
      ctaDescription:
        "Your membership gives you access to The Gentlemen circle and all its gatherings. Not a member yet?",
    }}
  />
);

export default TheGentlemenPage;
