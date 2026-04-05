import { createRootRouteWithContext, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { SidebarProvider } from "@/components/ui/sidebar.tsx";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import type { QueryClient } from '@tanstack/react-query'
import { isAuthenticated } from '@/lib/auth'

interface MyRouterContext {
    queryClient: QueryClient
}

function RootLayout() {
    const location = useLocation();

    if (location.pathname === '/login' || location.pathname === '/register') {
        return <Outlet />;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 p-4">
                <Outlet />
            </main>
            <TanStackRouterDevtools />
        </SidebarProvider>
    );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: RootLayout,
    beforeLoad: ({ location }) => {
        const authed = isAuthenticated();
        const publicRoutes = ['/login', '/register'];
        if (!authed && !publicRoutes.includes(location.pathname)) {
            throw redirect({ to: '/login', search: { redirect: location.href } });
        }
        if (authed && publicRoutes.includes(location.pathname)) {
            throw redirect({ to: '/' });
        }
    },
})
