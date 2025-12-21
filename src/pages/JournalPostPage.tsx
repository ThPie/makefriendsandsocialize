import { Link } from 'react-router-dom';

const JournalPostPage = () => {
  return (
    <div className="flex-1 w-full flex flex-col items-center px-4 md:px-10 py-12 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex flex-wrap gap-2 pb-8 w-full max-w-3xl">
        <Link to="/" className="text-primary/70 text-sm font-medium leading-normal hover:text-primary transition-colors">Home</Link>
        <span className="text-primary/70 text-sm font-medium leading-normal">/</span>
        <Link to="/journal" className="text-primary/70 text-sm font-medium leading-normal hover:text-primary transition-colors">Journal</Link>
        <span className="text-primary/70 text-sm font-medium leading-normal">/</span>
        <span className="text-foreground text-sm font-medium leading-normal">An Evening of Elegance</span>
      </div>

      <article className="w-full max-w-3xl">
        <h1 className="text-foreground tracking-tight text-4xl md:text-5xl font-display font-bold leading-tight text-center pb-3">
          An Evening of Elegance: The Annual Gala Recap
        </h1>
        <p className="text-primary/80 text-base font-normal leading-normal text-center pb-8 pt-2">
          By Eleanor Vance • Published on August 22, 2024 • 8 min read
        </p>
        
        {/* Hero Image */}
        <div className="my-6">
          <div 
            className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl min-h-[450px]" 
            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA6g8cGFl6jvXPEFbkqzisYbGqoRw_ATi-Mc7kLiyhXvEGXZ_axtKm6HN-O_V22r4aYFkpHo7NwLLiocIeWgqeK0meH5vzR-i3Oc-fFr_vx8_5UgACnJLw5toZ1IZbSnsJQwmrKdx_bAp9-SOXJysID90uzR4M5d8VaT9MKOfCjer82o0FAxpRfRKolablpcF_1umm2Lhl5MMyUYEK7HBGJrroUwnn_j3m89mE9MG5LDtprpVmW0tq8fpseGqVsFn0YyEqcswAVIfwc")'}}
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none mx-auto text-muted-foreground font-light leading-relaxed">
          <p className="text-xl text-foreground">
            The air buzzed with anticipation. Crystal chandeliers cast a warm, golden glow across the Grand Ballroom, reflecting in the polished marble floors and the sparkling jewels of our esteemed members. The Annual Gala, our society's most anticipated event, was an evening that surpassed all expectations.
          </p>
          <br/>
          <p>
            From the moment guests arrived, they were enveloped in an atmosphere of sophistication. A string quartet played softly in the foyer as members mingled, champagne flutes in hand. The theme for the evening, "A Night Under the Stars," was brought to life with celestial decorations and a deep, midnight-blue color palette accented with shimmering gold.
          </p>
          
          <blockquote className="border-l-4 border-primary pl-6 py-2 my-10 italic">
            <p className="font-display text-2xl text-foreground">"It wasn't just an event; it was an experience. A perfectly orchestrated symphony of fine dining, captivating conversations, and unforgettable moments."</p>
            <cite className="text-primary/80 not-italic block mt-2">— A distinguished member</cite>
          </blockquote>

          <h3 className="font-display text-3xl text-foreground font-bold mt-12 mb-4">A Culinary Journey</h3>
          <p>
            The culinary experience, curated by renowned Chef Julian Dubois, was nothing short of extraordinary. The five-course meal was a journey for the senses, each dish paired with a rare vintage from our society's private cellar. Highlights included the seared scallops with saffron risotto and the exquisitely tender Wagyu beef.
          </p>
          
          <div className="my-10">
            <div 
              className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl min-h-96" 
              style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCrP8APY7AwVzt_39e96DD1YhvoyyeWl2OyEvjXGtcfwXkBdV6jlTw31ogrtcR7vb5K2aYAmNlAqIvNOimwz2ClO0w-1Q6SI5hBM-mLpssXh9lTvPgkTwAogRs_wrPeC_88mdBz6krwX9c6jtuGf4Cnbrh2FRqWElA8rNWcnwkXZDKHEVc9ejHj_UpFeKo7naAmNCrpiry2XGbEHv5pIJE5LOsJsFMZAns9QLfen8vnqolyv6oiygy8De96DKWiyTBEdLiIELHr5BTM")'}}
            />
          </div>

          <p>
            The evening culminated in a dazzling dessert buffet, a masterpiece of confectionery art. As the night drew to a close, the dance floor filled, with members swaying to the timeless melodies of a live jazz orchestra. It was a perfect ending to an evening dedicated to celebrating connection and creating lasting memories.
          </p>
        </div>

        {/* Share */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-12 pt-8 border-t border-border">
          <h3 className="text-foreground font-display text-xl">Share This Story</h3>
          <div className="flex items-center gap-3">
            {['link', 'mail', 'share'].map((icon, i) => (
              <button key={i} className="flex items-center justify-center size-12 bg-transparent border border-primary/40 rounded-full text-primary/70 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                <span className="material-symbols-outlined">{icon}</span>
              </button>
            ))}
          </div>
        </div>
      </article>

      {/* Related */}
      <section className="mt-20 w-full max-w-5xl">
        <h2 className="text-4xl font-display font-bold text-foreground text-center mb-10">Related Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: "Recap: The Annual Charity Auction", desc: "An unforgettable evening of generosity.", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6ttDLHpt5UQwyFyG2KSvh1MRTJw4LOTlses4EJ2ydnenIxhJfg7WMrDV9FFPip2PWDoHiE_qTzeBZUaxv8htFE34bbqa-_bKUS_V2b3iinsLjMAZbPgEioxKguOrj_Lcdec5ZYgAi-xSxHqG4PPEtIf1TLnpVjaMVXdmA2sAAXCHNJEqLxJMWlFdzFvvrH224aIoAWTqGOpTjUVHbzxTHdFLWdXaKy_C6Qgu-ifBqSHS-wTM73ux9EoTT5IiuukpsXn-YYhl32l3J" },
            { title: "An Interview with Our Sommelier", desc: "Discover our exclusive wine collection.", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9rVO2wlCx3QnGuueTaE7_MbH-pwB2BQ5-U1wBN1u4TBlw12gC-VwDLCWKHlSYszsRPQZUTR_LGWoN0EapzpkWxHtXvXswoaaeKPRscWL5kd9Ppku56nhQp8o_lx7rHVWcCjtfH4WeO0idEmmjkK0bI6NFWJmAQI2iFP9mgeqBn2e80_l7-mHFnd9U6s793yhhyPjkf0GAUIw-xV-2b6CTg32ODERc8Ao4MLHQZKcr1SrawFdSlXy4HW3MOl6lTkgOsaYjm-L_u8-S" }
          ].map((post, i) => (
            <Link key={i} to="/journal/1" className="flex flex-col group cursor-pointer">
              <div className="overflow-hidden rounded-lg">
                <div className="w-full bg-center bg-no-repeat bg-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: `url("${post.image}")`}} />
              </div>
              <h3 className="text-foreground text-2xl font-display font-bold mt-4 mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
              <p className="text-muted-foreground text-sm">{post.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JournalPostPage;
