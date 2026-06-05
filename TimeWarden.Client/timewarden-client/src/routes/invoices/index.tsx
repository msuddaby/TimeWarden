import { createFileRoute, Link } from '@tanstack/react-router';
import { useGetApiClientList } from '@/api/generated/client/client';
import { useGetApiInvoiceListByClientClientId } from '@/api/generated/invoice/invoice';
import type { InvoiceVM } from '@/api/generated/models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { PlusIcon, InvoiceIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { InvoiceStatusBadge } from '@/components/invoice-status-badge';
import {formatDate} from "@/lib/utils.ts";

export const Route = createFileRoute('/invoices/')({
    component: InvoicesRoute,
});

function InvoicesRoute() {
    const { data: clientsResponse, isPending: clientsLoading } = useGetApiClientList();
    const clients = clientsResponse?.data ?? [];

    if (clientsLoading) {
        return <InvoicesSkeleton />;
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage invoices across all clients
                    </p>
                </div>
                <Button asChild>
                    <Link to="/invoices/new">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Invoice
                    </Link>
                </Button>
            </div>

            <Separator />

            {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
                    <InvoiceIcon className="text-muted-foreground mb-4 h-12 w-12" />
                    <h3 className="text-lg font-medium">No clients yet</h3>
                    <p className="text-muted-foreground mb-6 mt-1 text-sm">
                        Add a client to start creating invoices.
                    </p>
                    <Button asChild variant="outline">
                        <Link to="/clients">Go to Clients</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {clients.map((client) => (
                        <ClientInvoicesSection key={client.id} clientId={client.id!} clientName={client.name ?? 'Unknown'} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ClientInvoicesSection({ clientId, clientName }: { clientId: string; clientName: string }) {
    const { data: invoicesResponse, isPending } = useGetApiInvoiceListByClientClientId(clientId);
    const invoices = invoicesResponse?.data ?? [];

    if (isPending) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (invoices.length === 0) return null;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{clientName}</CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link to="/invoices/new" search={{ clientId }}>
                        <PlusIcon className="mr-2 h-3.5 w-3.5" />
                        Add Invoice
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <InvoiceRow key={invoice.id} invoice={invoice} />
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function InvoiceRow({ invoice }: { invoice: InvoiceVM }) {
    const itemCount = invoice.itemCount ?? 0;

    return (
        <TableRow>
            <TableCell className="font-medium">
                {invoice.invoiceDate ? formatDate(invoice.invoiceDate) : '—'}
            </TableCell>
            <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
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

function InvoicesSkeleton() {
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <Skeleton className="h-9 w-36" />
                <Skeleton className="mt-2 h-5 w-56" />
            </div>
            <Separator />
            {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
