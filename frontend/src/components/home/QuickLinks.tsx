"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bird, BookOpen, GitCompare, ArrowRight } from "lucide-react";

export function QuickLinks() {
  const links = [
    {
      href: "/bird-courses",
      icon: Bird,
      title: "Bird Courses",
      description: "Find the easiest A's at TMU",
      color: "from-brand-gold/20 to-transparent",
      iconColor: "text-brand-gold",
      glowColor: "rgba(255, 220, 0, 0.2)",
    },
    {
      href: "/liberals",
      icon: BookOpen,
      title: "Liberal Courses",
      description: "Find the best upper or lower level liberal electives",
      color: "from-brand-blue/20 to-transparent",
      iconColor: "text-brand-blue",
      glowColor: "rgba(0, 76, 155, 0.2)",
    },
    {
      href: "/compare",
      icon: GitCompare,
      title: "Compare",
      description: "Side-by-side course or professor comparisons",
      color: "from-purple-500/20 to-transparent",
      iconColor: "text-purple-400",
      glowColor: "rgba(168, 85, 247, 0.2)",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {links.map((link, index) => (
        <motion.div
          key={link.href}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + 0.1 * index, duration: 0.5 }}
        >
          <Link href={link.href} className="block group">
            <motion.div
              className="glass p-6 h-full relative overflow-hidden"
              whileHover={{
                y: -4,
                boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 30px -10px ${link.glowColor}`,
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Gradient accent */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Hover glow border effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, transparent, ${link.glowColor}, transparent)`,
                  padding: '1px',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor',
                }}
              />

              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <link.icon className={`w-8 h-8 ${link.iconColor} mb-4`} />
                </motion.div>

                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  {link.title}
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 0, x: -8 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="inline-block"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                  </motion.span>
                </h3>

                <p className="text-white/50 text-sm group-hover:text-white/60 transition-colors duration-300">
                  {link.description}
                </p>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
