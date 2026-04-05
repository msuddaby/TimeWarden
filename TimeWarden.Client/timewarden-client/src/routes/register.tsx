import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { usePostApiUserRegister } from '@/api/generated/user/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/register')({
    component: RegisterPage,
});

function RegisterPage() {
    const navigate = useNavigate();
    const { setAuthFromResponse } = useAuth();
    const registerMutation = usePostApiUserRegister();

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        name: '',
        address: '',
        city: '',
        province: '',
        zip: '',
        phone: '',
    });
    const [error, setError] = useState('');

    function update(field: string) {
        return (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        registerMutation.mutate(
            { data: form },
            {
                onSuccess(response) {
                    setAuthFromResponse(response.data);
                    navigate({ to: '/' });
                },
                onError() {
                    setError('Registration failed. Please check your details and try again.');
                },
            },
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>Enter your details to get started with TimeWarden</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Full Name
                                </label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={update('name')}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-medium">
                                    Username
                                </label>
                                <Input
                                    id="username"
                                    value={form.username}
                                    onChange={update('username')}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={update('email')}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={form.password}
                                onChange={update('password')}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="address" className="text-sm font-medium">
                                Address
                            </label>
                            <Input
                                id="address"
                                value={form.address}
                                onChange={update('address')}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="city" className="text-sm font-medium">
                                    City
                                </label>
                                <Input
                                    id="city"
                                    value={form.city}
                                    onChange={update('city')}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="province" className="text-sm font-medium">
                                    Province
                                </label>
                                <Input
                                    id="province"
                                    value={form.province}
                                    onChange={update('province')}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="zip" className="text-sm font-medium">
                                    Zip
                                </label>
                                <Input
                                    id="zip"
                                    value={form.zip}
                                    onChange={update('zip')}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium">
                                Phone
                            </label>
                            <Input
                                id="phone"
                                type="tel"
                                value={form.phone}
                                onChange={update('phone')}
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-destructive text-sm">{error}</p>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={registerMutation.isPending}
                        >
                            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
                        </Button>
                        <p className="text-muted-foreground text-center text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
