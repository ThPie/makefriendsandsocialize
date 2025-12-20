import type { Benefit } from '@/types';

const benefits: Benefit[] = [
  {
    id: 'access',
    title: 'Exclusive Access',
    description: 'Gain entry to our private, members-only events, from intimate soirées to grand galas, held in the most sought-after venues.',
    iconName: 'celebration',
  },
  {
    id: 'networking',
    title: 'Curated Networking',
    description: 'Connect with a diverse and influential community of leaders, innovators, and connoisseurs from various fields.',
    iconName: 'groups',
  },
  {
    id: 'experiences',
    title: 'Bespoke Experiences',
    description: 'Enjoy meticulously planned experiences that cater to a refined palate, from gourmet dining to unique cultural engagements.',
    iconName: 'auto_awesome',
  },
];

export const MembershipSection = () => {
  return (
    <section className="mb-12 w-full px-6 md:mb-20 md:px-10" id="membership">
      <div className="mx-auto max-w-[1440px]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
            The Privileges of Membership
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Joining The Gathering Society opens the door to a world of unparalleled
            experiences and connections.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="flex flex-col items-center gap-4 text-center group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <span className="material-symbols-outlined text-3xl">
                  {benefit.iconName}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
