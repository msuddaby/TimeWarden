// import {
//     Sidebar,
//     SidebarContent,
//     SidebarFooter,
//     SidebarHeader,
//     SidebarMenu, SidebarMenuButton, SidebarMenuItem
// } from "@/components/ui/sidebar.tsx";
// import * as React from "react";
//
// export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//
//     return (
//         <Sidebar collapsible="offcanvas" {...props}>
//             <SidebarHeader>
//                 <SidebarMenu>
//                     <SidebarMenuItem>
//                         <SidebarMenuButton
//                             asChild
//                             className="data-[slot=sidebar-menu-button]:p-1.5!"
//                         >
//                             <a href="#">
//                                 <span className="text-base font-semibold">Acme Inc.</span>
//                             </a>
//                         </SidebarMenuButton>
//                     </SidebarMenuItem>
//                 </SidebarMenu>
//             </SidebarHeader>
//             <SidebarContent>
//                 <NavMain items={data.navMain} />
//                 <NavDocuments items={data.documents} />
//                 <NavSecondary items={data.navSecondary} className="mt-auto" />
//             </SidebarContent>
//             <SidebarFooter>
//                 <NavUser user={data.user} />
//             </SidebarFooter>
//         </Sidebar>
//     )
// }