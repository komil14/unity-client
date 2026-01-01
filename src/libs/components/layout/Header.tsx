import { Link, NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import { Menu, X, Home, Calendar, HelpCircle } from "lucide-react";

import { Button, buttonVariants } from "@/libs/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/libs/components/ui/sheet";
import { ModeToggle } from "@/libs/components/ui/mode-toggle";
import { Logo } from "@/libs/components/common/Logo";
import { cn } from "@/libs/utils";

import { useCheckAuthQuery } from "@/app/services/authApi";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export default function Header() {
  const { data: authData } = useCheckAuthQuery();
  const isAuthed = Boolean(authData?.member?._id);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkClassName = useMemo(
    () =>
      ({ isActive }: { isActive: boolean }) =>
        cn(
          "text-sm font-medium transition-colors duration-300",
          isActive
            ? "text-foreground font-semibold underline underline-offset-6"
            : "text-muted-foreground hover:text-foreground"
        ),
    []
  );

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b w-full">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex items-center justify-between h-14 sm:h-16 md:h-20">
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 hover:scale-95 transition-transform duration-300"
        >
          <Logo className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
          <span className="text-lg sm:text-xl font-semibold text-foreground">
            Eventify
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={linkClassName}
              end={link.href === "/"}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <ModeToggle />

          {isAuthed ? (
            <span className="text-sm text-muted-foreground">Signed in</span>
          ) : (
            <div className="flex items-center gap-2 lg:gap-4">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="text-xs sm:text-sm h-8 lg:h-9 px-3 lg:px-4"
                >
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="text-xs sm:text-sm h-8 lg:h-9 px-3 lg:px-4">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          {!isAuthed && (
            <Link to="/login">
              <Button variant="outline" className="text-xs sm:text-sm h-8 px-3">
                Login
              </Button>
            </Link>
          )}

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="min-w-[330px] w-[300px] sm:w-[350px]"
            >
              <div className="flex h-full flex-col">
                <SheetHeader className="gap-0 border-b p-0">
                  <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <div className="w-10" />
                    <SheetTitle className="text-base">Menu</SheetTitle>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 opacity-80 hover:opacity-100"
                        aria-label="Close menu"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>

                  <div className="grid grid-cols-1 items-center px-4 pb-4">
                    <div className="flex items-center justify-center">
                      <ModeToggle />
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-auto px-4 py-4">
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <NavLink
                          to={link.href}
                          className={({ isActive }) =>
                            cn(
                              buttonVariants({
                                variant: isActive ? "secondary" : "ghost",
                              }),
                              "w-full justify-start gap-3 h-11"
                            )
                          }
                          end={link.href === "/"}
                        >
                          <link.icon className="h-4 w-4" />
                          <span>{link.label}</span>
                        </NavLink>
                      </SheetClose>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
