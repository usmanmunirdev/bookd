import { useNavigate } from "react-router-dom";

const JourneySection = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="container mx-auto px-4">
        <div className="bg-[#d0aa2b] text-black xl:p-[38px] lg:p-[35px] md:p-[30px] sm:p-[28px] p-[25px] flex flex-col sm:flex-row items-center justify-between rounded-md relative top-[39px] w-full">
          <p className="xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[16px] font-normal font-gowun lg:max-w-[675px] md:max-w-[450px] sm:max-w-[300px] mb-3 sm:mb-0">
            BOOKD evolves with you, integrating smarter AI and new features
            shaped by your feedback.
          </p>
          <button
            onClick={() => navigate("/sign-up")}
            className="bg-white text-blacktext-[13px] lg:text-[14px] xl:text-[16px] cursor-pointer font-gowun py-[14px] border rounded-[6px] px-8 hover:bg-transparent hover:border-[#ffffff] hover:text-white transition"
          >
            Join the Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default JourneySection;
