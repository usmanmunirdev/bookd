const FullPageLoader = () => {
  return (
    <div className="fixed z-999 top-0 w-full left-0 flex justify-center items-center h-screen bg-black/25 backdrop-blur-sm">
      <div className="rounded-full h-20 w-20 bg-[#d4af37] animate-ping"></div>
    </div>
  );
};

export default FullPageLoader;
