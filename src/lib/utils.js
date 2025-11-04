import { IMAGE_BASE_URL } from "@/redux/feature/baseApi";
import { clsx } from "clsx";
import { format } from "date-fns";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Success Toast
export const SuccessToast = (msg) => {
  toast.success(msg)
}

// Error Toast 
export const ErrorToast = (msg) => {
  toast.error(msg)
}

// Get Initials
export const getInitials = (name) => {
  if (!name) return "NA";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "N";
  const second = parts[1]?.[0] || parts[0]?.[1] || "A";
  return (first + second).toUpperCase();
};

// Format Date 
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'dd-MM-yyyy | hh:mm a'); 
};

// Get Image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return imagePath.startsWith('/') ? `${IMAGE_BASE_URL}${imagePath}` : `${IMAGE_BASE_URL}/${imagePath}`;
};

// Get Status Variant
export const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case "N/A":
      return "default";
    case "paid":
      return "success";
    case "complete":
      return "default";
    case "pending":
      return "warning";
    case "cancel":
      return "destructive";
    default:
      return "outline";
  }
};

// Get Month Number
export const getMonthNumber = (monthName) => {
  const months = {
    'january': '01',
    'february': '02',
    'march': '03',
    'april': '04',
    'may': '05',
    'june': '06',
    'july': '07',
    'august': '08',
    'september': '09',
    'october': '10',
    'november': '11',
    'december': '12'
  };
  const formattedName = monthName.toLowerCase();

  return months[formattedName] || null;
}