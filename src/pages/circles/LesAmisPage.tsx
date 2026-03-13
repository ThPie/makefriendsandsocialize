import CirclePageTemplate from "@/components/circles/CirclePageTemplate";
import heroImage from "@/assets/les-amis-circle-new.webp";

const LesAmisPage = () => (
  <CirclePageTemplate
    config={{
      circleTag: "les-amis",
      heroImage: heroImage,
      heroImageAlt: "French café social gathering",
      title: (
        <>
          Les <span className="text-primary italic font-serif">Amis</span>
        </>
      ),
      tagline: "Open Circle",
      heroDescription:
        "Conversation, culture, and connection — in French.",
      quoteText: (
        <>
          "A space for real conversation in a{" "}
          <span className="text-primary italic">welcoming</span> setting."
        </>
      ),
      missionText:
        "Les Amis is a French-speaking social circle open to all members. Whether you're a native speaker or just starting your French journey, you'll find camaraderie and culture here.",
      features: [
        { id: "01", title: "Monthly Meetups", description: "Casual gatherings at selected cafés and wine bars." },
        { id: "02", title: "Open to All", description: "Native speakers and learners together." },
        { id: "03", title: "Light Prompts", description: "Guided conversation topics to keep it flowing." },
        { id: "04", title: "Culture", description: "Explore music, travel, food, and French art." },
      ],
      ctaDescription:
        "Your membership gives you access to Les Amis and all its Francophone gatherings. Not a member yet?",
    }}
  />
);

export default LesAmisPage;
