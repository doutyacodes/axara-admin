import { motion } from "framer-motion";
import React from "react";

const WelcomeCard = ({ data }) => {
  const { name, age, gender } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundImage: "linear-gradient(to bottom right, #ffedd5, #fff, #fed7aa)",
      }}
      className="fixed inset-0 flex items-center justify-center z-[9999999999999]"
    >
      <motion.div
        className="bg-white bg-opacity-90 border border-gray-300 rounded-lg p-6 shadow-lg text-center w-80 sm:w-96"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <motion.img
          src={gender === "male" ? "/images/boy.png" : "/images/girl.png"}
          alt={gender === "male" ? "Boy" : "Girl"}
          className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />
        <h2 className="text-2xl font-semibold text-gray-800">Welcome!</h2>
        <p className="text-gray-600 mt-2">
          You are logged in as <strong>{name}</strong> with age <strong>{age}</strong>.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeCard;
