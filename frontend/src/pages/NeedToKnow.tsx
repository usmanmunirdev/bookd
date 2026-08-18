import Header from "@/appComponents/Header";
import Footer from "@/appComponents/Footer";
import { motion } from "framer-motion";
import JourneySection from "@/appComponents/JourneySection";
import NeedToKnowBanner from "@/appComponents/NeedToKnowBanner";
import NeedToKnowSection from "@/appComponents/NeedToKnowSection.tsx";
import TipsAndExpectationsSection from "@/appComponents/TipsAndExpectationsSection";
import PrivacySection from "@/appComponents/PrivacySection";

const NeedToKnow = () => {
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
        <NeedToKnowBanner />
        <NeedToKnowSection />
        <TipsAndExpectationsSection />
        <PrivacySection />
        <JourneySection />
        <Footer />
      </div>
    </motion.div>
  );
};

export default NeedToKnow;



