import { useEffect } from "react";
import AboutSection01 from "../assets/banner-section-01.png";
import AboutSection02 from "../assets/banner-section-02.png";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const AboutSection: React.FC = () => {
  const navigate = useNavigate();

  const points = [
    "Reserve a table at Nobu for 8 PM.",
    "Find a flight to Paris this Friday.",
    "Schedule a call with Sarah at 3 PM.",
  ];
  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);

  return (
    <section className="xl:pt-[70px] lg:pt-[60px] md:pt-[50px] sm:pt-[40px] pt-[35px] px-4 md:px-12">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-center xl:mb-[70px] lg:mb-[60px] md:mb-[50px] sm:mb-[40px] mb-[35px]">
          <div className="flex justify-center">
            <div
              className="xl:h-[742] xl:w-[613px] lg:h-[742] lg:w-[613px] h-auto w-auto"
              data-aos="fade-right"
              data-aos-offset="100"
              data-aos-easing="ease-in-sine"
            >
              <img
                src={AboutSection01}
                alt="Luxury Pool View"
                className="max-w-full h-auto"
              />
            </div>
          </div>
          <div
            className="space-y-5 text-[#222] lg:ml-[60px]"
            data-aos="fade-left"
            data-aos-offset="100"
            data-aos-easing="ease-in-sine"
          >
            <div className="h-[8px] w-[117px] bg-[#C4A64E] mb-4"></div>
            <h2 className="xl:text-[48px] lg:text-[38px] md:text-[35px] sm:text-[30px] text-[25px] font-normal font-carien mb-4">
              Why We Built BOOKD <br /> And Our Mission
            </h2>
            <p className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun w-full">
              Time is your greatest luxury. Tired of outdated booking processes,
              endless searches and clunky forms. We created BOOKD to fuse
              conversational AI with sophistication and efficiency, acting as
              your trusted assistant.
            </p>
            <div>
              <p className="xl:text-[32px] lg:text-[31px] md:text-[30px] sm:text-[29px] tex-[28px] font-normal mb-2 text-gray-800">
                Simply say:
              </p>
              <ul className="space-y-2 text-gray-700">
                {points.map((point, index) => (
                  <li
                    key={index}
                    className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun"
                  >
                    – {point}
                  </li>
                ))}
              </ul>
            </div>
            <p className="xl:text-[28px] lg:text-[26px] md:text-[24px] sm:text-[20px] text-[16px] font-normal font-gowun">
              {" "}
              BOOKD listens, Understands, and Delivers Flawlessly.
            </p>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center order-1 lg:order-2">
            <div
              className="xl:h-[742] xl:w-[613px] lg:h-[742] lg:w-[613px] h-auto w-auto "
              data-aos="fade-up-right"
              data-aos-offset="100"
              data-aos-easing="ease-in-sine"
            >
              <img
                src={AboutSection02}
                alt="Luxury Pool View"
                className="max-w-full h-auto"
              />
            </div>
          </div>
          <div
            className="space-y-5 text-[#222] lg:ml-[60px] order-2 lg:order-1"
            data-aos="fade-right"
            data-aos-offset="100"
            data-aos-easing="ease-in-sine"
          >
            <div className="h-[8px] w-[117px] bg-[#C4A64E] mb-4 mx-auto lg:mx-0"></div>
            <h2 className="xl:text-[48px] lg:text-[38px] md:text-[35px] sm:text-[30px] text-[25px] font-normal font-carien mb-4 lg:text-left text-center">
              A Refined Experience{" "}
            </h2>
            <p className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun w-full lg:text-left text-center">
              Time is your greatest luxury. Tired of outdated booking processes,
              endless searches and clunky forms. We created BOOKD to fuse
              conversational AI with sophistication and efficiency, acting as
              your trusted assistant.
            </p>
            <div className="lg:text-left text-center">
              <button
                onClick={() => navigate("/sign-up")}
                className="bg-[#D4AF37] hover:bg-yellow-600 text-black text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] py-3 px-8 rounded-full font-gowun transition duration-300 ease-in-out self-start cursor-pointer"
              >
                Let's Experience
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
