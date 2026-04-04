import { createFileRoute } from '@tanstack/react-router'
import {useGetApiInvoiceInvoiceId} from "@/api/generated/invoice/invoice.ts";
import type {InvoiceVM, ItemOfWorkVM, ProjectVM} from "@/api/generated/models";

export const Route = createFileRoute('/invoices/$invoiceId/')({
  component: InvoiceDetailPage,
})

function InvoiceDetailPage() {
    const { invoiceId } = Route.useParams();
    const { data: invoiceResponse, isPending: invoicesLoading } = useGetApiInvoiceInvoiceId(invoiceId);
    const invoice = invoiceResponse?.data ?? null;

    if (!invoice) {
        return <div>No invoice found</div>;
    }

    if (invoicesLoading) {
        return <div>Loading invoices</div>;
    }

    const viewModel = buildViewModel(invoice);

    console.log("viewModel", viewModel);

    return (
        <>
            <h2 className={"text-2xl mb-3"}>{invoice.invoiceDate}</h2>
            {viewModel.map((details) => (
                <div key={details.project?.id ?? "no-project"} className={"mb-6"}>
                    <h3 className={"text-xl mb-2"}>{details.project?.projectName ?? "Items"}</h3>
                    <ul className={"list-disc list-inside"}>
                        {details.itemsOfWork.map((item) => (
                            <li key={item.id}>
                                {item.description} - {item.hoursOfWork} hours
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </>
    )
}

function buildViewModel(invoice: InvoiceVM): InvoiceDetails[] {
    const map = new Map<string, InvoiceDetails>();

    for (const item of invoice.itemsOfWork ?? []) {
        const projectId = item.projectId!;

        if (!map.has(projectId)) {
            map.set(projectId, { project: item.project!, itemsOfWork: [] });
        }

        map.get(projectId)!.itemsOfWork.push(item);
    }

    return Array.from(map.values());
}

interface InvoiceDetails {
    project: ProjectVM | null;
    itemsOfWork: ItemOfWorkVM[];
}
