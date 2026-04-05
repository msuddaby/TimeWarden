import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTimer } from '@/contexts/timer-context';
import { useGetApiClientList } from '@/api/generated/client/client';
import { useGetApiInvoiceListByClientClientId } from '@/api/generated/invoice/invoice';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TimerIcon, PlayIcon, StopIcon, TrashIcon, InvoiceIcon, PlusIcon } from '@phosphor-icons/react';

function formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export function TimerWidget() {
    const timer = useTimer();
    const navigate = useNavigate();

    const [pickingInvoice, setPickingInvoice] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');

    const { data: clientsResponse } = useGetApiClientList(
        { query: { enabled: pickingInvoice } },
    );
    const clients = clientsResponse?.data ?? [];

    const { data: invoicesResponse } = useGetApiInvoiceListByClientClientId(
        selectedClientId,
        { query: { enabled: !!selectedClientId } },
    );
    const invoices = invoicesResponse?.data ?? [];

    function handleNewInvoice() {
        if (!timer.stoppedResult) return;
        const { hours, description, date } = timer.stoppedResult;
        timer.discard();
        navigate({
            to: '/invoices/new',
            search: {
                timerHours: String(hours),
                timerDescription: description,
                timerDate: date,
            },
        });
    }

    function handleAddToInvoice(invoiceId: string) {
        if (!timer.stoppedResult) return;
        const { hours, description, date } = timer.stoppedResult;
        timer.discard();
        navigate({
            to: '/invoices/$invoiceId/edit',
            params: { invoiceId },
            search: {
                timerHours: String(hours),
                timerDescription: description,
                timerDate: date,
            },
        });
    }

    // Idle state
    if (!timer.isRunning && !timer.isStopped) {
        return (
            <>
                <SidebarSeparator />
                <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                    <SidebarGroupLabel>
                        <TimerIcon className="mr-1.5 h-4 w-4" />
                        Timer
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="px-2 pb-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={timer.start}
                        >
                            <PlayIcon className="mr-2 h-3.5 w-3.5" />
                            Start Timer
                        </Button>
                    </SidebarGroupContent>
                </SidebarGroup>
            </>
        );
    }

    // Running state
    if (timer.isRunning) {
        return (
            <>
                <SidebarSeparator />
                <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                    <SidebarGroupLabel>
                        <span className="relative mr-2 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                        </span>
                        Timer
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="space-y-2 px-2 pb-2">
                        <div className="text-center font-mono text-lg font-semibold tabular-nums">
                            {formatElapsed(timer.elapsedSeconds)}
                        </div>
                        <Input
                            placeholder="Description (optional)"
                            value={timer.description}
                            onChange={(e) => timer.setDescription(e.target.value)}
                            className="h-7 text-xs"
                        />
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="flex-1"
                                onClick={timer.stop}
                            >
                                <StopIcon className="mr-1.5 h-3.5 w-3.5" />
                                Stop
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={timer.discard}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <TrashIcon className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>
            </>
        );
    }

    // Stopped state (result ready)
    return (
        <>
            <SidebarSeparator />
            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                <SidebarGroupLabel>
                    <TimerIcon className="mr-1.5 h-4 w-4" />
                    Timer Result
                </SidebarGroupLabel>
                <SidebarGroupContent className="space-y-2 px-2 pb-2">
                    <div className="text-center">
                        <span className="text-lg font-semibold">
                            {timer.stoppedResult!.hours}
                        </span>
                        <span className="text-muted-foreground ml-1 text-sm">hours</span>
                    </div>
                    {timer.stoppedResult!.description && (
                        <p className="text-muted-foreground truncate text-center text-xs">
                            {timer.stoppedResult!.description}
                        </p>
                    )}

                    <Button
                        size="sm"
                        className="w-full"
                        onClick={handleNewInvoice}
                    >
                        <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
                        New Invoice
                    </Button>

                    {!pickingInvoice ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setPickingInvoice(true)}
                        >
                            <InvoiceIcon className="mr-1.5 h-3.5 w-3.5" />
                            Add to Existing
                        </Button>
                    ) : (
                        <div className="space-y-2">
                            <Select
                                value={selectedClientId}
                                onValueChange={(v) => {
                                    setSelectedClientId(v);
                                }}
                            >
                                <SelectTrigger className="h-7 text-xs">
                                    <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((c) => (
                                        <SelectItem key={c.id} value={c.id!}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedClientId && (
                                <Select
                                    onValueChange={(invoiceId) => handleAddToInvoice(invoiceId)}
                                >
                                    <SelectTrigger className="h-7 text-xs">
                                        <SelectValue placeholder="Select invoice" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {invoices.map((inv) => (
                                            <SelectItem key={inv.id} value={inv.id!}>
                                                {inv.invoiceDate?.slice(0, 10)} ({inv.itemCount} items)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => {
                                    setPickingInvoice(false);
                                    setSelectedClientId('');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive w-full"
                        onClick={timer.discard}
                    >
                        <TrashIcon className="mr-1.5 h-3.5 w-3.5" />
                        Discard
                    </Button>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}
