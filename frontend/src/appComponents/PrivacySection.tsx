import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"
import MobileImg from '../assets/mobile-img.png';

const PrivacySection: React.FC = () => {
    useEffect(() => {
        AOS.init({ duration: 1000, once: false });
    }, []);
    return (
        <section className='bg-[#1C1C1C] px-4 md:px-12 xl:pt-[70px] lg:pt-[60px] md:pt-[50px] sm:pt-[40px] pt-[35px]'>
            <div className="container mx-auto ">
                <div className="grid grid-cols-12 items-center xl:gap-10 lg:gap-8 md:gap-6 sm:gap-4 gap-2">
                    <div className="col-span-12 lg:col-span-7 lg:text-left xl:pb-[70px] lg:pb-[60px] md:pb-[50px] sm:pb-[40px] pb-[35px]">
                        <div className="h-[8px] w-[117px] bg-[#C4A64E] mb-4 text-center mx-auto lg:mx-0"></div>
                        <h2 className="xl:text-[99px] xl:leading-[120px] lg:text-[80px] md:text-[60px] md:leading-[70px] sm:text-[40px] sm:leading-[50px] text-[30px] leading-[40px]  font-normal font-carien mb-4 text-white lg:text-left text-center" data-aos="zoom-in-down">Your Privacy,<br />Always</h2>
                        <p className="xl:text-[32px] lg:text-[28px] md:text-[26px] sm:text-[22px] text-[18px] font-normal mb-2 text-white font-gowun lg:max-w-[715px] max-w-full lg:text-left text-center" data-aos="zoom-in-down"> Discretion is our promise. We store only essential details for your reservations—nothing more. Your conversations are private, never shared or sold.</p>
                    </div>
                    <div className="col-span-12 lg:col-span-5 flex justify-center">
                        <div className="relative xl:h-[529px] lg-[480px] h-auto xl:w-[432px] lg-[400px] w-auto overflow-hidden flex flex-col justify-between " data-aos="flip-up">
                            <img src={MobileImg} alt="mobile img" className="max-w-full h-auto object-cover" />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default PrivacySection;