import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"
import TipImg from '../assets/tip-img.png';

const TipsAndExpectationsSection: React.FC = () => {
    useEffect(() => {
        AOS.init({ duration: 1000, once: false });
    }, []);

    return (
        <section className="xl:py-[70px] lg:py-[60px] md:py-[50px] sm:py-[40px] py-[35px] px-4 md:px-12">
            <div className="container mx-auto">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-center">
                    <div className="lg:text-left text-center" data-aos="fade-up" data-aos-duration="3000">
                        <h2 className="xl:text-[48px] xl:leading-[54px] lg:text-[40px] lg:leading-[46px] md:text-[35px] md:leading-[41px] sm:text-[30px] sm:leading-[36px] text-[25px] leading-[31px] font-normal font-carien text-black mb-4"> Insider <span className="text-[#D4AF37]">Tips</span></h2>
                        <p className="xl:text-[32px] lg:text-[30px] md:text-[28px] sm:text-[26px] tex-[24px] font-gowun font-normal mb-2 ">For effortless bookings, consider these tips:</p>
                        <p className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun lg:max-w-[349px] max-w-full"> For effortless bookings, be specific—include names, dates, and times (e.g., "Reserve a table for two at Cipriani tomorrow at 7 PM"). Speak naturally; there's no need for rigid phrasing, but avoid ambiguity by using exact venue names.</p>
                    </div>
                    <div className=" flex justify-center items-center">
                        <div className="w-[609px] h-[416px] md:w-[416px] md:h-[609px] w-auto h-auto overflow-hidden rounded-full shadow-lg" data-aos="fade-down" data-aos-easing="linear" data-aos-duration="1500">
                            <img src={TipImg} alt="Couple planning bookings" className="max-w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className='lg:text-end text-center' data-aos="fade-up" data-aos-duration="3000">
                        <h2 className="xl:text-[48px] xl:leading-[54px] lg:text-[40px] lg:leading-[46px] md:text-[35px] md:leading-[41px] sm:text-[30px] sm:leading-[36px] text-[25px] leading-[31px] font-normal font-carien text-black mb-4">
                            What To <span className="text-[#D4AF37]">Expect</span>
                        </h2>
                        <p className="xl:text-[32px] lg:text-[30px] md:text-[28px] sm:text-[26px] tex-[24px] font-normal font-gowun mb-2 ">While BOOKD is powerful, some limitations apply:</p>
                        <div className='flex lg:justify-end justify-center '>
                            <p className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun max-w-[369px]">BOOKD is powerful, yet a few limits remain: some partners may not show real-time availability, in-app payments are still in progress, and unconfirmed bookings will be paired with curated alternatives.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TipsAndExpectationsSection;