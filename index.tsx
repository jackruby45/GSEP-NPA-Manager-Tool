/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { render } from 'preact';
import { useState, useRef } from 'preact/hooks';
import { html } from 'htm/preact';
import { 
    state as appState,
    setActiveProject,
    getActiveProject,
    createProject,
    openReportModal,
    closeReportModal,
    setReportViewMode,
    getReportProject,
    openSchemaModal,
    closeSchemaModal,
    openAboutModal,
    closeAboutModal,
    openDeleteConfirmModal,
    closeDeleteConfirmModal,
    deleteProjectConfirmed,
    openNewProjectModal,
    closeNewProjectModal,
    updateProjectField,
    addStreetToActiveProject,
    removeStreetFromActiveProject,
    updateStreetField,
    removeSegmentFromStreet,
    updateSegmentField,
    addServiceToSegment,
    removeServiceFromSegment,
    updateServiceField,
    addBranchServiceToSegment,
    addMeterToService,
    removeMeterFromService,
    updateMeterField,
    recalcProjectTotals,
} from './src/state.ts';
import { savePlan, openPlanFromFileInput } from './src/import-export.ts';
import { 
    generateReportCSV,
    renderReportSummaryHTML,
    renderReportTableHTML
} from './src/report.ts';
import { generateSchemasHTML } from './src/data/schemas.ts';
import { download } from './src/utils.ts';
import { ProjectEditor } from './src/tabs/projects.tsx';


const Header = ({ onNewProject, onSavePlan, onOpenPlan, onOpenSchema, onOpenAbout }) => {
    return html`
        <header class="header" role="banner">
            <h1>GSEP & NPA Manager Tool</h1>
            <div class="header-actions">
                <button class="button button-secondary" onClick=${onOpenPlan}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
                    Open Plan
                </button>
                <button class="button button-secondary" onClick=${onSavePlan}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Save Plan
                </button>
                <button class="button button-secondary" onClick=${onOpenSchema}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                    Data Schema
                </button>
                <button class="button button-secondary" onClick=${onOpenAbout} aria-label="About this application">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    About
                </button>
                <button class="button button-primary" onClick=${onNewProject}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    New Project
                </button>
            </div>
        </header>
    `;
};

const Sidebar = ({ projects, activeProjectId, onSelectProject }) => {
    return html`
        <nav class="sidebar" aria-label="Projects">
            <div class="sidebar-header">
                <h2>Projects</h2>
            </div>
            <ul class="sidebar-list">
                ${projects.map(project => html`
                    <li
                        key=${project.id}
                        class="sidebar-item ${project.id === activeProjectId ? 'active' : ''}"
                        onClick=${() => onSelectProject(project.id)}
                        role="button"
                        aria-pressed=${project.id === activeProjectId}
                        tabindex="0"
                    >
                        ${project.projectName}
                    </li>
                `)}
            </ul>
        </nav>
    `;
};

const MainContent = ({ project, handlers }) => {
    if (!project) {
        return html`
            <main class="main-content" role="main">
                <div class="welcome-message">
                    <h2>Welcome to the GSEP & NPA Manager Tool</h2>
                    <p>Select a project from the list to view its details, or create a new project to get started.</p>
                </div>
            </main>
        `;
    }

    return html`
        <main class="main-content" role="main" aria-labelledby="project-title">
            <${ProjectEditor} project=${project} handlers=${handlers} />
        </main>
    `;
};

const ReportModal = ({ project, viewMode, onSwitchView, onClose, onDownloadCSV }) => {
    if (!project) return null;

    const summaryHtml = viewMode === 'summary' ? renderReportSummaryHTML(project) : '';
    const tableHtml = viewMode === 'table' ? renderReportTableHTML(project) : '';

    return html`
        <div class="modal-overlay" onClick=${onClose}>
            <div class="modal-content report-modal" onClick=${e => e.stopPropagation()}>
                <div class="modal-header">
                    <h3>Report for: ${project.projectName}</h3>
                    <div class="report-controls">
                        <div class="report-view-switcher">
                            <button
                                class=${`button button-sm ${viewMode === 'summary' ? 'active' : ''}`}
                                onClick=${() => onSwitchView('summary')}
                                aria-pressed=${viewMode === 'summary'}
                            >Summary</button>
                            <button
                                class=${`button button-sm ${viewMode === 'table' ? 'active' : ''}`}
                                onClick=${() => onSwitchView('table')}
                                aria-pressed=${viewMode === 'table'}
                            >Table</button>
                        </div>
                        <button class="button button-secondary button-sm" onClick=${onDownloadCSV}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Download CSV
                        </button>
                    </div>
                    <button class="modal-close-button" onClick=${onClose} aria-label="Close report">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="modal-body">
                    ${viewMode === 'summary' && html`<div dangerouslySetInnerHTML=${{ __html: summaryHtml }}></div>`}
                    ${viewMode === 'table' && html`<div dangerouslySetInnerHTML=${{ __html: tableHtml }}></div>`}
                </div>
            </div>
        </div>
    `;
};

