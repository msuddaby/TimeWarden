import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePostApiProject, getGetApiProjectListByClientClientIdQueryKey } from '@/api/generated/project/project';
import {
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ProjectFormSheet({ clientId, onClose }: { clientId: string; onClose: () => void }) {
    const queryClient = useQueryClient();
    const createMutation = usePostApiProject();

    const [projectName, setProjectName] = useState('');
    const [error, setError] = useState('');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        createMutation.mutate(
            { data: { clientId, projectName } },
            {
                onSuccess() {
                    queryClient.invalidateQueries({ queryKey: getGetApiProjectListByClientClientIdQueryKey(clientId) });
                    onClose();
                },
                onError() {
                    setError('Failed to create project. Please try again.');
                },
            },
        );
    }

    return (
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Add Project</SheetTitle>
                <SheetDescription>Create a new project for this client.</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 px-4">
                <div className="space-y-2">
                    <label htmlFor="projectName" className="text-sm font-medium">Project Name</label>
                    <Input
                        id="projectName"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
            </form>
        </SheetContent>
    );
}
