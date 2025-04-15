"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
        >
            <div className="relative h-5 w-5">
                <AnimatePresence mode="wait">
                    {theme === "dark" ? (
                        <motion.div
                            key="moon"
                            initial={{ rotate: 90, scale: 0, opacity: 0 }}
                            animate={{
                                rotate: 0,
                                scale: 1,
                                opacity: 1,
                                transition: {
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    duration: 0.3,
                                },
                            }}
                            exit={{
                                rotate: -90,
                                scale: 0,
                                opacity: 0,
                                transition: {
                                    duration: 0.15,
                                },
                            }}
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    transition: {
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                    },
                                }}
                            >
                                <Moon className="absolute h-5 w-5" />
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ rotate: -90, scale: 0, opacity: 0 }}
                            animate={{
                                rotate: 360,
                                scale: 1,
                                opacity: 1,
                                transition: {
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    duration: 0.3,
                                },
                            }}
                            exit={{
                                rotate: 90,
                                scale: 0,
                                opacity: 0,
                                transition: {
                                    duration: 0.15,
                                },
                            }}
                        >
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    transition: {
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: "linear",
                                    },
                                }}
                            >
                                <Sun className="absolute h-5 w-5" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <span className="sr-only">Toggle theme</span>
        </motion.button>
    );
}
