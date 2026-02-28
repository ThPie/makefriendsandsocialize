import CirclePageTemplate from "@/components/circles/CirclePageTemplate";

const ThePartnersPage = () => (
  <CirclePageTemplate
    config={{
      circleTag: "couples-circle",
      heroImage: "/images/circles/couples-circle-hero.png",
      heroImageAlt: "Couples connecting",
      title: (
        <>
          <span className="text-primary italic font-serif">Couple's</span>
          <br />
          Circle
        </>
      ),
      tagline: "Couple's Circle",
      heroDescription:
        "A private sanctuary for couples to connect, share experiences, and build lasting friendships together.",
      quoteText: (
        <>
          "Finding your people shouldn't end{" "}
          <span className="text-primary italic">when you find your person.</span>"
        </>
      ),
      missionText:
        "The Couple's Circle is designed for couples who want to expand their social horizons together. Whether it's through intimate dinner parties, double dates, or exclusive retreats, we bring together aligned partners to foster genuine connections.",
      features: [
        { id: "01", title: "Double Dates", description: "Tailored dinners and outings matching you with like-minded couples." },
        { id: "02", title: "Exclusive Retreats", description: "Invitation-only weekend getaways and couples' retreats." },
        { id: "03", title: "Shared Passions", description: "Connect over shared goals, businesses, hobbies, and family values." },
        { id: "04", title: "Vetted Community", description: "A secure, verified network of driven, successful couples." },
      ],
      ctaDescription:
        "Your membership gives you access to the Couple's Circle and all its gatherings. Not a member yet?",
    }}
  />
);

export default ThePartnersPage;
