import { state } from './state.ts';
import { syncIdGenerator } from './utils.ts';

export function savePlan(): void {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    projects: state.projects,
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gsep_plan.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function openPlanFromFileInput(input: HTMLInputElement, onLoaded: () => void) {
  const files = input.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || '{}'));
      // Accept either { projects: [...] } or raw [...]
      const projects = Array.isArray(parsed) ? parsed : parsed.projects;
      if (!Array.isArray(projects)) throw new Error('Invalid file format: "projects" array not found.');

      // Basic validation of project structure
      if (projects.length > 0 && (projects[0].id === undefined || projects[0].projectName === undefined)) {
          throw new Error('Invalid file format: Projects are missing required fields like "id" or "projectName".');
      }

      // Sync ID generator to prevent collisions after loading a file
      let maxId = 0;
      projects.forEach(p => {
        if (p.id > maxId) maxId = p.id;
        p.streets?.forEach(s => {
            if (s.id > maxId) maxId = s.id;
            s.mainSegments?.forEach(ms => {
                if (ms.id > maxId) maxId = ms.id;
                ms.services?.forEach(svc => {
                    if (svc.id > maxId) maxId = svc.id;
                    svc.meters?.forEach(m => {
                        if (m.id > maxId) maxId = m.id;
                    });
                });
            });
        });
      });
      syncIdGenerator(maxId);

      // Overwrite state in-place (keeps references in other modules)
      state.projects.length = 0; // Clear existing projects
      Array.prototype.push.apply(state.projects, projects);

      state.activeProjectId = projects.length ? projects[0].id : null;
      state.isCreatingNewProject = projects.length === 0;
      onLoaded();
    } catch (err) {
      alert(`Failed to open plan: ${(err as Error).message}`);
    } finally {
      // Reset file input to allow opening the same file again
      input.value = '';
    }
  };
  reader.readAsText(file);
}