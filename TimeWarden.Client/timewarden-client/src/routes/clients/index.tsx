import { createFileRoute, Link } from '@tanstack/react-router'
import { useGetApiClientList } from "@/api/generated/client/client.ts";
import type { ClientVM } from "@/api/generated/models";
import { Button } from "@/components/ui/button.tsx";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
    PlusIcon,
    DotsThreeVerticalIcon,
    BuildingsIcon,
    MapPinIcon,
    UserIcon,
} from "@phosphor-icons/react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet.tsx";
import { ClientFormSheet } from "../../components/forms/client-form-sheet.tsx";
import { useState } from "react";

export const Route = createFileRoute('/clients/')({
    component: ClientsRoute,
})

function ClientsRoute() {
    const { data: response, isPending } = useGetApiClientList();
    const clients = response?.data ?? [];
    const [sheetOpen, setSheetOpen] = useState(false);

    if (isPending) {
        return <ClientsSkeleton />;
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground mt-1">
                        {clients.length} {clients.length === 1 ? 'client' : 'clients'}
                    </p>
                </div>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen} modal={false}>
                    <SheetTrigger asChild>
                        <Button>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Client
                        </Button>
                    </SheetTrigger>
                    <ClientFormSheet onClose={() => setSheetOpen(false)} />
                </Sheet>
            </div>

            <Separator />

            {/* Client Cards */}
            {clients.length === 0 ? (
                <EmptyState onAdd={() => setSheetOpen(true)} />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ClientCard({ client }: { client: ClientVM }) {
    const address = [client.city, client.province].filter(Boolean).join(', ');

    return (
        <Card className="group relative transition-colors hover:border-primary/30">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="space-y-1">
                    <CardTitle className="text-base leading-tight">
                        <Link
                            to="/clients/$clientId"
                            params={{ clientId: client.id! }}
                            className="hover:underline"
                        >
                            {client.name}
                        </Link>
                    </CardTitle>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="xs"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <DotsThreeVerticalIcon className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(client.id ?? "")}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/clients/$clientId" params={{ clientId: client.id! }}>
                                View projects
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                {client.attention && (
                    <div className="text-muted-foreground flex items-center gap-2">
                        <UserIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{client.attention}</span>
                    </div>
                )}
                {client.address && (
                    <div className="text-muted-foreground flex items-center gap-2">
                        <BuildingsIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{client.address}</span>
                    </div>
                )}
                {address && (
                    <div className="text-muted-foreground flex items-center gap-2">
                        <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{address}{client.zip ? ` ${client.zip}` : ''}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <BuildingsIcon className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="text-lg font-medium">No clients yet</h3>
            <p className="text-muted-foreground mb-6 mt-1 text-sm">
                Get started by adding your first client.
            </p>
            <Button onClick={onAdd}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Client
            </Button>
        </div>
    );
}

function ClientsSkeleton() {
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <Skeleton className="h-9 w-32" />
                <Skeleton className="mt-2 h-5 w-20" />
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-3">
                            <Skeleton className="h-5 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-36" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
