import React, { useMemo } from 'react';
import { Bill } from '../types';
import DollarIcon from './icons/DollarIcon';
import CalendarIcon from './icons/CalendarIcon';
import WarningIcon from './icons/WarningIcon';

interface DashboardSummaryProps {
    bills: Bill[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ bills }) => {
    const summary = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let totalAmount = 0;
        let upcomingCount = 0;
        let overdueCount = 0;

        bills.forEach(bill => {
            totalAmount += bill.amount;
            
            const nextPayment = new Date(bill.nextPaymentDate);
            nextPayment.setHours(0, 0, 0, 0);

            const diffTime = nextPayment.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                overdueCount++;
            } else if (diffDays >= 0 && diffDays <= 7) {
                upcomingCount++;
            }
        });

        return { totalAmount, upcomingCount, overdueCount };
    }, [bills]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard 
                title="Total Amount"
                value={`$${summary.totalAmount.toFixed(2)}`}
                icon={<DollarIcon className="h-6 w-6 text-green-600" />}
                colorClass="bg-green-100"
            />
            <StatCard 
                title="Upcoming (7 days)"
                value={summary.upcomingCount}
                icon={<CalendarIcon className="h-6 w-6 text-yellow-600" />}
                colorClass="bg-yellow-100"
            />
            <StatCard 
                title="Overdue"
                value={summary.overdueCount}
                icon={<WarningIcon className="h-6 w-6 text-red-600" />}
                colorClass="bg-red-100"
            />
        </div>
    );
};

export default DashboardSummary;