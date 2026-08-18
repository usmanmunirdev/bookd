import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PlansChartProps {
  plans: Record<string, number>;
}

export default function PlansChart({ plans }: PlansChartProps) {
  // remove null / undefined plans
  const filteredPlans = Object.entries(plans).filter(
    ([key]) => key !== "null" && key !== null
  );

  const labels = filteredPlans.map(([key]) => key);
  const values = filteredPlans.map(([, value]) => value);

  const data = {
    labels,
    datasets: [
      {
        label: "Users",
        data: values,
        backgroundColor: [
          "#22c55e", // Free
          "#f59e0b", // Premium
          "#3b82f6", // Elite
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-white dark:bg-white/[0.03] border dark:border-white/[0.03]">
      <h4 className="mb-4 font-semibold text-gray-800 dark:text-white/90">
        Users by Plan
      </h4>
      {values.length > 0 ? (
        <Pie data={data} />
      ) : (
        <p className="text-sm text-gray-500 dark:text-white/90">No plan data available</p>
      )}
    </div>
  );
}
