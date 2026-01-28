const Mission = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card-elevated p-10 md:p-14 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-sm font-medium text-muted-foreground mb-6">
            Our Mission
          </span>
          <h2 className="serif-headline text-3xl sm:text-4xl md:text-5xl leading-tight mb-6">
            Making the web accessible{" "}
            <span className="italic-accent">for everyone</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We believe digital accessibility shouldn't be an afterthought. Comply empowers businesses to create inclusive experiences while protecting themselves from legal risk. Our AI-powered scanner identifies issues that manual audits miss, giving you the confidence that your website works for every visitor.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Mission;
