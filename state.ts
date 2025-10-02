import { genId, toNumberOrNull } from './utils.ts';
import type { AppState, Project, Street, MainSegment, Service, Meter } from './types.ts';

export const state: AppState = {
  projects: [],
  activeProjectId: null,
  isAdminPanelOpen: false,
  isPasscodeModalOpen: false,
  isCreatingNewProject: true,

  isDeleteConfirmModalOpen: false,
  projectToDeleteId: null,

  isMoveStreetModalOpen: false,
  streetToMove: null,

  isDataVarsModalOpen: false,

  isReportModalOpen: false,
  reportProjectId: null,
  reportViewMode: 'summary',

  isSchemaModalOpen: false,
  isAboutModalOpen: false,
  isNewProjectModalOpen: false,
};

// ---------- Factories ----------
export function createMeter(): Meter {
  return { id: genId(), meterNumber: '', customerAccountNumber: '', unitIdentifier: '', uddUsage: null, baseUsage: null };
}
export function createService(streetName = ''): Service {
  return {
    id: genId(),
    streetName,
    streetNumber: '',
    serviceId: '',
    diameter: null,
    material: '',
    length: null,
    isBranchService: false,
    parentServiceId: null,
    workType: '',
    structureType: '',
    structureTypeOther: '',
    numberOfMeters: 0,
    meters: [],
    replacementDiameter: null,
    replacementMaterial: '',
    replacementLength: null,
    replacementMethod: '',
  };
}
export function createMainSegment(): MainSegment {
  return {
    id: genId(),
    fromLocation: '',
    toLocation: '',
    diameter: null,
    material: '',
    length: null,
    mainId: '',
    dimpRiskScore: null,
    maop: '',
    essentialStatus: '',
    lengthToBeReplaced: null,
    replacementPipeDiameter: null,
    replacementPipeMaterial: '',
    replacementPipeMethod: '',
    replacementPipeMaop: '',
    numberOfServices: 0,
    services: [],
    primaryPurpose: '',
    primaryPurposeOtherReason: '',
    primaryPurposeExplanation: '',
    secondaryPurpose: '',
    secondaryPurposeOtherReason: '',
    secondaryPurposeExplanation: '',
    diameterReduction: '',
  };
}
export function createStreet(): Street {
  return {
    id: genId(),
    name: '',
    numberOfMainSegments: 0,
    mainSegments: [],
    advancedLeakDetectionEvaluation: {
      cisbotNotUsedReasons: [],
      reliningNotUsedReasons: [],
      keyholeNotUsedReasons: [],
      seiNotUsedReasons: [],
    },
  };
}
export function createProject(name: string): Project {
  return {
    id: genId(),
    projectNumber: null,
    projectName: name,
    revisionNumber: '',
    revisionDate: null,
    projectDescription: '',
    projectStartDate: null,
    projectEndDate: null,
    projectCost: null,
    overviewMapFileName: null,
    overviewMapFileContent: null,
    overviewMapWidth: null,
    overviewMapHeight: null,
    projectType: 'GSEP (Gas System Enhancement Plan)',
    townCity: '',
    isEJCommunity: null,
    ejInformation: '',
    ejSummary: '',
    eliminatesRegulatorStation: null,
    contributesToRegulatorStationElimination: null,
    regulatorStationComments: '',
    numberOfStreets: 1,
    streets: [createStreet()],
    annualHDD: 5800,
    annualHDDBasis: '(Based on 2020–2025 Average for Worcester Massachusetts)',
    totalAbandonedLength: null,
    totalReplacedLength: null,
    totalAnnualUsage: null,
  };
}

// ---------- Getters ----------
export function getActiveProject(): Project | undefined {
  return state.activeProjectId == null
    ? undefined
    : state.projects.find(p => p.id === state.activeProjectId);
}
export function setActiveProject(id: number | null) {
  state.activeProjectId = id;
}

// ---------- Report Modal State ----------
export function openReportModal(projectId: number) {
  state.isReportModalOpen = true;
  state.reportProjectId = projectId;
  state.reportViewMode = 'summary';
}

