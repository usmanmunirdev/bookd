import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import slide from "../../src/assets/firstSlide.jpg";

import reminders from "../assets/reminders.jpg";
import hotel from "../assets/hotelBookings.jpg";
import { Autoplay } from 'swiper/modules';

export default function CustomSlider() {
  const slides = [
    { title: "SET REMINDERS", image: reminders },
    { title: "HOTELS BOOKING", image: hotel },
    { title: "FLIGHT BOOKING", image: slide },
  ];

  return (
    <div className="bg-black w-full flex justify-center items-center">
      <div className="w-full px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20">
        <Swiper
          modules={[Autoplay]}
          slidesPerView={1.3}
          spaceBetween={25}
          loop={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
            reverseDirection:true
          
          }}
          allowTouchMove={false}
          centeredSlides={true}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 1.3,
              spaceBetween: 20,
            },
          }}
        >
          {slides.map((data, index) => (
            <SwiperSlide key={index}>
              <div className="group my-10 relative h-[200px] sm:h-[300px] md:h-[350px] w-full max-w-[600px] sm:max-w-[750px] md:max-w-[950px] rounded-[9999px] border-2 flex justify-center items-center border-[#262626] opacity-100 mx-auto">
                <img
                  src={`${data.image}`}
                  alt=""
                  className="rounded-full h-[150px] w-[150px] sm:h-[180px] sm:w-[180px] md:h-[200px] md:w-[200px] transition-all duration-500 ease-in-out group-hover:h-full group-hover:w-full"
                />
                <h1 className="font-inter absolute text-center px-2 text-[40px] sm:text-[70px] md:text-[110.19px] leading-[100%] tracking-[0%] text-white">
                  {data.title}
                </h1>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
