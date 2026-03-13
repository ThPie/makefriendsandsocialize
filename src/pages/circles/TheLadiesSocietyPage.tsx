import CirclePageTemplate from "@/components/circles/CirclePageTemplate";

const TheLadiesSocietyPage = () => (
  <CirclePageTemplate
    config={{
      circleTag: "the-ladies-society",
      heroImage: "/images/gallery/golf-outdoor.webp",
      heroImageAlt: "The Ladies Society",
      title: (
        <>
          The <span className="text-primary italic font-serif">Ladies</span> Society
        </>
      ),
      tagline: "Private Women's Circle",
      heroDescription:
        "A private membership space for women who seek growth, support, accountability, and meaningful connection — without drama or gossip. Just women lifting each other higher.",
      quoteText: (
        <>
          "Every day is women's day —{" "}
          <span className="text-primary italic">not just once a year.</span>"
        </>
      ),
      missionText:
        "The Ladies Society exists to recognize, celebrate, and support women consistently, through meaningful gatherings, honest conversations, and a community built on mutual respect.",
      features: [
        { id: "01", title: "Private Gatherings", description: "Intimate events designed to foster genuine connection and sisterhood." },
        { id: "02", title: "Growth Conversations", description: "Facilitated discussions on personal development, leadership, and life goals." },
        { id: "03", title: "Networking", description: "Connect with ambitious women across industries in a supportive setting." },
        { id: "04", title: "Wellness Evenings", description: "Curated wellness experiences — from mindfulness sessions to self-care rituals." },
      ],
      ctaDescription:
        "Your membership gives you access to The Ladies Society and all its gatherings. Not a member yet?",
    }}
  />
);

export default TheLadiesSocietyPage;
