import {createFileRoute, Link} from '@tanstack/react-router'
import {useGetApiClientList} from "@/api/generated/client/client.ts";
import type {ClientVM} from "@/api/generated/models";
import type {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "@/components/data-table.tsx";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {DotsThreeVerticalIcon} from "@phosphor-icons/react";

export const Route = createFileRoute('/clients/')({
    component: ClientsRoute,
})

function ClientsRoute() {
    const { data: response, isPending } = useGetApiClientList();
    const clients = response?.data ?? [];

    return <section>
        <div className={"mb-4 "}>
            <h2 className={"text-4xl"}>
                Clients
            </h2>
        </div>

        {isPending ? (<p>Loading</p>) : clients.length === 0 ? (
            <p>No Clients yet</p>
        ) : (
            <DataTable columns={columns} data={clients} />
        )}

    </section>
}

const columns: ColumnDef<ClientVM>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "address",
        header: "Address",
    },
    {
        accessorKey: "id",
        header: "Client ID",
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
                        <DropdownMenuItem asChild>
                            <Link to={`/clients/$clientId`} params={{ clientId: client.id! }}>
                                View projects
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]