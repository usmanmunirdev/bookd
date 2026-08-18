import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="flex items-center animate-fadeIn">
      <p className=" w-[10px] h-[10px] xl:text-[24px] lg:text-[22px] md:text-[20px] sm:text-[18px] text-[13px] font-normal font-gowun text-white animate-pulse whitespace-nowrap">
        BOOKD is thinking…
      </p>
      {/* <div className="w-[10px] h-[10px] rounded-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] animate-loaderGold" /> */}
    </div>
  );
};

export default Loader;
