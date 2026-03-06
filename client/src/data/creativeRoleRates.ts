/**
 * Market rate data for the Team Cost Comparison tool.
 *
 * Sources: US averages from Glassdoor, ZipRecruiter, and Bureau of Labor Statistics (2024-2025).
 * Freelance rates: Upwork, Toptal, and industry surveys.
 * Agency rates: Typically 2-3x freelance rates to cover overhead + markup.
 */

export interface CreativeRole {
  id: string;
  label: string;
  /** Average annual US full-time salary */
  annualSalary: number;
  /** Average freelance hourly rate */
  freelanceHourlyRate: number;
  /** Typical agency billing rate per hour */
  agencyHourlyRate: number;
}

export const CREATIVE_ROLES: CreativeRole[] = [
  {
    id: 'designer',
    label: 'Graphic Designer',
    annualSalary: 55_000,
    freelanceHourlyRate: 75,
    agencyHourlyRate: 175,
  },
  {
    id: 'photographer',
    label: 'Photographer',
    annualSalary: 45_000,
    freelanceHourlyRate: 65,
    agencyHourlyRate: 150,
  },
  {
    id: 'videographer',
    label: 'Videographer',
    annualSalary: 50_000,
    freelanceHourlyRate: 85,
    agencyHourlyRate: 200,
  },
  {
    id: 'copywriter',
    label: 'Copywriter',
    annualSalary: 60_000,
    freelanceHourlyRate: 70,
    agencyHourlyRate: 175,
  },
  {
    id: 'art-director',
    label: 'Art Director',
    annualSalary: 85_000,
    freelanceHourlyRate: 100,
    agencyHourlyRate: 250,
  },
  {
    id: 'motion',
    label: 'Motion Graphics',
    annualSalary: 65_000,
    freelanceHourlyRate: 90,
    agencyHourlyRate: 225,
  },
  {
    id: 'social-media',
    label: 'Social Media Manager',
    annualSalary: 55_000,
    freelanceHourlyRate: 60,
    agencyHourlyRate: 150,
  },
  {
    id: 'web-dev',
    label: 'Web Developer',
    annualSalary: 75_000,
    freelanceHourlyRate: 95,
    agencyHourlyRate: 225,
  },
];

/** Overhead multiplier for full-time hires (benefits, taxes, insurance, etc.) */
export const BENEFITS_MULTIPLIER = 1.3;

/** Roster Growth tier project fee percentage */
export const ROSTER_PROJECT_FEE_RATE = 0.12;

/** Roster Growth tier monthly platform fee */
export const ROSTER_PLATFORM_FEE = 299;

/** Average weeks per month */
export const WEEKS_PER_MONTH = 4.33;
