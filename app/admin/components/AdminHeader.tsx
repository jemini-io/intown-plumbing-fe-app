"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from 'next/image';


export default function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 border-b fixed top-0 left-0 right-0 z-50">
        <Image
            src="/intown-logo-2023.svg"
            alt="InTown Plumbing Logo"
            width={200}
            height={134}
            className="h-auto w-64 sm:w-40 lg:w-64"
            priority
        />
        <h1 className="text-xl font-bold">Admin Dashboard</h1>

        <div className="relative">
            <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
            Menu
            </button>

            {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                <Link
                href="/admin"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
                >
                Dashboard Home
                </Link>
                <hr className="my-1" />
                <Link
                href="/admin/settings"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
                >
                App Settings
                </Link>
                <Link
                href="/admin/users"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
                >
                Users
                </Link>
                <hr className="my-1" />
                <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                Logout
                </button>
            </div>
            )}
        </div>
    </div>
  );
}
