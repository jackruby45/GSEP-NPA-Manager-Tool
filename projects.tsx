import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { InputField, SelectField, TextareaField, RadioGroup, TownStreetInput, LocationEditor } from '../components/forms.tsx';
import { TOWNS, REPLACEMENT_PIPE_MATERIALS, REPLACEMENT_PIPE_METHODS, MAOP_OPTIONS, PRIMARY_PURPOSE_OPTIONS, PIPE_DIAMETERS, PIPE_MATERIALS, REPLACEMENT_PIPE_DIAMETERS, SERVICE_WORK_TYPES, STRUCTURE_TYPES, STREETS_BY_TOWN, SERVICE_PIPE_DIAMETERS, DIAMETER_REDUCTION_MAP, ADVANCED_LEAK_DETECTION_OPTIONS } from '../data/options.ts';
import type { Project, Street, MainSegment, Service, Meter } from '../types.ts';

const MeterEditor = ({ meter, sIdx, mIdx, vIdx, tIdx, handlers, isNew = false }) => {
    const [isCollapsed, setIsCollapsed] = useState(!isNew);
    const u = (field, value) => handlers.updateMeter(sIdx, mIdx, vIdx, tIdx, field, value);
    
    const title = `Meter${meter.meterNumber ? ` #${meter.meterNumber}` : meter.unitIdentifier ? ` (${meter.unitIdentifier})` : ` #${tIdx + 1}`}`;

    return html`
        <div class="meter-input-group collapsible-group ${isCollapsed ? 'collapsed' : ''}">
            <div class="group-title-actions collapsible-header" onClick=${() => setIsCollapsed(!isCollapsed)}>
                <div class="collapsible-title-wrapper">
                    <button type="button" class="collapse-toggle" aria-expanded=${!isCollapsed}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>
                    </button>
                    <h4 class="group-title">${title}</h4>
                </div>
                <button class="button button-danger button-xs" onClick=${(e) => { e.stopPropagation(); handlers.removeMeter(sIdx, mIdx, vIdx, tIdx); }}>Remove Meter</button>
            </div>
            ${!isCollapsed && html`
                <div class="collapsible-content">
                    <div class="form-grid">
                        <${InputField} label="Meter #" value=${meter.meterNumber} onInput=${v => u('meterNumber', v)} />
                        <${InputField} label="Customer Account Number" value=${meter.customerAccountNumber} onInput=${v => u('customerAccountNumber', v)} />
                        <${InputField} label="Unit Identifier" value=${meter.unitIdentifier} onInput=${v => u('unitIdentifier', v)} />
                        <${InputField} label="Annual Usage (therms/yr)" type="number" value=${meter.uddUsage} onInput=${v => u('uddUsage', v)} />
                        <${InputField} label="Base Usage (therms/mo)" type="number" value=${meter.baseUsage} onInput=${v => u('baseUsage', v)} />
                    </div>
                </div>
            `}
        </div>
    `;
}

