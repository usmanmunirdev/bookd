import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"
import AboutBannerImg from "../assets/about-banner.png";

const AboutBanner: React.FC = () => {
     useEffect(() => {
              AOS.init({ duration: 1000, once: false });
            }, []);

    return (
        <div className="bg-cover bg-no-repeat xl:h-[567px] lg:h-[520px] md:h-[500px] sm:h-[480px] h-[450px] flex items-center justify-center text-center text-white py-[40px] relative"
            style={{
                backgroundImage: `url(${AboutBannerImg})`,
            }}
        >
            <div className="container mx-auto px-4">
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.70)]"></div>
                <div className="relative top-[50px] z-10">
                    <h1 className="text-white font-carien xl:text-[58px] xl:leading-[62px] lg:text-[50px] lg:leading-[54px] md:text-[40px] md:leading-[44px] sm:text-[35px] sm:leading-[39px] text-[30px] leading-[34px]  font-normal  mb-4"  data-aos="fade-up">Your Luxury AI Concierge</h1>
                    <p className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun mx-auto max-w-[965px]" data-aos="fade-left">
                        BOOKD redefines booking tools, offering seamless access to extraordinary experiences. Whether reserving a table at a world-class restaurant, arranging a stylish flight, or setting a reminder, BOOKD delivers effortless, intelligent solutions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutBanner;
