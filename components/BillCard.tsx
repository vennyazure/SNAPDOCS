import React, { useState } from 'react';
import { Bill } from '../types';
import { sendSmsAlert } from '../services/alertService';
import BellIcon from './icons/BellIcon';

interface BillCardProps {
  bill: Bill;
}

type AlertStatus = {
    type: 'success' | 'error';
    message: string;
}

const BillCard: React.FC<BillCardProps> = ({ bill }) => {
  const [isAlertSending, setIsAlertSending] = useState(false);
  const [alertStatus, setAlertStatus] = useState<AlertStatus | null>(null);

  const getDaysUntilDue = (dueDate: string): { days: number, label: string, color: string } => {
    const due = new Date(dueDate);
    const today = new Date();
    // Reset time part to compare dates only
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { days: diffDays, label: 'Overdue', color: 'bg-red-100 text-red-800' };
    }
    if (diffDays === 0) {
      return { days: diffDays, label: 'Due Today', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (diffDays <= 3) {
      return { days: diffDays, label: `Due in ${diffDays} days`, color: 'bg-yellow-100 text-yellow-800' };
    }
    return { days: diffDays, label: `Due in ${diffDays} days`, color: 'bg-green-100 text-green-800' };
  };
  
  const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
  };

  const handleSendAlert = async () => {
    setIsAlertSending(true);
    setAlertStatus(null);
    try {
        const message = await sendSmsAlert(bill);
        setAlertStatus({ type: 'success', message });
    } catch (err: any) {
        setAlertStatus({ type: 'error', message: err.message || 'An unknown error occurred.' });
    } finally {
        setIsAlertSending(false);
    }
  }

  const { label, color } = getDaysUntilDue(bill.dueDate);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-blue-600">{bill.billType}</p>
            <h3 className="text-xl font-bold text-gray-800">{bill.organizationName}</h3>
            <p className="text-sm text-gray-500">{bill.payeeName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-gray-800">${bill.amount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600">
           <div className="flex justify-between">
                <span className="font-medium">Bill Date:</span>
                <span>{formatDate(bill.billDate)}</span>
            </div>
             <div className="flex justify-between">
                <span className="font-medium">Due Date:</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${color}`}>
                    {label}
                </span>
            </div>
        </div>
      </div>
      <div className="mt-auto bg-gray-50 px-6 py-4">
        <div className="border-t border-gray-200 pt-4">
            <p className="text-right text-lg font-bold text-gray-800 mt-1">{formatDate(bill.dueDate)}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
            <button
                onClick={handleSendAlert}
                disabled={isAlertSending}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
                <BellIcon className="w-4 h-4 mr-2" />
                {isAlertSending ? 'Sending...' : 'Send SMS Reminder'}
            </button>
             {alertStatus && (
                <p className={`text-xs mt-2 text-center ${alertStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {alertStatus.message}
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default BillCard;