const ServiceEditor = ({ service, sIdx, mIdx, vIdx, handlers, project, isBranch }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isAddingMeter, setIsAddingMeter] = useState(false);

    const u = (field, value) => handlers.updateService(sIdx, mIdx, vIdx, field, value);
    const structureTypeOptions = [...STRUCTURE_TYPES.flatMap(g => g.options), 'Other user defined'];
    const projectStreetNames = project.streets.map(s => s.name).filter(Boolean);

    useEffect(() => {
        if (isAddingMeter) {
            setIsAddingMeter(false);
        }
    }, [isAddingMeter]);

    const handleAddMeter = () => {
        setIsAddingMeter(true);
        handlers.addMeter(sIdx, mIdx, vIdx);
    };

    const handleIsBranchChange = (value) => {
        const wantsBranch = value === 'true';
        // Only trigger add when switching from false to true
        if (wantsBranch && !service.isBranchService) {
            handlers.addBranchService(sIdx, mIdx, vIdx);
        }
        // Always update the parent's flag
        u('isBranchService', wantsBranch);
    };
    
    const newMeterIndex = isAddingMeter ? service.meters.length : -1;


    return html`
        <div class="service-input-group collapsible-group ${isCollapsed ? 'collapsed' : ''}" style=${isBranch ? { marginLeft: '2rem', borderLeftColor: '#6c757d' } : {}}>
             <div class="group-title-actions collapsible-header" onClick=${() => setIsCollapsed(!isCollapsed)}>
                <div class="collapsible-title-wrapper">
                    <button type="button" class="collapse-toggle" aria-expanded=${!isCollapsed}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>
                    </button>
                    <h4 class="group-title">${isBranch ? 'Branch Service' : `Service on ${service.streetNumber} ${service.streetName}`}</h4>
                </div>
                <button class="button button-danger button-xs" onClick=${(e) => { e.stopPropagation(); handlers.removeService(sIdx, mIdx, vIdx); }}>Remove Service</button>
            </div>
            ${!isCollapsed && html`
                <div class="collapsible-content">
                    <div class="form-grid">
                        <${InputField} label="Street #" value=${service.streetNumber} onInput=${v => u('streetNumber', v)} />
                        <${TownStreetInput}
                            label="Street Name"
                            id=${`service-street-name-${service.id}`}
                            value=${service.streetName}
                            onInput=${v => u('streetName', v)}
                            townCity=${project.townCity}
                            projectStreetNames=${projectStreetNames}
                        />
                        <${InputField} label="Service ID" value=${service.serviceId} onInput=${v => u('serviceId', v)} />
                        <${SelectField} label="Existing Diameter (in)" value=${service.diameter} onChange=${v => u('diameter', Number(v))} options=${SERVICE_PIPE_DIAMETERS} placeholder="Select..." />
                        <${SelectField} label="Existing Material" value=${service.material} onChange=${v => u('material', v)} options=${PIPE_MATERIALS} placeholder="Select..." />
                        <${InputField} label="Existing Length (ft)" type="number" value=${service.length} onInput=${v => u('length', v)} />
                        <${SelectField} label="Work Type" value=${service.workType} onChange=${v => u('workType', v)} options=${SERVICE_WORK_TYPES} placeholder="Select..." />
                        
                        ${(service.workType === 'Full Replacement' || service.workType === 'Partial Replacement') && html`
                            <${SelectField} label="Replacement Diameter (in)" value=${service.replacementDiameter} onChange=${v => u('replacementDiameter', Number(v))} options=${SERVICE_PIPE_DIAMETERS} placeholder="Select..." />
                            <${SelectField} label="Replacement Material" value=${service.replacementMaterial} onChange=${v => u('replacementMaterial', v)} options=${REPLACEMENT_PIPE_MATERIALS} placeholder="Select..." />
                            <${InputField} label="Replacement Length (ft)" type="number" value=${service.replacementLength} onInput=${v => u('replacementLength', v)} />
                            ${service.workType === 'Full Replacement' && html`
                                <${SelectField} label="Replacement Method" value=${service.replacementMethod} onChange=${v => u('replacementMethod', v)} options=${REPLACEMENT_PIPE_METHODS} placeholder="Select..." />
                            `}
                        `}
                        ${service.workType === 'Abandonment Only' && html`
                            <${SelectField} label="Replacement Method" value=${service.replacementMethod} onChange=${v => u('replacementMethod', v)} options=${REPLACEMENT_PIPE_METHODS} placeholder="Select..." />
                        `}

                        <${SelectField} label="Structure Type" value=${service.structureType} onChange=${v => u('structureType', v)} options=${structureTypeOptions} placeholder="Select..." />
                        ${service.structureType === 'Other user defined' && html`
                            <${InputField} label="Structure Type (Other)" value=${service.structureTypeOther} onInput=${v => u('structureTypeOther', v)} />
                        `}

                        ${!isBranch && html`
                            <${SelectField} 
                                label="Has Branch Service?" 
                                value=${service.isBranchService ? 'true' : 'false'} 
                                onChange=${handleIsBranchChange} 
                                options=${[{label:'No', value:'false'}, {label:'Yes', value:'true'}]} 
                            />
                        `}
                    </div>
                    ${service.meters.map((meter, tIdx) => html`
                        <${MeterEditor} key=${meter.id} meter=${meter} sIdx=${sIdx} mIdx=${mIdx} vIdx=${vIdx} tIdx=${tIdx} handlers=${handlers} isNew=${tIdx === newMeterIndex} />
                    `)}
                    <div class="button-group">
                        <button class="button button-secondary button-sm" onClick=${handleAddMeter}>Add Meter</button>
                    </div>
                </div>
            `}
        </div>
    `;
}

