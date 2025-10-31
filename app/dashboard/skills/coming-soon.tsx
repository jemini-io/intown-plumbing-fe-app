"use client";
import DashboardLayout from "../components/DashboardLayout";

export default function SkillsPage() {
  return (
    <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg px-8 py-12 flex flex-col items-center">
            <span className="text-5xl mb-4">🚧</span>
            <p className="text-lg text-gray-600 mb-4">Hey Dan, behold the message you love to see when things are not done yet:</p>
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Coming Soon!</h1>
            <h2 className="text-2xl font-semibold mb-2 text-gray-700">😛</h2>
        </div>
        </div>
    </DashboardLayout>

  );
}