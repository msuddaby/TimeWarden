import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  AddressBookIcon, InvoiceIcon
} from "@phosphor-icons/react"
import {Link} from "@tanstack/react-router";
import {useAuth} from "@/contexts/auth-context";
import {TimerWidget} from "@/components/timer-widget";

const navMain = [
  {
    title: "Clients",
    url: "#",
    icon: (
      <AddressBookIcon />
    ),
    isActive: true,
    items: [
      {
        title: "Clients",
        url: "/clients",
      },
    ],
  },
  {
    title: "Invoices",
    url: "#",
    icon: (
      <InvoiceIcon />
    ),
    items: [
      {
        title: "Invoices",
        url: "/invoices",
      },
      {
        title: "New Invoice",
        url: "/invoices/new",
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div>
          <Link className={"font-medium"} to={"/"}>
            TimeWarden
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <TimerWidget />
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
