import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePostApiClient, getGetApiClientListQueryKey } from '@/api/generated/client/client';
import {
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ClientFormSheet({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const createMutation = usePostApiClient();

    const [form, setForm] = useState({
        name: '',
        attention: '',
        address: '',
        city: '',
        province: '',
        zip: '',
    });
    const [error, setError] = useState('');

    function update(field: string) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        createMutation.mutate(
            { data: form },
            {
                onSuccess() {
                    queryClient.invalidateQueries({ queryKey: getGetApiClientListQueryKey() });
                    onClose();
                },
                onError() {
                    setError('Failed to create client. Please try again.');
                },
            },
        );
    }

    return (
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Add Client</SheetTitle>
                <SheetDescription>Enter the details for the new client.</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 px-4">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" value={form.name} onChange={update('name')} required autoFocus />
                </div>
                <div className="space-y-2">
                    <label htmlFor="attention" className="text-sm font-medium">Attention</label>
                    <Input id="attention" value={form.attention} onChange={update('attention')} />
                </div>
                <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">Address</label>
                    <Input id="address" value={form.address} onChange={update('address')} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="city" className="text-sm font-medium">City</label>
                        <Input id="city" value={form.city} onChange={update('city')} required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="province" className="text-sm font-medium">Province</label>
                        <Input id="province" value={form.province} onChange={update('province')} required />
                    </div>
                </div>
                <div className="w-1/2 space-y-2">
                    <label htmlFor="zip" className="text-sm font-medium">Zip / Postal Code</label>
                    <Input id="zip" value={form.zip} onChange={update('zip')} required />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Client'}
                </Button>
            </form>
        </SheetContent>
    );
}
