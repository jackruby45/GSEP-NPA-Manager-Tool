import { TOWNS, PIPE_DIAMETERS, PIPE_MATERIALS, REPLACEMENT_PIPE_DIAMETERS, REPLACEMENT_PIPE_MATERIALS, REPLACEMENT_PIPE_METHODS, MAOP_OPTIONS, PRIMARY_PURPOSE_OPTIONS, SERVICE_WORK_TYPES, STRUCTURE_TYPES, SERVICE_PIPE_DIAMETERS } from './options.ts';

export function generateRelationalSchemas() {
  const appGenerated = 'A unique ID for this record, generated automatically by the app (Primary Key).';

  const project = {
    title: 'Table 1: Projects',
    description: 'Top-level table. One row per project.',
    fields: {
      id: { type: 'number', description: appGenerated, isKey: true },
      projectNumber: { type: 'number', description: 'Official project number.' },
      projectName: { type: 'string', description: 'Project name/identifier.' },
      projectType: { type: 'string', description: 'Type of the project.', example: 'GSEP (Gas System Enhancement Plan)' },
      revisionNumber: { type: 'string', description: 'Project revision number.' },
      revisionDate: { type: 'string', description: 'Date of the revision (YYYY-MM-DD).' },
      projectDescription: { type: 'string', description: 'General scope description.' },
      projectStartDate: { type: 'string', description: 'Estimated start date.', example: '2025-04-01' },
      projectEndDate: { type: 'string', description: 'Estimated end date.', example: '2025-10-31' },
      projectCost: { type: 'number', description: 'Fully-loaded estimated cost ($).' },
      townCity: { type: 'string', description: 'Town/City.', options: TOWNS },
      isEJCommunity: { type: 'boolean', description: 'True if in an EJ community.' },
      ejInformation: { type: 'string', description: 'Raw EJ text pasted from source.' },
      eliminatesRegulatorStation: { type: 'boolean', description: 'True if project eliminates a District Regulator Station (DRS).' },
      contributesToRegulatorStationElimination: { type: 'boolean', description: 'True if project contributes to a future District Regulator Station (DRS) elimination.' },
      regulatorStationComments: { type: 'string', description: 'Comments regarding the District Regulator Station.' },
      numberOfStreets: { type: 'number', description: 'Count of streets in this project.' },
      streets: { type: 'array of objects', description: `Linked rows are in 'Streets'.` },
    },
  };

  const street = {
    title: 'Table 2: Streets',
    description: 'One row per street within a project.',
    fields: {
      id: { type: 'number', description: appGenerated, isKey: true },
      project_id: { type: 'number', description: 'Foreign Key -> Projects.id', isKey: true },
      name: { type: 'string', description: 'Street name.' },
      numberOfMainSegments: { type: 'number', description: 'Number of main segments.' },
      advancedLeakDetectionEvaluation: { type: 'object', description: 'Contains arrays of reasons why advanced leak detection/repair methods were not used for this street.' },
      mainSegments: { type: 'array of objects', description: `Linked rows are in 'Main Segments'.` },
    },
  };

  const mainSeg = {
    title: 'Table 3: Main Segments',
    description: 'One row per main pipe segment.',
    fields: {
      id: { type: 'number', description: appGenerated, isKey: true },
      street_id: { type: 'number', description: 'Foreign Key -> Streets.id', isKey: true },
      diameter: { type: 'number', description: 'Existing main diameter (in).', options: PIPE_DIAMETERS },
      material: { type: 'string', description: 'Existing main material.', options: PIPE_MATERIALS },
      length: { type: 'number', description: 'Existing main length (ft).' },
      mainId: { type: 'string', description: 'Existing main ID.' },
      dimpRiskScore: { type: 'number', description: 'DIMP risk score.' },
      maop: { type: 'string', description: 'MAOP of existing main.', options: MAOP_OPTIONS },
      essentialStatus: { type: 'string', description: 'Essential or non-essential.', options: ['essential', 'nonEssential'] },
      lengthToBeReplaced: { type: 'number', description: 'Length to be replaced (ft).' },
      replacementPipeDiameter: { type: 'number', description: 'New pipe diameter (in).', options: REPLACEMENT_PIPE_DIAMETERS },
      replacementPipeMaterial: { type: 'string', description: 'New pipe material.', options: REPLACEMENT_PIPE_MATERIALS },
      replacementPipeMethod: { type: 'string', description: 'Replacement method.', options: REPLACEMENT_PIPE_METHODS },
      replacementPipeMaop: { type: 'string', description: 'New pipe MAOP.', options: MAOP_OPTIONS },
      numberOfServices: { type: 'number', description: 'Number of services on this segment.' },
      primaryPurpose: { type: 'string', description: 'Primary reason.', options: PRIMARY_PURPOSE_OPTIONS },
      primaryPurposeExplanation: { type: 'string', description: 'Explanation of primary purpose.' },
      secondaryPurpose: { type: 'string', description: 'Secondary reason.', options: PRIMARY_PURPOSE_OPTIONS },
      secondaryPurposeExplanation: { type: 'string', description: 'Explanation of secondary purpose.' },
      diameterReduction: { type: 'string', description: 'Reduction in main diameter to reduce standard costs.', options: ['8_to_6', '8_to_4', '8_to_2', '6_to_4', '6_to_2', '4_to_2', ''] },
      services: { type: 'array of objects', description: `Linked rows are in 'Services'.` },
    },
  };

  const svc = {
    title: 'Table 4: Services',
    description: 'One row per service line.',
    fields: {
      id: { type: 'number', description: appGenerated, isKey: true },
      main_segment_id: { type: 'number', description: 'Foreign Key -> MainSegments.id', isKey: true },
      parentServiceId: { type: 'number', description: 'Foreign Key -> Services.id. If populated, this service is a branch of the parent service.' },
      streetName: { type: 'string', description: 'Street name for service location.' },
      streetNumber: { type: 'string', description: 'Street number for service location.' },
      serviceId: { type: 'string', description: 'Service line ID.' },
      diameter: { type: 'number', description: 'Existing service diameter (in).', options: SERVICE_PIPE_DIAMETERS },
      material: { type: 'string', description: 'Existing service material.', options: PIPE_MATERIALS },
      length: { type: 'number', description: 'Existing service length (ft).' },
      replacementDiameter: { type: 'number', description: 'Replacement service diameter (in).', options: SERVICE_PIPE_DIAMETERS },
      replacementMaterial: { type: 'string', description: 'Replacement service material.', options: REPLACEMENT_PIPE_MATERIALS },
      replacementLength: { type: 'number', description: 'Replacement service length (ft).' },
      replacementMethod: { type: 'string', description: 'Method of replacement or abandonment.', options: REPLACEMENT_PIPE_METHODS },
      isBranchService: { type: 'boolean', description: 'True if this service has one or more branch services coming off of it.' },
      workType: { type: 'string', description: 'Work type.', options: SERVICE_WORK_TYPES },
      structureType: { type: 'string', description: 'Structure type.', options: [...STRUCTURE_TYPES.flatMap(g => g.options), 'Other user defined'] },
      structureTypeOther: { type: 'string', description: 'If Other, specify.' },
      numberOfMeters: { type: 'number', description: 'Number of meters on this service.' },
      meters: { type: 'array of objects', description: `Linked rows are in 'Meters'.` },
    },
  };

  const meter = {
    title: 'Table 5: Meters',
    description: 'One row per meter.',
    fields: {
      id: { type: 'number', description: appGenerated, isKey: true },
      service_id: { type: 'number', description: 'Foreign Key -> Services.id', isKey: true },
      meterNumber: { type: 'string', description: 'Meter number.' },
      customerAccountNumber: { type: 'string', description: 'Customer account number.' },
      unitIdentifier: { type: 'string', description: 'Unit (e.g., Apt 2).' },
      uddUsage: { type: 'number', description: 'Annual usage (therms/yr).' },
      baseUsage: { type: 'number', description: 'Base usage (therms/mo).' },
    },
  };

  return [project, street, mainSeg, svc, meter];
}

