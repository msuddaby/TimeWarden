import { createFileRoute, Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetApiInvoiceInvoiceId,
    getGetApiInvoiceInvoiceIdQueryKey,
    usePatchApiInvoiceInvoiceIdStatus,
} from "@/api/generated/invoice/invoice.ts";
import type { InvoiceVM, InvoiceStatus, ItemOfWorkVM, ProjectVM, ClientVM, UserVM } from "@/api/generated/models";
import { InvoiceStatusBadge } from '@/components/invoice-status-badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FilePdfIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { pdf } from '@react-pdf/renderer';
import { InvoicePdf } from './invoice-pdf';
import { useState } from 'react';

export const Route = createFileRoute('/invoices/$invoiceId/')({
    component: InvoiceDetailPage,
})

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

function toNumber(value: number | string | undefined): number {
    return Number(value) || 0;
}

function InvoiceDetailPage() {
    const { invoiceId } = Route.useParams();
    const { data: invoiceResponse, isPending: invoicesLoading } = useGetApiInvoiceInvoiceId(invoiceId);
    const invoice = invoiceResponse?.data ?? null;
    const queryClient = useQueryClient();
    const statusMutation = usePatchApiInvoiceInvoiceIdStatus();

    if (invoicesLoading) {
        return <InvoiceSkeleton />;
    }

    if (!invoice) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-muted-foreground text-lg">Invoice not found.</p>
            </div>
        );
    }

    const nextStatus: InvoiceStatus | null =
        invoice.status === 'Draft' ? 'Sent' :
        invoice.status === 'Sent' ? 'Paid' :
        null;

    function handleAdvanceStatus() {
        if (!nextStatus || !invoice?.id) return;
        statusMutation.mutate(
            { invoiceId: invoice.id, data: { status: nextStatus } },
            {
                onSuccess() {
                    queryClient.invalidateQueries({
                        queryKey: getGetApiInvoiceInvoiceIdQueryKey(invoiceId),
                    });
                },
            },
        );
    }

    const sections = buildViewModel(invoice);
    const grandTotal = sections.reduce((sum, s) => sum + s.total, 0);
    const totalHours = sections.reduce((sum, s) => sum + s.totalHours, 0);

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            {/* Invoice Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">Invoice</h1>
                        <InvoiceStatusBadge status={invoice.status} />
                    </div>
                    <p className="text-muted-foreground mt-1">
                        <span className="font-medium">Invoice Date:</span>{' '}
                        {invoice.invoiceDate ? formatDate(invoice.invoiceDate) : 'No date'}
                    </p>
                </div>
                <div className="flex items-start gap-4">
                    <div className="text-right">
                        <p className="text-muted-foreground text-sm">Invoice ID</p>
                        <p className="font-mono text-sm">{invoice.id?.slice(0, 8)}</p>
                    </div>
                    {nextStatus && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAdvanceStatus}
                            disabled={statusMutation.isPending}
                        >
                            Mark as {nextStatus}
                        </Button>
                    )}
                    <DownloadPdfButton invoice={invoice} />
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/invoices/$invoiceId/edit" params={{ invoiceId: invoiceId }}>
                            <PencilSimpleIcon className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                </div>
            </div>

            <Separator />

            {/* From / Bill To */}
            <div className="grid grid-cols-2 gap-4">
                {invoice.user && <UserDetails user={invoice.user} />}
                {invoice.client && <ClientDetails client={invoice.client} />}
            </div>

            <Separator />

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Total Amount
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(grandTotal)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Total Hours
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">
                            Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{sections.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Project Sections */}
            {sections.map((section) => (
                <Card key={section.project?.id ?? "no-project"}>
                    <CardHeader>
                        <CardTitle>{section.project?.projectName ?? "Uncategorised"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[45%]">Description</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                    <TableHead className="text-right">Rate</TableHead>
                                    <TableHead className="text-right">Hours</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {section.itemsOfWork.map((item) => {
                                    const rate = toNumber(item.hourlyRate);
                                    const hours = toNumber(item.hoursOfWork);
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.description}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.dateOfWork ? formatDate(item.dateOfWork) : '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(rate)}/hr
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {hours.toFixed(1)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(rate * hours)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3}>Subtotal</TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {section.totalHours.toFixed(1)}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {formatCurrency(section.total)}
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CardContent>
                </Card>
            ))}

            {/* Extra Notes */}
            {invoice.extraNotes && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-muted-foreground text-sm font-medium">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{invoice.extraNotes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Grand Total */}
            {sections.length > 1 && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="flex items-center justify-between py-4">
                        <span className="text-lg font-semibold">Grand Total</span>
                        <span className="text-2xl font-bold">{formatCurrency(grandTotal)}</span>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function DownloadPdfButton({ invoice }: { invoice: InvoiceVM }) {
    const [generating, setGenerating] = useState(false);

    async function handleDownload() {
        setGenerating(true);
        try {
            const blob = await pdf(<InvoicePdf invoice={invoice} />).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateSlug = invoice.invoiceDate?.slice(0, 10) ?? 'invoice';
            a.download = `invoice-${dateSlug}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setGenerating(false);
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={generating}>
            <FilePdfIcon className="mr-2 h-4 w-4" />
            {generating ? 'Generating...' : 'Download PDF'}
        </Button>
    );
}

function UserDetails({ user }: { user: UserVM }) {
    const addressParts = [user.city, user.province].filter(Boolean).join(', ');
    const fullAddress = [addressParts, user.zip].filter(Boolean).join(' ');

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">From</CardTitle>
            </CardHeader>
            <CardContent>
                {user.name && <p className="text-lg font-semibold">{user.name}</p>}
                {user.address && <p className="text-muted-foreground">{user.address}</p>}
                {fullAddress && <p className="text-muted-foreground">{fullAddress}</p>}
                {user.phone && <p className="text-muted-foreground">{user.phone}</p>}
            </CardContent>
        </Card>
    );
}

function ClientDetails({ client }: { client: ClientVM }) {
    const addressParts = [client.city, client.province].filter(Boolean).join(', ');
    const fullAddress = [addressParts, client.zip].filter(Boolean).join(' ');

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">Bill To</CardTitle>
            </CardHeader>
            <CardContent>
                {client.attention && (
                    <p className="text-muted-foreground text-sm">Attn: {client.attention}</p>
                )}
                {client.name && <p className="text-lg font-semibold">{client.name}</p>}
                {client.address && <p className="text-muted-foreground">{client.address}</p>}
                {fullAddress && <p className="text-muted-foreground">{fullAddress}</p>}
            </CardContent>
        </Card>
    );
}

function InvoiceSkeleton() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="mt-2 h-5 w-32" />
            </div>
            <Separator />
            <Card>
                <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-16" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-40" />
                </CardContent>
            </Card>
            <Separator />
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-5 w-full" />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function buildViewModel(invoice: InvoiceVM): InvoiceSection[] {
    const map = new Map<string, InvoiceSection>();

    for (const item of invoice.itemsOfWork ?? []) {
        const projectId = item.projectId ?? "uncategorised";

        if (!map.has(projectId)) {
            map.set(projectId, {
                project: item.project ?? null,
                itemsOfWork: [],
                total: 0,
                totalHours: 0,
            });
        }

        const section = map.get(projectId)!;
        const hours = toNumber(item.hoursOfWork);
        const rate = toNumber(item.hourlyRate);

        section.itemsOfWork.push(item);
        section.totalHours += hours;
        section.total += hours * rate;
    }

    return Array.from(map.values());
}

interface InvoiceSection {
    project: ProjectVM | null;
    itemsOfWork: ItemOfWorkVM[];
    total: number;
    totalHours: number;
}
