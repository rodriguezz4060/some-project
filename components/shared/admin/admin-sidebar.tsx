"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  IconDashboard,
  IconHistory,
  IconHelp,
  IconSearch,
  IconUserCircle,
  IconUsers,
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
    title: "Профіль",
    url: "/profile",
    icon: IconUserCircle,
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

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const navMain = [
    {
      title: "Дашборд",
      url: "/admin",
      icon: IconDashboard,
      isActive: pathname === "/admin",
    },
    ...(isAdmin
      ? [
          {
            title: "Користувачі",
            url: "/admin/users",
            icon: IconUsers,
            isActive: pathname.startsWith("/admin/users"),
          } as const,
        ]
      : []),
    {
      title: "Лог дій",
      url: "/admin/logs",
      icon: IconHistory,
      isActive: pathname.startsWith("/admin/logs"),
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
