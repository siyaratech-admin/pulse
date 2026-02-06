import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Lock, Shield, User } from 'lucide-react';
import { useFrappeAuth } from 'frappe-react-sdk';

interface LoginFormData {
    username: string;
    password: string;
}

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useFrappeAuth();

    const form = useForm<LoginFormData>({
        defaultValues: {
            username: '',
            password: ''
        }
    });


    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            // TODO: Implement actual login logic with Frappe

            console.log('Login data:', data);

            await login({ username: data.username, password: data.password });

            // Refresh the route after successful login
            window.location.href = '/pulse';
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header Section */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Login Card */}
                <Card className="shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl text-center">Sign In</CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* Username Field */}
                                <FormField
                                    control={form.control}
                                    name="username"
                                    rules={{
                                        required: 'Username is required',
                                        minLength: {
                                            value: 3,
                                            message: 'Username must be at least 3 characters'
                                        }
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                Username
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter your username"
                                                    className="pl-4"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Password Field */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    rules={{
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters'
                                        }
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Lock className="h-4 w-4 text-muted-foreground" />
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Enter your password"
                                                        className="pl-4 pr-10"
                                                        {...field}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={togglePasswordVisibility}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                        <span className="sr-only">
                                                            {showPassword ? 'Hide password' : 'Show password'}
                                                        </span>
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-600 transition-all"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Signing in...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Sign In
                                        </div>
                                    )}
                                </Button>

                            </form>
                        </Form>

                        {/* Security Badge */}
                        <div className="mt-4 flex items-center justify-center">
                            <Badge variant="secondary" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Secure & Encrypted
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-xs text-muted-foreground">
                    <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
