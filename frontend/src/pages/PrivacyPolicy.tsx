// src/pages/PrivacyPolicy.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/appComponents/Header";
import Footer from "@/appComponents/Footer";

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface PolicyContent {
  id: string;
  title: string;
  message: string; // HTML string from backend
}

const PrivacyPolicy = () => {
  const [content, setContent] = useState<PolicyContent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/policies/privacy`);
      if (res?.data?.length > 0) {
        setContent(res.data[0]);
      } else {
        setContent(null);
      }
    } catch (err) {
      console.error("Error fetching Privacy Policy", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <section className="xl:pt-[70px] lg:pt-[60px] md:pt-[50px] sm:pt-[40px] xl:pb-[70px] lg:pb-[60px] md:pb-[50px] sm:pb-[40px] pt-[35px] pb-[35px] px-4 md:px-12 bg-[#E5E7EB]">
        <div className="container mx-auto">
          <h2 className="xl:text-[48px] lg:text-[40px] md:text-[35px] sm:text-[30px] text-[25px] font-normal font-carien mb-6 text-center">
            {content ? content.title : "Privacy Policy"}
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : content ? (
            <div
              className="cms-content max-w-full mx-auto"
              dangerouslySetInnerHTML={{ __html: content.message }}
            ></div>
          ) : (
            <p className="text-center text-gray-500">
              Privacy Policy content is not available.
            </p>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
