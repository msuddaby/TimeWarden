import { useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useGetApiClientList } from '@/api/generated/client/client';
import { useGetApiProjectListByClientClientId } from '@/api/generated/project/project';
import {
    usePostApiInvoice,
    usePatchApiInvoice,
    getGetApiInvoiceInvoiceIdQueryKey,
    getGetApiInvoiceListByClientClientIdQueryKey,
} from '@/api/generated/invoice/invoice';
import type { InvoiceCreateModel, ItemOfWorkCreateModel, ProjectVM } from '@/api/generated/models';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';

// --- Types ---

export interface LineItem {
    _key: string;
    id?: string;
    projectId: string;
    description: string;
    dateOfWork: string;
    hourlyRate: string;
    hoursOfWork: string;
}

export interface InvoiceFormState {
    clientId: string;
    invoiceDate: string;
    extraNotes: string | null;
    items: LineItem[];
}

interface InvoiceFormProps {
    mode: 'create' | 'edit';
    invoiceId?: string;
    initialState?: InvoiceFormState;
    preselectedClientId?: string;
    prefilledItems?: LineItem[];
}

// --- Helpers ---

function createEmptyItem(): LineItem {
    return {
        _key: crypto.randomUUID(),
        projectId: '',
        description: '',
        dateOfWork: '',
        hourlyRate: '',
        hoursOfWork: '',
    };
}

function toNumber(value: string): number {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
}

