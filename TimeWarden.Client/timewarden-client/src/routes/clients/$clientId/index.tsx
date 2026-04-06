import { createFileRoute, Link } from '@tanstack/react-router'
import { useGetApiClientList } from "@/api/generated/client/client.ts";
import { useGetApiProjectListByClientClientId } from "@/api/generated/project/project.ts";
import { useGetApiInvoiceListByClientClientId } from "@/api/generated/invoice/invoice.ts";
import type { InvoiceVM, ProjectVM } from "@/api/generated/models";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx";
import {
    BuildingsIcon,
    MapPinIcon,
    UserIcon,
    FolderIcon,
    InvoiceIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    PlusIcon,
} from "@phosphor-icons/react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet.tsx";
import { ProjectFormSheet } from "@/components/forms/project-form-sheet.tsx";
import { useState } from "react";

export const Route = createFileRoute('/clients/$clientId/')({
    component: ClientDetailPage,
})

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function ClientDetailPage() {
    const { clientId } = Route.useParams();
    const { data: clientsResponse, isPending: clientsLoading } = useGetApiClientList();
    const client = clientsResponse?.data?.find((c) => c.id === clientId);

    const { data: projectsResponse, isPending: projectsLoading } = useGetApiProjectListByClientClientId(clientId);
    const projects = projectsResponse?.data ?? [];

    const { data: invoicesResponse, isPending: invoicesLoading } = useGetApiInvoiceListByClientClientId(clientId);
    const invoices = invoicesResponse?.data ?? [];

    const [projectSheetOpen, setProjectSheetOpen] = useState(false);

    const isLoading = clientsLoading || projectsLoading || invoicesLoading;

    if (isLoading) {
        return <ClientDetailSkeleton />;
    }

    if (!client) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-muted-foreground text-lg">Client not found.</p>
            </div>
        );
    }

    const address = [client.city, client.province].filter(Boolean).join(', ');
    const fullAddress = [address, client.zip].filter(Boolean).join(' ');

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Back link */}
            <Link to="/clients" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors">
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                Back to clients
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                    <p className="text-muted-foreground mt-1 font-mono text-sm">
                        {client.id?.slice(0, 8)}
                    </p>
                </div>
            </div>

            <Separator />

            {/* Client Details Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-medium">Client Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {client.attention && (
                        <div className="flex items-center gap-2">
                            <UserIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                            <span>{client.attention}</span>
                        </div>
                    )}
                    {client.address && (
                        <div className="flex items-center gap-2">
                            <BuildingsIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                            <span>{client.address}</span>
                        </div>
                    )}
                    {fullAddress && (
                        <div className="flex items-center gap-2">
                            <MapPinIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                            <span>{fullAddress}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{projects.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{invoices.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Projects Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FolderIcon className="h-5 w-5" />
                        Projects
                    </CardTitle>
                    <Sheet open={projectSheetOpen} onOpenChange={setProjectSheetOpen} modal={false}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Project
                            </Button>
                        </SheetTrigger>
                        <ProjectFormSheet clientId={clientId} onClose={() => setProjectSheetOpen(false)} />
                    </Sheet>
                </CardHeader>
                <CardContent>
                    {projects.length === 0 ? (
                        <div className="flex flex-col items-center py-8">
                            <FolderIcon className="text-muted-foreground mb-3 h-10 w-10" />
                            <p className="text-muted-foreground text-sm">No projects yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project Name</TableHead>
                                    <TableHead className="text-right w-24"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.map((project) => (
                                    <ProjectRow key={project.id} project={project} />
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Invoices Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <InvoiceIcon className="h-5 w-5" />
                        Invoices
                    </CardTitle>
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/invoices/new" search={{ clientId, timerHours: undefined, timerDescription: undefined, timerDate: undefined }}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            New Invoice
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {invoices.length === 0 ? (
                        <div className="flex flex-col items-center py-8">
                            <InvoiceIcon className="text-muted-foreground mb-3 h-10 w-10" />
                            <p className="text-muted-foreground text-sm">No invoices yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice Date</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead className="text-right w-24"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <InvoiceRow key={invoice.id} invoice={invoice} />
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ProjectRow({ project }: { project: ProjectVM }) {
    return (
        <TableRow>
            <TableCell className="font-medium">{project.projectName}</TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="xs" asChild>
                    <Link to="/clients/$clientId" params={{ clientId: project.clientId! }}>
                        <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                </Button>
            </TableCell>
        </TableRow>
    );
}

function InvoiceRow({ invoice }: { invoice: InvoiceVM }) {
    const itemCount = invoice.itemsOfWork?.length ?? 0;

    return (
        <TableRow>
            <TableCell className="font-medium">
                {invoice.invoiceDate ? formatDate(invoice.invoiceDate) : '—'}
            </TableCell>
            <TableCell className="text-muted-foreground">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="xs" asChild>
                    <Link to="/invoices/$invoiceId" params={{ invoiceId: invoice.id! }}>
                        <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                </Button>
            </TableCell>
        </TableRow>
    );
}

function ClientDetailSkeleton() {
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <Skeleton className="h-4 w-28" />
            <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="mt-2 h-4 w-20" />
            </div>
            <Separator />
            <Card>
                <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-44" />
                </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-20" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-10" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Array.from({ length: 3 }).map((_, j) => (
                            <Skeleton key={j} className="h-5 w-full" />
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
