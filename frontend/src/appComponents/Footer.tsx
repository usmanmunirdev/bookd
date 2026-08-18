import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import FooterLogo from "../assets/bookd-logo-cropped.svg";
import { Link } from "react-router-dom";
import { useAuth } from "../../utils";
import { buildNavigationLinks } from "../lib/utils";
import Facebook from "../assets/fb.svg";
import Instagram from "../assets/insta.svg";
import Whatsapp from "../assets/whatsapp.svg";
import X from "../assets/x.svg";

const Footer = () => {
  const { user } = useAuth();
  const { publicLinks, memberLinks } = buildNavigationLinks(
    user?.subscription?.plan,
  );
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Quick Links",
      links: publicLinks,
    },
    // {
    //   title: "Your Account",
    //   links: user ? memberLinks : [],
    // },
    {
      title: "Support",
      links: [
        { label: "FAQs", url: "/faq" },
        { label: "Contact Us", url: "/contact-us" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", url: "/privacy-policy" },
        { label: "Terms Condition", url: "/terms-condition" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/" },
    { icon: Instagram, href: "https://www.instagram.com" },
    { icon: Whatsapp, href: "https://web.whatsapp.com/" },
    { icon: X, href: "https://x.com/?lang=en" },
  ];

  return (
    <footer className="bg-[#0A0D13] text-gray-300 py-8 px-6 md:px-6">
      <div className="max-w-7xl mx-auto border-t border-b border-[#3E3E3E] py-10">
        <div className="grid lg:grid-cols-[30%_70%] grid-cols-1 gap-8">
          {/* Logo, Description & Social */}
          <div>
            <Link to="/">
              <img
                src={FooterLogo}
                alt="footer logo"
                className="w-[120px] mb-4"
              />
            </Link>

            <p className="text-sm mb-4">
              Your AI-powered travel companion. <br />
              Plan smarter, book faster, and explore more.
            </p>
          </div>

          {/* Dynamic Sections */}
          <div className="grid xl:grid-cols-[70%_30%] grid-cols-1 xl:gap-8 gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 sm:grid-cols-2 grid-cols-1  md:gap-8 gap-2">
              {footerSections.map(
                (section, index) =>
                  section?.links.length > 0 && (
                    <div key={index} className="mb-6">
                      <h3 className="text-white font-bold mb-3">
                        {section.title}
                      </h3>
                      <ul className="space-y-2">
                        {section?.links.map((link: any, i: number) => (
                          <li key={i}>
                            <Link
                              to={link.url}
                              className="text-sm hover:text-[#D6AF63]"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
              )}
            </div>
            <div className="">
              <h3 className="text-white font-bold mb-3">
                Follow Us on Social Media
              </h3>
              {/* Social Icons */}
              <div className="flex gap-4 mt-4">
                {socialLinks.map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 flex items-center justify-center border rounded-full text-gray-400 hover:text-[#D6AF63] hover:border-[#D6AF63] transition"
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
      {/* Copyright */}
      <p className="text-sm text-gray-500 pt-6 text-center">
        © {currentYear} BOOKD. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
