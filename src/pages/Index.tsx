import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Mission from "@/components/Mission";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />
      <main>
        <Hero />
        <div id="features">
          <Features />
        </div>
        <div id="about">
          <Mission />
        </div>
        <div id="faq">
          <FAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
