import { useState } from "react"
import { Link, useLocation } from "react-router"
import { useAuth } from "@/context/AuthContext"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Cpu, LogOut, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const navLinks = [
    { to: "/", label: "Builder", active: location.pathname === "/" || location.pathname.startsWith("/builder") },
    ...(user ? [
      { to: "/builds",  label: "Le mie build", active: isActive("/builds") },
      { to: "/compare", label: "Confronta",     active: isActive("/compare") },
      ...(isAdmin ? [{ to: "/admin", label: "Pannello Admin", active: isActive("/admin") }] : []),
    ] : []),
  ]

  return (
    <header className="flex-shrink-0 border-b border-border bg-background z-10">
      <div className="px-4 sm:px-6 h-14 flex items-center gap-4 sm:gap-8">

        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-[15px] shrink-0 hover:opacity-80 transition-opacity"
        >
          <Cpu className="w-4 h-4 text-primary" />
          PC Builder
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} active={link.active}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground select-none">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium hidden md:block leading-none">
                  {user.name}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="hidden sm:flex h-8 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Esci</span>
              </Button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/register"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Registrati
              </Link>
              <Link to="/login" className={buttonVariants({ size: "sm", className: "h-8" })}>
                Accedi
              </Link>
            </div>
          )}

          {/* Hamburger mobile */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 flex flex-col pt-12 pb-6 px-4">
              <nav className="flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      link.active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-border">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-1">
                      <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-tight">{user.name}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); setOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Esci dall'account
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className={buttonVariants({ className: "h-10 w-full justify-center" })}
                    >
                      Accedi
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className={buttonVariants({ variant: "outline", className: "h-10 w-full justify-center" })}
                    >
                      Registrati
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  )
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={cn(
        "px-3 py-1.5 rounded-md text-sm transition-colors",
        active
          ? "bg-muted text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      )}
    >
      {children}
    </Link>
  )
}
