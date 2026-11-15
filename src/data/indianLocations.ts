import type { LocationInfo } from '../types/weather';

export const ODISHA_STATIONS: Array<{
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  coastal: boolean;
}> = [
  { name: 'Bhubaneswar', district: 'Khordha', latitude: 20.2961, longitude: 85.8245, coastal: false },
  { name: 'Puri', district: 'Puri', latitude: 19.8135, longitude: 85.8312, coastal: true },
  { name: 'Paradip', district: 'Jagatsinghpur', latitude: 20.3165, longitude: 86.6114, coastal: true },
  { name: 'Balasore', district: 'Balasore', latitude: 21.4934, longitude: 86.9135, coastal: true },
  { name: 'Gopalpur', district: 'Ganjam', latitude: 19.2647, longitude: 84.9063, coastal: true },
  { name: 'Cuttack', district: 'Cuttack', latitude: 20.4625, longitude: 85.883, coastal: false },
  { name: 'Sambalpur', district: 'Sambalpur', latitude: 21.4669, longitude: 83.9812, coastal: false },
  { name: 'Rourkela', district: 'Sundargarh', latitude: 22.2604, longitude: 84.8536, coastal: false },
];

export const FEATURED_INDIAN_CITIES: LocationInfo[] = [
  {
    id: 'odisha-bbsr',
    name: 'Bhubaneswar',
    admin1: 'Odisha',
    country: 'India',
    countryCode: 'IN',
    latitude: 20.2961,
    longitude: 85.8245,
    isOdisha: true,
  },
  {
    id: 'odisha-puri',
    name: 'Puri',
    admin1: 'Odisha',
    country: 'India',
    countryCode: 'IN',
    latitude: 19.8135,
    longitude: 85.8312,
    isOdisha: true,
  },
  {
    id: 'odisha-paradip',
    name: 'Paradip',
    admin1: 'Odisha',
    country: 'India',
    countryCode: 'IN',
    latitude: 20.3165,
    longitude: 86.6114,
    isOdisha: true,
  },
  {
    id: 'odisha-cuttack',
    name: 'Cuttack',
    admin1: 'Odisha',
    country: 'India',
    countryCode: 'IN',
    latitude: 20.4625,
    longitude: 85.883,
    isOdisha: true,
  },
  {
    id: 'in-delhi',
    name: 'New Delhi',
    admin1: 'Delhi',
    country: 'India',
    countryCode: 'IN',
    latitude: 28.6139,
    longitude: 77.209,
  },
  {
    id: 'in-mumbai',
    name: 'Mumbai',
    admin1: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    latitude: 19.076,
    longitude: 72.8777,
  },
  {
    id: 'in-bengaluru',
    name: 'Bengaluru',
    admin1: 'Karnataka',
    country: 'India',
    countryCode: 'IN',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    id: 'in-chennai',
    name: 'Chennai',
    admin1: 'Tamil Nadu',
    country: 'India',
    countryCode: 'IN',
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    id: 'in-kolkata',
    name: 'Kolkata',
    admin1: 'West Bengal',
    country: 'India',
    countryCode: 'IN',
    latitude: 22.5726,
    longitude: 88.3639,
  },
  {
    id: 'in-hyderabad',
    name: 'Hyderabad',
    admin1: 'Telangana',
    country: 'India',
    countryCode: 'IN',
    latitude: 17.385,
    longitude: 78.4867,
  },
];

export function isLocationInOdisha(loc: Pick<LocationInfo, 'admin1' | 'name' | 'latitude' | 'longitude'>): boolean {
  if (loc.admin1?.toLowerCase().includes('odisha') || loc.admin1?.toLowerCase().includes('orissa')) {
    return true;
  }
  // Rough bounding box for Odisha (17.78N–22.57N, 81.37E–87.53E)
  return loc.latitude >= 17.78 && loc.latitude <= 22.57 && loc.longitude >= 81.37 && loc.longitude <= 87.53;
}
