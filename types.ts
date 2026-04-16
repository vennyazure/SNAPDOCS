
export enum BillCategory {
  Electricity = 'Electricity',
  Gas = 'Gas',
  Water = 'Water',
  Internet = 'Internet',
  Phone = 'Phone',
  EMI = 'EMI',
  Rent = 'Rent',
  CreditCard = 'Credit Card',
  Insurance = 'Insurance',
  Other = 'Other',
}

export interface Bill {
  id: string;
  organizationName: string;
  payeeName: string;
  billType: BillCategory;
  amount: number;
  billDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  nextPaymentDate: string; // YYYY-MM-DD
}
