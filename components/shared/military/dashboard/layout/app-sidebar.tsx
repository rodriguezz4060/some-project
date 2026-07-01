"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CalendarClock,
  BarChart3,
  UserCircle,
  Users,
  Landmark,
  Crosshair,
  ShieldCheck,
  Camera,
  Fuel,
} from "lucide-react";

import { NavMain } from "@/components/shared/military/dashboard/layout/nav-main";
import { NavSecondary } from "@/components/shared/military/dashboard/layout/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navSecondary = [
  {
    title: "Профіль",
    url: "/profile",
    icon: UserCircle,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const canAdmin = role === "admin" || role === "moderator";

  const navMain = [
    {
      title: "Особовий склад",
      url: "/military",
      icon: Users,
      isActive: pathname === "/military",
    },
    {
      title: "БЗВП",
      url: "/bzvp",
      icon: Crosshair,
      isActive: pathname.startsWith("/bzvp"),
    },
    {
      title: "Підрозділи",
      url: "/military/units",
      icon: Landmark,
      isActive: pathname.startsWith("/military/units"),
    },
    {
      title: "Графік чергувань",
      url: "/military/schedule",
      icon: CalendarClock,
      isActive: pathname.startsWith("/military/schedule"),
    },
    {
      title: "Паливо",
      url: "/fuel",
      icon: Fuel,
      isActive: pathname.startsWith("/fuel"),
    },
    {
      title: "Звіти",
      url: "/military/reports",
      icon: BarChart3,
      isActive: pathname.startsWith("/military/reports"),
    },
    {
      title: "Детекція об'єктів",
      url: "/military/detection",
      icon: Camera,
      isActive: pathname.startsWith("/military/detection"),
    },
  ];
  if (canAdmin) {
    navMain.push({
      title: "Адміністрування",
      url: "/admin",
      icon: ShieldCheck,
      isActive: pathname.startsWith("/admin"),
    });
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      style={{
        top: "var(--header-height)",
        height: "calc(100svh - var(--header-height))",
      }}
    >
      <SidebarHeader />
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