export function closeReportModal() {
  state.isReportModalOpen = false;
  state.reportProjectId = null;
}

export function setReportViewMode(mode: 'summary' | 'table') {
  state.reportViewMode = mode;
}

export function getReportProject(): Project | undefined {
    return state.reportProjectId == null
        ? undefined
        : state.projects.find(p => p.id === state.reportProjectId);
}

// ---------- Schema Modal State ----------
export function openSchemaModal() {
  state.isSchemaModalOpen = true;
}

export function closeSchemaModal() {
  state.isSchemaModalOpen = false;
}

// ---------- About Modal State ----------
export function openAboutModal() {
  state.isAboutModalOpen = true;
}

export function closeAboutModal() {
  state.isAboutModalOpen = false;
}

// ---------- New Project Modal State ----------
export function openNewProjectModal() {
  state.isNewProjectModalOpen = true;
}

export function closeNewProjectModal() {
  state.isNewProjectModalOpen = false;
}


// ---------- Delete Confirm Modal State ----------
export function openDeleteConfirmModal(projectId: number) {
  state.isDeleteConfirmModalOpen = true;
  state.projectToDeleteId = projectId;
}

export function closeDeleteConfirmModal() {
  state.isDeleteConfirmModalOpen = false;
  state.projectToDeleteId = null;
}

export function deleteProjectConfirmed() {
    if (state.projectToDeleteId === null) return;
    
    const projectIndex = state.projects.findIndex(p => p.id === state.projectToDeleteId);
    if (projectIndex === -1) {
        closeDeleteConfirmModal();
        return;
    }

    // Remove the project
    state.projects.splice(projectIndex, 1);
    
    // If the deleted project was the active one, select a new one
    if (state.activeProjectId === state.projectToDeleteId) {
        if (state.projects.length > 0) {
            // Select the previous project or the first one
            const newActiveIndex = Math.max(0, projectIndex - 1);
            state.activeProjectId = state.projects[newActiveIndex].id;
        } else {
            state.activeProjectId = null;
        }
    }
    
    closeDeleteConfirmModal();
}

// ---------- Editor State Mutations ----------
const getActive = () => {
  const project = getActiveProject();
  if (!project) throw new Error("No active project");
  return { project };
}
const getStreet = (sIdx: number) => {
  const { project } = getActive();
  const street = project.streets[sIdx];
  if (!street) throw new Error(`Street at index ${sIdx} not found`);
  return { project, street };
}
const getSegment = (sIdx: number, mIdx: number) => {
  const { street } = getStreet(sIdx);
  const segment = street.mainSegments[mIdx];
  if (!segment) throw new Error(`Segment at index ${mIdx} not found`);
  return { street, segment };
}
const getService = (sIdx: number, mIdx: number, vIdx: number) => {
  const { segment } = getSegment(sIdx, mIdx);
  const service = segment.services[vIdx];
  if (!service) throw new Error(`Service at index ${vIdx} not found`);
  return { segment, service };
}
const getMeter = (sIdx: number, mIdx: number, vIdx: number, tIdx: number) => {
  const { service } = getService(sIdx, mIdx, vIdx);
  const meter = service.meters[tIdx];
  if (!meter) throw new Error(`Meter at index ${tIdx} not found`);
  return { service, meter };
}

// Project
export function updateProjectField(field: keyof Project, value: any) {
  const { project } = getActive();
  (project as any)[field] = value;
}
export function addStreetToActiveProject() {
  const { project } = getActive();
  project.streets.push(createStreet());
  project.numberOfStreets = project.streets.length;
}
export function removeStreetFromActiveProject(sIdx: number) {
  const { project } = getActive();
  project.streets.splice(sIdx, 1);
  project.numberOfStreets = project.streets.length;
}

