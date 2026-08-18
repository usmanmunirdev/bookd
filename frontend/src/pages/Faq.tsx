import Footer from "@/appComponents/Footer";
import Header from "@/appComponents/Header";
import axios from "axios";
import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

const Faq = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/faq/category`);
      setCategories([{ id: "", name: "All" }, ...(res?.data || [])]);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  // Fetch FAQs
  const fetchFaqs = async (categoryId?: number) => {
    try {
      setLoading(true);

      const params: any = {};
      if (categoryId && categoryId !== 0) {
        params.categoryId = categoryId;
      }

      const res = await axios.get(`${API}/faq`, { params });

      setFaqs(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching FAQs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchFaqs();
  }, []);

  const handleTabClick = (index: number, categoryId?: number) => {
    setActiveTab(index);
    setOpenIndex(null);
    fetchFaqs(categoryId);
  };

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Header />

      <section className="xl:pt-[70px] lg:pt-[60px] md:pt-[50px] sm:pt-[40px] pt-[35px] px-4 md:px-12 pb-16 bg-[#E5E7EB]">
        <div className="container mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="xl:text-[48px] lg:text-[38px] md:text-[35px] sm:text-[30px] text-[25px] font-carien mb-3">
            Frequently Asked Question
            </h1>
            <p className="text-[#5B5B5B] font-gowun xl:text-[22px] lg:text-[20px] md:text-[18px] sm:text-[17px] text-[16px]">
             Here’s What People Usually Ask Us!

            </p>
          </div>
          {/* Tabs */}
          <div className="max-w-3xl mx-auto lg:mb-8 md:mb-6 mb-4 border-b flex space-x-4 overflow-x-auto hide-scrollbar">
            {categories.map((cat, index) => (
              <button
                key={cat.id}
                onClick={() => handleTabClick(index, cat.id)}
                className={`pb-2 font-medium transition-colors duration-300 whitespace-nowrap cursor-pointer xl:text-[22px] lg:text-[20px] md:text-[18px] sm:text-[17px] text-[16px] xl:mr-[40px] lg:mr-[35px]  md:mr-[30px] sm:mr-[25px] mr-[20px] ${
                  activeTab === index
                    ? "border-b-2 border-[#D6AF63] text-[#D6AF63]"
                    : "text-gray-600 hover:text-[#D6AF63]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto mt-4">
            {/* {loading ? (
              <div className="text-center py-10 text-gray-400" >
                Loading FAQs...
              </div>
            ) :  */}
            {
            faqs.length ? (
              faqs.map((item, index) => (
                <div key={item.id} className="border-b border-gray-300">
                  <button
                    onClick={() => toggleIndex(index)}
                    className="w-full flex justify-between items-center py-4 text-left"
                  >
                    <span className="text-[#5B5B5B] font-gowun xl:text-[22px] lg:text-[20px] md:text-[18px] sm:text-[17px] text-[16px] cursor-pointer mr-[20px] w-[calc(100%-30px)]">
                      {item.question}
                    </span>
                    <span className="text-xl cursor-pointer  bg-[#D4AF37] w-[30px] h-[30px] rounded-[100%] flex items-center justify-center text-white">
                      {openIndex === index ? "-" : "+"}
                    </span>
                  </button>

                  <div
                    className=
                    {`overflow-hidden transition-all duration-300 ${
                      openIndex === index
                        ? " opacity-100 py-2"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-[#5B5B5B] font-gowun xl:text-[20px] lg:text-[18px] sm:text-[16px] text-[14px]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 xl:text-[20px] lg:text-[18px] text-[16px]">
                No FAQs found.
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Faq;
