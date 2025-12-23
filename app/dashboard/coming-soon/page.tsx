"use client";
import DashboardLayout from "../components/DashboardLayout";

export default function ComingSoonPage() {
  return (
    <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg px-8 py-12 flex flex-col items-center">
            <span className="text-5xl mb-4">🚧</span>
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Coming Soon!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">Thanks for checking out the app! It&apos;s still a work in progress, please check back later when we&apos;ve finished this feature!</p>
        </div>
        </div>
    </DashboardLayout>

  );
}