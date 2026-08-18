import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { motion } from 'framer-motion';
import { Slider } from "@/components/ui/slider";

const initialNotifications = [
  {
    id: 'booking',
    title: 'Booking Updates',
    description: 'Get notified when your booking is confirmed or updated.',
    hasSwitch: true,
    enabled: false
  },
  {
    id: 'reminders',
    title: 'Reminders',
    description: 'Receive reminders for upcoming reservations and activities.',
    hasSwitch: true,
    enabled: false
  },
  {
    id: 'promotions',
    title: 'Promotions',
    description: 'Stay informed about exclusive offers and seasonal deals.',
    hasSwitch: true,
    enabled: false
  },
  {
    id: 'vip',
    title: 'VIP Alerts',
    description: 'Get priority alerts for VIP-only events and experiences.',
    hasSwitch: true,
    enabled: false
  },
  {
    id: 'discreet',
    title: 'Discreet Push Notifications',
    description: 'Adjust how often we send you notifications.',
    hasSwitch: false
  },
];

const Notification = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const handleToggle = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    );
  };

  return (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0 * 0.1 }}
    >
      <div>
        <div className="flex flex-col">
          {notifications.map((item) => (
            <div className="w-full" key={item.id}>
              <div className="flex justify-between items-end w-full">
                <div className='xl:mb-[40px] lg:mb-[35px] md:mb-[30px] sm:mb-[25px] mb-[25px]'>
                  <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-[#D4AF37] mb-[8px] flex">
                    {item.title}
                  </p>
                  <p className="xl:text-[20px] xl:leading-[30px] lg:text-[18px] lg:leading-[28px] md:text-[16px] md:leading-[26px] sm:text-[15px] sm:leading-[25px] text-[14px] leading-[24px] font-normal font-gowun text-white">
                    {item.description}
                  </p>
                </div>
                {item.hasSwitch && (
                  <Switch
                    checked={item.enabled}
                    onCheckedChange={() => handleToggle(item.id)}
                    className="border border-[#89898980] backdrop-blur-[8px] cursor-pointer"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 grid-cols-1 items-center gap-4">
          <div className='xl:w-[500px] lg:w-[350px] w-auto lg:mb-0 mb-[40px]'>
            <Slider
              defaultValue={[2]}
              max={3}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span className='font-gowun'>Low</span>
              <span className='font-gowun'>Medium</span>
              <span className='font-gowun'>High</span>
            </div>
          </div>
          <div className="flex justify-end flex-wrap gap-4">
            {/* <button
              type="button"
              className="px-6 py-[10px] rounded-full border border-[#D4AF37] text-white hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun"
              onClick={() => {
                console.log("AI Suggestions requested from past bookings");
              }}
            >
              ✨ Suggestions for You
            </button>
            <button
              type="button"
              className="px-6 py-[10px] rounded-full border border-[#D4AF37] text-white hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun"
              onClick={() => {
                console.log("Reset to Default button clicked");
              }}
            >
              Reset to Default
            </button> */}
            <button
              type="button"
              className="px-6 py-[10px] rounded-full border border-[#D4AF37] bg-[#D4AF37] text-black transition-colors cursor-pointer text-[14px] md:text-[13px] lg:text-[14px] xl:text-[16px] font-normal font-gowun  hover:bg-transparent hover:text-white"
              onClick={() => {
                console.log("Save button clicked");
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Notification;