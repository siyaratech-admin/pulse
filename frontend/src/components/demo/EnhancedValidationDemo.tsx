import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { FieldWrapper } from '../../ui/form/FieldWrapper';
import { LiveValidation, ValidationMessage } from '../../ui/form/ValidationMessage';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';

interface EnhancedValidationDemoProps {
    className?: string;
}

export const EnhancedValidationDemo: React.FC<EnhancedValidationDemoProps> = ({ className }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Email validation rules
    const emailRules = [
        {
            test: (value: string) => value.length > 0,
            message: 'Email is required',
            status: 'error' as const,
        },
        {
            test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Please enter a valid email address',
            status: 'error' as const,
        },
    ];

    // Password validation rules
    const passwordRules = [
        {
            test: (value: string) => value.length >= 8,
            message: 'Password must be at least 8 characters long',
            status: 'error' as const,
        },
        {
            test: (value: string) => /[A-Z]/.test(value),
            message: 'Password must contain at least one uppercase letter',
            status: 'warning' as const,
        },
        {
            test: (value: string) => /[0-9]/.test(value),
            message: 'Password must contain at least one number',
            status: 'warning' as const,
        },
    ];

    // Username validation rules
    const usernameRules = [
        {
            test: (value: string) => value.length >= 3,
            message: 'Username must be at least 3 characters long',
            status: 'error' as const,
        },
        {
            test: (value: string) => /^[a-zA-Z0-9_]+$/.test(value),
            message: 'Username can only contain letters, numbers, and underscores',
            status: 'error' as const,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitted(true);
        
        // Simulate successful submission
        setTimeout(() => {
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
        }, 1000);
    };

    const isPasswordValid = password.length >= 8;
    const isConfirmPasswordValid = confirmPassword === password && password.length > 0;

    return (
        <div className={cn('max-w-2xl mx-auto space-y-6', className)}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Enhanced Form Validation Demo
                        <Badge variant="secondary">Live Validation</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Experience real-time validation with improved visual feedback, animations, and user guidance.
                    </p>
                </CardHeader>
                <CardContent>
                    {/* Success Message */}
                    {showSuccessMessage && (
                        <ValidationMessage
                            status="success"
                            message="Form submitted successfully! All validation checks passed."
                            dismissible
                            onDismiss={() => setShowSuccessMessage(false)}
                            className="mb-6"
                        />
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field with Live Validation */}
                        <LiveValidation 
                            value={email} 
                            rules={emailRules}
                            debounceMs={500}
                        >
                            {({ status, message, isValidating }) => (
                                <FieldWrapper
                                    fieldname="email"
                                    label="Email Address"
                                    required
                                    helpText="We'll use this email for account notifications"
                                    validationStatus={status}
                                    isValidating={isValidating}
                                    error={status === 'error' ? message : undefined}
                                    success={status === 'success' ? 'Email format is valid!' : undefined}
                                    variant="card"
                                >
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className={cn(
                                            status === 'error' && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
                                            status === 'success' && 'border-green-300 focus:border-green-500 focus:ring-green-500/20',
                                            'transition-all duration-200'
                                        )}
                                    />
                                </FieldWrapper>
                            )}
                        </LiveValidation>

                        {/* Username Field */}
                        <LiveValidation 
                            value={username} 
                            rules={usernameRules}
                            debounceMs={300}
                        >
                            {({ status, message, isValidating }) => (
                                <FieldWrapper
                                    fieldname="username"
                                    label="Username"
                                    required
                                    badge="Unique"
                                    helpText="Choose a unique username for your account"
                                    validationStatus={status}
                                    isValidating={isValidating}
                                    error={status === 'error' ? message : undefined}
                                    success={status === 'success' ? 'Username is available!' : undefined}
                                >
                                    <Input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter username"
                                        className={cn(
                                            status === 'error' && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
                                            status === 'success' && 'border-green-300 focus:border-green-500 focus:ring-green-500/20',
                                            'transition-all duration-200'
                                        )}
                                    />
                                </FieldWrapper>
                            )}
                        </LiveValidation>

                        {/* Password Field */}
                        <LiveValidation 
                            value={password} 
                            rules={passwordRules}
                            debounceMs={200}
                        >
                            {({ status, message, isValidating }) => (
                                <FieldWrapper
                                    fieldname="password"
                                    label="Password"
                                    required
                                    helpText="Choose a strong password with at least 8 characters"
                                    validationStatus={status}
                                    isValidating={isValidating}
                                    error={status === 'error' ? message : undefined}
                                    warning={status === 'warning' ? message : undefined}
                                    success={status === 'success' ? 'Strong password!' : undefined}
                                >
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        className={cn(
                                            status === 'error' && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
                                            status === 'warning' && 'border-amber-300 focus:border-amber-500 focus:ring-amber-500/20',
                                            status === 'success' && 'border-green-300 focus:border-green-500 focus:ring-green-500/20',
                                            'transition-all duration-200'
                                        )}
                                    />
                                </FieldWrapper>
                            )}
                        </LiveValidation>

                        {/* Confirm Password Field */}
                        <FieldWrapper
                            fieldname="confirmPassword"
                            label="Confirm Password"
                            required
                            validationStatus={
                                confirmPassword.length === 0 ? undefined :
                                isConfirmPasswordValid ? 'success' : 'error'
                            }
                            error={
                                confirmPassword.length > 0 && !isConfirmPasswordValid 
                                    ? 'Passwords do not match' 
                                    : undefined
                            }
                            success={
                                isConfirmPasswordValid 
                                    ? 'Passwords match!' 
                                    : undefined
                            }
                        >
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className={cn(
                                    confirmPassword.length > 0 && !isConfirmPasswordValid && 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
                                    isConfirmPasswordValid && 'border-green-300 focus:border-green-500 focus:ring-green-500/20',
                                    'transition-all duration-200'
                                )}
                            />
                        </FieldWrapper>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <Button 
                                type="submit" 
                                className="flex-1"
                                disabled={!email || !isPasswordValid || !isConfirmPasswordValid || !username}
                            >
                                {formSubmitted ? 'Creating Account...' : 'Create Account'}
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => {
                                    setEmail('');
                                    setPassword('');
                                    setConfirmPassword('');
                                    setUsername('');
                                    setFormSubmitted(false);
                                }}
                            >
                                Reset
                            </Button>
                        </div>

                        {/* Form Status Summary */}
                        <div className="pt-4 border-t">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium mb-2">Field Status:</p>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={email ? 'default' : 'outline'} className="w-16 justify-center text-xs">
                                                Email
                                            </Badge>
                                            <span className="text-muted-foreground">
                                                {email ? '✓ Filled' : 'Empty'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={username ? 'default' : 'outline'} className="w-16 justify-center text-xs">
                                                Username
                                            </Badge>
                                            <span className="text-muted-foreground">
                                                {username ? '✓ Filled' : 'Empty'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={isPasswordValid ? 'default' : 'outline'} className="w-16 justify-center text-xs">
                                                Password
                                            </Badge>
                                            <span className="text-muted-foreground">
                                                {isPasswordValid ? '✓ Valid' : 'Invalid'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium mb-2">Validation Features:</p>
                                    <ul className="space-y-1 text-muted-foreground">
                                        <li>• Real-time validation feedback</li>
                                        <li>• Animated status transitions</li>
                                        <li>• Contextual help text</li>
                                        <li>• Mobile-friendly design</li>
                                        <li>• Accessibility support</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};