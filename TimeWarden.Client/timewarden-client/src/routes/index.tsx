import { createFileRoute, Link } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'
import { useGetApiClientList } from "@/api/generated/client/client"
import {
    getGetApiInvoiceListByClientClientIdQueryOptions,
} from "@/api/generated/invoice/invoice"
import type { InvoiceVM } from "@/api/generated/models"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
    BuildingsIcon,
    InvoiceIcon,
    PlusIcon,
    ArrowRightIcon,
    CurrencyDollarIcon,
    CalendarDotsIcon,
} from "@phosphor-icons/react"
import { InvoiceStatusBadge } from "@/components/invoice-status-badge"

export const Route = createFileRoute('/')({
    component: Dashboard,
})

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    })
}

function Dashboard() {
    const { user } = useAuth()
    const { data: clientsResponse, isPending: clientsLoading } = useGetApiClientList()
    const clients = clientsResponse?.data ?? []

    const invoiceQueries = useQueries({
        queries: clients.map((client) =>
            getGetApiInvoiceListByClientClientIdQueryOptions(client.id!)
        ),
    })

    const invoicesLoading = clientsLoading || invoiceQueries.some((q) => q.isPending)

    const allInvoices: (InvoiceVM & { _clientName: string })[] = invoiceQueries.flatMap(
        (q, i) =>
            (q.data?.data ?? []).map((inv) => ({
                ...inv,
                _clientName: clients[i]?.name ?? 'Unknown',
            }))
    )

    const totalRevenue = allInvoices.reduce(
        (sum, inv) => sum + (Number(inv.totalAmount) || 0),
        0,
    )

    const recentInvoices = [...allInvoices]
        .sort((a, b) => {
            const da = a.invoiceDate ? new Date(a.invoiceDate).getTime() : 0
            const db = b.invoiceDate ? new Date(b.invoiceDate).getTime() : 0
            return db - da
        })
        .slice(0, 5)

    const firstName = user?.name?.split(' ')[0] ?? 'there'

    if (clientsLoading) {
        return <DashboardSkeleton />
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            {/* Greeting */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {firstName}
                </h1>
                <p className="text-muted-foreground mt-1">
                    Here's an overview of your business.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Clients
                        </CardTitle>
                        <BuildingsIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clients.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Invoices
                        </CardTitle>
                        <InvoiceIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {invoicesLoading ? (
                            <Skeleton className="h-8 w-12" />
                        ) : (
                            <div className="text-2xl font-bold">{allInvoices.length}</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                        <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {invoicesLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-2xl font-bold">
                                {formatCurrency(totalRevenue)}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <Button asChild>
                    <Link to="/clients">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Client
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link to="/invoices/new">
                        <InvoiceIcon className="mr-2 h-4 w-4" />
                        New Invoice
                    </Link>
                </Button>
            </div>

            <Separator />

            {/* Recent Invoices */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">
                        Recent Invoices
                    </h2>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/invoices">
                            View all
                            <ArrowRightIcon className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {invoicesLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-lg" />
                        ))}
                    </div>
                ) : recentInvoices.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <InvoiceIcon className="text-muted-foreground mb-3 h-10 w-10" />
                            <p className="text-muted-foreground text-sm">
                                No invoices yet. Create one to get started.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {recentInvoices.map((invoice) => (
                            <Link
                                key={invoice.id}
                                to="/invoices/$invoiceId"
                                params={{ invoiceId: invoice.id! }}
                                className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                                        <CalendarDotsIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium leading-tight">
                                            {invoice._clientName}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-muted-foreground">
                                                {invoice.invoiceDate
                                                    ? formatDate(invoice.invoiceDate)
                                                    : 'No date'}{' '}
                                                &middot;{' '}
                                                {Number(invoice.itemCount) || 0}{' '}
                                                {Number(invoice.itemCount) === 1 ? 'item' : 'items'}
                                            </p>
                                            <InvoiceStatusBadge status={invoice.status} />
                                        </div>
                                    </div>
                                </div>
                                <ArrowRightIcon className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="mt-2 h-5 w-48" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-20" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="flex gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-36" />
            </div>
            <Separator />
            <div className="space-y-4">
                <Skeleton className="h-7 w-40" />
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    )
}