const SchemaModal = ({ onClose }) => {
    const schemasHtml = generateSchemasHTML();

    return html`
        <div class="modal-overlay" onClick=${onClose}>
            <div class="modal-content schema-modal" onClick=${e => e.stopPropagation()}>
                <div class="modal-header">
                    <h3>Data Schema Definition</h3>
                    <button class="modal-close-button" onClick=${onClose} aria-label="Close schema view">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <p>The application data is structured into the following relational tables for clarity and potential database export. Foreign keys link the tables together.</p>
                    <div dangerouslySetInnerHTML=${{ __html: schemasHtml }}></div>
                </div>
            </div>
        </div>
    `;
};

const AboutModal = ({ onClose }) => {
    return html`
        <div class="modal-overlay" onClick=${onClose}>
            <div class="modal-content about-modal" onClick=${e => e.stopPropagation()}>
                <div class="modal-header">
                    <h3>About GSEP & NPA Manager Tool</h3>
                    <button class="modal-close-button" onClick=${onClose} aria-label="Close about dialog">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="modal-body about-content">
                    <h4>Version</h4>
                    <p>1.0.0</p>
                    <h4>Description</h4>
                    <p>A tool to streamline the planning and documentation of gas system enhancement projects. Manage project details, track assets, and generate comprehensive reports with ease.</p>
                    <h4>Contact</h4>
                    <p>For support or inquiries, please contact the development team.</p>
                    <hr />
                    <p class="text-center">Thank you for using GSEP & NPA Manager Tool!</p>
                </div>
            </div>
        </div>
    `;
};

