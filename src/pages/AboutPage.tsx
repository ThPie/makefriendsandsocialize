const AboutPage = () => {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      {/* Hero */}
      <section 
        className="w-full min-h-[480px] flex flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center px-6 py-20 text-center" 
        style={{
          backgroundImage: 'linear-gradient(rgba(20, 57, 59, 0.3) 0%, rgba(20, 57, 59, 0.7) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuD8-F3RY9H5cqEv7-lZOpcYmt4E5bLYfLDW5gCw3Bz2tS0M1tJY_stkdmb3tg_U2mBg8BCNImMzNg1-bw1YUJyKJgp9-XRGw6bslt88e3BZWh8JDxfxmiRHJ0XGnNSsfmNYWFVIN9Ntq7kMOH8BSBLDcygmOmq1KImEma6iU3IkxdZcYBvSDfNHKtW2024ILgRsPr1zqBao9VjQgYkg2D9Zy9137MbsF4D3A2AiKgy1i1SHQ4Jp_jb3gKarxjHqlbPUEDUaPdh5x-XO")'
        }}
      >
        <div className="flex flex-col gap-2 max-w-[800px]">
          <h1 className="text-white text-4xl font-black font-display leading-tight tracking-tight md:text-5xl drop-shadow-md">
            Cultivating Connections, Celebrating Moments.
          </h1>
          <p className="text-white/90 text-sm font-normal leading-normal md:text-base max-w-2xl mx-auto drop-shadow-sm">
            Welcome to The Gathering Society, where exclusive events and meaningful connections create unforgettable experiences.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 md:py-20 w-full max-w-[1440px] px-4">
        <h2 className="text-foreground text-3xl font-bold leading-tight tracking-tight pb-4 font-display">Our Story</h2>
        <p className="text-muted-foreground text-lg font-normal leading-relaxed">
          Founded on the principles of community and celebration, The Gathering Society began as a small assembly of like-minded individuals with a shared passion for culture, conversation, and connection. Over the years, it has blossomed into a premier club dedicated to fostering lasting relationships through meticulously curated events, each designed to be a memorable chapter in our collective story.
        </p>
      </section>

      {/* Timeline */}
      <section className="py-12 md:py-20 w-full max-w-[1440px] px-4">
        <h2 className="text-foreground text-3xl font-bold leading-tight tracking-tight pb-8 font-display">Our Journey</h2>
        <div className="grid grid-cols-[auto_1fr] gap-x-6">
          {[
            { icon: 'nightlife', title: 'The Founding Year', desc: 'Our humble beginnings in a historic townhouse, establishing a new standard for social assembly.' },
            { icon: 'celebration', title: 'First Annual Gala', desc: 'A night of splendor that set the standard for all future celebrations.' },
            { icon: 'groups', title: 'Expanded to New Horizons', desc: 'Opening our doors to a wider community of connoisseurs.' }
          ].map((item, idx) => (
            <div key={idx} className="contents">
              <div className="flex flex-col items-center gap-1 pt-1">
                {idx > 0 && <div className="w-[2px] bg-border h-4" />}
                <div className="text-foreground text-2xl bg-primary/20 p-2 rounded-full">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                {idx < 2 && <div className="w-[2px] bg-border h-full grow min-h-[40px]" />}
              </div>
              <div className={`flex flex-1 flex-col ${idx > 0 ? 'pt-4' : ''} pb-10`}>
                <p className="text-foreground text-lg font-medium leading-normal font-display">{item.title}</p>
                <p className="text-muted-foreground text-base font-normal leading-normal mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-20 w-full max-w-[1440px] px-4">
        <h2 className="text-foreground text-3xl font-bold leading-tight tracking-tight pb-8 text-center font-display">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: 'diversity_3', title: 'Community', desc: 'Fostering a sense of belonging and building meaningful, lasting relationships among members.' },
            { icon: 'workspace_premium', title: 'Excellence', desc: 'Committing to the highest standards in every event we curate and every service we provide.' },
            { icon: 'lock', title: 'Discretion', desc: 'Upholding the utmost privacy and creating a trusted environment for all our members.' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-8 bg-card border border-border rounded-xl hover:shadow-md transition-shadow">
              <div className="p-3 mb-4 bg-primary/20 rounded-full text-primary">
                <span className="material-symbols-outlined text-4xl">{item.icon}</span>
              </div>
              <h3 className="text-foreground text-xl font-bold mb-3 font-display">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="py-12 md:py-20 w-full max-w-[1440px] px-4">
        <h2 className="text-foreground text-3xl font-bold leading-tight tracking-tight pb-8 text-center font-display">The Experience</h2>
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
