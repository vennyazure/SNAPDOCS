import React from 'react';
import { Bill } from '../types';
import BillCard from './BillCard';
import DashboardSummary from './DashboardSummary';

interface BillDashboardProps {
  bills: Bill[];
}

const BillDashboard: React.FC<BillDashboardProps> = ({ bills }) => {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center md:text-left">Your Dashboard</h2>
      {bills.length === 0 ? (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500">No bills processed yet. Upload one to build your dashboard!</p>
        </div>
      ) : (
        <>
          <DashboardSummary bills={bills} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BillDashboard;