"use client";

import {
  IconCalendarClock,
  IconHelp,
  IconReportAnalytics,
  IconSearch,
  IconSettings,
  IconUsers,
  IconBuildingFortress,
} from "@tabler/icons-react";

import { NavMain } from "@/components/shared/military/dashboard/nav-main";
import { NavSecondary } from "@/components/shared/military/dashboard/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navMain = [
  {
    title: "Особовий склад",
    url: "/military",
    icon: IconUsers,
  },
  {
    title: "Підрозділи",
    url: "/military/units",
    icon: IconBuildingFortress,
  },
  {
    title: "Графік чергувань",
    url: "/military/schedule",
    icon: IconCalendarClock,
  },
  {
    title: "Звіти",
    url: "/military/reports",
    icon: IconReportAnalytics,
  },
];

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
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader />
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
