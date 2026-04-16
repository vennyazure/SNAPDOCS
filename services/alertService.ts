import { Bill } from '../types';

// ===================================================================================
// IMPORTANT SECURITY NOTE FOR LOCAL DEVELOPMENT
// ===================================================================================
// This function simulates a call to a backend API endpoint. In a real-world
// application, you MUST NOT handle Twilio credentials (or any secrets) on the
// client-side. The code below provides a blueprint for how a real backend
// would handle the SMS sending.
//
// To run this locally, you would need to:
// 1. Set up a simple backend server (e.g., using Node.js and Express).
// 2. Install the Twilio Node.js library (`npm install twilio`).
// 3. Set your Twilio credentials as environment variables on your server:
//    - process.env.TWILIO_ACCOUNT_SID
//    - process.env.TWILIO_AUTH_TOKEN
//    - process.env.TWILIO_PHONE_NUMBER (Your phone number from Twilio)
// 4. Implement the server-side logic as shown in the example comment below.
// ===================================================================================

/**
 * Simulates calling a backend endpoint to send an SMS alert via Twilio.
 * @param bill The bill to send an alert for.
 * @param phoneNumber The recipient's phone number.
 * @returns A promise that resolves with a success message or rejects with an error.
 */
export const sendSmsAlert = async (bill: Bill): Promise<string> => {
  // The backend now reads the recipient's phone number from environment variables.
  // The bill data is sent to the backend to construct the message.
  
  // In a real application, you would use fetch() to call your backend:
  const response = await fetch('http://localhost:3001/api/send-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bill }),
  });

  if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send SMS.');
  }

  const result = await response.json();
  return result.message;
};

/*
// ===================================================================================
// EXAMPLE: Backend Server Logic (e.g., in a file like `server.js` using Express)
// ===================================================================================
//
// const express = require('express');
// const twilio = require('twilio');
// const app = express();
// app.use(express.json());
//
// // Load credentials from environment variables
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
//
// // Check if credentials are set
// if (!accountSid || !authToken || !twilioPhoneNumber) {
//   console.error("Twilio credentials are not set in environment variables.");
//   // In a real app, you might want to exit or handle this more gracefully
// }
//
// const client = twilio(accountSid, authToken);
//
// app.post('/api/send-sms', async (req, res) => {
//   const { to, body } = req.body;
//
//   if (!to || !body) {
//     return res.status(400).json({ message: 'Missing "to" or "body" in request.' });
//   }
//
//   try {
//     const message = await client.messages.create({
//       body: body,
//       from: twilioPhoneNumber,
//       to: to
//     });
//
//     console.log('SMS sent successfully. SID:', message.sid);
//     res.status(200).json({ message: `Alert successfully sent to ${to}.` });
//
//   } catch (error) {
//     console.error('Failed to send SMS:', error);
//     res.status(500).json({ message: 'Failed to send SMS.', error: error.message });
//   }
// });
//
// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//
// ===================================================================================
*/