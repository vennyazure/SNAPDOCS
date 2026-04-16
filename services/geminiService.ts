import { GoogleGenAI, Type } from "@google/genai";
import { Bill, BillCategory } from "../types";
import { BILL_CATEGORIES } from "../constants";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeBillImage = async (file: File): Promise<Bill> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = await fileToGenerativePart(file);

  const prompt = `Analyze the attached bill image and extract the following information.

    1.  **organizationName**: The name of the company or shop that issued the bill.
    2.  **payeeName**: The name of the person the bill is addressed to. If not present, use "N/A".
    3.  **billType**: Classify the bill into one of the following categories: ${BILL_CATEGORIES.join(', ')}.
    4.  **amount**: The total amount due as a number, without currency symbols.
    5.  **billDate**: The date the bill was issued or generated, in YYYY-MM-DD format.
    6.  **extractedDueDate**: Find the payment due date mentioned on the bill. If no due date is found, return null.
    7.  **calculatedDueDate**: Calculate a due date based on the 'billDate' and 'billType' using these rules:
        - Electricity: 2 months after the billDate.
        - Gas: 1 month after the billDate.
        - Water: 3 months after the billDate.
        - Internet: 1 month after the billDate.
        - Phone: 1 month after the billDate.
        - EMI: 1 month after the billDate.
        - Rent: 1 month after the billDate.
        - Credit Card: 1 month after the billDate.
        - Insurance: 1 year after the billDate.
        - Other: 1 month after the billDate.

    Return the result as a single JSON object.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, {text: prompt}] },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                organizationName: { type: Type.STRING },
                payeeName: { type: Type.STRING },
                billType: { type: Type.STRING, enum: BILL_CATEGORIES },
                amount: { type: Type.NUMBER },
                billDate: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
                dueDate: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
            },
            required: ["organizationName", "payeeName", "billType", "amount", "billDate", "dueDate"],
        }
    }
  });

  let parsedJson: any = {};
  try {
    const rawJson = JSON.parse(response.text);
    if (rawJson && typeof rawJson === 'object') {
        parsedJson = rawJson;
    }
  } catch (error) {
    console.error("Invalid JSON response from API, using defaults.", error);
    // Let parsedJson remain an empty object so defaults are used
  }
  
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  const validatedBill = {
    organizationName: parsedJson.organizationName || 'Unknown Organization',
    payeeName: parsedJson.payeeName || 'N/A',
    amount: typeof parsedJson.amount === 'number' ? parsedJson.amount : 0.00,
    billDate: parsedJson.billDate || todayISO,
    dueDate: parsedJson.dueDate || todayISO,
    nextPaymentDate: parsedJson.calculatedDueDate || todayISO, // Set nextPaymentDate to dueDate
    // Safely check if the returned billType is a valid category
    billType: BILL_CATEGORIES.includes(parsedJson.billType as BillCategory)
      ? parsedJson.billType
      : BillCategory.Other,
  };

  return { ...validatedBill, id: crypto.randomUUID() };
};