function itemAmount(item: LineItem): number {
    return toNumber(item.hourlyRate) * toNumber(item.hoursOfWork);
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

const NONE_PROJECT = '__none__';

// --- Main Form ---

export function InvoiceForm({ mode, invoiceId, initialState, preselectedClientId, prefilledItems }: InvoiceFormProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<InvoiceFormState>(() => {
        if (initialState) {
            return prefilledItems
                ? { ...initialState, items: [...initialState.items, ...prefilledItems] }
                : initialState;
        }
        return {
            clientId: preselectedClientId ?? '',
            invoiceDate: new Date().toISOString().slice(0, 10),
            extraNotes: null,
            items: prefilledItems ?? [createEmptyItem()],
        };
    });
    const [error, setError] = useState('');

    // Queries
    const { data: clientsResponse } = useGetApiClientList();
    const clients = clientsResponse?.data ?? [];

    const { data: projectsResponse } = useGetApiProjectListByClientClientId(
        form.clientId,
        { query: { enabled: !!form.clientId } },
    );
    const projects = projectsResponse?.data ?? [];

    // Mutations
    const createMutation = usePostApiInvoice();
    const updateMutation = usePatchApiInvoice();
    const mutation = mode === 'create' ? createMutation : updateMutation;

    // Computed
    const grandTotal = form.items.reduce((sum, item) => sum + itemAmount(item), 0);
    const totalHours = form.items.reduce((sum, item) => sum + toNumber(item.hoursOfWork), 0);

    const projectSubtotals = useMemo(() => {
        const map = new Map<string, { name: string; total: number; hours: number }>();
        for (const item of form.items) {
            const pid = item.projectId || 'unassigned';
            const project = projects.find((p) => p.id === pid);
            const existing = map.get(pid) ?? {
                name: project?.projectName ?? 'Unassigned',
                total: 0,
                hours: 0,
            };
            existing.total += itemAmount(item);
            existing.hours += toNumber(item.hoursOfWork);
            map.set(pid, existing);
        }
        return Array.from(map.entries());
    }, [form.items, projects]);

    // Updaters
    function handleClientChange(newClientId: string) {
        setForm((prev) => ({
            ...prev,
            clientId: newClientId,
            items: prev.items.map((item) => ({ ...item, projectId: '' })),
        }));
    }

    function updateItem(key: string, field: keyof Omit<LineItem, '_key' | 'id'>) {
        return (value: string) =>
            setForm((prev) => ({
                ...prev,
                items: prev.items.map((item) =>
                    item._key === key ? { ...item, [field]: value } : item,
                ),
            }));
    }

    function addItem() {
        setForm((prev) => ({
            ...prev,
            items: [...prev.items, createEmptyItem()],
        }));
    }

    function removeItem(key: string) {
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item._key !== key),
        }));
    }

    // Submit
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        const payload: InvoiceCreateModel = {
            ...(mode === 'edit' ? { id: invoiceId } : {}),
            clientId: form.clientId,
            invoiceDate: form.invoiceDate,
            extraNotes: form.extraNotes,
            itemsOfWork: form.items.map(
                (item): ItemOfWorkCreateModel => ({
                    ...(item.id ? { id: item.id } : {}),
                    ...(mode === 'edit' ? { invoiceId } : {}),
                    projectId: item.projectId && item.projectId !== NONE_PROJECT ? item.projectId : undefined,
                    description: item.description,
                    dateOfWork: item.dateOfWork,
                    hourlyRate: item.hourlyRate,
                    hoursOfWork: item.hoursOfWork,
                }),
            ),
        };

        mutation.mutate(
            { data: payload },
            {
                onSuccess() {
                    if (mode === 'edit' && invoiceId) {
                        queryClient.invalidateQueries({
                            queryKey: getGetApiInvoiceInvoiceIdQueryKey(invoiceId),
                        });
                    }
                    if (form.clientId) {
                        queryClient.invalidateQueries({
                            queryKey: getGetApiInvoiceListByClientClientIdQueryKey(form.clientId),
                        });
                    }
                    if (mode === 'edit' && invoiceId) {
                        navigate({ to: '/invoices/$invoiceId', params: { invoiceId } });
                    } else {
                        navigate({ to: '/' });
                    }
                },
                onError() {
                    setError(
                        mode === 'create'
                            ? 'Failed to create invoice. Please try again.'
                            : 'Failed to update invoice. Please try again.',
                    );
                },
            },
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <Link
                to="/"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
            >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                Back
            </Link>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {mode === 'create' ? 'New Invoice' : 'Edit Invoice'}
                </h1>
                {mode === 'edit' && invoiceId && (
                    <p className="text-muted-foreground mt-1 font-mono text-sm">
                        {invoiceId.slice(0, 8)}
                    </p>
                )}
            </div>

            <Separator />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Invoice Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Client</label>
                                <Select
                                    value={form.clientId}
                                    onValueChange={handleClientChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((c) => (
                                            <SelectItem key={c.id} value={c.id!}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Invoice Date</label>
                                <Input
                                    type="date"
                                    value={form.invoiceDate}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, invoiceDate: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Line Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Line Items</CardTitle>
                        {!form.clientId && (
                            <p className="text-muted-foreground text-xs">
                                Select a client to enable project selection.
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[18%]">Project</TableHead>
                                        <TableHead className="w-[28%]">Description</TableHead>
                                        <TableHead className="w-[14%]">Date</TableHead>
                                        <TableHead className="w-[10%] text-right">Rate</TableHead>
                                        <TableHead className="w-[10%] text-right">Hours</TableHead>
                                        <TableHead className="w-[14%] text-right">Amount</TableHead>
                                        <TableHead className="w-[6%]" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {form.items.map((item) => (
                                        <LineItemRow
                                            key={item._key}
                                            item={item}
                                            projects={projects}
                                            hasClient={!!form.clientId}
                                            onUpdate={updateItem}
                                            onRemove={() => removeItem(item._key)}
                                            canRemove={form.items.length > 1}
                                        />
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    {projectSubtotals.length > 1 &&
                                        projectSubtotals.map(([pid, sub]) => (
                                            <TableRow key={pid}>
                                                <TableCell colSpan={4} className="text-muted-foreground">
                                                    {sub.name}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {sub.hours.toFixed(1)}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {formatCurrency(sub.total)}
                                                </TableCell>
                                                <TableCell />
                                            </TableRow>
                                        ))}
                                    <TableRow>
                                        <TableCell colSpan={4} className="font-semibold">
                                            Total
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {totalHours.toFixed(1)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatCurrency(grandTotal)}
                                        </TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                            <PlusIcon className="mr-2 h-3.5 w-3.5" />
                            Add Line Item
                        </Button>
                    </CardFooter>
                </Card>

                {/* Extra Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Extra Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            className="w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30"
                            rows={3}
                            placeholder="Optional notes to include on the invoice..."
                            value={form.extraNotes ?? ''}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, extraNotes: e.target.value || null }))
                            }
                        />
                    </CardContent>
                </Card>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" asChild>
                        <Link to="/">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={mutation.isPending || !form.clientId}>
                        {mutation.isPending
                            ? mode === 'create'
                                ? 'Creating...'
                                : 'Saving...'
                            : mode === 'create'
                                ? 'Create Invoice'
                                : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// --- Line Item Row ---

function LineItemRow({
    item,
    projects,
    hasClient,
    onUpdate,
    onRemove,
    canRemove,
}: {
    item: LineItem;
    projects: ProjectVM[];
    hasClient: boolean;
    onUpdate: (key: string, field: keyof Omit<LineItem, '_key' | 'id'>) => (value: string) => void;
    onRemove: () => void;
    canRemove: boolean;
}) {
    const amount = itemAmount(item);

    return (
        <TableRow>
            <TableCell className="align-top">
                <Select
                    value={item.projectId || NONE_PROJECT}
                    onValueChange={onUpdate(item._key, 'projectId')}
                    disabled={!hasClient}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Project" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={NONE_PROJECT}>No project</SelectItem>
                        {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id!}>
                                {p.projectName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="align-top">
                <Input
                    value={item.description}
                    onChange={(e) => onUpdate(item._key, 'description')(e.target.value)}
                    placeholder="Description"
                />
            </TableCell>
            <TableCell className="align-top">
                <Input
                    type="date"
                    value={item.dateOfWork}
                    onChange={(e) => onUpdate(item._key, 'dateOfWork')(e.target.value)}
                />
            </TableCell>
            <TableCell className="align-top">
                <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.hourlyRate}
                    onChange={(e) => onUpdate(item._key, 'hourlyRate')(e.target.value)}
                    placeholder="0.00"
                    className="text-right"
                />
            </TableCell>
            <TableCell className="align-top">
                <Input
                    type="number"
                    min="0"
                    step="0.25"
                    value={item.hoursOfWork}
                    onChange={(e) => onUpdate(item._key, 'hoursOfWork')(e.target.value)}
                    placeholder="0.0"
                    className="text-right"
                />
            </TableCell>
            <TableCell className="text-right align-middle font-medium">
                {formatCurrency(amount)}
            </TableCell>
            <TableCell className="align-middle">
                <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={onRemove}
                    disabled={!canRemove}
                    className="text-muted-foreground hover:text-destructive"
                >
                    <TrashIcon className="h-3.5 w-3.5" />
                </Button>
            </TableCell>
        </TableRow>
    );
}

// --- Skeleton ---

export function InvoiceFormSkeleton() {
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <Skeleton className="h-4 w-28" />
            <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="mt-2 h-4 w-20" />
            </div>
            <Separator />
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-full" />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
