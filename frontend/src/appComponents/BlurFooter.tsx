import layer from  "../assets/Rectangle 28.png"

type blurFooterProps={
  pos:string;
  rotate:boolean
}

const BlurFooter = ({ pos, rotate }: blurFooterProps) => {
  console.log(` ${pos}`);
  return (
    <div
      className={`w-full h-[50px] sm:h-[48px] bg-black relative ${
        rotate ? "rotate-180" : "rotate-0"
      }`}
    >
      <img src={layer} alt="" className={`absolute ${pos}`} />
    </div>
  );
};

export default BlurFooter;
