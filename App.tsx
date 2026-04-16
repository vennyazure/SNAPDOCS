import React, { useState, useEffect } from 'react';
import { Bill } from './types';
import { analyzeBillImage } from './services/geminiService';
import { sendSmsAlert } from './services/alertService';
import { addBill, getAllBills } from './services/dbService';
import Header from './components/Header';
import BillUploader from './components/BillUploader';
import BillDashboard from './components/BillDashboard';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Loading your saved bills...');
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('Never');

  // Effect for loading bills from DB on initial load
  useEffect(() => {
    const loadBills = async () => {
      setIsLoading(true);
      setLoadingMessage('Loading your saved bills...');
      setError(null);
      try {
        const storedBills = await getAllBills();
        setBills(storedBills);
      } catch (err) {
        console.error(err);
        setError('Failed to load bills from the local database.');
      } finally {
        setIsLoading(false);
      }
    };
    loadBills();
  }, []);

  // Effect for automatic alerts
  useEffect(() => {
    const checkBills = () => {
      setLastChecked(new Date().toLocaleTimeString());
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      bills.forEach(bill => {
        const dueDate = new Date(bill.dueDate);
        dueDate.setHours(0, 0, 0, 0);
  
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
        const alertWindows = [7, 2, 0];
  
        if (alertWindows.includes(diffDays)) {
          const todayStr = today.toISOString().split('T')[0];
          const alertKey = `alert-sent-${bill.id}-${diffDays}-${todayStr}`;
  
          if (!localStorage.getItem(alertKey)) {
            console.log(`Auto-sending alert for ${bill.organizationName} due in ${diffDays} days.`);
            sendSmsAlert(bill)
              .then(() => {
                localStorage.setItem(alertKey, 'true');
              })
              .catch(err => {
                console.error(`Failed to auto-send alert for bill ${bill.id}:`, err);
              });
          }
        }
      });
    };
  
    // Check every hour
    const intervalId = setInterval(checkBills, 1000 * 60 * 60);
  
    // Initial check
    checkBills();
  
    return () => clearInterval(intervalId);
  }, [bills]);

  const handleBillProcess = async (file: File) => {
    setIsLoading(true);
    setLoadingMessage('Analyzing your bill, please wait...');
    setError(null);
    try {
      const newBill = await analyzeBillImage(file);
      await addBill(newBill); // Save to database
      // Add to state for immediate UI update, preserving sort order
      setBills(prevBills => [newBill, ...prevBills].sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime()));
    } catch (err) {
      console.error(err);
      setError('Failed to analyze bill. Please check the image or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Upload Your Bill</h2>
          <p className="text-gray-500 mb-6">Let AI organize your expenses. Upload a bill image to get started.</p>
          <BillUploader onProcessBill={handleBillProcess} disabled={isLoading} />
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center my-10">
            <Spinner />
            <p className="text-gray-600 mt-4 animate-pulse">{loadingMessage}</p>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg text-center">
            <p className="font-semibold">An Error Occurred</p>
            <p>{error}</p>
          </div>
        )}

        <BillDashboard bills={bills} />
      </main>
      <footer className="text-center p-4 mt-8 text-gray-500 text-sm">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
