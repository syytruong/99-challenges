Currency Swap Application

A modern, responsive currency swap interface built with React, Vite, and Tailwind CSS. This project demonstrates a production-grade frontend architecture with robust error handling, loading states, and simulated blockchain interactions.

🚀 Tech Stack

Framework: React 18

Build Tool: Vite (chosen for fast HMR and optimized builds)

Styling: Tailwind CSS (v3.4)

Icons: Lucide React

Linting: ESLint

🛠️ Getting Started

Follow these instructions to run the project locally.

Prerequisites

Node.js (v18 or higher recommended)

npm

Installation

Clone the repository:

git clone [https://github.com/syytruong/99-challenges.git](https://github.com/syytruong/99-challenges.git)
cd 99-challenges


Install dependencies:

npm install


Note: If you encounter peer dependency warnings regarding Tailwind, simply run npm install -D tailwindcss@3.4.17 to align versions.

Start the development server:

npm run dev


View the app:
Open your browser and navigate to http://localhost:5173.

🌟 Features

Real-time Data: Fetches live token prices from interview.switcheo.com.

Smart Search: Memoized filtering for instant token search performance.

Simulated Transactions: Includes a mock service layer that simulates network latency and random slippage errors (10% failure rate) to demonstrate realistic UI feedback loops.

Defensive Design: Handles missing token icons and API failures gracefully with visual fallbacks.

Responsive UI: Mobile-first design using Tailwind utility classes.

📝 Author's Note

Regarding the Fullstack Application:
I am applying for the Fullstack Engineer position. However, adhering to the challenge's recommendation to "view your solution without any pain" and to avoid over-engineering, I have focused this submission on delivering a polished Frontend experience.

Instead of including a heavy backend server (which requires database setup/Docker), I simulated backend interactions directly in the client. This demonstrates my ability to handle asynchronous data flows, loading states, and error handling effectively while keeping the repository easy to clone and run.