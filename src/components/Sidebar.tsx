"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tooltip } from "@mdrbx/nerv-ui";
import { motion } from "framer-motion";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="0" />
      <path d="M2 4l10 9 10-9" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconTrending() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { id: "contact", label: "CONTACT", href: "/contact", icon: <IconMail /> },
  { id: "reads", label: "READS", href: "/reads", icon: <IconBook /> },
  { id: "photos", label: "PHOTOS", href: "/photos", icon: <IconCamera /> },
  { id: "health", label: "HEALTH", href: "/health", icon: <IconHeart /> },
  { id: "software", label: "SOFTWARE", href: "/software", icon: <IconCode /> },
  { id: "sales", label: "SALES", href: "/sales", icon: <IconTrending /> },
  { id: "x", label: "X", href: "https://x.com/jaredwerba", icon: <IconX />, external: true },
  { id: "linkedin", label: "LINKEDIN", href: "https://linkedin.com/in/jaredwerba", icon: <IconLinkedin />, external: true },
];

function NavIcon({ item, active }: { item: NavItem; active: boolean }) {
  const inner = (
    <Tooltip content={item.label} side="top" color={active ? "orange" : "green"} delay={100}>
      <motion.div
        className={`
          relative flex items-center justify-center w-10 h-10
          transition-colors cursor-pointer
          ${active
            ? "text-nerv-orange"
            : "text-nerv-mid-gray hover:text-nerv-white"
          }
        `}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
      >
        {item.icon}
        {active && (
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-5 bg-nerv-orange"
            layoutId="nav-indicator"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </motion.div>
    </Tooltip>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return <Link href={item.href}>{inner}</Link>;
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeId = NAV_ITEMS.find((item) => !item.external && pathname.startsWith(item.href))?.id;

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="p-4 md:p-8 max-w-4xl mx-auto pb-16">
          {children}
        </div>
      </main>

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-nerv-black border-t border-nerv-mid-gray/20 safe-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {NAV_ITEMS.map((item) => (
            <NavIcon key={item.id} item={item} active={activeId === item.id} />
          ))}
        </div>
      </nav>
    </div>
  );
}
