import { useState } from "react";
import { toast } from "sonner";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success("You're on the list! We'll be in touch soon.");
    setEmail("");
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-4 pt-20 pb-16">
      {/* Cloud gradients */}
      <div className="cloud-gradient-tl fixed inset-0 pointer-events-none" />
      <div className="cloud-gradient-tr fixed inset-0 pointer-events-none" />
      <div className="cloud-gradient-br fixed inset-0 pointer-events-none" />
      
      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/50 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-muted-foreground font-medium">Coming Soon</span>
        </div>

        {/* Headline */}
        <h1 
          className="serif-headline text-5xl sm:text-6xl md:text-7xl leading-[1.1] mb-6 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          Scan Your Website for{" "}
          <span className="italic-accent">ADA Compliance</span>
        </h1>

        {/* Subheadline */}
        <p 
          className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 opacity-0 animate-fade-in-up font-sans"
          style={{ animationDelay: "0.2s" }}
        >
          Comply helps agencies and businesses identify accessibility issues before they become costly legal problems.
        </p>

        {/* Email signup form */}
        <form 
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="relative w-full sm:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-pill w-full sm:w-80 text-base shadow-soft"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-pill btn-primary w-full sm:w-auto whitespace-nowrap disabled:opacity-70"
          >
            {isLoading ? "Joining..." : "Join Waitlist"}
          </button>
        </form>

        {/* Social proof */}
        <div 
          className="flex items-center justify-center gap-3 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex -space-x-3">
            {[
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            ].map((src, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-background overflow-hidden"
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Join <span className="font-semibold text-foreground">500+</span> agencies & businesses
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
