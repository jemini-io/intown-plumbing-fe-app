"use client";
import DashboardLayout from "../components/DashboardLayout";

export default function ComingSoonPage() {
  return (
    <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg px-8 py-12 flex flex-col items-center">
            <span className="text-5xl mb-4">🚧</span>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Coming Soon!</h1>
            <p className="text-sm text-gray-500 mt-1 text-center">Thanks for checking out the app! It&apos;s still a work in progress, please check back later when we&apos;ve finished this feature!</p>
        </div>
        </div>
    </DashboardLayout>

  );
}