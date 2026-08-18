import section3 from "../assets/section3.jpg";
import BlurFooter from "./BlurFooter";

const Section3 = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${section3})`,
        filter: "contrast(1.020)",
      }}
      className="bg-cover relative bg-center bg-no-repeat min-h-[820px] w-full flex flex-col"
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <BlurFooter rotate={true} pos="lg:-top-28 sm:-top-24 -top-[60px]" />

      <div className="container mx-auto flex-1 flex  flex-col sm:px-20 px-10 pt-12  pb-5 relative z-10">
        <div className="flex-1 flex justify-center items-center text-center px-4">
          <div className="w-full max-w-[700px] mx-auto">
            <h1 className="text-white font-normal text-[20px] sm:text-[40px] mt-10 md:text-[45px] leading-tight">
              Smart Bookings. Inspired Travel. AI-Powered."
            </h1>
          </div>
        </div>


        <div className="flex flex-col items-center text-center md:text-left md:items-start gap-5 sm:mt-10 mb-28">
          <h2 className="text-white font-medium text-[17px] sm:text-[18px] md:text-[25px] leading-[110%]">
            Why Choose BOOKD
          </h2>

          <p className="text-white text-[11px] sm:text-[12px] leading-[18px] max-w-[350px] font-normal">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-white w-full max-w-[330px]">
            {[
              { id: "01", text: "All-in-One Travel Assistant" },
              { id: "02", text: "Voice & Text Booking Options" },
              { id: "03", text: "Smarter, Faster Decisions" },
              { id: "04", text: "Save Time, Stay Productive" },
            ].map((item) => (
              <div key={item.id} className="text-center sm:text-left">
                <h3 className="text-[20px] sm:text-[24px] font-medium mb-0">
                  {item.id}
                </h3>
                <p className="text-[10px] leading-[12px] font-normal">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BlurFooter rotate={false} pos="lg:-bottom-20 md:-bottom-16 bottom-0 " />
    </div>
  );
};

export default Section3;
