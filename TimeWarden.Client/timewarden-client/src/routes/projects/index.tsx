import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/projects/')({
  component: RouteComponent,
})

function RouteComponent() {

  return <div>Hello "/projects/"!</div>
}

// const columns: ColumnDef<ProjectVM>[] = [
//     {
//         accessorKey: "projectName",
//         header: "Project"
//     },
//     {
//         accessorKey: "id",
//         header: "Project ID"
//     },
//     {
//         id: "actions",
//         cell: ({ row }) => {
//             const client = row.original;
//
//             return (
//                 <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                         <Button variant={"ghost"} className={"h-8 w-8 p-0"}>
//                             <span className={"sr-only"}>Open menu</span>
//                             <DotsThreeVerticalIcon />
//                         </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                         <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                         <DropdownMenuItem
//                             onClick={() => navigator.clipboard.writeText(client.id ?? "")}
//                         >
//                             Copy ID
//                         </DropdownMenuItem>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem>View customer</DropdownMenuItem>
//                         <DropdownMenuItem>View payment details</DropdownMenuItem>
//                     </DropdownMenuContent>
//                 </DropdownMenu>
//             )
//         }
//     }
//
// ]