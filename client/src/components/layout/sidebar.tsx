import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { CodeIcon, X } from "lucide-react";
import {
  DashboardIcon,
  QuestionMarkCircledIcon,
  StarFilledIcon,
  FileTextIcon,
  ChatBubbleIcon,
  RocketIcon,
  PersonIcon,
  GearIcon,
  ExitIcon,
  FileIcon,
  BarChartIcon,
} from "@radix-ui/react-icons";

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
};

const SidebarLink = ({ href, icon, children, active }: SidebarLinkProps) => (
  <li className="mb-1">
    <Link href={href}
      className={`flex items-center px-4 py-2 text-sm rounded-md mx-2 ${
        active
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      }`}
    >
      <span className="mr-3 text-lg">{icon}</span>
      {children}
    </Link>
  </li>
);

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  // Close sidebar on mobile when location changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

  // Reopen sidebar when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(true);
    }
  }, [isMobile]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // If the sidebar is closed on mobile, don't render anything
  if (!isOpen) return null;

  return (
    <aside
      className={`${
        isMobile ? "fixed z-50 inset-y-0 left-0" : "hidden md:flex"
      } flex-col w-64 bg-sidebar-background text-sidebar-foreground transition-all duration-300`}
    >
      {/* Logo and brand */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-sidebar-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          <div className="bg-primary p-1 rounded">
            <CodeIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">CodeLearn</h1>
        </div>
      </div>

      {/* User info section */}
      {user && (
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/profile">
            <div className="flex items-center space-x-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg p-2 -m-2 cursor-pointer transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 font-semibold">
                {user.displayName
                  ? user.displayName.substring(0, 2)
                  : user.username.substring(0, 2)}
              </div>
              <div>
                <h3 className="font-medium text-sm">
                  {user.displayName || user.username}
                </h3>
                <span className="text-xs text-sidebar-foreground/60 capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 bg-amber-600">
        <div className="px-3 mb-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
          Main
        </div>
        <ul>
          <SidebarLink
            href="/"
            icon={<DashboardIcon />}
            active={location === "/"}
          >
            Dashboard
          </SidebarLink>
          <SidebarLink
            href="/problems"
            icon={<QuestionMarkCircledIcon />}
            active={location.startsWith("/problem")}
          >
            Problems
          </SidebarLink>
          <SidebarLink
            href="/competitions"
            icon={<StarFilledIcon />}
            active={location.startsWith("/competition")}
          >
            Competitions
          </SidebarLink>
          <SidebarLink
            href="/submissions"
            icon={<FileTextIcon />}
            active={location === "/submissions"}
          >
            Submissions
          </SidebarLink>
        </ul>

        <div className="px-3 mt-6 mb-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
          Resources
        </div>
        <ul>
          <SidebarLink
            href="/discussions"
            icon={<ChatBubbleIcon />}
            active={location === "/discussions"}
          >
            Discussions
          </SidebarLink>
          <SidebarLink
            href="/learning-paths"
            icon={<RocketIcon />}
            active={location === "/learning-paths"}
          >
            Learning Paths
          </SidebarLink>
        </ul>

        {/* Admin section, conditionally shown based on user role */}
        {user && ['super_admin', 'admin', 'examiner'].includes(user.role) && (
          <>
            <div className="px-3 mt-6 mb-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Admin
            </div>
            <ul>
              {['super_admin', 'admin'].includes(user.role) && (
                <SidebarLink
                  href="/admin/users"
                  icon={<PersonIcon />}
                  active={location === "/admin/users"}
                >
                  User Management
                </SidebarLink>
              )}
              <SidebarLink
                href="/admin/problems"
                icon={<FileIcon />}
                active={location === "/admin/problems"}
              >
                Question Management
              </SidebarLink>
              {['super_admin', 'admin'].includes(user.role) && (
                <SidebarLink
                  href="/admin/reports"
                  icon={<BarChartIcon />}
                  active={location === "/admin/reports"}
                >
                  Reports
                </SidebarLink>
              )}
            </ul>
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-sidebar-border">
        <Link href="/settings">
          <a className="flex items-center px-4 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md">
            <GearIcon className="mr-3 text-lg" />
            Settings
          </a>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start px-4 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-md"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <ExitIcon className="mr-3 text-lg" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </aside>
  );
}