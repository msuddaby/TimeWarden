import { useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useGetApiInvoiceInvoiceId } from '@/api/generated/invoice/invoice';
import { InvoiceForm, InvoiceFormSkeleton } from '../invoice-form';
import type { InvoiceFormState, LineItem } from '../invoice-form';

export const Route = createFileRoute('/invoices/$invoiceId/edit')({
    component: EditInvoicePage,
    validateSearch: (search: Record<string, unknown>) => ({
        timerHours: typeof search.timerHours === 'string' ? search.timerHours : undefined,
        timerDescription: typeof search.timerDescription === 'string' ? search.timerDescription : undefined,
        timerDate: typeof search.timerDate === 'string' ? search.timerDate : undefined,
    }),
});

function EditInvoicePage() {
    const { invoiceId } = Route.useParams();
    const { timerHours, timerDescription, timerDate } = Route.useSearch();
    const { data: invoiceResponse, isPending } = useGetApiInvoiceInvoiceId(invoiceId);
    const invoice = invoiceResponse?.data ?? null;

    const prefilledItems: LineItem[] | undefined = timerHours
        ? [{
            _key: crypto.randomUUID(),
            projectId: '',
            description: timerDescription ?? '',
            dateOfWork: timerDate ?? new Date().toISOString().slice(0, 10),
            hourlyRate: '',
            hoursOfWork: timerHours,
        }]
        : undefined;

    const initialState = useMemo<InvoiceFormState | undefined>(() => {
        if (!invoice) return undefined;
        return {
            clientId: invoice.clientId ?? '',
            invoiceDate: invoice.invoiceDate?.slice(0, 10) ?? '',
            items: (invoice.itemsOfWork ?? []).map((item) => ({
                _key: crypto.randomUUID(),
                id: item.id,
                projectId: item.projectId ?? '',
                description: item.description ?? '',
                dateOfWork: item.dateOfWork?.slice(0, 10) ?? '',
                hourlyRate: String(item.hourlyRate ?? ''),
                hoursOfWork: String(item.hoursOfWork ?? ''),
            })),
        };
    }, [invoice]);

    if (isPending) {
        return <InvoiceFormSkeleton />;
    }

    if (!initialState) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-muted-foreground text-lg">Invoice not found.</p>
            </div>
        );
    }

    return (
        <InvoiceForm
            mode="edit"
            invoiceId={invoiceId}
            initialState={initialState}
            prefilledItems={prefilledItems}
        />
    );
}
