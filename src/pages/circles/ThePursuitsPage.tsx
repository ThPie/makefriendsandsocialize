import CirclePageTemplate from "@/components/circles/CirclePageTemplate";

const ThePursuitsPage = () => (
  <CirclePageTemplate
    config={{
      circleTag: "active-outdoor",
      heroImage: "/images/gallery/golf-outdoor.jpg",
      heroImageAlt: "Active pursuits and golf",
      title: (
        <>
          <span className="text-primary italic font-serif">Active</span> &<br />
          Outdoor
        </>
      ),
      tagline: "Active & Outdoor",
      heroDescription:
        "Elevated living, shared adventures, and a community dedicated to active lifestyles and wellness.",
      quoteText: (
        <>
          "Bonds forged in motion are{" "}
          <span className="text-primary italic">bonds that endure.</span>"
        </>
      ),
      missionText:
        "From golf foursomes and cycling excursions to recovery spas and performance retreats, Active & Outdoor unites members who view movement and vitality as essential pillars of a life well-lived.",
      features: [
        { id: "01", title: "Active Outings", description: "Golf pairings, private cycling tours, ski days, and hiking excursions." },
        { id: "02", title: "Wellness Events", description: "Rejuvenating spa days, sound baths, yoga retreats, and biohacking sessions." },
        { id: "03", title: "Skill Levels", description: "Events tailored for both passionate beginners and seasoned athletes." },
        { id: "04", title: "Vibrant Community", description: "Connect with members who prioritize health, vitality, and adventure." },
      ],
      ctaDescription:
        "Your membership gives you access to Active & Outdoor and all its active experiences. Not a member yet?",
    }}
  />
);

export default ThePursuitsPage;
