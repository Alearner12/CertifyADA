import { Search, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Deep Scanning",
    description: "Comprehensive analysis of every page, element, and interaction on your website for WCAG compliance.",
  },
  {
    icon: Shield,
    title: "Legal Protection",
    description: "Stay ahead of ADA lawsuits with proactive compliance monitoring and detailed remediation reports.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get actionable insights within minutes, not days. Prioritized issues with clear fix instructions.",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-elevated p-8 opacity-0 animate-fade-in-up group hover:shadow-soft transition-shadow duration-300"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-5 group-hover:bg-primary/5 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="serif-headline text-2xl mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
