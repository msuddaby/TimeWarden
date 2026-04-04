import { createRootRouteWithContext, Outlet} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import {SidebarProvider} from "@/components/ui/sidebar.tsx";
import {AppSidebar} from "@/components/app-sidebar.tsx";
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
    queryClient: QueryClient
}

const RootLayout = () => (
    <>
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 p-4">
                <Outlet />
            </main>
            <TanStackRouterDevtools />
        </SidebarProvider>

    </>
)

export const Route = createRootRouteWithContext<MyRouterContext>()({ component: RootLayout })