const CheckboxGroup = ({ title, options, selectedOptions, onToggle }) => {
    return html`
        <div class="checkbox-group-container">
            <h6 class="checkbox-group-title">${title}</h6>
            <div class="checkbox-group-list">
                ${options.map(option => html`
                    <label class="checkbox-label" key=${option}>
                        <input
                            type="checkbox"
                            checked=${selectedOptions.includes(option)}
                            onChange=${() => onToggle(option)}
                        />
                        <span>${option}</span>
                    </label>
                `)}
            </div>
        </div>
    `;
};

const AdvancedLeakDetectionEditor = ({ dataSource, onUpdate }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const data = dataSource.advancedLeakDetectionEvaluation || {
        cisbotNotUsedReasons: [],
        reliningNotUsedReasons: [],
        keyholeNotUsedReasons: [],
        seiNotUsedReasons: [],
    };

    const handleToggle = (groupKey, reason) => {
        const currentReasons = data[groupKey] || [];
        const newReasons = currentReasons.includes(reason)
            ? currentReasons.filter(r => r !== reason)
            : [...currentReasons, reason];
        
        onUpdate({
            ...data,
            [groupKey]: newReasons,
        });
    };

    return html`
        <div class="collapsible-group ${isCollapsed ? 'collapsed' : ''}" style=${{marginTop: '1.5rem', border: 'none', background: 'transparent', padding: 0}}>
            <div class="group-title-actions collapsible-header" onClick=${() => setIsCollapsed(!isCollapsed)} style=${{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: isCollapsed ? 0 : '1rem' }}>
                <div class="collapsible-title-wrapper">
                    <button type="button" class="collapse-toggle" aria-expanded=${!isCollapsed}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>
                    </button>
                    <h5 class="sub-header" style=${{ margin: 0, padding: 0, border: 'none' }}>Advanced leak detection evaluation</h5>
                </div>
            </div>
            ${!isCollapsed && html`
                <div class="collapsible-content" style=${{paddingTop: '0'}}>
                    <div class="advanced-leak-detection-container">
                        ${Object.entries(ADVANCED_LEAK_DETECTION_OPTIONS).map(([key, value]) => {
                            const dataKey = `${key}NotUsedReasons`;
                            return html`
                                <${CheckboxGroup}
                                    key=${key}
                                    title=${value.label}
                                    options=${value.reasons}
                                    selectedOptions=${data[dataKey] || []}
                                    onToggle=${(reason) => handleToggle(dataKey, reason)}
                                />
                            `;
                        })}
                    </div>
                </div>
            `}
        </div>
    `;
};

