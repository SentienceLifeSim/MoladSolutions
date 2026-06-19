import Hero from "@/components/Hero";
import AppShowcase from "@/components/AppShowcase";
import ReviewFeed from "@/components/ReviewFeed";
import Services from "@/components/Services";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <AppShowcase />
      <ReviewFeed />
      <Services />
      <About />
      <Footer />
    </main>
  );
}