const DeleteConfirmModal = ({ onCancel, onConfirm }) => {
    return html`
        <div class="modal-overlay" onClick=${onCancel}>
            <div class="modal-content about-modal" onClick=${e => e.stopPropagation()}>
                <div class="modal-header">
                    <h3>Confirm Deletion</h3>
                    <button class="modal-close-button" onClick=${onCancel} aria-label="Close dialog">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this project? This action cannot be undone.</p>
                    <div class="button-group" style=${{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button class="button button-secondary" onClick=${onCancel}>Cancel</button>
                        <button class="button button-danger" onClick=${onConfirm}>Delete Project</button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const NewProjectModal = ({ onCancel, onConfirm }) => {
    const [name, setName] = useState(`New Project ${appState.projects.length + 1}`);

    const handleConfirm = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onConfirm(name.trim());
        }
    };

    return html`
        <div class="modal-overlay" onClick=${onCancel}>
            <form class="modal-content about-modal" onClick=${e => e.stopPropagation()} onSubmit=${handleConfirm}>
                <div class="modal-header">
                    <h3>Create New Project</h3>
                    <button type="button" class="modal-close-button" onClick=${onCancel} aria-label="Close dialog">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="new-project-name-input">Project Name</label>
                        <input
                            id="new-project-name-input"
                            type="text"
                            value=${name}
                            onInput=${e => setName(e.currentTarget.value)}
                            required
                            autofocus
                        />
                    </div>
                    <div class="button-group" style=${{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="button" class="button button-secondary" onClick=${onCancel}>Cancel</button>
                        <button type="submit" class="button button-primary">Create Project</button>
                    </div>
                </div>
            </form>
        </div>
    `;
};


const App = () => {
    const [_, forceUpdate] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const needsUpdate = () => forceUpdate(c => c + 1);

    const handleSelectProject = (projectId) => {
        setActiveProject(projectId);
        needsUpdate();
    };

    const handleNewProject = () => {
        openNewProjectModal();
        needsUpdate();
    };

    const handleCloseNewProjectModal = () => {
        closeNewProjectModal();
        needsUpdate();
    };

    const handleCreateProjectConfirmed = (projectName) => {
        const newProject = createProject(projectName);
        appState.projects.push(newProject);
        setActiveProject(newProject.id);
        closeNewProjectModal();
        needsUpdate();
    };
    
    const handleSavePlan = () => {
        savePlan();
    };

    const handleOpenPlan = () => {
        fileInputRef.current?.click();
    };

    const handleFileOpened = (event) => {
        const input = event.target as HTMLInputElement;
        if (input) {
            openPlanFromFileInput(input, needsUpdate);
        }
    };

    const handleGenerateReport = (projectId) => {
        openReportModal(projectId);
        needsUpdate();
    };
    
    const handleCloseReport = () => {
        closeReportModal();
        needsUpdate();
    };
    
    const handleSwitchReportView = (mode) => {
        setReportViewMode(mode);
        needsUpdate();
    };

    const handleDownloadCSV = () => {
        const project = getReportProject();
        if (project) {
            recalcProjectTotals(project);
            const csv = generateReportCSV(project);
            download(`${project.projectName.replace(/\s+/g, '_')}_report.csv`, csv, 'text/csv');
        }
    };

    const handleOpenSchema = () => {
        openSchemaModal();
        needsUpdate();
    };

    const handleCloseSchema = () => {
        closeSchemaModal();
        needsUpdate();
    };

    const handleOpenAbout = () => {
        openAboutModal();
        needsUpdate();
    };

    const handleCloseAbout = () => {
        closeAboutModal();
        needsUpdate();
    };
    
    const handleOpenDeleteConfirm = (projectId) => {
        openDeleteConfirmModal(projectId);
        needsUpdate();
    };

    const handleCloseDeleteConfirm = () => {
        closeDeleteConfirmModal();
        needsUpdate();
    };

    const handleDeleteProjectConfirmed = () => {
        deleteProjectConfirmed();
        needsUpdate();
    };

    // --- Editor Handlers ---
    const handlers = {
        onGenerateReport: handleGenerateReport,
        onDeleteProject: handleOpenDeleteConfirm,
        updateProject: (field, value) => { updateProjectField(field, value); needsUpdate(); },
        addStreet: () => { addStreetToActiveProject(); needsUpdate(); },
        removeStreet: (sIdx) => { removeStreetFromActiveProject(sIdx); needsUpdate(); },
        updateStreet: (sIdx, field, value) => { updateStreetField(sIdx, field, value); needsUpdate(); },
        removeSegment: (sIdx, mIdx) => { removeSegmentFromStreet(sIdx, mIdx); needsUpdate(); },
        updateSegment: (sIdx, mIdx, field, value) => { updateSegmentField(sIdx, mIdx, field, value); needsUpdate(); },
        addService: (sIdx, mIdx) => { addServiceToSegment(sIdx, mIdx); needsUpdate(); },
        removeService: (sIdx, mIdx, vIdx) => { removeServiceFromSegment(sIdx, mIdx, vIdx); needsUpdate(); },
        updateService: (sIdx, mIdx, vIdx, field, value) => { updateServiceField(sIdx, mIdx, vIdx, field, value); needsUpdate(); },
        addBranchService: (sIdx, mIdx, vIdx) => { addBranchServiceToSegment(sIdx, mIdx, vIdx); needsUpdate(); },
        addMeter: (sIdx, mIdx, vIdx) => { addMeterToService(sIdx, mIdx, vIdx); needsUpdate(); },
        removeMeter: (sIdx, mIdx, vIdx, tIdx) => { removeMeterFromService(sIdx, mIdx, vIdx, tIdx); needsUpdate(); },
        updateMeter: (sIdx, mIdx, vIdx, tIdx, field, value) => { updateMeterField(sIdx, mIdx, vIdx, tIdx, field, value); needsUpdate(); },
    };

    const activeProject = getActiveProject();
    if (activeProject) {
        recalcProjectTotals(activeProject);
    }
    const reportProject = getReportProject();


    return html`
        <${Header}
            onNewProject=${handleNewProject}
            onSavePlan=${handleSavePlan}
            onOpenPlan=${handleOpenPlan}
            onOpenSchema=${handleOpenSchema}
            onOpenAbout=${handleOpenAbout}
        />
        <div class="app-container">
            <${Sidebar}
                projects=${appState.projects}
                activeProjectId=${appState.activeProjectId}
                onSelectProject=${handleSelectProject}
            />
            <${MainContent}
                project=${activeProject}
                handlers=${handlers} 
            />
        </div>
        <input
            type="file"
            ref=${fileInputRef}
            onChange=${handleFileOpened}
            style=${{ display: 'none' }}
            accept="application/json,.json"
        />
        ${appState.isReportModalOpen && html`
            <${ReportModal}
                project=${reportProject}
                viewMode=${appState.reportViewMode}
                onSwitchView=${handleSwitchReportView}
                onClose=${handleCloseReport}
                onDownloadCSV=${handleDownloadCSV}
            />
        `}
        ${appState.isSchemaModalOpen && html`
            <${SchemaModal} onClose=${handleCloseSchema} />
        `}
        ${appState.isAboutModalOpen && html`
            <${AboutModal} onClose=${handleCloseAbout} />
        `}
        ${appState.isNewProjectModalOpen && html`
            <${NewProjectModal}
                onCancel=${handleCloseNewProjectModal}
                onConfirm=${handleCreateProjectConfirmed}
            />
        `}
        ${appState.isDeleteConfirmModalOpen && html`
            <${DeleteConfirmModal}
                onCancel=${handleCloseDeleteConfirm}
                onConfirm=${handleDeleteProjectConfirmed}
            />
        `}
    `;
};

render(html`<${App} />`, document.getElementById('root'));