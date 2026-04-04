import {createFileRoute, Link} from '@tanstack/react-router'
import {useGetApiClientList} from "@/api/generated/client/client.ts";
import {useGetApiProjectListByClientClientId} from "@/api/generated/project/project.ts";
import type {ColumnDef} from "@tanstack/react-table";
import type {InvoiceVM, ProjectVM} from "@/api/generated/models";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {DotsThreeVerticalIcon} from "@phosphor-icons/react";
import {DataTable} from "@/components/data-table.tsx";
import {useGetApiInvoiceListByClientClientId} from "@/api/generated/invoice/invoice.ts";

export const Route = createFileRoute('/clients/$clientId/')({
  component: ClientDetailPage,
})

function ClientDetailPage() {
    const { clientId } = Route.useParams();
    const { data: clientsResponse, isPending: clientsLoading } = useGetApiClientList();
    const client = clientsResponse?.data?.find((c) => c.id === clientId);

    const { data: projectsResponse, isPending: projectsLoading } = useGetApiProjectListByClientClientId(clientId);
    const projects = projectsResponse?.data ?? [];

    const { data: invoicesResponse, isPending: invoicesLoading } = useGetApiInvoiceListByClientClientId(clientId);
    const invoices = invoicesResponse?.data ?? [];

    if (clientsLoading) {
        return (
            <section>
                <p>Loading client...</p>
            </section>
        )
    }

    if (projectsLoading) {
        return (
            <section>
                <p>Loading projects...</p>
            </section>
        )
    }

    if (invoicesLoading) {
        return (
            <section>
                <p>Loading invoices...</p>
            </section>
        )
    }

    return (
        <>
            <div>
                <h2 className={"text-4xl mb-4"}>{client?.name}</h2>
            </div>
            <section className="mb-8">
                <h3 className={"text-2xl mb-4"}>Projects</h3>
                {projects.length === 0 ? (
                    <p>No projects for this client yet.</p>
                ) : (
                    <DataTable columns={projectColumns} data={projects} />
                )}
            </section>
            <section>
                <h3 className={"text-2xl mb-4"}>Invoices</h3>
                {invoices.length === 0 ? (
                    <p>No invoices for this client yet.</p>
                ) : (
                    <DataTable columns={invoicesColumns} data={invoices} />
                )}
            </section>
        </>
    )

}

const invoicesColumns: ColumnDef<InvoiceVM>[] = [
    {
        accessorKey: "invoiceDate",
        header: "Invoice Date",
        cell: ({ row }) => {
            const invoice = row.original;
            const date = new Date(invoice.invoiceDate!);
            const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "short" });
            return formatter.format(date);
        }
    },
    {
        accessorKey: "id",
        header: "Invoice ID"
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const invoice = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className={"h-8 w-8 p-0"}>
                            <span className={"sr-only"}>Open menu</span>
                            <DotsThreeVerticalIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(invoice.id ?? "")}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link to={`/invoices/$invoiceId`} params={{ invoiceId: invoice.id! }}>
                                View invoice
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }

]

const projectColumns: ColumnDef<ProjectVM>[] = [
    {
        accessorKey: "projectName",
        header: "Project"
    },
    {
        accessorKey: "id",
        header: "Project ID"
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const client = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className={"h-8 w-8 p-0"}>
                            <span className={"sr-only"}>Open menu</span>
                            <DotsThreeVerticalIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(client.id ?? "")}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }

]