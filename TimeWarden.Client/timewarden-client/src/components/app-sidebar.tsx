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
  RowsIcon,
  WaveformIcon,
  CommandIcon,
  CropIcon,
  ChartPieIcon,
  MapTrifoldIcon, AddressBookIcon, InvoiceIcon
} from "@phosphor-icons/react"
import {Link} from "@tanstack/react-router";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: (
        <RowsIcon
        />
      ),
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: (
        <WaveformIcon
        />
      ),
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: (
        <CommandIcon
        />
      ),
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Clients",
      url: "#",
      icon: (
        <AddressBookIcon
        />
      ),
      isActive: true,
      items: [
        {
          title: "Clients",
          url: "/clients",
        },
        {
          title: "Projects",
          url: "#",
        },
      ],
    },
    {
      title: "Invoices",
      url: "#",
      icon: (
        <InvoiceIcon
        />
      ),
      items: [
        {
          title: "Invoices",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: (
        <CropIcon
        />
      ),
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: (
        <ChartPieIcon
        />
      ),
    },
    {
      name: "Travel",
      url: "#",
      icon: (
        <MapTrifoldIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
