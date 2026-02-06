import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parse, isValid, setMonth, setYear, getMonth, getYear } from 'date-fns';
import type { FormFieldProps } from '../../../types/form';
import { cn } from '../../../lib/utils';
import { FieldWrapper } from '../../ui/form/FieldWrapper';

//========================
// DateField with Year/Month Selector
//========================
export const DateField: React.FC<FormFieldProps> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [displayMonth, setDisplayMonth] = React.useState<Date>(new Date());

    const dateValue = React.useMemo(() => {
        if (!value) return undefined;
        if (value instanceof Date) return isValid(value) ? value : undefined;
        try {
            const parsed = parse(value, 'yyyy-MM-dd', new Date());
            return isValid(parsed) ? parsed : undefined;
        } catch {
            return undefined;
        }
    }, [value]);

    // Initialize display month when opening
    React.useEffect(() => {
        if (isOpen && dateValue) {
            setDisplayMonth(dateValue);
        }
    }, [isOpen, dateValue]);

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            onChange(format(date, 'yyyy-MM-dd'));
        } else {
            onChange(null);
        }
        setIsOpen(false);
    };

    const handleMonthChange = (month: string) => {
        const newDate = setMonth(displayMonth, parseInt(month));
        setDisplayMonth(newDate);
    };

    const handleYearChange = (year: string) => {
        const newDate = setYear(displayMonth, parseInt(year));
        setDisplayMonth(newDate);
    };

    // Generate year options (1900 to current year + 10)
    const currentYear = getYear(new Date());
    const years = Array.from({ length: currentYear - 1900 + 11 }, (_, i) => 1900 + i).reverse();

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={field.label}
            required={Boolean(field.reqd)}
            description={field.description}
            error={error}
            disabled={disabled || Boolean(field.read_only)}
            className={className}
        >
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !dateValue && 'text-muted-foreground',
                            error && 'border-red-500',
                            field.read_only && 'bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium',
                            disabled && 'bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium'
                        )}
                        disabled={disabled || Boolean(field.read_only)}
                        onBlur={onBlur}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateValue ? format(dateValue, 'PPP') : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 space-y-2 border-b">
                        <div className="flex gap-2">
                            {/* Month Selector */}
                            <Select
                                value={getMonth(displayMonth).toString()}
                                onValueChange={handleMonthChange}
                            >
                                <SelectTrigger className="flex-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month, index) => (
                                        <SelectItem key={index} value={index.toString()}>
                                            {month}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Year Selector */}
                            <Select
                                value={getYear(displayMonth).toString()}
                                onValueChange={handleYearChange}
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Calendar
                        mode="single"
                        selected={dateValue}
                        onSelect={handleDateSelect}
                        month={displayMonth}
                        onMonthChange={setDisplayMonth}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </FieldWrapper>
    );
};

//========================
// TimeField
//========================
export const TimeField: React.FC<FormFieldProps> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
}) => {
    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={field.label}
            required={Boolean(field.reqd)}
            description={field.description}
            error={error}
            disabled={disabled || Boolean(field.read_only)}
            className={className}
        >
            <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    id={field.fieldname}
                    name={field.fieldname}
                    type="time"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    disabled={disabled || Boolean(field.read_only)}
                    className={cn(
                        'pl-10',
                        error && 'border-red-500 focus:ring-red-500',
                        field.read_only && 'bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium'
                    )}
                />
            </div>
        </FieldWrapper>
    );
};

//========================
// DatetimeField
//========================
export const DatetimeField: React.FC<FormFieldProps> = ({
    field,
    value,
    onChange,
    onBlur,
    error,
    disabled,
    className,
}) => {
    const [isDateOpen, setIsDateOpen] = React.useState(false);
    const [timeValue, setTimeValue] = React.useState('');
    const [displayMonth, setDisplayMonth] = React.useState<Date>(new Date());

    const { dateValue, timeStr } = React.useMemo(() => {
        if (!value) return { dateValue: undefined, timeStr: '' };
        try {
            const date = new Date(value);
            if (!isValid(date)) return { dateValue: undefined, timeStr: '' };
            const dateVal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const timeStr = format(date, 'HH:mm');
            return { dateValue: dateVal, timeStr };
        } catch {
            return { dateValue: undefined, timeStr: '' };
        }
    }, [value]);

    React.useEffect(() => {
        setTimeValue(timeStr);
    }, [timeStr]);

    React.useEffect(() => {
        if (isDateOpen && dateValue) {
            setDisplayMonth(dateValue);
        }
    }, [isDateOpen, dateValue]);

    const handleDateSelect = (date: Date | undefined) => {
        if (date && timeValue) {
            const [hours, minutes] = timeValue.split(':').map(Number);
            const datetime = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                hours,
                minutes
            );
            onChange(datetime.toISOString());
        } else if (date) {
            onChange(date.toISOString());
        } else {
            onChange(null);
        }
        setIsDateOpen(false);
    };

    const handleTimeChange = (time: string) => {
        setTimeValue(time);
        if (dateValue && time) {
            const [hours, minutes] = time.split(':').map(Number);
            const datetime = new Date(
                dateValue.getFullYear(),
                dateValue.getMonth(),
                dateValue.getDate(),
                hours,
                minutes
            );
            onChange(datetime.toISOString());
        }
    };

    const handleMonthChange = (month: string) => {
        const newDate = setMonth(displayMonth, parseInt(month));
        setDisplayMonth(newDate);
    };

    const handleYearChange = (year: string) => {
        const newDate = setYear(displayMonth, parseInt(year));
        setDisplayMonth(newDate);
    };

    const currentYear = getYear(new Date());
    const years = Array.from({ length: currentYear - 1900 + 11 }, (_, i) => 1900 + i).reverse();

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <FieldWrapper
            fieldname={field.fieldname}
            label={field.label}
            required={Boolean(field.reqd)}
            description={field.description}
            error={error}
            disabled={disabled || Boolean(field.read_only)}
            className={className}
        >
            <div className="flex gap-2">
                {/* Date Picker */}
                <div className="flex-1">
                    <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !dateValue && 'text-muted-foreground',
                                    error && 'border-red-500',
                                    field.read_only && 'bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium',
                                    disabled && 'bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium'
                                )}
                                disabled={disabled || Boolean(field.read_only)}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateValue ? format(dateValue, 'PPP') : <span>Pick date</span>}
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-3 space-y-2 border-b">
                                <div className="flex gap-2">
                                    <Select
                                        value={getMonth(displayMonth).toString()}
                                        onValueChange={handleMonthChange}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((month, index) => (
                                                <SelectItem key={index} value={index.toString()}>
                                                    {month}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={getYear(displayMonth).toString()}
                                        onValueChange={handleYearChange}
                                    >
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {years.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Calendar
                                mode="single"
                                selected={dateValue}
                                onSelect={handleDateSelect}
                                month={displayMonth}
                                onMonthChange={setDisplayMonth}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Time Input */}
                <div className="w-32">
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="time"
                            value={timeValue}
                            onChange={(e) => handleTimeChange(e.target.value)}
                            onBlur={onBlur}
                            disabled={disabled || Boolean(field.read_only)}
                            className={cn(
                                'pl-10',
                                error && 'border-red-500 focus:ring-red-500',
                                field.read_only && 'bg-gray-100 text-gray-800 cursor-not-allowed opacity-90 font-medium'
                            )}
                        />
                    </div>
                </div>
            </div>
        </FieldWrapper>
    );
};