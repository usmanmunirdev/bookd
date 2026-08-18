import { MultiSelect } from "@/components/ui/multi-select";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../utils";
import {
  cityOptions,
  cuisineOptions,
  diningOptions,
  seatingOptions,
} from "../lib/utils";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const PersonalPreferences = () => {
  const { user } = useAuth();

  // const cityOptions = [
  //   { label: "Paris", value: "paris" },
  //   { label: "Tokyo", value: "tokyo" },
  //   { label: "Amalfi Coast", value: "amalfi-coast" },
  //   { label: "New York", value: "new-york" },
  //   { label: "London", value: "london" },
  // ];

  // const cuisineOptions = [
  //   { label: "Italian", value: "italian" },
  //   { label: "Japanese", value: "japanese" },
  //   { label: "Mexican", value: "mexican" },
  //   { label: "French", value: "french" },
  //   { label: "Indian", value: "indian" },
  // ];

  // const diningOptions = [
  //   { label: "Casual Dining", value: "casual" },
  //   { label: "Fine Dining", value: "fine" },
  //   { label: "Adventurous", value: "adventurous" },
  //   { label: "Vegan/Vegetarian", value: "vegan" },
  // ];

  // const seatingOptions = [
  //   { label: "Indoor", value: "indoor" },
  //   { label: "Outdoor", value: "outdoor" },
  //   { label: "Window Seat", value: "window" },
  //   { label: "Private Booth", value: "booth" },
  // ];

  // ✅ Separate state for each preference
  const [preferredCities, setPreferredCities] = useState<string[]>([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);
  const [diningStyle, setDiningStyle] = useState<string[]>([]);
  const [preferredSeatings, setPreferredSeatings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Load preferences on mount
  useEffect(() => {
    if (!user?.id) return;

    const fetchPreferences = async () => {
      const token = localStorage.getItem("authToken");

      try {
        const { data } = await axios.get(`${API_URL}/personal-preferences`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data) {
          setPreferredCities(data.preferredCities || []);
          setFavoriteCuisines(data.favoriteCuisines || []);
          setDiningStyle(data.diningStyle || []);
          setPreferredSeatings(data.preferredSeatings || []);
        }
      } catch (error) {
        console.warn("No preferences found yet");
      }
    };

    fetchPreferences();
  }, [user?.id]);

  // 🔹 Save (Create or Update)
  const handleSave = async () => {
    toast.dismiss();
    const token = localStorage.getItem("authToken");

    if (!user?.id) return;

    setLoading(true);

    const payload = {
      preferredCities,
      favoriteCuisines,
      diningStyle,
      preferredSeatings,
    };

    try {
      await axios.put(`${API_URL}/personal-preferences`, payload, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Preferences saved successfully");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to save preferences"
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reset
  const handleReset = async () => {
    const token = localStorage.getItem("authToken");

    const emptyPayload = {
      preferredCities: [],
      favoriteCuisines: [],
      diningStyle: [],
      preferredSeatings: [],
    };

    setPreferredCities([]);
    setFavoriteCuisines([]);
    setDiningStyle([]);
    setPreferredSeatings([]);

    try {
      await axios.put(`${API_URL}/personal-preferences`, emptyPayload, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Preferences reset to default 🔄");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to reset preferences"
      );
    }
  };

  const getRandomSelection = (options: { value: string }[]) => {
    toast.dismiss();

    const min = 2;
    const max = 5;
    const count = Math.min(
      options.length,
      Math.floor(Math.random() * (max - min + 1)) + min
    );

    return options
      .sort(() => 0.5 - Math.random()) // shuffle
      .slice(0, count) // take random count
      .map((o) => o.value);
  };

  const handleAISuggestions = () => {
    setPreferredCities(getRandomSelection(cityOptions));
    setFavoriteCuisines(getRandomSelection(cuisineOptions));
    setDiningStyle(getRandomSelection(diningOptions));
    setPreferredSeatings(getRandomSelection(seatingOptions));

    toast.success("AI suggestions applied. Review & save if you like 👀");
  };

  return (
    <motion.div
      key="personal-preferences"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <div className="mb-[20px]">
          <label className="label">Preferred Cities</label>
          <MultiSelect
            options={cityOptions}
            selected={preferredCities}
            onSelectChange={setPreferredCities}
            placeholder="Select destinations"
          />
        </div>

        <div className="mb-[20px]">
          <label className="label">Favorite Cuisines</label>
          <MultiSelect
            options={cuisineOptions}
            selected={favoriteCuisines}
            onSelectChange={setFavoriteCuisines}
            placeholder="Select cuisines"
          />
        </div>

        <div className="mb-[20px]">
          <label className="label">Dining Style</label>
          <MultiSelect
            options={diningOptions}
            selected={diningStyle}
            onSelectChange={setDiningStyle}
            placeholder="Select dining styles"
          />
        </div>

        <div className="mb-[20px]">
          <label className="label">Preferred Seatings</label>
          <MultiSelect
            options={seatingOptions}
            selected={preferredSeatings}
            onSelectChange={setPreferredSeatings}
            placeholder="Select your seating preferences"
          />
        </div>

        {/* <div className="mt-10 flex justify-end gap-4 flex-wrap">
          <button
            type="button"
            className="btn-outline"
            onClick={() => console.log("AI Suggestions requested")}
          >
            ✨ Suggestions for You
          </button>

          <button type="button" className="btn-outline" onClick={handleReset}>
            Reset to Default
          </button>

          <button
            type="button"
            disabled={loading}
            className="btn-primary"
            onClick={handleSave}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div> */}
        <div className="mt-10 flex justify-end gap-4 flex-wrap">
          <button
            type="button"
            className="px-6 py-[10px] rounded-full border border-[#D4AF37] text-white hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun"
            onClick={handleAISuggestions}
          >
            ✨ Suggestions for You
          </button>
          <button
            type="button"
            className="px-6 py-[10px] rounded-full border border-[#D4AF37] text-white hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun"
            onClick={handleReset}
          >
            Reset to Default
          </button>
          <button
            type="button"
            disabled={loading}
            className="px-6 py-[10px] rounded-full border border-[#D4AF37] bg-[#D4AF37] text-black transition-colors cursor-pointer text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun  hover:bg-transparent hover:text-white"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalPreferences;
