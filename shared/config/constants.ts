/**
 * Shared Configuration - Constants
 * Application-wide constants
 */

export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || "CORE APP";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Core Application untuk manajemen modul internal PT Bintang Indokarya Gemilang dengan integrasi iDempiere ERP Special Forms. Platform modern untuk mengelola proses bisnis perusahaan.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// Pagination
export const ITEMS_PER_PAGE =
  Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE) || 10;
export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 15;

// User roles
export const USER_ROLES = process.env.USER_ROLES 
  ? process.env.USER_ROLES.split(', ')
  : ['admin', 'manager', 'staff', 'user'];

// Default values for dev
export const signInDefaultValues = {
  email: "admin@bintangindokarya.co.id",
  password: "12345678",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};
