import { Shield, Sparkles, Heart, Users, Award, Lock } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Exclusivity',
    desc: 'We maintain the highest standards to ensure every event attracts exceptional individuals.',
  },
  {
    icon: Award,
    title: 'Quality',
    desc: 'From venues to catering, every detail is meticulously curated for perfection.',
  },
  {
    icon: Lock,
    title: 'Discretion',
    desc: 'Privacy and confidentiality are paramount in all our interactions and events.',
  },
  {
    icon: Heart,
    title: 'Authenticity',
    desc: 'We foster genuine connections and meaningful relationships, not superficial networking.',
  },
  {
    icon: Sparkles,
    title: 'Elegance',
    desc: 'Sophistication and refinement are woven into every aspect of our experiences.',
  },
  {
    icon: Users,
    title: 'Community',
    desc: 'We create a supportive network of accomplished individuals who inspire each other.',
  },
];

const AboutPage = () => {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      {/* Hero */}
      <section className="w-full">
        <div className="p-4 w-full flex justify-center">
          <div 
            className="flex min-h-[480px] w-full max-w-[1440px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-lg items-center justify-center p-4 text-center transition-all duration-700" 
            style={{
              backgroundImage: 'linear-gradient(rgba(20, 57, 59, 0.2) 0%, rgba(20, 57, 59, 0.7) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuD8-F3RY9H5cqEv7-lZOpcYmt4E5bLYfLDW5gCw3Bz2tS0M1tJY_stkdmb3tg_U2mBg8BCNImMzNg1-bw1YUJyKJgp9-XRGw6bslt88e3BZWh8JDxfxmiRHJ0XGnNSsfmNYWFVIN9Ntq7kMOH8BSBLDcygmOmq1KImEma6iU3IkxdZcYBvSDfNHKtW2024ILgRsPr1zqBao9VjQgYkg2D9Zy9137MbsF4D3A2AiKgy1i1SHQ4Jp_jb3gKarxjHqlbPUEDUaPdh5x-XO")'
            }}
          >
            <div className="flex flex-col gap-2 max-w-[800px]">
              <h1 className="text-white text-4xl font-black font-display leading-tight tracking-tight md:text-5xl drop-shadow-md">
                About <span className="text-primary">Us</span>
              </h1>
              <p className="text-white/90 text-sm font-normal leading-normal md:text-base max-w-2xl mx-auto drop-shadow-sm">
                Curating exclusive luxury social experiences for discerning individuals seeking meaningful connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story, Mission, Values - Horizontal Layout */}
      <section className="py-12 md:py-20 w-full max-w-[1440px] px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Story */}
          <div className="flex flex-col">
            <h2 className="text-foreground text-2xl md:text-3xl font-bold leading-tight tracking-tight pb-4 font-display">
              Our <span className="text-primary">Story</span>
            </h2>
            <p className="text-muted-foreground text-base font-normal leading-relaxed mb-4">
              Founded in 2025, MakeFriends & Socialize was born from a vision to create meaningful connections in an increasingly digital world.
            </p>
            <p className="text-muted-foreground text-base font-normal leading-relaxed">
              Our community has grown to become a trusted space for professionals and socialites to meet, connect, and build lasting friendships through carefully curated events.
            </p>
          </div>

          {/* Mission */}
          <div className="flex flex-col">
            <h2 className="text-foreground text-2xl md:text-3xl font-bold leading-tight tracking-tight pb-4 font-display">
              Our <span className="text-primary">Mission</span>
            </h2>
            <p className="text-muted-foreground text-base font-normal leading-relaxed mb-4">
              To cultivate a vibrant network of like-minded individuals through meticulously curated luxury experiences that foster genuine connections and lasting partnerships.
            </p>
            <p className="text-muted-foreground text-base font-normal leading-relaxed">
              We believe the most valuable asset in life is not wealth or status, but the quality of relationships we build.
            </p>
          </div>

          {/* Values */}
          <div className="flex flex-col">
            <h2 className="text-foreground text-2xl md:text-3xl font-bold leading-tight tracking-tight pb-4 font-display">
              Our <span className="text-primary">Values</span>
            </h2>
            <p className="text-muted-foreground text-base font-normal leading-relaxed">
              These core principles guide every decision we make and every experience we create: Exclusivity, Quality, Discretion, Authenticity, Elegance, and Community.
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-12 md:py-20 w-full max-w-[1440px] px-4 bg-secondary/5 rounded-2xl mx-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((item, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center text-center p-8 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
            >
              <div className="p-4 mb-4 bg-primary/20 rounded-full text-primary transition-all duration-300 group-hover:bg-primary/30 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
                <item.icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-foreground text-xl font-bold mb-3 font-display">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="py-12 md:py-20 w-full max-w-[1440px] px-4">
        <h2 className="text-foreground text-3xl font-bold leading-tight tracking-tight pb-8 text-center font-display">
          The <span className="text-primary">Experience</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCdpnp_3dDGGGjbIeH5oSgTcj0beXv4FmlMQJeOL5Xgc7TTndHnBnlll7xXiEDYMKFJC74eWu8NERu1ELHttjo3T3xIsb4aYoGvfdwoeQQY67UiHu2CIcYKRZ8AOUMz3Rq8TJKWGXoEGKe1Gfl4y30tT-tcDagsxha-w4uF5x6yLTwys3Fo4CqR3w3gvkq8sDVsxIVNOGsoHvAf4BaOFg1Q6nc7RX0kQZkylAqPBGC8ZgpRXP_FtXh0_cvikp31SY9YIwJ2922XiV-o",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBcps9sj88SNCWQfFURdxjeXJEKicq8gntspG19pBoEPvzV-L4MMvK3ZL1FxmX1AERN0d3GQ14Etb0GnC3ho1Ij2gn_XSc7msrREhY-QNZaN4lTmNLAfJsgTwoaeENnZdEFIYhUddXhGvTjMluIifaoh7yiy4fm_Ai0j4o_Aw4xUJMP6GWhFLfd5MtzW9-oOO9PhfVYkc1LEQ4DnLf7ebCq_UV-3osGW9GegOx0Yb1sNqqJY-dLUt5UT_Wl0K7fV-R2VAtFarHztnze",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDZO0-PzU2md5ZjzU9SC48VabsNDeDaUR0nJ20rqYaIpva2Nh-lmKIfF9jQkUsyEdQ0oJDx_0CbadknmC0OH-vtn4wiCBwsLnydHPTfnqgo2uisAJIP4M3C0sgs9IWs5LnXmhuzG1TKAZ79lTUpTivt_vjLL5iqUCMQn-SeMJMUQAR9nhNzBNq1DzTzVVFhyX0Gljvtgn8LoexGa5pUDuJebmk-ke9ldJZaY1iQsZOowDFhEVg-1TNfvb-lzi2DnVo0mOOYiJMi7E-S",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCH_mVo_WxohoZNudaqL3Pzm95quKkW7mU7cLKLi-QYnJ_08yyoZpsuXI_FgQLgpUXHEzSpbmpc-JnV5ZdElE5skFvXGpAVAGwroieQtkitRQJM6n9307plzPIPe4sY5cvKhxFOTvt0d7xDbQT25h5UfE7v0h6dSFfEKMXHtlK9BQ6BQCvpIqH9S6LLYSHCz5GSyX7WHcxx6diuIqg4ZpsWsiVY8JS5I3Exike1jopJap4GY-t7PV40-W5OdwCkAJ8iPXMzOuh67vru"
          ].map((img, i) => (
            <img key={i} className="h-auto max-w-full rounded-lg hover:scale-[1.02] transition-transform duration-300" alt="Society event" src={img} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
