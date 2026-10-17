import Hero from "@/components/Hero";
import WhyChooseUs from "@/components/WhyChooseUs";
import PowerfulFeatures from "@/components/PowerfulFeatures";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <WhyChooseUs />
        <PowerfulFeatures />
      </main>
      <Footer />
    </>
  );
}
