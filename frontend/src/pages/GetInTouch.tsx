import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";

import MailIcon from "../assets/mail-icon.svg";
import Location from "../assets/location.png";
import AuthUserIcon from "../assets/auth-user-icon.svg";
import Timer from "../assets/timer.png";
import Header from "@/appComponents/Header";
import Footer from "@/appComponents/Footer";

import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import Facebook from "../assets/fb-black.svg";
import Instagram from "../assets/insta-black.svg";
import Whatsapp from "../assets/whatsapp-black.svg";
import X from "../assets/x-black.svg";

const API = import.meta.env.VITE_API_BASE_URL;

const contactValidationSchema = Yup.object({
  fullName: Yup.string()
    .matches(/^[a-zA-Z\s]+$/, "Full name must contain only letters")
    .min(2, "Full name must be at least 2 characters")
    .max(35, "Full name must be at most 35 characters")
    .required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  subject: Yup.string()
    .min(3, "Subject must be at least 3 characters")
    .required("Subject is required"),
  message: Yup.string()
    .min(10, "Message must be at least 10 characters")
    .required("Message is required"),
});

const GetInTouch = () => {
  const [loading, setLoading] = useState(false);

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/" },
    { icon: Instagram, href: "https://www.instagram.com" },
    { icon: Whatsapp , href: "https://web.whatsapp.com/" },
    { icon: X, href: "https://x.com/?lang=en" },
  ];

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      subject: "",
      message: "",
    },
    validationSchema: contactValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      toast.dismiss();

      try {
        await axios.post(`${API}/contact`, values, {
          headers: { "Content-Type": "application/json" },
        });

        toast.success("Your message has been sent successfully!");
        resetForm();
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || "Failed to send your message"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <Header />

      <section className="xl:pt-[70px] lg:pt-[60px] md:pt-[50px] sm:pt-[40px] pt-[35px] px-4 md:px-12 pb-16 bg-[#E5E7EB]">
        <div className="container m-auto">
          <div className="max-w-[1000px] m-auto">
          <div className="lg:pb-[50px] md:pb-[40px] pb-[30px] text-center">
            <h1 className="xl:text-[48px] xl:leading-[54px] lg:text-[40px] lg:leading-[46px] md:text-[35px] md:leading-[41px] sm:text-[30px] sm:leading-[36px] text-[25px] leading-[31px] font-carien text-[#1C1C1C] mb-3">
              Contact Us
            </h1>
            <p className="text-[#5B5B5B] xl:text-[20px] lg:text-[18px] md:text-[16px] sm:text-[15px] text-[14px] font-gowun">
             Have a question or just want to say hi? Fill out the form — we’ll reply soon!
            </p>
          </div>
          <div className="grid md:grid-cols-[60%_40%] grid-cols-1 gap-4">
            {/* FORM */}
            <div>
              <form
                onSubmit={formik.handleSubmit}
                className="bg-white shadow-2xl p-6 rounded-[20px]"
              >
                <div className="grid lg:grid-cols-2 grid-cols-1 md:gap-4 gap-3">
                  {/* Full Name */}
                  <div className="lg:mb-[20px] mb-[5px]">
                    <label className="text-[#5B5B5B] font-gowun block mb-2 pl-[15px]">
                      Full Name
                    </label>
                    <div className="relative">
                      <img
                        src={AuthUserIcon}
                        className="absolute left-[20px] top-[25px] -translate-y-1/2"
                      />
                      <input
                        name="fullName"
                        value={formik.values.fullName}
                        onChange={formik.handleChange}
                        placeholder="Your Full Name"
                        className="w-full pl-[50px] pr-[20px] py-[12px] bg-[#F8F6F2] rounded-full border"
                      />
                    </div>
                    {formik.touched.fullName && formik.errors.fullName && (
                      <p className="text-red-500 text-xs mt-1 pl-[15px]">
                        {formik.errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-[20px]">
                    <label className="text-[#5B5B5B] font-gowun mb-2 block pl-[15px]">
                      Email Address
                    </label>
                    <div className="relative">
                      <img
                        src={MailIcon}
                        className="absolute left-[20px] top-[25px] -translate-y-1/2"
                      />
                      <input
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        placeholder="Your Email Address"
                        className="w-full pl-[50px] pr-[20px] py-[12px] bg-[#F8F6F2] rounded-full border"
                      />
                    </div>
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-xs mt-1 pl-[15px]">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-[20px]">
                  <label className="text-[#5B5B5B] font-gowun mb-2 block pl-[15px]">Subject</label>
                  <input
                    name="subject"
                    value={formik.values.subject}
                    onChange={formik.handleChange}
                    placeholder="Enter Subject"
                    className="w-full px-5 py-[12px] bg-[#F8F6F2] rounded-full border"
                  />
                  {formik.touched.subject && formik.errors.subject && (
                    <p className="text-red-500 text-xs mt-1 pl-[15px]">
                      {formik.errors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="text-[#5B5B5B] font-gowun mb-2 block pl-[15px]">Message</label>
                  <textarea
                    name="message"
                    value={formik.values.message}
                    onChange={formik.handleChange}
                    rows={5}
                    placeholder="Type your message here..."
                    className="w-full p-4 border rounded-lg resize-none bg-[#F8F6F2]"
                  />
                  {formik.touched.message && formik.errors.message && (
                    <p className="text-red-500 text-xs pl-[15px]">
                      {formik.errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-[12px] rounded-full bg-[#D4AF37] text-black font-gowun hover:bg-white hover:text-[#D4AF37] border border-[#D4AF37] transition cursor-pointer"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* RIGHT SIDE STATIC CONTENT */}
            <div className="bg-white shadow-2xl p-6 rounded-[20px]">
              <h2 className="mb-2 xl:text-[30px] lg:text-[28px] md:text-[25px] sm:text-[22px] text-[20px] font-carien text-[#1C1C1C] mb-5">
               Find Us Here

              </h2>
              <div className="border-b-[#D4AF37] mb-4">
                <div className="flex  mb-4">
                  <div className="img bg-wihte shadow rounded p-2 w-[40px] h-[40px] mr-3 flex items-center justify-center">
                    <img src={Location} alt="location" />
                  </div>
                  <div className="content-wrapper">
                    <h3 className="text-black font-bold xl:text-[16px] lg:text-[14px] md:text-[12px] sm:text-[12px] text-[12px font-gowun">
                      Our Headquarter
                    </h3>
                    <p
                      className="text-[#5B5B5B] 
                      xl:text-[16px] 
                      lg:text-[14px] 
                      md:text-[14px] 
                      sm:text-[12px] 
                      text-[12px]  
                      font-gowun"
                    >
                      Creative Arts District 123 Digital Ave, Suite 400 York
                    </p>
                  </div>
                </div>
                <div className="flex  mb-4">
                  <div className="img bg-wihte shadow rounded p-2 w-[40px] h-[40px] mr-3 flex items-center justify-center">
                    <img src={MailIcon} alt="Email" />
                  </div>
                  <div className="content-wrapper">
                    <h3 className="text-black font-bold xl:text-[16px] lg:text-[14px] md:text-[12px] sm:text-[12px] text-[12px font-gowun">
                      Email Us
                    </h3>
                    <p
                      className="text-[#5B5B5B] 
                      xl:text-[16px] 
                      lg:text-[14px] 
                      md:text-[14px] 
                      sm:text-[12px] 
                      text-[12px]  
                      font-gowun"
                    >
                      <a
                        href="mailto:support@abc.com"
                        className="text-[#D4AF37] hover:underline"
                      >
                        support@abc.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex ">
                  <div className="img img bg-wihte shadow rounded p-2 w-[40px] h-[40px] mr-3 flex items-center justify-center">
                    <img src={Timer} alt="location" />
                  </div>
                  <div className="content-wrapper">
                    <h3 className="text-black font-bold xl:text-[16px] lg:text-[14px] md:text-[12px] sm:text-[12px] text-[12px font-gowun">
                      Business Hours
                    </h3>
                    <p
                      className="text-[#5B5B5B] 
                      xl:text-[16px] 
                      lg:text-[14px] 
                      md:text-[14px] 
                      sm:text-[12px] 
                      text-[12px]  
                      font-gowun"
                    >
                      Mon-Fri : 9am-6pm EST
                    </p>
                  </div>
                </div>
              </div>
              <div className="social-icons">
                <h3 className="xl:text-[30px] lg:text-[28px] md:text-[25px] sm:text-[22px] text-[20px] font-carien text-[#1C1C1C] mb-5">
                  {" "}
                 Find Us on Social Media

                </h3>
                <div className="flex gap-4 mt-4">
                  {socialLinks.map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 flex items-center justify-center border rounded-full text-gray-400 hover:text-[#D6AF63] border-[#000] hover:border-[#D6AF63] transition"
                    >
                      {typeof item.icon === "string" ? (
                      <img src={item.icon} alt="social" className="w-4 h-4" />
                    ) : (
                      <img className="w-4 h-4 text-gray-400 hover:text-[#D6AF63]" />
                    )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default GetInTouch;
