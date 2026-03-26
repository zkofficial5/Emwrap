import React from "react";
import { motion } from "framer-motion";

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose: () => void;
}

const ModalWrapper = ({ children, onClose }: ModalWrapperProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 backdrop-blur-sm sm:items-center"
    onClick={onClose}
  >
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-lg rounded-t-2xl border border-border bg-card p-6 shadow-2xl sm:rounded-2xl"
    >
      {children}
    </motion.div>
  </motion.div>
);

export default ModalWrapper;
