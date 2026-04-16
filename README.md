# SnapDocs - AI Bill Manager

SnapDocs is a modern web application that uses AI to automatically scan and parse your bills from images. It organizes them, stores them for you, and sends SMS reminders for upcoming due dates.

This project is powered by Google's Gemini API for image analysis and Twilio for SMS notifications.

## Features

- **AI-Powered Bill Scanning:** Upload an image of a bill, and the app will automatically extract key details like organization, amount, and due date.
- **Bill Dashboard:** View all your processed bills in an organized dashboard.
- **Automatic Due Date Reminders:** The system automatically checks for upcoming bills and sends an SMS alert via Twilio for bills that are due soon.
- **Manual SMS Reminders:** A "Send SMS Reminder" button on each bill card allows you to trigger a manual reminder at any time.
- **Client-Side Storage:** Uses the browser's IndexedDB to persist your bill data locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Setup and Installation

1.  **Clone the repository (if applicable) or download the source code.**

2.  **Install Dependencies:**
    Open your terminal in the project root directory and run the following command to install all the necessary frontend and backend packages:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    This project requires credentials for Google Gemini and Twilio. You will need to configure them in the `.env.local` file.

    a. A file named `.env.local` should exist in the project root with the following content:
    ```
    TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    TWILIO_AUTH_TOKEN=your_auth_token
    TWILIO_PHONE_NUMBER=+15017122661
    RECIPIENT_PHONE_NUMBER=+15558675309
    ```

    b. You will also need to add your Gemini API key. Create a new file named `env.js` and add the following line:
    ```javascript
    export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
    ```

    **Important:**
    - Replace the placeholder values with your actual credentials.
    - The phone numbers must be in E.164 format (e.g., `+15558675309`).
    - `TWILIO_PHONE_NUMBER` is the number you purchased from Twilio.
    - `RECIPIENT_PHONE_NUMBER` is where you want to receive the SMS alerts.

## Running the Application

To run the application, you need to start both the backend and frontend servers.

**1. Start the Backend Server:**
In a new terminal window, from the project root, run:
```bash
node server.js
```
This will start the backend API server on `http://localhost:3001`. You should see the message `Server running on http://localhost:3001`.

**2. Start the Frontend Development Server:**
In another terminal window, from the project root, run:
```bash
npm run dev
```
This will start the Vite development server, typically on `http://localhost:5173`. Your browser should automatically open to this address.

Your application is now running! You can start by uploading a bill image.