const SegmentEditor = ({ segment, sIdx, mIdx, handlers, project, currentStreetName }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const u = (field, value) => handlers.updateSegment(sIdx, mIdx, field, value);
    const townCity = project.townCity;
    const projectStreetNames = project.streets.map(s => s.name).filter(Boolean);
    
    return html`
        <div class="segment-input-group collapsible-group ${isCollapsed ? 'collapsed' : ''}">
            <div class="group-title-actions collapsible-header" onClick=${() => setIsCollapsed(!isCollapsed)}>
                <div class="collapsible-title-wrapper">
                     <button type="button" class="collapse-toggle" aria-expanded=${!isCollapsed}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>
                    </button>
                    <h4 class="group-title">${currentStreetName ? `${currentStreetName} - ` : ''}Main Segment ${mIdx + 1}</h4>
                </div>
                <button class="button button-danger button-xs" onClick=${(e) => { e.stopPropagation(); handlers.removeSegment(sIdx, mIdx); }}>Remove Segment</button>
            </div>

            ${!isCollapsed && html`
                <div class="collapsible-content">
                    <div class="form-grid">
                        <div class="form-grid-full"><h5 class="sub-header">Existing Main Details</h5></div>
                        <${LocationEditor}
                            label="From Location"
                            idPrefix=${`segment-${segment.id}-from`}
                            value=${segment.fromLocation}
                            onInput=${v => u('fromLocation', v)}
                            townCity=${townCity}
                            projectStreetNames=${projectStreetNames}
                            parentStreetName=${currentStreetName}
                        />
                        <${LocationEditor}
                            label="To Location"
                            idPrefix=${`segment-${segment.id}-to`}
                            value=${segment.toLocation}
                            onInput=${v => u('toLocation', v)}
                            townCity=${townCity}
                            projectStreetNames=${projectStreetNames}
                            parentStreetName=${currentStreetName}
                        />
                        <${SelectField} label="Diameter (in)" value=${segment.diameter} onChange=${v => u('diameter', Number(v))} options=${PIPE_DIAMETERS} placeholder="Select..." />
                        <${SelectField} label="Material" value=${segment.material} onChange=${v => u('material', v)} options=${PIPE_MATERIALS} placeholder="Select..." />
                        <${InputField} label="Length (ft)" type="number" value=${segment.length} onInput=${v => u('length', v)} />
                        <${InputField} label="Main ID" value=${segment.mainId} onInput=${v => u('mainId', v)} />
                        <${InputField} label="DIMP Risk Score" type="number" value=${segment.dimpRiskScore} onInput=${v => u('dimpRiskScore', v)} />
                        <${SelectField} label="MAOP" value=${segment.maop} onChange=${v => u('maop', v)} options=${MAOP_OPTIONS} placeholder="Select MAOP..." />
                        <${SelectField}
                            label="Status"
                            value=${segment.essentialStatus}
                            onChange=${v => u('essentialStatus', v)}
                            options=${[{label: 'Essential', value: 'essential'}, {label: 'Non-Essential', value: 'nonEssential'}]}
                            placeholder="Select..."
                        />

                        <div class="form-grid-full"><h5 class="sub-header">Replacement Main Details</h5></div>
                        <${InputField} label="Length to be Replaced (ft)" type="number" value=${segment.lengthToBeReplaced} onInput=${v => u('lengthToBeReplaced', v)} />
                        <${SelectField} label="New Diameter (in)" value=${segment.replacementPipeDiameter} onChange=${v => u('replacementPipeDiameter', Number(v))} options=${REPLACEMENT_PIPE_DIAMETERS} placeholder="Select..." />
                        <${SelectField} label="New Material" value=${segment.replacementPipeMaterial} onChange=${v => u('replacementPipeMaterial', v)} options=${REPLACEMENT_PIPE_MATERIALS} placeholder="Select..." />
                        <${SelectField} label="Replacement Method" value=${segment.replacementPipeMethod} onChange=${v => u('replacementPipeMethod', v)} options=${REPLACEMENT_PIPE_METHODS} placeholder="Select..." />
                        <${SelectField} label="New MAOP" value=${segment.replacementPipeMaop} onChange=${v => u('replacementPipeMaop', v)} options=${MAOP_OPTIONS} placeholder="Select MAOP..." />
                    </div>

                    <div class="form-grid-full"><h5 class="sub-header">Purpose</h5></div>
                    <div class="purpose-section form-grid-full">
                        <div class="purpose-group">
                            <${SelectField} label="Primary Purpose" value=${segment.primaryPurpose} onChange=${v => u('primaryPurpose', v)} options=${PRIMARY_PURPOSE_OPTIONS} placeholder="Select..." />
                            ${segment.primaryPurpose === 'Other (please specify)' && html`
                                <${InputField} label="Other Reason" value=${segment.primaryPurposeOtherReason} onInput=${v => u('primaryPurposeOtherReason', v)} placeholder="Specify reason" />
                            `}
                            <${TextareaField} label="Primary Explanation" value=${segment.primaryPurposeExplanation} onInput=${v => u('primaryPurposeExplanation', v)} />
                        </div>
                         <div class="purpose-group">
                            <${SelectField} label="Secondary Purpose" value=${segment.secondaryPurpose} onChange=${v => u('secondaryPurpose', v)} options=${PRIMARY_PURPOSE_OPTIONS} placeholder="Select..." />
                            ${segment.secondaryPurpose === 'Other (please specify)' && html`
                                <${InputField} label="Other Reason" value=${segment.secondaryPurposeOtherReason} onInput=${v => u('secondaryPurposeOtherReason', v)} placeholder="Specify reason" />
                            `}
                            <${TextareaField} label="Secondary Explanation" value=${segment.secondaryPurposeExplanation} onInput=${v => u('secondaryPurposeExplanation', v)} />
                        </div>
                    </div>

                    <div class="form-grid-full"><h5 class="sub-header">Diameter Reduction</h5></div>
                    <div class="form-grid-full">
                        <${RadioGroup}
                            label="Reduction in main diameter to reduce standard costs"
                            name=${`diameter-reduction-${segment.id}`}
                            value=${segment.diameterReduction || ''}
                            onChange=${v => u('diameterReduction', v)}
                            options=${[
                                { label: '8" to 6"', value: '8_to_6' },
                                { label: '8" to 4"', value: '8_to_4' },
                                { label: '8" to 2"', value: '8_to_2' },
                                { label: '6" to 4"', value: '6_to_4' },
                                { label: '6" to 2"', value: '6_to_2' },
                                { label: '4" to 2"', value: '4_to_2' },
                                { label: 'None', value: '' },
                            ]}
                        />
                    </div>

                    ${segment.services.map((service, vIdx) => html`
                        <${ServiceEditor} 
                            key=${service.id} 
                            service=${service} 
                            sIdx=${sIdx} 
                            mIdx=${mIdx} 
                            vIdx=${vIdx} 
                            handlers=${handlers} 
                            project=${project}
                            isBranch=${!!service.parentServiceId}
                        />
                    `)}
                    <div class="button-group">
                        <button class="button button-secondary button-sm" onClick=${() => handlers.addService(sIdx, mIdx)}>Add Service</button>
                    </div>
                </div>
            `}
        </div>
    `;
};

