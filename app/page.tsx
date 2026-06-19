import Hero from "@/components/Hero";
import AppShowcase from "@/components/AppShowcase";
import ReviewFeed from "@/components/ReviewFeed";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <AppShowcase />
      <ReviewFeed />
      <About />
      <Footer />
    </main>
  );
}
