import { Link } from "react-router-dom";
import {
  Instagram,
  Linkedin,
  Facebook,
  MapPin,
  Phone,
  Mail,
  Heart,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/libs/components/common/Logo";

const navigationLinks = [
  { href: "/events", label: "Explore Events", icon: Zap },
  { href: "/groups", label: "Join Groups", icon: Users },
  { href: "/organizers", label: "Find Organizers", icon: Heart },
];

const resourceLinks = [
  { href: "/help", label: "Help Center" },
  { label: "Privacy Policy" },
  { label: "Terms of Service" },
  { label: "Community Guidelines" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscriptionStatus("loading");
    setTimeout(() => {
      setSubscriptionStatus("success");
      setEmail("");
      setTimeout(() => setSubscriptionStatus("idle"), 3000);
    }, 800);
  };

  return (
    <footer className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 to-muted/30 border-t w-full">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6 lg:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
            >
              <Logo className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
              <span className="text-lg sm:text-xl font-semibold tracking-wide text-primary">
                UNITY
              </span>
            </Link>
            <p className="text-sm leading-7 text-muted-foreground max-w-xs">
              Connect. Volunteer. Make Impact. Unity brings people together to
              create meaningful change in their communities.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-muted/60 hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-muted/60 hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-full bg-muted/60 hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Explore
            </h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                    >
                      <Icon className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Resources
            </h3>
            <ul className="space-y-3">
              {resourceLinks.map((link, idx) => (
                <li key={`${link.label}-${idx}`}>
                  {link.href ? (
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Get in Touch
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                <div className="text-sm text-muted-foreground leading-6">
                  Seoul, Gangnam-gu
                  <br />
                  South Korea
                </div>
              </div>
              <a
                href="tel:010-5957-0418"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="group-hover:translate-x-0.5 transition-transform">
                  010-5957-0418
                </span>
              </a>
              <a
                href="mailto:info@unity.com"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Mail className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="group-hover:translate-x-0.5 transition-transform">
                  info@unity.com
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Footer Bottom */}
        <div className="pt-8 md:pt-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
          <p className="text-xs md:text-sm text-muted-foreground">
            © 2026 Unity. All rights reserved. • Made with{" "}
            <Heart className="w-3 h-3 inline text-primary fill-primary" /> by
            the community
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm">
            <button className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </button>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </button>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
