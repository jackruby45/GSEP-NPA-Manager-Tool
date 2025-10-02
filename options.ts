// Central place for option lists and drop-down choices
// NOTE: paste your full lists where indicated.
import { FITCHBURG_STREETS, GARDNER_STREETS } from './streets.ts';

export { FITCHBURG_STREETS, GARDNER_STREETS };

export const PASSCODE = '0665';
export const DESIGN_DAY_HDD_BASELINE = 65;

// ---- Geographic dropdowns ----
export const TOWNS: string[] = [
  // EXAMPLES — replace with your full list from your original index.tsx
  'Fitchburg', 'Lunenburg', 'Ashby', 'Westminster', 'Gardner'
  // PASTE FULL TOWNS ARRAY HERE
].sort();

// Optional: map of town -> street list
export const STREETS_BY_TOWN: Record<string, string[]> = {
  Fitchburg: FITCHBURG_STREETS,
  Gardner: GARDNER_STREETS,
  // add other towns if you have them
};

// ---- Engineering options ----
export const PIPE_DIAMETERS = [1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18];
export const SERVICE_PIPE_DIAMETERS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4, 6, 8, 10, 12];

export const PIPE_MATERIALS = [
  'Cast Iron',
  'Bare Steel',
  'Unprotected Coated Steel',
  'Protected Coated Steel',
  'Legacy Plastic HDPE',
  'Legacy Plastic MDPE',
  'Aldyl a pipe',
];

export const REPLACEMENT_PIPE_DIAMETERS = [2, 4, 6, 8, 10, 12];
export const REPLACEMENT_PIPE_MATERIALS = [
  'HDPE',
  'Coated Steel',
];

export const REPLACEMENT_PIPE_METHODS = [
  'Open-Cut',
  'Insertion',
  'Pipe Bursting',
  'HDD',
];

export const MAOP_OPTIONS = ['14 Inches W.C.', '30 psig', '99 psig'];

export const PRIMARY_PURPOSE_OPTIONS = [
  'Risk Score',
  'Municipal Improvement Project',
  'No supply due to upstream replacement',
  'Opportunistic',
  'Other (please specify)',
];

export const SERVICE_WORK_TYPES = [
  'Full Replacement',
  'Partial Replacement',
  'Abandonment Only',
  'Tie Over to New Main Segment',
];

export const STRUCTURE_TYPES: { category: string; options: string[] }[] = [
  {
    category: 'General Structures',
    options: [
      'Residential',
      'Residential Duplex',
      'Residential Triplex',
      'Residential Quadplex',
      'Small Multi Residential Apartment Building',
      'Large Multi Residential Apartment Building',
      'Small Commercial Building',
      'Large Commercial Building',
      'Small Restaurant',
      'Large Restaurant',
      'Small Industrial Building',
      'Large Industrial Building',
    ],
  },
];

export const DIRECTIONS = ['North', 'South', 'East', 'West'];

export const DIAMETER_REDUCTION_MAP = {
    '8_to_6': '8" to 6"',
    '8_to_4': '8" to 4"',
    '8_to_2': '8" to 2"',
    '6_to_4': '6" to 4"',
    '6_to_2': '6" to 2"',
    '4_to_2': '4" to 2"',
};

export const ADVANCED_LEAK_DETECTION_OPTIONS = {
  cisbot: {
    label: 'CISBOT (Cast Iron Sealing Robot)',
    reasons: [
      'The pipe diameter is too small (<12")',
      'The pipe barrel is cracked, fractured, or heavily pitted (structurally unsound)',
      'The pipe alignment includes sharp bends, offsets, or non-standard fittings',
      'A launch pit cannot be constructed due to underground congestion or pavement restrictions',
      'The segment is short or small-diameter where replacement is faster and cheaper',
      'The segment is already scheduled for retirement or NPA/electrification in the near term',
      'A ≥10-year life extension cannot be demonstrated for regulatory approval',
      'A future scheduled encroachment will trigger replacement under 220 CMR 113.06/113.07',
      'Traffic or permitting constraints prevent prolonged robotic operations in the project area',
      'A qualified contractor or equipment is not available for the project timeline',
      'The work window is too short (downtowns, school zones, etc.) for robotic sealing',
    ],
  },
  relining: {
    label: 'Internal Relining / Sleeving (CIPP, epoxy liners, internal sleeves)',
    reasons: [
      'The pipe diameter is too small (<4") or the cast iron geometry is irregular',
      'The pipe alignment has offsets, sags, or multiple bends that prevent liner insertion',
      'The service connections are too numerous or complex (each must be re-tapped after lining)',
      'The relining material lowers allowable MAOP or reduces capacity below system requirements',
      'The pipe is crushed, deformed, or subject to heavy water infiltration',
      'The lining material is incompatible with gas contaminants or local soil conditions',
      'Long-term compliance under 49 CFR 192 / ASME B31.8 cannot be demonstrated',
      'The high upfront cost makes lining uneconomical for the project segment',
      'A future scheduled encroachment will require replacement under 220 CMR 113.06/113.07',
      'Seasonal or weather conditions prevent successful installation (e.g., cold weather cure failures)',
      'The worksite is too constrained to handle equipment footprint or resin operations',
      'Extended outages needed for cleaning, prep, and cure cannot be supported',
    ],
  },
  keyhole: {
    label: 'Targeted Keyhole Leak Repair / Joint Sealing',
    reasons: [
      'The leak is deeper than ~6 ft or located under pavement/structures that restrict access',
      'More than one leak is present on the segment (systemic deterioration vs isolated issue)',
      'The pipe shows structural problems beyond localized joint leaks',
      'The repair materials cannot demonstrate ≥10 years of service life',
      'The leak density is high enough that repeated repairs would exceed replacement cost',
      'The DPU or regulatory review deems the repair insufficient for long-term risk reduction',
      'A future scheduled encroachment requires replacement under 220 CMR 113.06/113.07',
      'Traffic control costs for repeated keyholes exceed replacement cost for the segment',
      'Frozen ground or wet conditions prevent effective sealing',
      'Noise or dust limits prohibit repeated excavation in sensitive areas',
    ],
  },
  sei: {
    label: 'Targeted Repair of a Grade 3 SEI (Significant Environmental Impact) Leak',
    reasons: [
      'The pipe is degraded or structurally unsound (repairs would not address the root condition)',
      'The leak density is high, making multiple targeted repairs uneconomical',
      'The repair cannot demonstrate ≥10 years of effectiveness',
      'The sealing compound or injection method is unproven under local freeze/thaw or saturation conditions',
      'The repair results in recurring methane emissions or requires repeat excavations',
      'Replacement is required for long-term safety and system integrity',
      'A future scheduled encroachment will require replacement under 220 CMR 113.06/113.07',
      'Repeated repair cycles would cause unacceptable community disruption',
      'The contractor or specialized materials are not available in time for the project',
      'Winter construction moratoria prevent repairs before replacement season begins',
    ],
  },
};