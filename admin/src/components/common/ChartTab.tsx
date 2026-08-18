import { useState } from "react";

const ChartTab: React.FC = () => {
  const [selected, setSelected] = useState<
    "optionOne" | "optionTwo" | "optionThree"
  >("optionOne");

  const getButtonClass = (option: "optionOne" | "optionTwo" | "optionThree") =>
    selected === option
      ? "shadow-theme-xs text-white" 
      : "text-gray-500 dark:text-gray-400";

  return (
    <div 
      className="flex items-center gap-0.5 rounded-lg p-0.5 dark:bg-gray-900" 
      style={{backgroundColor: '#f3f5f8'}}
    >
      <button
        onClick={() => setSelected("optionOne")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-white ${getButtonClass("optionOne")}`}
        style={{
          backgroundColor: selected === "optionOne" ? "#467ff7" : "transparent"
        }}
      >
        Monthly
      </button>

      <button
        onClick={() => setSelected("optionTwo")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-white ${getButtonClass("optionTwo")}`}
        style={{
          backgroundColor: selected === "optionTwo" ? "#467ff7" : "transparent"
        }}
      >
        Quarterly
      </button>

      <button
        onClick={() => setSelected("optionThree")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-white ${getButtonClass("optionThree")}`}
        style={{
          backgroundColor: selected === "optionThree" ? "#467ff7" : "transparent"
        }}
      >
        Annually
      </button>
    </div>
  );
};

export default ChartTab;