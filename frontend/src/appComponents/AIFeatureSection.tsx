import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import FeautureImg from "../assets/feauture-img.png";

const AIFeatureSection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: false });
  }, []);
  return (
    <section className="bg-gray-100 xl:py-[70px] lg:py-[60px] md:py-[50px] sm:py-[40px] py-[35px]">
      <div className="max-w-[1280px] m-auto px-4">
        <div className="xl:flex block flex-col lg:flex-row items-stretch justify-end relative mx-auto">
          <div
            className="xl:absolute static xl:top-1/2 lg:top-0 xl:left-0 xl:-translate-y-1/2 xl:h-[633px] xl:w-[519px] w-full lg:h-[500px] h-[400px] mb-0 mx-auto mb-lg-0 mb-5 z-[9]"
            data-aos="fade-right"
            data-aos-offset="100"
            data-aos-easing="ease-in-sine"
          >
            <img
              src={FeautureImg}
              alt="AI for Flights and Travel"
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className="xl:max-w-[925px] max-w-full xl:p-16 lg:p-12 md:p-10 sm:p-8 p-5 flex flex-col justify-center bg-[#D9D9D9] xl:pl-[270px] lg:pl-[40px] xl:h-[707px] h-auto"
            data-aos="fade-left"
            data-aos-offset="100"
            data-aos-easing="ease-in-sine"
          >
            <h2 className="xl:text-[48px] xl:leading-[54px] lg:text-[40px] lg:leading-[46px] md:text-[35px] md:leading-[41px] sm:text-[30px] sm:leading-[36px] text-[25px] leading-[31px] text-black mb-6 xl:max-w-[600px] lg:max-w-[500px] md:max-w-[400px] sm:max-w-[350px] max-w-[300px]">
              AI for Flights, Hotels & Travel{" "}
              <span className="text-[#D4AF37]"> Simple & Smart</span>
            </h2>
            <p className="text-gray-600 xl:text-[20px] lg:text-[18px] md:text-[16px] sm:text-[15px] text-[14px] font-normal font-gowun mb-[30px]">
              BOOKD's intelligent assistant finds the best flights and stays in
              seconds. It tracks prices, sends real-time alerts, and reminds you
              of every key step. Plan less, travel more, and let AI keep your
              journey stress-free. Get personalized suggestions based on your
              preferences and travel history. Stay updated with instant
              notifications for any changes along the way.
            </p>
            <button
              onClick={() => navigate("/sign-up")}
              className="bg-[#D4AF37] hover:bg-yellow-600 text-black text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] py-3 px-8 rounded-full font-gowun transition duration-300 ease-in-out self-start cursor-pointer"
            >
              Let's Experience
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIFeatureSection;
