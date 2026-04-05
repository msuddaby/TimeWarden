import { Badge } from '@/components/ui/badge';
import type { InvoiceStatus } from '@/api/generated/models';

const config: Record<InvoiceStatus, { label: string; className: string }> = {
    Draft: {
        label: 'Draft',
        className: 'bg-muted text-muted-foreground hover:bg-muted',
    },
    Sent: {
        label: 'Sent',
        className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300',
    },
    Paid: {
        label: 'Paid',
        className: 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300',
    },
};

export function InvoiceStatusBadge({ status }: { status?: InvoiceStatus }) {
    const s = status ?? 'Draft';
    const { label, className } = config[s];
    return (
        <Badge variant="outline" className={className}>
            {label}
        </Badge>
    );
}
