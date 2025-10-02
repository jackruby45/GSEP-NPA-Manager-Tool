// Pure types and interfaces only

export interface Meter {
  id: number;
  meterNumber: string;
  customerAccountNumber: string;
  unitIdentifier: string;
  uddUsage: number | null;   // annual usage (therms/yr)
  baseUsage: number | null;  // base (therms/mo)
}

export interface Service {
  id: number;
  streetName: string;
  streetNumber: string;
  serviceId: string;
  diameter: number | null;
  material: string;
  length: number | null;
  isBranchService: boolean;
  parentServiceId: number | null;
  workType: string;
  structureType: string;
  structureTypeOther: string;
  numberOfMeters: number | null;
  meters: Meter[];
  replacementDiameter: number | null;
  replacementMaterial: string;
  replacementLength: number | null;
  replacementMethod: string;
}

export interface MainSegment {
  id: number;
  fromLocation: string;
  toLocation: string;
  diameter: number | null;
  material: string;
  length: number | null;
  mainId: string;
  dimpRiskScore: number | null;
  maop: string;
  essentialStatus: 'essential' | 'nonEssential' | '';
  lengthToBeReplaced: number | null;
  replacementPipeDiameter: number | null;
  replacementPipeMaterial: string;
  replacementPipeMethod: string;
  replacementPipeMaop: string;
  numberOfServices: number | null;
  services: Service[];
  primaryPurpose: string;
  primaryPurposeOtherReason: string;
  primaryPurposeExplanation: string;
  secondaryPurpose: string;
  secondaryPurposeOtherReason: string;
  secondaryPurposeExplanation: string;
  diameterReduction: string;
}

export interface Street {
  id: number;
  name: string;
  numberOfMainSegments: number | null;
  mainSegments: MainSegment[];
  advancedLeakDetectionEvaluation?: {
    cisbotNotUsedReasons: string[];
    reliningNotUsedReasons: string[];
    keyholeNotUsedReasons: string[];
    seiNotUsedReasons: string[];
  };
}

export interface Project {
  id: number;
  projectNumber: number | null;
  projectName: string;
  revisionNumber: string;
  revisionDate: string | null;
  projectDescription: string;
  projectStartDate: string | null;
  projectEndDate: string | null;
  projectCost: number | null;

  overviewMapFileName: string | null;
  overviewMapFileContent: string | null;
  overviewMapWidth: number | null;
  overviewMapHeight: number | null;

  // EJ/regulator kept as plain text fields (no AI)
  projectType: string;
  townCity: string;
  isEJCommunity: boolean | null;
  ejInformation: string;
  ejSummary: string;
  eliminatesRegulatorStation: boolean | null;
  contributesToRegulatorStationElimination: boolean | null;
  regulatorStationComments: string;

  numberOfStreets: number;
  streets: Street[];

  annualHDD: number;
  annualHDDBasis: string;

  // computed totals
  totalAbandonedLength: number | null; // not computed in original; left for future use
  totalReplacedLength: number | null;
  totalAnnualUsage: number | null;
}

export interface AppState {
  projects: Project[];
  activeProjectId: number | null;
  isAdminPanelOpen: boolean;
  isPasscodeModalOpen: boolean;
  isCreatingNewProject: boolean;

  isDeleteConfirmModalOpen: boolean;
  projectToDeleteId: number | null;

  isMoveStreetModalOpen: boolean;
  streetToMove: { sourceProjectId: number; streetIndex: number } | null;

  isDataVarsModalOpen: boolean;

  isReportModalOpen: boolean;
  reportProjectId: number | null;
  reportViewMode: 'summary' | 'table';

  isSchemaModalOpen: boolean;
  isAboutModalOpen: boolean;
  isNewProjectModalOpen: boolean;
}