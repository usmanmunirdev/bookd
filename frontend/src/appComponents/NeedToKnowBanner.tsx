import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"
import NeedBannerImg from "../assets/need-banner.png";

const NeedToKnowBanner: React.FC = () => {
    useEffect(() => {
        AOS.init({ duration: 1000, once: false });
    }, []);

    return (
        <div className="bg-cover bg-no-repeat  xl:h-[567px] lg:h-[520px] md:h-[500px] sm:h-[480px] h-[450px] flex items-center justify-center text-center text-white py-[40px] relative"
            style={{
                backgroundImage: `url(${NeedBannerImg})`,
            }}
        >
            <div className="container mx-auto px-4">
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.70)]"></div>
                <div className="relative top-[50px] z-10">
                    <h1 className="text-white font-carien xl:text-[58px] xl:leading-[62px] lg:text-[50px] lg:leading-[54px] md:text-[40px] md:leading-[44px] sm:text-[35px] sm:leading-[39px] text-[30px] leading-[34px]  font-normal  mb-4" data-aos="flip-left">Welcome To The Inner Circle</h1>
                    <p className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun mx-auto max-w-[965px]" data-aos="flip-up">
                        Think of this as your private concierge’s welcome packet—a curated guide to unlocking the most seamless, elevated booking experience with BOOKD
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NeedToKnowBanner;
