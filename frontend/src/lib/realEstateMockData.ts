import { startOfMonth, subMonths, subDays, addDays, format } from "date-fns";

// ================= TYPES =================

export type UnitStatus = 'Available' | 'On Hold' | 'Booked' | 'Sold' | 'Cancelled' | 'Possession Given';
export type UnitType = '1BHK' | '2BHK' | '3BHK' | 'Villa' | 'Commercial';
export type PaymentMode = 'Cheque' | 'NEFT' | 'UPI' | 'Cash';
export type CustomerType = 'Individual' | 'Joint' | 'Company';
export type BookingStage = 'Enquiry' | 'Shortlisted' | 'Reserved' | 'Booked' | 'Agreement' | 'Possession';

export interface Unit {
    id: string;
    project: string;
    tower: string;
    floor: number;
    number: string;
    type: UnitType;
    superArea: number; // sq ft
    carpetArea: number; // sq ft
    facing: string;
    baseRate: number;
    totalValue: number;
    status: UnitStatus;
    parking: string;
}

export interface Customer {
    id: string;
    name: string;
    type: CustomerType;
    mobile: string;
    email: string;
    pan: string;
    leadSource: string;
    salesExecutive: string;
}

export interface PaymentMilestone {
    id: string;
    name: string;
    dueDate: string;
    amount: number;
    status: 'Pending' | 'Paid' | 'Overdue';
    paidDate?: string;
    mode?: PaymentMode;
}

export interface Booking {
    id: string;
    unitId: string;
    customerId: string;
    bookingDate: string;
    bookingAmount: number;
    stage: BookingStage;
    totalAgreementValue: number;
    paidAmount: number;
    outstandingAmount: number;
    payments: PaymentMilestone[];
    customer?: Customer; // Joined for convenience
    unit?: Unit; // Joined for convenience
}

// ================= MOCK DATA GENERATORS =================

const PROJECTS = ["Sunrise Heights", "Green Valley", "Urban Towers"];
const TOWERS = ["A", "B", "C", "D"];
const UNIT_TYPES: UnitType[] = ["1BHK", "2BHK", "3BHK"];
const STATUSES: UnitStatus[] = ["Available", "Booked", "Sold", "On Hold"];

export const generateUnits = (count: number = 100): Unit[] => {
    const units: Unit[] = [];

    PROJECTS.forEach(project => {
        TOWERS.forEach(tower => {
            for (let floor = 1; floor <= 10; floor++) {
                for (let num = 1; num <= 4; num++) {
                    const type = UNIT_TYPES[Math.floor(Math.random() * UNIT_TYPES.length)];
                    const superArea = type === "1BHK" ? 650 : type === "2BHK" ? 1050 : 1450;
                    const baseRate = 5000 + Math.floor(Math.random() * 500);
                    const totalValue = superArea * baseRate;

                    units.push({
                        id: `${project}-${tower}-${floor}0${num}`,
                        project,
                        tower,
                        floor,
                        number: `${floor}0${num}`,
                        type,
                        superArea,
                        carpetArea: superArea * 0.75,
                        facing: Math.random() > 0.5 ? "East" : "West",
                        baseRate,
                        totalValue,
                        status: Math.random() > 0.6 ? "Available" : STATUSES[Math.floor(Math.random() * STATUSES.length)],
                        parking: `P-${tower}-${floor}0${num}`
                    });
                }
            }
        });
    });

    return units;
};

export const generateCustomers = (count: number = 20): Customer[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `CUST-${1000 + i}`,
        name: `Customer ${i + 1}`,
        type: Math.random() > 0.8 ? 'Company' : 'Individual',
        mobile: `98765${10000 + i}`,
        email: `customer${i}@example.com`,
        pan: `ABCDE${1000 + i}F`,
        leadSource: Math.random() > 0.5 ? 'Direct' : 'Broker',
        salesExecutive: Math.random() > 0.5 ? 'John Doe' : 'Jane Smith'
    }));
};

export const generateBookings = (units: Unit[], customers: Customer[]): Booking[] => {
    const bookings: Booking[] = [];
    const bookedUnits = units.filter(u => u.status === 'Booked' || u.status === 'Sold');

    bookedUnits.forEach((unit, idx) => {
        if (idx >= customers.length) return;

        const customer = customers[idx];
        const totalValue = unit.totalValue;
        const paidPercentage = Math.random() * 0.8; // 0 to 80% paid
        const paidAmount = Math.floor(totalValue * paidPercentage);

        bookings.push({
            id: `BK-${2024000 + idx}`,
            unitId: unit.id,
            customerId: customer.id,
            bookingDate: format(subDays(new Date(), Math.floor(Math.random() * 90)), 'yyyy-MM-dd'),
            bookingAmount: 50000,
            stage: unit.status === 'Sold' ? 'Possession' : 'Agreement',
            totalAgreementValue: totalValue,
            paidAmount,
            outstandingAmount: totalValue - paidAmount,
            payments: [], // Populate if needed for detail view
            customer,
            unit
        });
    });

    return bookings;
};

// ================= SINGLETON STORE (MOCKED) =================

class MockRealEstateStore {
    units: Unit[] = [];
    customers: Customer[] = [];
    bookings: Booking[] = [];

    constructor() {
        this.units = generateUnits();
        this.customers = generateCustomers(50);
        this.bookings = generateBookings(this.units, this.customers);
    }

    getStats() {
        const totalUnits = this.units.length;
        const soldUnits = this.units.filter(u => u.status === 'Sold' || u.status === 'Booked').length;
        const availableUnits = this.units.filter(u => u.status === 'Available').length;
        const totalValue = this.bookings.reduce((sum, b) => sum + b.totalAgreementValue, 0);
        const totalCollected = this.bookings.reduce((sum, b) => sum + b.paidAmount, 0);

        return {
            totalUnits,
            soldUnits,
            availableUnits,
            soldPercentage: ((soldUnits / totalUnits) * 100).toFixed(1),
            totalValue,
            totalCollected,
            outstanding: totalValue - totalCollected
        };
    }
}

export const realEstateStore = new MockRealEstateStore();
