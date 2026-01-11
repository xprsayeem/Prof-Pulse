"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bird, LayoutGrid, GitCompare, ArrowRight } from "lucide-react";

export function QuickLinks() {
  const links = [
    {
      href: "/bird-courses",
      icon: Bird,
      title: "Bird Courses",
      description: "Find the easiest A's at TMU",
      color: "from-brand-gold/20 to-transparent",
      iconColor: "text-brand-gold",
    },
    {
      href: "/departments",
      icon: LayoutGrid,
      title: "Departments",
      description: "Browse courses by faculty",
      color: "from-brand-blue/20 to-transparent",
      iconColor: "text-brand-blue",
    },
    {
      href: "/compare",
      icon: GitCompare,
      title: "Compare",
      description: "Side-by-side course comparison",
      color: "from-purple-500/20 to-transparent",
      iconColor: "text-purple-400",
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
            <div className="glass glass-hover p-6 h-full relative overflow-hidden">
              {/* Gradient accent */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className="relative z-10">
                <link.icon className={`w-8 h-8 ${link.iconColor} mb-4`} />
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  {link.title}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </h3>
                <p className="text-white/50 text-sm">{link.description}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}