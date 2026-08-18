import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const WhyChooseSection = () => {
  const features = [
    {
      number: '01',
      description: 'All-in-One Travel Assistant',
    },
    {
      number: '02',
      description: 'Voice & Text Booking Options',
    },
    {
      number: '03',
      description: 'Smarter, Faster Decisions',
    },
    {
      number: '04',
      description: 'Voice & Text Booking Options',
    },
  ];
  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  return (
    <section className="bg-[#1C1C1C] text-white py-[40px]">
      <div className="container mx-auto px-4">
        <div className="text-center lg:mb-12 md:mb-8 mb-4">
          <h2 className="xl:text-[48px] lg:text-[40px] md:text-[35px] sm:text-[30px] text-[25px] font-normal font-carien text-white mb-4">
            Why Choose <span className="text-[#D4AF37]">BOOKD</span>
          </h2>
          <p className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun mx-auto">
            From quick reservations to AI-powered search, we streamline every step of your booking journey
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:gap-8 lg:gap-7 md:gap-6 sm:gap-5 gap-2 max-w-[924px] mx-auto" data-aos="fade-right">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col md:p-4 p-2 lg:text-left text-center">
              <div className="xl:text-[40px] lg:text-[35px] md:text-[30px] sm:text-[25px] text-[20px] lg:text-start text-center font-carien text-[#D4AF37] mb-4">
                {feature.number}
              </div>
              <p className="text-gray-400 xl:text-[18px] lg:text-[17px] md:text-[16px] sm:text-[15px] text-[14px] font-gowun font-normal lg:max-w-[135px] max-w-full">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;