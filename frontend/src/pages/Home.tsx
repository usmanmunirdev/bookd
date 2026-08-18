import Header from "@/appComponents/Header"
import WhyChooseSection from "@/appComponents/WhyChooseSection"
import AIFeatureSection from "@/appComponents/AIFeatureSection"
import OurFeatures from "@/appComponents/OurFeatures"
import PlanSection from "@/appComponents/PlanSection"
import Footer from "@/appComponents/Footer"
import { motion } from 'framer-motion';


const Home = () => {
  return (
   <motion.div
      key="home"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 * 0.1 }}
      className="relative"
    >
      <Header />
      <WhyChooseSection />
      <AIFeatureSection />
      <OurFeatures />
      <PlanSection />
      <Footer />
    </motion.div>
  );
}

export default Home
