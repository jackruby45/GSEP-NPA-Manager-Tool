import type { Project, Street, MainSegment, Service, Meter } from './types.ts';
import { DIAMETER_REDUCTION_MAP } from './data/options.ts';

export function getReportTableHeaders(): string[] {
  return [
    'Project Name','Project Number','Revision Number','Revision Date','Project Start Date','Project End Date','Project Type','Town/City',
    'EJ Community','Eliminates District Regulator Station','Contributes to District Regulator Elimination','Comments regarding District Regulator Station',
    'Project Description','Street Name',
    'Main ID','Main From Location','Main To Location','Existing Diameter','Existing Material','Existing Length',
    'DIMP Risk','MAOP','Essential Status','Length To Be Replaced','New Diameter','New Material','Replacement Method','New MAOP',
    'Primary Purpose','Primary Purpose Other','Primary Purpose Explanation',
    'Secondary Purpose','Secondary Purpose Other','Secondary Purpose Explanation',
    'Diameter Reduction for Cost',
    'CISBOT - Not Used Reasons',
    'Internal Relining - Not Used Reasons',
    'Targeted Keyhole Repair - Not Used Reasons',
    'Targeted SEI Repair - Not Used Reasons',
    'Service Address','Service ID', 'Parent Service ID', 'Existing Service Diameter','Existing Service Material','Existing Service Length',
    'Replacement Service Diameter', 'Replacement Service Material', 'Replacement Service Length', 'Replacement Service Method',
    'Work Type','Structure Type','Structure Type Other',
    'Meter Number','Customer Account Number','Unit Identifier','Annual Usage (therms/yr)','Base Usage (therms/mo)'
  ];
}

function buildRow(project: Project, street: Street, segment?: MainSegment, service?: Service, meter?: Meter): any[] {
  const serviceAddress = `${service?.streetNumber || ''} ${service?.streetName || ''}`.trim();
  const diameterReductionText = segment?.diameterReduction ? (DIAMETER_REDUCTION_MAP[segment.diameterReduction] || segment.diameterReduction) : '';
  const advancedEval = street?.advancedLeakDetectionEvaluation;
  const cisbotReasons = advancedEval?.cisbotNotUsedReasons.join('; ') || '';
  const reliningReasons = advancedEval?.reliningNotUsedReasons.join('; ') || '';
  const keyholeReasons = advancedEval?.keyholeNotUsedReasons.join('; ') || '';
  const seiReasons = advancedEval?.seiNotUsedReasons.join('; ') || '';

  return [
    project.projectName, project.projectNumber, project.revisionNumber, project.revisionDate, project.projectStartDate, project.projectEndDate, project.projectType, project.townCity,
    project.isEJCommunity == null ? '' : project.isEJCommunity ? 'Yes' : 'No',
    project.eliminatesRegulatorStation == null ? '' : project.eliminatesRegulatorStation ? 'Yes' : 'No',
    project.contributesToRegulatorStationElimination == null ? '' : project.contributesToRegulatorStationElimination ? 'Yes' : 'No',
    project.regulatorStationComments,
    project.projectDescription,
    street.name,
    segment?.mainId, segment?.fromLocation, segment?.toLocation, segment?.diameter, segment?.material, segment?.length,
    segment?.dimpRiskScore, segment?.maop, segment?.essentialStatus, segment?.lengthToBeReplaced,
    segment?.replacementPipeDiameter, segment?.replacementPipeMaterial, segment?.replacementPipeMethod, segment?.replacementPipeMaop,
    segment?.primaryPurpose, segment?.primaryPurposeOtherReason, segment?.primaryPurposeExplanation,
    segment?.secondaryPurpose, segment?.secondaryPurposeOtherReason, segment?.secondaryPurposeExplanation,
    diameterReductionText,
    cisbotReasons,
    reliningReasons,
    keyholeReasons,
    seiReasons,
    serviceAddress, service?.serviceId, service?.parentServiceId, service?.diameter, service?.material, service?.length,
    service?.replacementDiameter, service?.replacementMaterial, service?.replacementLength, service?.replacementMethod,
    service?.workType, service?.structureType, service?.structureTypeOther,
    meter?.meterNumber, meter?.customerAccountNumber, meter?.unitIdentifier, meter?.uddUsage, meter?.baseUsage
  ];
}