const StreetEditor = ({ street, sIdx, handlers, project }) => {
    const u = (field, value) => handlers.updateStreet(sIdx, field, value);
    const [isCollapsed, setIsCollapsed] = useState(true);

    // For the main street name input, filter out the current street's own name from suggestions.
    // This prevents a UI bug where the manual input field disappears while typing a new name.
    const filteredProjectStreetNames = project.streets.filter(s => s.id !== street.id).map(s => s.name).filter(Boolean);

    const essentialTotal = street.mainSegments.reduce((acc, seg) => 
        acc + (seg.essentialStatus === 'essential' ? (seg.lengthToBeReplaced || 0) : 0), 0);

    const nonEssentialTotal = street.mainSegments.reduce((acc, seg) => 
        acc + (seg.essentialStatus === 'nonEssential' ? (seg.lengthToBeReplaced || 0) : 0), 0);
    
    const reductionTotals = street.mainSegments.reduce((acc, seg) => {
        if (seg.diameterReduction && seg.lengthToBeReplaced) {
            if (!acc[seg.diameterReduction]) {
                acc[seg.diameterReduction] = 0;
            }
            acc[seg.diameterReduction] += seg.lengthToBeReplaced;
        }
        return acc;
    }, {} as Record<string, number>);

    const hasReductions = Object.keys(reductionTotals).length > 0;

    return html`
        <div class="street-section ${isCollapsed ? 'collapsed' : ''}">
            <div class="street-header collapsible-header" onClick=${() => setIsCollapsed(!isCollapsed)}>
                 <button
                    type="button"
                    class="collapse-toggle"
                    aria-expanded=${!isCollapsed}
                    aria-label=${isCollapsed ? `Expand street ${street.name || 'details'}` : `Collapse street ${street.name || 'details'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>
                </button>
                <${TownStreetInput}
                    label=${html`Street <span class="sr-only">Name</span>`}
                    id=${`street-name-${street.id}`}
                    value=${street.name}
                    onInput=${v => u('name', v)}
                    townCity=${project.townCity}
                    projectStreetNames=${filteredProjectStreetNames}
                />
                <${InputField}
                    label="Number of Segments"
                    type="number"
                    value=${street.numberOfMainSegments}
                    onInput=${v => u('numberOfMainSegments', v)}
                    min="0"
                    style=${{ maxWidth: '180px' }}
                />
                <div class="street-header-actions">
                    <button class="button button-danger button-sm" onClick=${(e) => { e.stopPropagation(); handlers.removeStreet(sIdx); }}>Remove Street</button>
                </div>
            </div>

            ${!isCollapsed && html`
                <div class="collapsible-content">
                    <div class="totals-bar" style=${{ marginTop: 0, marginBottom: '1.5rem' }}>
                        <div class="totals-item">
                            <span class="totals-label">Essential Footage (ft)</span>
                            <span class="totals-value">${essentialTotal.toLocaleString()}</span>
                        </div>
                        <div class="totals-item">
                            <span class="totals-label">Non-Essential Footage (ft)</span>
                            <span class="totals-value">${nonEssentialTotal.toLocaleString()}</span>
                        </div>
                    </div>
                    <${AdvancedLeakDetectionEditor}
                        dataSource=${street}
                        onUpdate=${v => u('advancedLeakDetectionEvaluation', v)}
                    />
                     ${hasReductions && html`
                        <div>
                            <h5 class="reduction-summary-title">Reduction in main diameter to reduce standard costs</h5>
                            <div class="totals-bar reduction-totals">
                                ${Object.entries(reductionTotals).map(([key, value]) => html`
                                    <div class="totals-item">
                                        <span class="totals-label">${DIAMETER_REDUCTION_MAP[key] || key} Footage (ft)</span>
                                        <span class="totals-value">${value.toLocaleString()}</span>
                                    </div>
                                `)}
                            </div>
                        </div>
                    `}
                    ${street.mainSegments.map((segment, mIdx) => html`
                        <${SegmentEditor}
                            key=${segment.id}
                            segment=${segment}
                            sIdx=${sIdx}
                            mIdx=${mIdx}
                            handlers=${handlers}
                            project=${project}
                            currentStreetName=${street.name}
                        />
                    `)}

                    ${street.mainSegments.length === 0 && html`
                        <div class="hint-text">This street has no main segments yet. Set the number of segments above to begin.</div>
                    `}
                </div>
            `}
        </div>
    `;
};

const CollapsibleSection = ({ title, children, defaultCollapsed = false }) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return html`
        <div class="collapsible-section ${isCollapsed ? 'collapsed' : ''}">
            <div class="section-header collapsible-header" onClick=${() => setIsCollapsed(!isCollapsed)}>
                 <button
                    type="button"
                    class="collapse-toggle"
                    aria-expanded=${!isCollapsed}
                    aria-label=${isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>
                </button>
                <h3>${title}</h3>
            </div>
            ${!isCollapsed && html`<div class="collapsible-content">${children}</div>`}
        </div>
    `;
};

export const ProjectEditor = ({ project, handlers }) => {
    const u = (field, value) => handlers.updateProject(field, value);

    return html`
      <div class="project-editor">
        <div class="project-header">
            <h2 id="project-title">${project.projectName}</h2>
            <div class="project-header-actions">
                <button class="button button-secondary" onClick=${() => handlers.onGenerateReport(project.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3"></path><rect x="8" y="3" width="8" height="4"></rect><line x1="12" y1="16" x2="12" y2="10"></line><line x1="9" y1="13" x2="15" y2="13"></line></svg>
                    Generate Report
                </button>
                 <button class="button button-danger" onClick=${() => handlers.onDeleteProject(project.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    Delete Project
                </button>
            </div>
        </div>
        
        <${CollapsibleSection} title="Project Details">
            <div class="form-grid">
                <${InputField} label="Project Name" value=${project.projectName} onInput=${v => u('projectName', v)} required />
                <${InputField} label="Project #" type="number" value=${project.projectNumber} onInput=${v => u('projectNumber', v)} />
                <${InputField} label="Revision #" value=${project.revisionNumber} onInput=${v => u('revisionNumber', v)} />
                <${InputField} label="Revision Date" type="date" value=${project.revisionDate} onInput=${v => u('revisionDate', v)} />
                <${InputField} label="Project Start Date" type="date" value=${project.projectStartDate} onInput=${v => u('projectStartDate', v)} />
                <${InputField} label="Project End Date" type="date" value=${project.projectEndDate} onInput=${v => u('projectEndDate', v)} />
                <${InputField} label="Estimated Cost ($)" type="number" value=${project.projectCost} onInput=${v => u('projectCost', v)} />
                <${SelectField} label="Town/City" value=${project.townCity} onChange=${v => u('townCity', v)} options=${TOWNS} placeholder="Select a town..." />
                <div class="form-grid-full">
                    <${TextareaField} label="Project Description" value=${project.projectDescription} onInput=${v => u('projectDescription', v)} />
                </div>
            </div>
        </${CollapsibleSection}>

        <${CollapsibleSection} title="Community & Regulatory" defaultCollapsed=${true}>
            <div class="form-grid">
                <${RadioGroup}
                    label="Is this an Environmental Justice Community?"
                    name="isEJCommunity"
                    value=${project.isEJCommunity}
                    onChange=${v => u('isEJCommunity', v)}
                    options=${[{ label: 'Yes', value: true }, { label: 'No', value: false }, { label: 'Unknown', value: null }]}
                />
                <div class="form-grid-full">
                    <${TextareaField} label="EJ Information" value=${project.ejInformation} onInput=${v => u('ejInformation', v)} />
                </div>
                <div class="form-grid-full">
                    <${TextareaField} label="EJ Summary" value=${project.ejSummary} onInput=${v => u('ejSummary', v)} />
                </div>
                 <${RadioGroup}
                    label="Eliminates District Regulator Station?"
                    name="eliminatesDRS"
                    value=${project.eliminatesRegulatorStation}
                    onChange=${v => u('eliminatesRegulatorStation', v)}
                    options=${[{ label: 'Yes', value: true }, { label: 'No', value: false }, { label: 'N/A', value: null }]}
                />
                 <${RadioGroup}
                    label="Contributes to District Regulator Elimination?"
                    name="contributesToDRS"
                    value=${project.contributesToRegulatorStationElimination}
                    onChange=${v => u('contributesToRegulatorStationElimination', v)}
                    options=${[{ label: 'Yes', value: true }, { label: 'No', value: false }, { label: 'N/A', value: null }]}
                />
                <div class="form-grid-full">
                    <${TextareaField} label="Comments regarding District Regulator Station" value=${project.regulatorStationComments} onInput=${v => u('regulatorStationComments', v)} />
                </div>
            </div>
        </${CollapsibleSection}>

        <${CollapsibleSection} title="Streets & Main Segments">
            <div class="totals-bar">
                <div class="totals-item">
                    <span class="totals-label">Total Replaced Main (ft)</span>
                    <span class="totals-value">${project.totalReplacedLength?.toLocaleString() ?? '0'}</span>
                </div>
                <div class="totals-item">
                    <span class="totals-label">Total Annual Usage (therms)</span>
                    <span class="totals-value">${project.totalAnnualUsage?.toLocaleString() ?? '0'}</span>
                </div>
            </div>

            ${project.streets.map((street, sIdx) => html`
                <${StreetEditor} key=${street.id} street=${street} sIdx=${sIdx} handlers=${handlers} project=${project} />
            `)}

            <div class="button-group" style=${{ justifyContent: 'center', marginTop: '2rem' }}>
                <button class="button button-primary" onClick=${handlers.addStreet}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add Another Street
                </button>
            </div>
        </${CollapsibleSection}>
      </div>
    `;
};