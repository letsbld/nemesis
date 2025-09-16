"use client";
import React, { useEffect, useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Laptop,
  Smartphone,
} from "lucide-react";

// Dummy fetch function (replace with real API)
async function fetchUserProfile() {
  return {
    display_name: "John Doe",
    first_name: "John",
    middle_name: "A.",
    last_name: "Doe",
    phone: "+1-555-1234",
    company_email: "john.doe@example.com",
    alternate_email: "john.alt@example.com",
    current_address: "123 Main St, Springfield",
    permanent_address: "456 Elm St, Shelbyville",
    devices: [
      { id: "dev-001", name: "Laptop", registered: "2024-01-10" },
      { id: "dev-002", name: "Mobile", registered: "2024-03-22" },
    ],
  };
}

const MyProfiles = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile().then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 animate-pulse">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg p-6 flex items-center space-x-6">
        <div className="bg-white text-blue-600 w-20 h-20 flex items-center justify-center rounded-full text-2xl font-bold shadow-md">
          {profile.first_name[0]}
        </div>
        <div>
          <h2 className="text-3xl font-bold">{profile.display_name}</h2>
          <p className="text-sm text-blue-100">
            {profile.first_name} {profile.middle_name} {profile.last_name}
          </p>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="bg-white mt-6 rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InfoItem icon={<Phone />} label="Phone" value={profile.phone} />
          <InfoItem icon={<Mail />} label="Email" value={profile.company_email} />
          <InfoItem
            icon={<Mail />}
            label="Alternate Email"
            value={profile.alternate_email}
          />
          <InfoItem
            icon={<MapPin />}
            label="Current Address"
            value={profile.current_address}
          />
          <InfoItem
            icon={<MapPin />}
            label="Permanent Address"
            value={profile.permanent_address}
          />
        </div>
      </div>

      {/* Devices Section */}
      <div className="bg-white mt-6 rounded-2xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Registered Devices
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {profile.devices.map((device: any) => (
            <div
              key={device.id}
              className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition rounded-xl p-4"
            >
              <div className="flex items-center space-x-3">
                {device.name.toLowerCase() === "laptop" ? (
                  <Laptop className="w-6 h-6 text-blue-500" />
                ) : (
                  <Smartphone className="w-6 h-6 text-green-500" />
                )}
                <div>
                  <p className="font-medium text-gray-800">{device.name}</p>
                  <p className="text-sm text-gray-500">ID: {device.id}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {new Date(device.registered).toDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start space-x-3">
    <div className="text-blue-500 mt-1">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  </div>
);

export default MyProfiles;
