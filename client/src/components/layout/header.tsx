import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MenuIcon,
  SearchIcon,
  BellIcon,
  HelpCircleIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const isMobile = useMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleToggleSidebar = () => {
    // Create a custom event to toggle the sidebar
    const event = new CustomEvent("toggle-sidebar");
    window.dispatchEvent(event);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  useEffect(() => {
    if (showMobileSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showMobileSearch]);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Mobile menu button and logo */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden text-slate-500 hover:text-slate-700"
            onClick={handleToggleSidebar}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <div className="md:hidden flex items-center space-x-2">
            <div className="bg-primary text-white p-1 rounded">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 18l6-6-6-6" />
                <path d="M8 6l-6 6 6 6" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">CodeLearn</h1>
          </div>
        </div>

        {/* Search */}
        {showMobileSearch ? (
          <form
            onSubmit={handleSearch}
            className="absolute inset-x-0 top-0 z-20 flex h-16 items-center justify-between bg-white px-4"
          >
            <div className="relative w-full max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                ref={searchInputRef}
                type="text"
                className="bg-slate-100 border border-slate-200 text-slate-700 text-sm rounded-md pl-10 pr-4 py-2 w-full"
                placeholder="Search for problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileSearch(false)}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <div className="hidden md:flex flex-1 max-w-md ml-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                className="bg-slate-100 border border-slate-200 text-slate-700 text-sm rounded-md pl-10 pr-4 py-2 w-full"
                placeholder="Search for problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        )}

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          {isMobile && !showMobileSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-700"
              onClick={() => setShowMobileSearch(true)}
            >
              <SearchIcon className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-slate-700 relative"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-slate-700"
          >
            <HelpCircleIcon className="h-5 w-5" />
          </Button>

          {/* User dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary-200 text-primary-800 font-semibold">
                    {user.displayName
                      ? user.displayName.substring(0, 2)
                      : user.username.substring(0, 2)}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || user.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
