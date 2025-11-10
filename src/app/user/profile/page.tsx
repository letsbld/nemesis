"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader } from '@/components/ui/loader';
import { apiFetch } from '@/lib/apiFetch';
import { UserData } from "@/types/user.types";


export default function UserProfile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await apiFetch("/user/me"); // 👈 backend API
        const data = res;

        // Map API → UserData
        const mapped: UserData = {

            id: data.id, 
            first_name: data.first_name,
            middle_name: data.middle_name,
            last_name: data.last_name,
            display_name: data.display_name,
            company_email: data.company_email,
            alternate_email: data.alternate_email,
            manager_id: data.manager_id,
            username: data.username,
            department: data.department,
            description: data.description ,
            totp_secret: data.totp_secret,
            totp_enabled: data.totp_enabled, // boolean → use ?? instead of ||
            ssh_key_allowed: data.ssh_key_allowed,
            role: data.role ,
            created_at: data.created_at,
            updated_at: data.updated_at ,
            manager_email: data.manager_email,

            // fields not present in backend → keep defaults
            designation: data.designation,
            phone: data.phone,
            dob: data.dob,
            address: data.address,
            city: data.city,
            state: data.state,
            country: data.country,
            postcode: data.postcode,
            profileImage: data.profileImage || "/user-imge.png",
            coverImage: data.coverImage ||"/blue-cover.jpg",
        };


        setUser(mapped);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!user) return;
    const { name, value } = e.target;

    // Special case: if input name is "date", map it to "dob"
    if (name === "date") {
        setUser((prev) => (prev ? { ...prev, dob: value } : prev));
    } else {
        setUser((prev) => (prev ? { ...prev, [name]: value } : prev));
    }
    };


  // Handle image upload preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profileImage" | "coverImage") => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setUser({ ...user, [type]: url });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated Data:", user);
    alert("Profile updated successfully ✅");
  };

  if (loading || !user){ 
    return( 
            <div className="flex justify-center py-6">
                <Loader />
            </div>
        )
    };

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-[#1a2332] rounded-xl shadow-md overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-40 w-full bg-blue-600 dark:bg-blue-700">
        <Image src={user.coverImage} alt="Cover" fill className="object-cover" />
        <label className="absolute top-3 right-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow text-sm cursor-pointer">
          Edit Cover
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageChange(e, "coverImage")}
          />
        </label>
      </div>

      {/* Floating Profile Card */}
        <div className="relative -mt-16 px-6">
            <div className="w-full  bg-white dark:bg-[#101828] rounded-xl shadow p-6 text-center mx-auto md:mx-0">
                <div className="flex flex-row items-center">
                    <div className="w-28 h-28 relative">
                        <Image
                        src={user.profileImage}
                        alt="Profile"
                        width={112}
                        height={112}
                        className="rounded-full border-4 border-white dark:border-gray-700 shadow object-cover"
                        />
                        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-full shadow cursor-pointer">
                        Edit
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageChange(e, "profileImage")}
                        />
                        </label>
                    </div>
                    <div className="ml-10 text-left">
                        <h2 className="mt-4 text-xl font-semibold dark:text-white">{user.username}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{user.designation}</p>
                        <p className="text-gray-400 dark:text-gray-500">{user.company_email}</p>
                    </div>
                </div>
            </div>
        </div>

    

        {/* Right Form Section */}
        <div className="mt-6 bg-white dark:bg-[#1a2332] rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Account Settings</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
           {/* Read-only fields */}
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
            <input
                type="text"
                value={user.first_name}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
            <input
                type="text"
                value={user.last_name}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <input
                type="text"
                value={user.role}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Email</label>
            <input
                type="company email"
                value={user.company_email}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Personal Email</label>
            <input
                type="personal email"
                value={user.alternate_email}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manger Email</label>
            <input
                type="manager email"
                value={user.manager_email}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Totp Enabled</label>
            <input
                type="totp enabled"
                value={user.totp_enabled ? "Yes" : "No"}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SSH Enabled</label>
            <input
                type="ssh enabled"
                value={user.ssh_key_allowed ? "Yes" : "No"}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
            </div>
            

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
            <input
                type="date"
                name="dob"
                value={user.dob || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>

            {/* Editable fields */}
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input
                type="text"
                name="phone"
                value={user.phone || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <input
                type="text"
                name="address"
                value={user.address || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
            <input
                type="text"
                name="city"
                value={user.city || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
            <input
                type="text"
                name="state"
                value={user.state || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postcode</label>
            <input
                type="text"
                name="postcode"
                value={user.postcode || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
            <select
                name="country"
                value={user.country || "India"}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option>United States</option>
                <option>India</option>
                <option>Canada</option>
            </select>
            </div>


            {/* Submit */}
            <div className="col-span-2 flex justify-end mt-4">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Update
              </button>
            </div>
          </form>
        </div>
      
    </div>
  );
}

// Tailwind helper
function inputClass() {
  return "border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring focus:ring-blue-200 focus:outline-none";
}
