  import { MoveRight } from "lucide-react";
  import section2 from "../assets/section2.png";

  const Section2 = () => {
    return (
      <div className="bg-black w-full min-h-screen flex flex-col justify-center items-center">
        <div className="container mx-auto px-6 md:px-20 flex flex-col-reverse lg:flex-row items-center justify-center gap-10">
          <div className="w-full xl:w-1/2 text-center lg:text-left">
            <h1 className="font-normal text-[30px] leading-[35px] uppercase text-[white]">
              AI for Flights, Hotels & Travel Reminders — Simple & Smart
            </h1>

            <p className="text-[12px]  not-italic mt-5 leading-[25px] text-[#CAC9D1]">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged.
            </p>

            <div className="text-white flex justify-center md:justify-start px-7 items-center w-[160px] h-[50px] opacity-100 rounded-[44px] border border-[#A4A4A4] text-[13px] mt-18 mx-auto lg:mx-0 cursor-pointer">
              <button>Learn More</button>
              <MoveRight size={14} className="ml-5" />
            </div>
          </div>

        
          <div className="w-full lg:w-auto flex justify-center">
            <img
              src={section2}
              alt="Flight Booking"
              className="w-full max-w-[700px] h-auto md:h-[450px] object-contain"
            />
          </div>
         
        </div>
    
      </div>
    );
  };

  export default Section2;
