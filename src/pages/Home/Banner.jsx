import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';

// Import your Lottie JSON animations
import animation1 from '../../assets/slide2.json';
import animation2 from '../../assets/slide4.json';
import animation3 from '../../assets/slide3.json';
import animation4 from '../../assets/slide1.json';

const Banner = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: 'ease-in-out',
  };

  const slides = [
    {
      title: "Where's Your Lost Item?",
      description: "Can't find your belongings? Post it here and let our community help you track it down. Lost items deserve to be found.",
      animation: animation1,
    },
    {
      title: "Found Something? Make a Difference",
      description: "Discover items waiting to be returned to their owners. Be a hero by reuniting lost belongings with the people who cherish them.",
      animation: animation2,
    },
    {
      title: "Your Campus, Your Community",
      description: "We're building a connected network where nothing stays lost for long. Report, search, and recover with just a few clicks.",
      animation: animation3,
    },
    {
      title: "Every Item Has a Story",
      description: "From keys to gadgets, we help bring meaningful items back home. Trust our community to get what matters most back to you.",
      animation: animation4,
    },
  ];

  return (
    <div className="container mx-auto my-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <Slider {...settings} className="slick-slider-custom">
        {slides.map((slide, index) => (
          <div key={index} className="p-6 h-[500px] bg-gradient-to-r from-white to-teal-50 dark:from-gray-900 dark:to-gray-800 rounded-lg shadow-lg">
            <motion.div
              className="flex flex-col md:flex-row justify-between items-center h-full gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1,
                ease: 'easeInOut',
              }}
            >
              <div className="w-full md:w-1/2 text-left p-4">
                <motion.h2
                  className="text-2xl md:text-3xl font-bold text-teal-600 dark:text-teal-400 mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  {slide.title}
                </motion.h2>
                <motion.p
                  className="text-gray-600 dark:text-gray-300 mt-2 text-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  {slide.description}
                </motion.p>
              </div>
              <div className="w-full md:w-1/2 flex justify-center items-center">
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-full p-4 shadow-md"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <Lottie className="w-[60%] mx-auto" animationData={slide.animation} loop={true} />
                </motion.div>
              </div>
            </motion.div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;
