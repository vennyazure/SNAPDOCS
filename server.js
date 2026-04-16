import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import twilio from 'twilio';

dotenv.config({ path: '.env.local' });

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Twilio credentials from .env.local
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const recipientPhoneNumber = process.env.RECIPIENT_PHONE_NUMBER;

// Validate that all required environment variables are set
if (!accountSid || !authToken || !twilioPhoneNumber || !recipientPhoneNumber) {
  console.error('FATAL ERROR: Twilio environment variables are not configured.');
  console.error('Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, and RECIPIENT_PHONE_NUMBER in your .env.local file.');
  // We don't exit the process here to allow frontend development, but SMS will fail.
}

let twilioClient;
try {
  twilioClient = twilio(accountSid, authToken);
} catch (error) {
  console.error('Error initializing Twilio client:', error.message);
  // This will likely fail if credentials are not just missing but invalid.
}

/**
 * Endpoint to send an SMS reminder.
 * Expects a POST request with a 'bill' object in the body.
 * Example body: { "bill": { "name": "Netflix", "amount": 15.99, "dueDate": "2025-11-15" } }
 */
app.post('/api/send-reminder', (req, res) => {
  if (!twilioClient) {
    return res.status(500).json({ success: false, message: 'Twilio client is not initialized. Check server logs for details.' });
  }

  const { bill } = req.body;

  if (!bill) {
    return res.status(400).json({ success: false, message: 'Bill object is required.' });
  }

  const messageBody = `Hi! This is a reminder that your bill for ${bill.organizationName} of $${bill.amount} is due on ${new Date(bill.dueDate).toLocaleDateString()}.`;

  twilioClient.messages
    .create({
      body: messageBody,
      from: twilioPhoneNumber,
      to: recipientPhoneNumber,
    })
    .then(message => {
      console.log('SMS sent successfully! SID:', message.sid);
      res.json({ success: true, message: 'SMS sent successfully!' });
    })
    .catch(error => {
      console.error('Error sending SMS:', error);
      // Provide a more informative error message to the frontend
      let errorMessage = 'Failed to send SMS.';
      if (error.code === 21211) {
        errorMessage = 'Failed to send SMS: The "To" phone number is not a valid number.';
      } else if (error.code === 21608) {
        errorMessage = 'Failed to send SMS: The "From" phone number is not owned by your Twilio account or is not SMS-capable.';
      }
      res.status(500).json({ success: false, message: errorMessage, error: error.message });
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});