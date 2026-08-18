import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"
import NeedSection01 from "../assets/need-section-01.png";
import NeedSection02 from "../assets/need-section-02.png";
import NeedSection03 from "../assets/need-section-03.png";
import NeedSection04 from "../assets/need-section-04.png";
import NeedSection05 from "../assets/need-section-05.png";

const NeedToKnowSection: React.FC = () => {

    const needToKnowItems = [

        {
            title: "Dining",
            description: "coveted tables via OpenTable’s premier restaurants",
            image: NeedSection01,
            altText: "Dining",
            maxWidth: "max-w-[400px]"
        },
        {
            title: "Flights",
            description: "Global routes and exclusive fares via Skyscanner",
            image: NeedSection02,
            altText: "Flights",
            maxWidth: "max-w-[326px]"
        },
        {
            title: "Hotels & Resorts",
            description: "Handpicked stays via Booking.com and Expedia",
            image: NeedSection03,
            altText: "Hotels & Resorts",
            maxWidth: "max-w-[326px]"
        },
        {
            title: "Events & Experiences",
            description: "Reminders and RSVPs via Google Calendar",
            image: NeedSection04,
            altText: "Events & Experiences",
            maxWidth: "max-w-[326px]"
        },
        {
            title: "Confirmations",
            description: "SMS and email follow-ups for every detail",
            image: NeedSection05,
            altText: "Confirmations",
            maxWidth: "max-w-[310px]"
        },
        {
            title: "This is just the start",
            description: "We’re expanding to include private car services and curated luxury experiences.",
            isCtaBox: true
        }
    ];
    useEffect(() => {
        AOS.init({ duration: 1000, once: false });
    }, []);


    return (
        <section className="xl:pt-[70px] lg:pt-[60px] md:pt-[50px] sm:pt-[40px] pt-[35px] px-4 md:px-12">
            <div className="container mx-auto">
                <div className="xl:mb-[50px] lg:mb-[45px] md:mb-[40px] sm:mb-[35px] mb-[30px]">
                    <div className="flex justify-center mb-0">
                        <div className="h-[8px] w-[117px] bg-[#C4A64E] mb-4 text-center"></div>
                    </div>
                    <h2 className="xl:text-[48px] lg:text-[38px] md:text-[35px] sm:text-[30px] text-[25px] font-normal font-carien md:mb-4 mb-2 text-center">What BOOKD Can Arrange</h2>
                    <p className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun w-full text-center">Your AI concierge excels at securing:</p>
                </div>
                <div className="grid xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-[20px]">
                    {needToKnowItems.map((item, index) => (
                        <div key={index}>
                            {!item.isCtaBox ? (
                                <div className="relative rounded-xl overflow-hidden group cursor-pointer" data-aos="zoom-in">
                                    <div className="h-auto w-auto">
                                        <img
                                            src={item.image}
                                            alt={item.altText}
                                            className="w-full h-full object-cover transition-transform duration-500"
                                        />
                                    </div>
                                    <div className={"absolute inset-0 flex flex-col justify-end items-start p-6 text-white transition-all duration-500 " + " bg-transparent group-hover:bg-[rgba(212,175,55,0.70)]"}>
                                        <h3 className="xl:text-[32px] lg:text-[31px] md:text-[30px] sm:text-[29px] tex-[28px] font-normal mb-2 text-gray-800 text-black opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                            {item.title}
                                        </h3>
                                        <p className={`xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun text-black opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 ${item.maxWidth}`}>
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-400 p-8 rounded-lg w-full h-full">
                                    <div className="flex justify-center items-center h-full">
                                        <div className="text-center">
                                            <h2 className=" xl:text-[40px] xl:leading-[44px] lg:text-[35px] lg:leading-[39px] md:text-[30px] md:leading-[34px] sm:text-[25px] sm:leading-[29px] text-[20px] leading-[24px] font-normal font-carien mb-3 sm:max-w-[250px] max-w-[150px] mx-auto uppercase" data-aos="zoom-in-down">
                                                {item.title}
                                            </h2>
                                            <p className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun text-black sm:max-w-[320px] max-w-[200px] mx-auto" data-aos="zoom-out">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NeedToKnowSection;