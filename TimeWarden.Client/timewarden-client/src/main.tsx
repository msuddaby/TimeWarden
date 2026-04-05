import './index.css'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AuthProvider} from "@/contexts/auth-context.tsx";
import {TimerProvider} from "@/contexts/timer-context.tsx";

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({ routeTree, context: { queryClient } })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <TimerProvider>
                        <TooltipProvider>
                            <RouterProvider router={router}/>
                        </TooltipProvider>
                    </TimerProvider>
                </AuthProvider>
            </QueryClientProvider>
        </StrictMode>,
    )
}