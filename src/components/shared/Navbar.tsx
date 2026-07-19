"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { NAV_LINKS, WEBSITE_DETAILS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useGetMeQuery } from "@/redux/api/getMe/getMeApi";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();
  const scrollToSection = useScrollToSection();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = useAuth();
  const { data: userData } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { handleLogout } = useLogout();

  const profile = userData?.data;
  const u = profile as unknown as
    | { name?: string; profilePicture?: string }
    | undefined;
  const displayName = profile?.name || u?.name || "User";
  const profileImage = profile?.profileImage || u?.profilePicture || undefined;

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      // Scrolling down
      setIsVisible(false);
    } else {
      // Scrolling up
      setIsVisible(true);
    }

    setLastScrollY(currentScrollY);

    if (pathname === "/") {
      const sections = ["feature", "review", "pricing"];
      let current = "";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 300) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    }
  }, [lastScrollY, pathname]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Determines if a nav link is "active" based on current pathname.
   * Anchor links (/#section) become active when scrolled into view on the homepage.
   */
  const getIsActive = (href: string) => {
    if (href.startsWith("/#")) {
      const section = href.replace("/#", "");
      return pathname === "/" && activeSection === section;
    }
    if (href === "/") return pathname === "/" && !activeSection;
    return pathname.startsWith(href);
  };

  /**
   * Returns click handler for nav links.
   * - Anchor links (#section) → use smooth scroll hook
   * - Page links → normal Next.js Link (no handler needed)
   */
  const getAnchorClickHandler = (href: string, closeMenu?: () => void) => {
    if (href === "/") {
      return (e: React.MouseEvent) => {
        if (pathname === "/") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        closeMenu?.();
      };
    }
    if (href.startsWith("/#")) {
      const sectionId = href.replace("/#", "");
      return (e: React.MouseEvent) => {
        if (pathname === "/") {
          e.preventDefault();
          closeMenu?.();
          scrollToSection(sectionId);
        } else {
          // If not on homepage, let Next.js navigate to /#section automatically
          closeMenu?.();
        }
      };
    }
    return closeMenu ? () => closeMenu() : undefined;
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-100 md:px-4 2xl:px-0 border-b border-white/5 transition-all duration-500 ease-in-out",
          isVisible
            ? "translate-y-0 bg-transparent backdrop-blur-[2px]"
            : "-translate-y-full bg-transparent border-none",
        )}
      >
        <div className="customContainer mx-auto px-4 md:px-0 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-2 group relative z-110"
          >
            {/* <Logo className="w-44 h-12 group-hover:scale-105 transition-transform" /> */}
            <Image
              src="/logo.png"
              alt="logo"
              width={50}
              height={50}
              draggable={false}
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = getIsActive(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={getAnchorClickHandler(link.href)}
                  className={cn(
                    "relative py-1 text-gray-300 hover:text-white transition-colors font-medium text-sm lg:text-base",
                    isActive && "text-primary",
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Button & Mobile Toggle */}
          <div className="flex items-center gap-4 relative z-110">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1 rounded-full border border-primary/10 hover:border-brand/30 hover:bg-brand/5 hover:cursor-pointer transition-all duration-200"
                  aria-label="User menu"
                >
                  <Avatar name={displayName} src={profileImage} size={40} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="hidden lg:block text-left pr-1">
                      <p className="text-xs font-semibold text-foreground leading-none mb-0.5">
                        {profile?.name || "-"}
                      </p>
                      <p className="text-[9px] text-brand uppercase tracking-wider font-bold">
                        {profile?.email || ""}
                      </p>
                    </div>
                    <div className="p-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowDropdown(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-brand/5 hover:text-brand hover:cursor-pointer transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Go to Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 hover:cursor-pointer rounded-xl px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href="/login"
                  className="px-7 py-2.5 text-base rounded-20! font-semibold text-foreground hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all active:scale-95 flex items-center justify-center backdrop-blur-md"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="rounded-full px-7 py-2.5 text-base font-bold text-brand-dark golden-gradient-card border-none! hover:brightness-105 transition-all active:scale-95 shadow-[0_4px_14px_rgba(255,212,81,0.25)] flex items-center justify-center"
                >
                  Get Started
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2 text-title hover:bg-brand-dark hover:scale-95 hover:cursor-pointer rounded-16 transition-all duration-300"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Professional Full-Screen Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-9999 md:hidden bg-background/95 backdrop-blur-xl transition-all duration-500 ease-in-out",
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none",
        )}
      >
        <div className="flex flex-col h-full bg-transparent">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center"
            >
              <Image
                src="/logo.png"
                alt="logo"
                width={45}
                height={45}
                draggable={false}
              />
            </Link>
            <button
              className="p-2 text-gray-300 hover:text-white hover:bg-brand-dark hover:cursor-pointer rounded-full transition-all active:scale-90"
              onClick={() => setIsOpen(false)}
            >
              <X size={28} />
            </button>
          </div>

          {/* Mobile Nav Links */}
          <div className="flex-1 px-6 py-10 flex flex-col gap-6 overflow-y-auto">
            {NAV_LINKS.map((item, index) => {
              const isActive = getIsActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={getAnchorClickHandler(item.href, () =>
                    setIsOpen(false),
                  )}
                  className={cn(
                    "text-3xl font-bold transition-all duration-300 transform flex items-center justify-between",
                    isActive
                      ? "text-primary"
                      : "text-gray-300 hover:text-white",
                    isOpen
                      ? "translate-x-0 opacity-100"
                      : "translate-x-10 opacity-0",
                  )}
                  style={{ transitionDelay: `${index * 100 + 200}ms` }}
                >
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(255,212,81,0.5)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Footer Action */}
          <div className="p-6 border-t border-white/10 bg-black/20">
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button
                    className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-brand-dark transition-all active:scale-95"
                    size="lg"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  variant="outline"
                  className="w-full py-6 text-lg font-bold border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
                  size="lg"
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full py-6 text-lg font-semibold text-white bg-white/5 border-white/10 hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md"
                    size="lg"
                  >
                    Log In
                  </Button>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button
                    className="w-full py-6 text-lg font-bold text-brand-dark hover:cursor-pointer border-none! golden-gradient-card hover:brightness-105 transition-all active:scale-95 shadow-[0_4px_14px_rgba(255,212,81,0.25)]"
                    size="lg"
                  >
                    Get Started
                  </Button>
                </Link>

                <div className="mt-4 flex flex-col items-center gap-1">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">
                    © 2026 {WEBSITE_DETAILS.SITE_NAME}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
