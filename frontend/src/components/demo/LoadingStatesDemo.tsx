import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
    FieldSkeleton, 
    FormLoadingOverlay, 
    ProgressiveFieldLoader 
} from '../../ui/form/FieldSkeleton';
import { FieldWrapper } from '../../ui/form/FieldWrapper';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { cn } from '../../../lib/utils';

interface LoadingStatesDemoProps {
    className?: string;
}

export const LoadingStatesDemo: React.FC<LoadingStatesDemoProps> = ({ className }) => {
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [progressiveFields, setProgressiveFields] = useState([
        { id: 'name', type: 'input' as const, loaded: false, error: false },
        { id: 'email', type: 'input' as const, loaded: false, error: false },
        { id: 'bio', type: 'textarea' as const, loaded: false, error: false },
        { id: 'country', type: 'select' as const, loaded: false, error: false },
        { id: 'preferences', type: 'checkbox' as const, loaded: false, error: false },
        { id: 'data_table', type: 'table' as const, loaded: false, error: false },
    ]);
    const [fieldLoadingStates, setFieldLoadingStates] = useState<Record<string, boolean>>({});

    // Simulate progressive field loading
    const simulateProgressiveLoading = () => {
        setProgressiveFields(prev => prev.map(field => ({ ...field, loaded: false, error: false })));
        
        progressiveFields.forEach((_, index) => {
            setTimeout(() => {
                setProgressiveFields(prev => {
                    const newFields = [...prev];
                    if (Math.random() > 0.1) { // 90% success rate
                        newFields[index] = { ...newFields[index], loaded: true };
                    } else {
                        newFields[index] = { ...newFields[index], error: true };
                    }
                    return newFields;
                });
            }, (index + 1) * 800); // Stagger the loading
        });
    };

    // Simulate form loading
    const simulateFormLoading = () => {
        setIsFormLoading(true);
        setTimeout(() => setIsFormLoading(false), 3000);
    };

    // Simulate individual field loading
    const simulateFieldLoading = (fieldName: string) => {
        setFieldLoadingStates(prev => ({ ...prev, [fieldName]: true }));
        setTimeout(() => {
            setFieldLoadingStates(prev => ({ ...prev, [fieldName]: false }));
        }, 2000);
    };

    return (
        <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Form Loading States Demo
                        <Badge variant="secondary">Interactive</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Explore different loading patterns for form fields with skeleton loaders, 
                        progressive loading, and loading overlays.
                    </p>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="skeletons" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="skeletons">Skeleton Loaders</TabsTrigger>
                            <TabsTrigger value="progressive">Progressive Loading</TabsTrigger>
                            <TabsTrigger value="overlay">Form Overlay</TabsTrigger>
                            <TabsTrigger value="field-states">Field States</TabsTrigger>
                        </TabsList>

                        {/* Skeleton Loaders Tab */}
                        <TabsContent value="skeletons" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Input Field Skeletons</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FieldSkeleton variant="input" showLabel showDescription />
                                        <FieldSkeleton variant="input" size="sm" showLabel />
                                        <FieldSkeleton variant="input" size="lg" showLabel showDescription />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Selection Field Skeletons</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FieldSkeleton variant="select" showLabel showDescription />
                                        <FieldSkeleton variant="checkbox" showLabel />
                                        <FieldSkeleton variant="radio" showLabel showDescription />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Complex Field Skeletons</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FieldSkeleton variant="textarea" rows={4} showLabel showDescription />
                                        <FieldSkeleton variant="card" rows={3} showLabel showDescription />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Table Skeleton</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <FieldSkeleton variant="table" rows={3} showLabel />
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Progressive Loading Tab */}
                        <TabsContent value="progressive" className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Progressive Field Loading</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Fields load one by one with staggered animation
                                    </p>
                                </div>
                                <Button onClick={simulateProgressiveLoading}>
                                    Start Progressive Loading
                                </Button>
                            </div>
                            
                            <ProgressiveFieldLoader fields={progressiveFields} staggerDelay={150} />
                        </TabsContent>

                        {/* Form Overlay Tab */}
                        <TabsContent value="overlay" className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Form Loading Overlay</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Overlay with blur effect during form submission
                                    </p>
                                </div>
                                <Button onClick={simulateFormLoading} disabled={isFormLoading}>
                                    {isFormLoading ? 'Loading...' : 'Simulate Form Loading'}
                                </Button>
                            </div>

                            <FormLoadingOverlay 
                                isLoading={isFormLoading} 
                                message="Submitting your form..."
                                blur
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Sample Form</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FieldWrapper
                                            fieldname="sample_name"
                                            label="Full Name"
                                            required
                                        >
                                            <Input placeholder="Enter your full name" />
                                        </FieldWrapper>
                                        
                                        <FieldWrapper
                                            fieldname="sample_email"
                                            label="Email Address"
                                            required
                                        >
                                            <Input type="email" placeholder="Enter your email" />
                                        </FieldWrapper>
                                        
                                        <FieldWrapper
                                            fieldname="sample_message"
                                            label="Message"
                                            description="Optional message"
                                        >
                                            <Textarea 
                                                placeholder="Enter your message" 
                                                rows={4} 
                                            />
                                        </FieldWrapper>

                                        <Button type="submit" className="w-full" disabled={isFormLoading}>
                                            Submit Form
                                        </Button>
                                    </CardContent>
                                </Card>
                            </FormLoadingOverlay>
                        </TabsContent>

                        {/* Field States Tab */}
                        <TabsContent value="field-states" className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Individual Field Loading States</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Demonstrate loading states for individual form fields
                                </p>
                            </div>

                            <div className="grid gap-4">
                                <FieldWrapper
                                    fieldname="async_name"
                                    label="Name with Validation"
                                    required
                                    loading={fieldLoadingStates.name}
                                    helpText="This field validates asynchronously"
                                >
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Enter name to validate" 
                                            disabled={fieldLoadingStates.name}
                                            className="flex-1"
                                        />
                                        <Button 
                                            onClick={() => simulateFieldLoading('name')}
                                            disabled={fieldLoadingStates.name}
                                            variant="outline"
                                        >
                                            Validate
                                        </Button>
                                    </div>
                                </FieldWrapper>

                                <FieldWrapper
                                    fieldname="async_data"
                                    label="Data Source Selection"
                                    loading={fieldLoadingStates.data}
                                    helpText="Options are loaded from external API"
                                >
                                    <div className="flex gap-2">
                                        <Select disabled={fieldLoadingStates.data}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select data source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="api1">API Source 1</SelectItem>
                                                <SelectItem value="api2">API Source 2</SelectItem>
                                                <SelectItem value="api3">API Source 3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button 
                                            onClick={() => simulateFieldLoading('data')}
                                            disabled={fieldLoadingStates.data}
                                            variant="outline"
                                        >
                                            Load Options
                                        </Button>
                                    </div>
                                </FieldWrapper>

                                <FieldWrapper
                                    fieldname="async_content"
                                    label="Dynamic Content"
                                    loading={fieldLoadingStates.content}
                                    description="Content is generated based on user input"
                                >
                                    <div className="space-y-2">
                                        <Textarea 
                                            placeholder="Enter content or generate automatically" 
                                            rows={4}
                                            disabled={fieldLoadingStates.content}
                                        />
                                        <Button 
                                            onClick={() => simulateFieldLoading('content')}
                                            disabled={fieldLoadingStates.content}
                                            size="sm"
                                        >
                                            Generate Content
                                        </Button>
                                    </div>
                                </FieldWrapper>
                            </div>

                            {/* Loading States Summary */}
                            <Card className="bg-muted/30">
                                <CardHeader>
                                    <CardTitle className="text-base">Loading Features Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <h4 className="font-medium mb-2">Skeleton Loaders</h4>
                                            <ul className="space-y-1 text-muted-foreground">
                                                <li>• Animated placeholder content</li>
                                                <li>• Multiple field type variants</li>
                                                <li>• Configurable sizes and layouts</li>
                                                <li>• Accessible loading indicators</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">Progressive Loading</h4>
                                            <ul className="space-y-1 text-muted-foreground">
                                                <li>• Staggered field appearance</li>
                                                <li>• Error state handling</li>
                                                <li>• Smooth animations</li>
                                                <li>• Customizable timing</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">Form Overlays</h4>
                                            <ul className="space-y-1 text-muted-foreground">
                                                <li>• Full form blocking</li>
                                                <li>• Blur and opacity effects</li>
                                                <li>• Custom loading messages</li>
                                                <li>• Backdrop interaction prevention</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">Field States</h4>
                                            <ul className="space-y-1 text-muted-foreground">
                                                <li>• Individual field loading</li>
                                                <li>• Integrated with FieldWrapper</li>
                                                <li>• Contextual loading indicators</li>
                                                <li>• Non-blocking interactions</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};