export function flattenProject(project: Project): any[][] {
  const rows: any[][] = [];
  if (project.streets.length === 0) {
    // To ensure the project itself is represented even if empty
    rows.push(buildRow(project, { id: -1, name: 'N/A', mainSegments: [], numberOfMainSegments: 0 }));
  } else {
    project.streets.forEach(street => {
      if (street.mainSegments.length === 0) {
        rows.push(buildRow(project, street));
      } else {
        street.mainSegments.forEach(seg => {
          if (seg.services.length === 0) {
            rows.push(buildRow(project, street, seg));
          } else {
            seg.services.forEach(svc => {
              if (svc.meters.length === 0) {
                rows.push(buildRow(project, street, seg, svc));
              } else {
                svc.meters.forEach(m => rows.push(buildRow(project, street, seg, svc, m)));
              }
            });
          }
        });
      }
    });
  }
  return rows;
}

function csvEscape(value: any): string {
  if (value === null || value === undefined) return '';
  let s = String(value);
  if (/[",\r\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function generateReportCSV(project: Project): string {
  const headers = getReportTableHeaders();
  const rows = flattenProject(project);
  const headerRow = headers.map(csvEscape).join(',');
  const dataRows = rows.map(r => r.map(csvEscape).join(','));
  return [headerRow, ...dataRows].join('\n');
}

function renderServiceHTML(svc: Service, index: number, isBranch = false): string {
    const f = (label: string, value: any, full = false) => `
        <div class="report-field ${full ? 'report-value-full' : ''}">
            <div class="report-label">${label}</div>
            <div class="report-value">${value ?? 'N/A'}</div>
        </div>`;
    
    let serviceHtml = '';
    const title = isBranch ? `Branch Service #${index + 1}` : `Service #${index + 1}: ${svc.streetNumber} ${svc.streetName}`;
    const wrapperStyle = isBranch ? 'padding-left: 1rem; margin-top: 1rem; border-left: 2px solid #ccc;' : 'padding-left: 1rem; margin-top: 1rem;';

    serviceHtml += `<div style="${wrapperStyle}">`;
    serviceHtml += `<h6>${title}</h6>`;
    serviceHtml += '<div class="report-grid">';
    serviceHtml += f('Service ID', svc.serviceId);
    serviceHtml += f('Work Type', svc.workType);
    const st = svc.structureType === 'Other user defined' ? `${svc.structureType} (${svc.structureTypeOther})` : svc.structureType;
    serviceHtml += f('Structure Type', st);
    serviceHtml += f('Existing Diameter', svc.diameter == null ? 'N/A' : `${svc.diameter}"`);
    serviceHtml += f('Existing Material', svc.material);
    serviceHtml += f('Existing Length (ft)', svc.length);
    if (svc.workType === 'Full Replacement' || svc.workType === 'Partial Replacement') {
        serviceHtml += f('Replacement Diameter', svc.replacementDiameter == null ? 'N/A' : `${svc.replacementDiameter}"`);
        serviceHtml += f('Replacement Material', svc.replacementMaterial);
        serviceHtml += f('Replacement Length (ft)', svc.replacementLength);
    }
    if (svc.workType === 'Full Replacement' || svc.workType === 'Abandonment Only') {
        serviceHtml += f('Replacement Method', svc.replacementMethod);
    }
    serviceHtml += f('Has Branch Services', svc.isBranchService ? 'Yes' : 'No');
    serviceHtml += '</div>';

    if (svc.meters.length) {
        svc.meters.forEach((m, j) => {
            serviceHtml += `<div class="report-grid" style="padding-left: 1rem; margin-top: .5rem; border-top: 1px solid #eee;">`;
            serviceHtml += `<strong style="grid-column: 1 / -1; margin-top: .5rem;">Meter #${j + 1}</strong>`;
            serviceHtml += f('Meter Number', m.meterNumber);
            serviceHtml += f('Customer Account Number', m.customerAccountNumber);
            serviceHtml += f('Unit Identifier', m.unitIdentifier);
            serviceHtml += f('Annual Usage (therms/yr)', m.uddUsage);
            serviceHtml += f('Base Usage (therms/mo)', m.baseUsage);
            serviceHtml += '</div>';
        });
    }
    serviceHtml += `</div>`;
    return serviceHtml;
}


export function renderReportSummaryHTML(project: Project): string {
  const f = (label: string, value: any, full = false) => `
    <div class="report-field ${full ? 'report-value-full' : ''}">
      <div class="report-label">${label}</div>
      <div class="report-value">${value ?? 'N/A'}</div>
    </div>`;

  let html = '';
  html += '<div class="report-section">';
  html += `<h3>Project: ${project.projectName || 'Untitled Project'}</h3>`;
  html += '<div class="report-grid">';
  html += f('Project Number', project.projectNumber);
  html += f('Project Type', project.projectType);
  html += f('Revision Number', project.revisionNumber);
  html += f('Revision Date', project.revisionDate);
  html += f('Start Date', project.projectStartDate);
  html += f('End Date', project.projectEndDate);
  html += f('Estimated Cost ($)', project.projectCost?.toLocaleString());
  html += f('Town/City', project.townCity);
  html += f('EJ Community', project.isEJCommunity == null ? 'N/A' : project.isEJCommunity ? 'Yes' : 'No');
  html += f('Eliminates District Regulator Station', project.eliminatesRegulatorStation == null ? 'N/A' : project.eliminatesRegulatorStation ? 'Yes' : 'No');
  html += f('Contributes to District Regulator Elimination', project.contributesToRegulatorStationElimination == null ? 'N/A' :
    project.contributesToRegulatorStationElimination ? 'Yes' : 'No');
  html += '</div>';
  html += f('Description', project.projectDescription, true);
  html += f('EJ Information', project.ejInformation, true);
  html += f('EJ Summary', project.ejSummary, true);
  html += f('Comments regarding District Regulator Station', project.regulatorStationComments, true);
  html += '</div>';

  html += '<div class="report-section">';
  html += `<h3>Project Totals & Assumptions</h3>`;
  html += '<div class="report-grid">';
  html += f('Total Abandoned Main Length (ft)', project.totalAbandonedLength?.toLocaleString());
  html += f('Total Replaced Main Length (ft)', project.totalReplacedLength?.toLocaleString());
  html += f('Total Annual Usage (therms)', project.totalAnnualUsage?.toLocaleString());
  html += f('Annual HDD', project.annualHDD);
  html += f('Annual HDD Basis', project.annualHDDBasis);
  html += '</div></div>';

  // Detailed per-street segments
  project.streets.forEach((street, sIdx) => {
    html += `<div class="report-section"><h3>Street #${sIdx + 1}: ${street.name || 'Unnamed Street'}</h3>`;

    if (street.advancedLeakDetectionEvaluation &&
        (street.advancedLeakDetectionEvaluation.cisbotNotUsedReasons.length > 0 ||
         street.advancedLeakDetectionEvaluation.reliningNotUsedReasons.length > 0 ||
         street.advancedLeakDetectionEvaluation.keyholeNotUsedReasons.length > 0 ||
         street.advancedLeakDetectionEvaluation.seiNotUsedReasons.length > 0)) {
      html += '<h5>Advanced Leak Detection Evaluation (Reasons for Non-Use)</h5>';
      const renderReasons = (title, reasons) => {
          if (reasons && reasons.length > 0) {
              return `<h6>${title}</h6><ul>${reasons.map(r => `<li>${r}</li>`).join('')}</ul>`;
          }
          return '';
      };
      html += renderReasons('CISBOT', street.advancedLeakDetectionEvaluation.cisbotNotUsedReasons);
      html += renderReasons('Internal Relining / Sleeving', street.advancedLeakDetectionEvaluation.reliningNotUsedReasons);
      html += renderReasons('Targeted Keyhole Leak Repair', street.advancedLeakDetectionEvaluation.keyholeNotUsedReasons);
      html += renderReasons('Targeted SEI Leak Repair', street.advancedLeakDetectionEvaluation.seiNotUsedReasons);
    }
      
    street.mainSegments.forEach((seg, mIdx) => {
      html += `<div style="padding-left: 1rem; border-left: 3px solid #eee; margin-top: 1rem;">`;
      html += `<h4>Main Segment #${mIdx + 1}</h4>`;
      html += '<h5>Existing Main Details</h5><div class="report-grid">';
      html += f('Main ID', seg.mainId);
      html += f('From', seg.fromLocation);
      html += f('To', seg.toLocation);
      html += f('Diameter', seg.diameter == null ? 'N/A' : `${seg.diameter}"`);
      html += f('Material', seg.material);
      html += f('Length (ft)', seg.length);
      html += f('MAOP', seg.maop);
      html += f('DIMP Risk Score', seg.dimpRiskScore);
      html += f('Essential Status', seg.essentialStatus);
      html += '</div>';

      html += '<h5>Replacement Main Details</h5><div class="report-grid">';
      html += f('Length to be Replaced (ft)', seg.lengthToBeReplaced);
      html += f('New Diameter', seg.replacementPipeDiameter == null ? 'N/A' : `${seg.replacementPipeDiameter}"`);
      html += f('New Material', seg.replacementPipeMaterial);
      html += f('New MAOP', seg.replacementPipeMaop);
      html += f('Replacement Method', seg.replacementPipeMethod);
      if (seg.diameterReduction && DIAMETER_REDUCTION_MAP[seg.diameterReduction]) {
          html += f('Diameter Reduction', DIAMETER_REDUCTION_MAP[seg.diameterReduction]);
      }
      html += '</div>';

      html += '<h5>Purpose</h5>';
      const pOther = seg.primaryPurpose === 'Other (please specify)' ? ` (${seg.primaryPurposeOtherReason})` : '';
      const sOther = seg.secondaryPurpose === 'Other (please specify)' ? ` (${seg.secondaryPurposeOtherReason})` : '';
      html += f('Primary Purpose', `${seg.primaryPurpose}${pOther}`, true);
      html += f('Primary Purpose Explanation', seg.primaryPurposeExplanation, true);
      html += f('Secondary Purpose', `${seg.secondaryPurpose}${sOther}`, true);
      html += f('Secondary Purpose Explanation', seg.secondaryPurposeExplanation, true);

      if (seg.services.length) {
          html += '<h5>Services</h5>';
          const serviceTree = new Map<number, Service[]>();
          const topLevelServices: Service[] = [];

          seg.services.forEach(s => {
              if (s.parentServiceId) {
                  if (!serviceTree.has(s.parentServiceId)) {
                      serviceTree.set(s.parentServiceId, []);
                  }
                  serviceTree.get(s.parentServiceId)!.push(s);
              } else {
                  topLevelServices.push(s);
              }
          });

          topLevelServices.forEach((svc, i) => {
              html += renderServiceHTML(svc, i);
              const branches = serviceTree.get(svc.id) || [];
              branches.forEach((branch, j) => {
                  html += renderServiceHTML(branch, j, true);
              });
          });
      }
      html += '</div>';
    });
    html += '</div>';
  });

  return html;
}

export function renderReportTableHTML(project: Project): string {
  const headers = getReportTableHeaders();
  const rows = flattenProject(project);
  if (!rows.length) return '<p>No data available to display in table view for this project.</p>';

  const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>`;

  return `
    <div class="report-table-wrapper">
      <table class="report-table">
        ${thead}
        ${tbody}
      </table>
    </div>
  `;
}