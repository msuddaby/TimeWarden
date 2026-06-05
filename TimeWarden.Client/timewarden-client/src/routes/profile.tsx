import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
    useGetApiUserProfile,
    usePostApiUserProfile,
    getGetApiUserProfileQueryKey,
} from '@/api/generated/user/user.ts'
import type { UserVM } from '@/api/generated/models'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/profile')({
  component: ProfileRoute,
})

function ProfileRoute() {
    const { data: profileResponse, isPending: profileLoading } = useGetApiUserProfile();
    const profile = profileResponse?.data ?? null;

    if (profileLoading) {
      return <ProfileSkeleton />;
    }

    if (profile === null) {
      return <div>Profile not found</div>;
    }

    return <ProfileForm profile={profile} />;
}

function ProfileForm({ profile }: { profile: UserVM }) {
    const queryClient = useQueryClient();

    const [form, setForm] = useState<UserVM>(profile);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    const mutation = usePostApiUserProfile();

    function updateField(field: keyof Omit<UserVM, 'id' | 'username'>) {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setSaved(false);
            setForm((prev) => ({ ...prev, [field]: e.target.value }));
        };
    }

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setError('');
        setSaved(false);

        mutation.mutate(
            { data: form },
            {
                onSuccess() {
                    setSaved(true);
                    queryClient.invalidateQueries({
                        queryKey: getGetApiUserProfileQueryKey(),
                    });
                },
                onError() {
                    setError('Failed to save profile. Please try again.');
                },
            },
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Your details appear on generated invoices.
                </p>
            </div>

            <Separator />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Username</label>
                                <Input value={form.username} disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    value={form.name}
                                    onChange={updateField('name')}
                                    placeholder="Your full name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input
                                    type="tel"
                                    value={form.phone}
                                    onChange={updateField('phone')}
                                    placeholder="Phone number"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <label className="text-sm font-medium">Address</label>
                                <Input
                                    value={form.address}
                                    onChange={updateField('address')}
                                    placeholder="Street address"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">City</label>
                                <Input
                                    value={form.city}
                                    onChange={updateField('city')}
                                    placeholder="City"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Province</label>
                                <Input
                                    value={form.province}
                                    onChange={updateField('province')}
                                    placeholder="Province"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Postal Code</label>
                                <Input
                                    value={form.zip}
                                    onChange={updateField('zip')}
                                    placeholder="Postal code"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-3">
                        {error && <p className="text-destructive text-sm">{error}</p>}
                        {saved && <p className="text-muted-foreground text-sm">Profile saved.</p>}
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}

function ProfileSkeleton() {
  return (
      <div className={"mx-auto max-w-5xl space-y-6"}>
        <div>
          <Skeleton className={"h-9 w-36"} />
          <Skeleton className="mt-2 h-5 w-56" />
        </div>
        <Separator />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="col-span-2 h-9 w-full" />
              {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
