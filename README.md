# Nezu Dashboard (Frontend)

The modern administrative dashboard for the **Nezu Intent Manager**. Built with **Next.js 14** (App Router), this interface allows users to view intent status, manage devices (boards), and monitor system activity in real-time.

## 🚀 Technologies

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State/Fetching**: React Hooks, SWR (or Axios)
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NezuSas/intentflow-dashboard.git
   cd intentflow-dashboard
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the connection to your backend:
   ```env
   # Default local backend URL
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📦 Deployment (Vercel)

This project is optimized for **Vercel**.

1. Import the repository into Vercel.
2. The framework preset should detect **Next.js** automatically.
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Set this to your production backend URL (e.g., `https://intentflow-api.onrender.com`).
4. Click **Deploy**.

## 📂 Project Structure

- `src/app/`: App Router pages and layouts.
- `src/components/`: Reusable UI components.
- `src/services/`: API integration services.
- `src/types/`: TypeScript definitions for Intents and Boards.
