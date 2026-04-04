import {createFileRoute} from '@tanstack/react-router'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    return (
        <section>
            <h3>Welcome Home!</h3>
            <Card className="max-w-sm">
                <CardHeader>
                    <CardTitle>Project Overview</CardTitle>
                    <CardDescription>
                        Track progress and recent activity for your Vite app.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    Your design system is ready. Start building your next component.
                </CardContent>
            </Card>
        </section>
    )
}