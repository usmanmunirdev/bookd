import Header from "@/appComponents/Header";
import Footer from "@/appComponents/Footer";
import { motion } from "framer-motion";
import AboutBanner from "@/appComponents/AboutBanner";
import AboutSection from "@/appComponents/AboutSection";
import JourneySection from "@/appComponents/JourneySection";

const About = () => {
  return (
    <motion.div
      key="about"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 * 0.1 }}
    >
      <div className="relative !bg-white">
        <div className="absolute w-full">
          <Header />
        </div>
        <AboutBanner />
        <AboutSection />
        <JourneySection />
        <Footer />
      </div>
    </motion.div>
  );
};

export default About;