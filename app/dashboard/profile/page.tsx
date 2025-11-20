"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import Image from "next/image";
import { PencilIcon } from "@heroicons/react/24/outline";
import { UserForm } from "../users/user-form";
import { UserRole } from "../users/types";

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  enabled?: boolean;
}

interface UserImage {
  id: string;
  url: string;
  publicId: string;
  uploadedAt: string;
}

interface UserFormExisting {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image: UserImage | null;
  enabled: boolean;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/api/auth/signin");
    }
  }, [status, router]);

  // Extract user info from session
  const user = session?.user as SessionUser | undefined;
  const name = user?.name || "";
  const email = user?.email || "";
  const role = (user?.role as UserRole) || "user";
  const image = user?.image || null;
  const enabled = user?.enabled ?? true;

  const existingUser = useMemo<UserFormExisting>(
    () => ({
      id: user?.id || "self",
      name,
      email,
      role,
      image: image
        ? {
            id: "self-image",
            url: image,
            publicId: "self-image-public-id",
            uploadedAt: new Date().toISOString(),
          }
        : null,
      enabled,
    }),
    [user, name, email, role, image, enabled]
  );

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="min-h-screen p-8 flex items-center justify-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session?.user) return null;

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <h3 className="text-3xl font-bold mb-6 dark:text-white">My Profile</h3>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 max-w-xl">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold dark:text-white">Account</h4>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-900 dark:hover:bg-gray-600"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-5 gap-y-4">
            <div className="col-span-2 sm:col-span-1 row-span-3 flex items-start">
              {image ? (
                <Image
                  src={image}
                  alt={name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                  No Img
                </div>
              )}
            </div>

            <div className="col-span-3 sm:col-span-4">
              <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Name</div>
              <div className="text-base font-medium dark:text-white">{name}</div>
            </div>

            <div className="col-span-3 sm:col-span-4">
              <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Email</div>
              <div className="text-sm dark:text-gray-300">{email}</div>
            </div>

            <div className="col-span-3 sm:col-span-4">
              <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Role</div>
              <div className="text-sm dark:text-gray-300">{role}</div>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative"
            style={{ minWidth: 400, maxHeight: "90vh" }}
          >
            <button
              onClick={() => setEditing(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
            <UserForm
              title="Edit my profile"
              existing={existingUser}
              onSaved={async () => {
                await update();
                setEditing(false);
              }}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}