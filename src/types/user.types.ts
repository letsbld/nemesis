export interface UserData {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  display_name: string;
  company_email: string;
  alternate_email: string;
  manager_id: string;
  username: string;
  department: string | null;
  description: string | null;
  totp_secret: string;
  totp_enabled: boolean;
  ssh_key_allowed: boolean;
  role: "user" | "admin"; // 👈 if roles are fixed
  created_at: string; // can be Date if you parse it
  updated_at: string;
  manager_email: string;
  designation: string | null;
  phone: string | null;
  dob: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postcode: string | null;
  profileImage: string; // URL to profile image
  coverImage: string;   // URL to cover image
}