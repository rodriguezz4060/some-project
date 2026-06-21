"use client";

import { usePathname } from "next/navigation";
import {
  IconCalendarClock,
  IconHelp,
  IconReportAnalytics,
  IconSearch,
  IconSettings,
  IconUsers,
  IconBuildingFortress,
  IconTargetArrow,
} from "@tabler/icons-react";

import { NavMain } from "@/components/shared/military/dashboard/layout/nav-main";
import { NavSecondary } from "@/components/shared/military/dashboard/layout/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navSecondary = [
  {
    title: "Налаштування",
    url: "/military/settings",
    icon: IconSettings,
  },
  {
    title: "Довідка",
    url: "#",
    icon: IconHelp,
  },
  {
    title: "Пошук",
    url: "#",
    icon: IconSearch,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const navMain = [
    {
      title: "Особовий склад",
      url: "/military",
      icon: IconUsers,
      isActive: pathname === "/military",
    },
    {
      title: "БЗВП",
      url: "/bzvp",
      icon: IconTargetArrow,
      isActive: pathname.startsWith("/bzvp"),
    },
    {
      title: "Підрозділи",
      url: "/military/units",
      icon: IconBuildingFortress,
      isActive: pathname.startsWith("/military/units"),
    },
    {
      title: "Графік чергувань",
      url: "/military/schedule",
      icon: IconCalendarClock,
      isActive: pathname.startsWith("/military/schedule"),
    },
    {
      title: "Звіти",
      url: "/military/reports",
      icon: IconReportAnalytics,
      isActive: pathname.startsWith("/military/reports"),
    },
  ];
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
