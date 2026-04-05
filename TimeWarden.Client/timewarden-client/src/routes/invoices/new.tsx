import { createFileRoute } from '@tanstack/react-router';
import { InvoiceForm } from './invoice-form';
import type { LineItem } from './invoice-form';

export const Route = createFileRoute('/invoices/new')({
    component: NewInvoicePage,
    validateSearch: (search: Record<string, unknown>) => ({
        clientId: typeof search.clientId === 'string' ? search.clientId : undefined,
        timerHours: typeof search.timerHours === 'string' ? search.timerHours : undefined,
        timerDescription: typeof search.timerDescription === 'string' ? search.timerDescription : undefined,
        timerDate: typeof search.timerDate === 'string' ? search.timerDate : undefined,
    }),
});

function NewInvoicePage() {
    const { clientId, timerHours, timerDescription, timerDate } = Route.useSearch();

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

    return (
        <InvoiceForm
            mode="create"
            preselectedClientId={clientId}
            prefilledItems={prefilledItems}
        />
    );
}
