import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ContactPage = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you within 48 hours.",
    });
  };

  return (
    <div className="flex-grow flex flex-col items-center">
      {/* Hero */}
      <div 
        className="w-full min-h-[400px] flex flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center px-6 py-20 text-center" 
        style={{backgroundImage: 'linear-gradient(rgba(20, 57, 59, 0.2) 0%, rgba(20, 57, 59, 0.4) 100%), url("https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=2669&auto=format&fit=crop")'}}
      >
        <div className="flex flex-col gap-2 max-w-[800px]">
          <h1 className="text-white text-4xl font-black leading-tight tracking-tight md:text-5xl font-display">Connect With The Society</h1>
          <p className="text-white/80 text-sm font-normal leading-normal md:text-base">We welcome your inquiries. Please use the information below to get in touch.</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 px-6 md:px-10 w-full max-w-[1440px] mx-auto mb-20">
        {/* Contact Info */}
        <div>
          <h2 className="text-foreground text-xl font-bold leading-tight tracking-tight font-display pb-3 pt-5">Direct Inquiries</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            {[
              { label: 'General Inquiries', value: 'contact@gatheringsociety.com' },
              { label: 'Phone', value: '+1 (234) 567-890' },
              { label: 'Membership', value: 'membership@gatheringsociety.com' },
              { label: 'Private Events', value: 'events@gatheringsociety.com' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-1 border-t border-primary/30 py-4">
                <p className="text-muted-foreground text-sm font-normal leading-normal">{item.label}</p>
                <p className="text-foreground text-sm font-normal leading-normal">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-primary/30 py-4 flex flex-col gap-1">
            <p className="text-muted-foreground text-sm font-normal leading-normal">Address</p>
            <p className="text-foreground text-sm font-normal leading-normal">123 Luxury Lane, Prestige City, 10101</p>
          </div>
          
          <h2 className="text-foreground text-xl font-bold leading-tight tracking-tight font-display pb-3 pt-10">Follow Our Journey</h2>
          <div className="flex items-center gap-4 py-4 border-t border-primary/30">
            {['LinkedIn', 'Instagram', 'Twitter'].map((social, i) => (
              <a key={i} className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium" href="#">
                {social}
              </a>
            ))}
          </div>
        </div>

        {/* Form */}
        <div>
          <h2 className="text-foreground text-xl font-bold leading-tight tracking-tight font-display pb-3 pt-5">Send Us a Message</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium leading-6 text-muted-foreground" htmlFor="full-name">Full Name</label>
              <div className="mt-2">
                <input 
                  className="block w-full rounded-md border-0 py-2.5 px-3 bg-muted text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary text-sm" 
                  id="full-name" 
                  name="full-name" 
                  type="text"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium leading-6 text-muted-foreground" htmlFor="email">Email Address</label>
              <div className="mt-2">
                <input 
                  className="block w-full rounded-md border-0 py-2.5 px-3 bg-muted text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary text-sm" 
                  id="email" 
                  name="email" 
                  type="email"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium leading-6 text-muted-foreground" htmlFor="inquiry-type">Inquiry Regarding</label>
              <div className="mt-2">
                <select 
                  className="block w-full rounded-md border-0 py-2.5 px-3 bg-muted text-foreground shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary text-sm" 
                  id="inquiry-type" 
                  name="inquiry-type"
                >
                  <option>Membership</option>
                  <option>Private Events</option>
                  <option>Partnership</option>
                  <option>General Inquiry</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium leading-6 text-muted-foreground" htmlFor="message">Message</label>
              <div className="mt-2">
                <textarea 
                  className="block w-full rounded-md border-0 py-2.5 px-3 bg-muted text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary text-sm" 
                  id="message" 
                  name="message" 
                  rows={4}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