export function generateCsvTemplate(schemaName: string): string | null {
  const schemas = generateRelationalSchemas();
  const schema = schemas.find(s => s.title === schemaName);
  if (!schema) return null;
  const headers = Object.keys(schema.fields)
    .filter(k => schema.fields[k].type !== 'array of objects')
    .map(k => `"${k}"`)
    .join(',');
  return headers;
}

export function generateSchemasHTML(): string {
  const schemas = generateRelationalSchemas();
  const table = (schema: any) => {
    const rows = Object.entries(schema.fields).map(([key, meta]: [string, any]) => {
      const type = meta.type;
      const desc = meta.description || '';
      const opts = meta.options ? `<div class="json-value"><code>${JSON.stringify(meta.options)}</code></div>` : '';
      const eg = meta.example ? `<div class="json-value"><code>${JSON.stringify(meta.example)}</code></div>` : '';
      return `
        <tr>
          <td><strong>${key}</strong>${meta.isKey ? ' <em>(Key)</em>' : ''}</td>
          <td>${type}</td>
          <td>${desc}</td>
          <td>${opts || eg || ''}</td>
        </tr>
      `;
    }).join('');
    return `
      <h3>${schema.title}</h3>
      <p>${schema.description}</p>
      <table class="relational-schema-table">
        <thead>
          <tr><th>Field</th><th>Type</th><th>Description</th><th>Options/Example</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  };

  return schemas.map(table).join('\n');
}