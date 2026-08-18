import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import backgroundImage from '../assets/background-feauture.png';

const OurFeatures = () => {

    const features = [
        {
            id: "01",
            title: "Voice & Chat Search",
            description:
                "Speak or type to find destinations and the best deals. Our AI delivers accurate, personalized results instantly. Travel planning feels as simple as having a conversation.",
        },
        {
            id: "02",
            title: "Instant Booking",
            description:
                "Reserve flights, hotels, and activities in a few taps. Enjoy secure payments and immediate confirmations. Plan every part of your trip without switching apps.",
        },
        {
            id: "03",
            title: "Set Reminders",
            description:
                "Receive automatic alerts for flights, check-ins, and activities. Stay perfectly on schedule wherever you travel. No more missed departures or last-minute rush.",
        },
        {
            id: "04",
            title: "Personalized Deals",
            description:
                "BOOKD tracks prices and hidden discounts around the clock. Get offers tailored to your preferences and budget. Save more while enjoying your ideal itinerary.",
        },
    ];

 useEffect(() => {
      AOS.init({ duration: 1000, once: false });
    }, []);

    return (
        <section className="our-feature-wrapper relative xl:h-[1200px] h-auto w-full xl:bg-[length:100%_100%] lg:bg-[length:100%_100%] bg-cover bg-center bg-no-repeat text-white xl:py-[70px] lg:py-[60px] md:py-[50px] sm:py-[40px] py-[35px]"
            style={{
                backgroundImage: `url(${backgroundImage})`
            }}>
            <div className="container mx-auto px-4">
                <div className="grid xl:grid-cols-12">
                    <div className="col-span-7 xl:mb-12 lg:mb-10 md:mb-8 sm:mb-6 mb-5" data-aos="zoom-in-right">
                        <h2 className="xl:text-[48px] xl:leading-[54px] lg:text-[40px] lg:leading-[46px] md:text-[35px] md:leading-[41px] sm:text-[30px] sm:leading-[36px] text-[25px] leading-[31px] font-normal font-carien text-white mb-4">
                            Our BOOKD <span className="text-[#D4AF37]">Features</span>
                        </h2>
                        <p className=" xl:text-[20px] lg:text-[18px] md:text-[16px] sm:text-[15px] text-[14px] font-normal font-gowun max-w-[550px]">
                            All the tools you need for effortless travel. Smart, fast, and always connected—powered by BOOKD AI.
                        </p>
                    </div>
                    <div className="col-span-5 xl:mb-12 lg:mb-10 md:mb-8 sm:mb-6 mb-5" data-aos="zoom-out">
                        <ul className="relative p-0">
                            {features.map((item, index) => (
                                <li
                                    key={index}
                                    className="relative before:content-[''] before:absolute before:top-[8px] xl:before:left-[-50px] before:left-[0px] before:w-[23px] before:h-[23px] before:rounded-full before:bg-[#D4AF37] after:content-[''] after:absolute after:top-[31px] xl:after:left-[-39px] after:left-[10px] after:w-[1px] after:h-full after:bg-white xl:pb-[40px] lg:pb-[35px] md:pb-[30px] sm:pb-[25px] pb-[20px] xl:pl-0 pl-[40px]"
                                >
                                    <h4 className="text-[#D4AF37] xl:text-[40px] xl:leading-[44px] lg:text-[35px] lg:leading-[39px] md:text-[30px] md:leading-[34px] sm:text-[25px] sm:leading-[29px] text-[20px] leading-[24px] font-normal font-carien xl:mb-4 lg:mb-4 md:mb-3 sm:mb-3 mb-3">
                                        {item.id}
                                    </h4>
                                    <strong className="text-[#D4AF37] xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-bold font-gowun xl:mb-4 lg:mb-4 md:mb-3 sm:mb-3 mb-3 flex">
                                        {item.title}
                                    </strong>
                                    <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun">
                                        {item.description}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OurFeatures;