// Street
export function updateStreetField(sIdx: number, field: keyof Street, value: any) {
  const { street } = getStreet(sIdx);

  if (field === 'numberOfMainSegments') {
    const targetCount = Math.max(0, toNumberOrNull(value) ?? 0);
    const currentCount = street.mainSegments.length;

    if (targetCount > currentCount) {
      for (let i = 0; i < targetCount - currentCount; i++) {
        street.mainSegments.push(createMainSegment());
      }
    } else if (targetCount < currentCount) {
      street.mainSegments.length = targetCount;
    }
    street.numberOfMainSegments = targetCount;
  } else {
    (street as any)[field] = value;
  }
}

export function removeSegmentFromStreet(sIdx: number, mIdx: number) {
  const { street } = getStreet(sIdx);
  street.mainSegments.splice(mIdx, 1);
  street.numberOfMainSegments = street.mainSegments.length;
}

// Segment
export function updateSegmentField(sIdx: number, mIdx: number, field: keyof MainSegment, value: any) {
  const { segment } = getSegment(sIdx, mIdx);
  (segment as any)[field] = value;
}
export function addServiceToSegment(sIdx: number, mIdx: number) {
  const { street, segment } = getSegment(sIdx, mIdx);
  segment.services.push(createService(street.name));
  segment.numberOfServices = segment.services.length;
}
export function removeServiceFromSegment(sIdx: number, mIdx: number, vIdx: number) {
    const { segment } = getSegment(sIdx, mIdx);
    const serviceToRemove = segment.services[vIdx];

    if (!serviceToRemove) return;

    // Find children of the service being removed (for cascading delete)
    const childrenIds = segment.services
        .filter(s => s.parentServiceId === serviceToRemove.id)
        .map(s => s.id);

    const idsToRemove = new Set([serviceToRemove.id, ...childrenIds]);

    segment.services = segment.services.filter(s => !idsToRemove.has(s.id));
    segment.numberOfServices = segment.services.length;
}

// Service
export function updateServiceField(sIdx: number, mIdx: number, vIdx: number, field: keyof Service, value: any) {
  const { service } = getService(sIdx, mIdx, vIdx);
  (service as any)[field] = value;
}
export function addBranchServiceToSegment(sIdx: number, mIdx: number, vIdx: number) {
    const { segment, service: parentService } = getService(sIdx, mIdx, vIdx);
    const branchService = createService(parentService.streetName);
    branchService.parentServiceId = parentService.id;

    // Insert the new branch right after its parent for logical grouping
    const parentIndex = segment.services.findIndex(s => s.id === parentService.id);
    if (parentIndex > -1) {
        segment.services.splice(parentIndex + 1, 0, branchService);
    } else {
        segment.services.push(branchService); // Fallback
    }
    
    segment.numberOfServices = segment.services.length;
}
export function addMeterToService(sIdx: number, mIdx: number, vIdx: number) {
  const { service } = getService(sIdx, mIdx, vIdx);
  service.meters.push(createMeter());
  service.numberOfMeters = service.meters.length;
}
export function removeMeterFromService(sIdx: number, mIdx: number, vIdx: number, tIdx: number) {
  const { service } = getService(sIdx, mIdx, vIdx);
  service.meters.splice(tIdx, 1);
  service.numberOfMeters = service.meters.length;
}

// Meter
export function updateMeterField(sIdx: number, mIdx: number, vIdx: number, tIdx: number, field: keyof Meter, value: any) {
  const { meter } = getMeter(sIdx, mIdx, vIdx, tIdx);
  (meter as any)[field] = value;
}


// ---------- Totals ----------
export function calculateMeterAnnual(m: Meter, _annualHDD: number): number {
  return m.uddUsage || 0;
}
export function recalcProjectTotals(project: Project) {
  let replaced = 0;
  let usage = 0;
  project.streets.forEach(st =>
    st.mainSegments.forEach(seg => {
      replaced += toNumberOrNull(seg.lengthToBeReplaced) || 0;
      seg.services.forEach(svc => svc.meters.forEach(m => (usage += calculateMeterAnnual(m, project.annualHDD))));
    }),
  );
  project.totalReplacedLength = replaced;
  project.totalAnnualUsage = usage;
}