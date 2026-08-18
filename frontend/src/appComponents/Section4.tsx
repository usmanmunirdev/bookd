import { MoveRight } from "lucide-react";
import sectionOne from '../assets/sec4one.png'
import sectiontwo from '../assets/sec4two.mp4'
import sectionThree from '../assets/sec4three.png'
import sectionFour from "../assets/sec4.mp4";
import { useState } from "react";
import music from '../assets/music.png'
import arrrow from '../assets/Arrow 5.png'

type MediaItem = { type: "image" | "video"; src: string };

const Section4 = () => {
  const images: MediaItem[] = [
    { type: "image", src: sectionOne },
    { type: "video", src: sectiontwo },
    { type: "image", src: sectionThree },
    { type: "video", src: sectionFour },
  ]
    const [activeIndex, setActiveIndex] = useState<number | null>(0);
  return (
    <div className="bg-black w-full min-h-screen flex items-center">
      <div className="container mx-auto px-6 xl:px-16 flex flex-col-reverse lg:flex-row items-center justify-center gap-10">

        <div className="w-full xl:w-1/2 text-center lg:text-left">
          <h1 className=" sm:text-[40px] text-[30px] leading-[35px] uppercase tracking-normal text-white">
            OUR BOOKD FEATURES
          </h1>

          <p className="text-[12px] xl:w-[80%] mx-auto md:mx-0 not-italic mt-10 leading-[25px] text-[#CAC9D1]">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged.
          </p>

          <div className="text-white flex justify-center lg:justify-start px-7 items-center w-[160px] h-[50px] opacity-100 rounded-[44px] border border-[#A4A4A4] text-[12px] mt-12 mx-auto lg:mx-0 cursor-pointer">
            <button>Learn More</button>
            <MoveRight size={14} className="ml-5" />
          </div>
        </div>

       
        <div className="w-full lg:w-auto flex justify-center rounded-[20px]">
          <div className="flex justify-center gap-2 overflow-x-auto md:overflow-visible">
            {images.map((media, index) => (
              <div
                key={index}
                onMouseEnter={() => setActiveIndex(index)}
                className={`h-[300px] relative overflow-hidden rounded-[16px] transition-all duration-300 ${
                  activeIndex === index ? "w-[350px]" : "w-[60px]"
                } flex-shrink-0`}
              >
                {activeIndex == index && (
                  <div
                    className={`w-[40px] h-[40px] flex justify-center items-center text-[13px] font-medium bg-${
                      index == 0 || index == 3 ? "white" : "black"
                    } rounded-full absolute top-2 left-2 font-poppins font-semibold text-${
                      index == 0 || index == 3 ? "black" : "white"
                    } `}
                  >
                    0{index + 1}
                  </div>
                )}

                {media.type === "video" ? (
                  <video
                    src={media.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={media.src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}

                {activeIndex === index && (
                  <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[95%] h-[50px] rounded-[48px] flex items-center justify-center gap-x-3 px-3 bg-[#0000000D] backdrop-blur-[100px]">
                    <div className="w-[40px] h-[40px] bg-white rounded-full flex justify-center items-center">
                      <img src={music} alt="" className="object-cover w-2/4" />
                    </div>

                    <div className="flex justify-between items-center flex-1">
                      <h6 className="font-semibold text-base leading-[100%] tracking-normal text-center font-poppins text-white text-[13px]">
                        Voice Search
                      </h6>

                      <div className="font-poppins font-normal text-[12px] leading-[100%] tracking-normal text-center text-[#7E7E7E] flex justify-between items-center gap-2">
                        <div>Learn More</div>
                        <img src={arrrow} alt="" className="object-cover" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section4
