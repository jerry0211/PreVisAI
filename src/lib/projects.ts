/**
 * Project library persistence (localStorage), ported from the vanilla app.
 * Falls back to the seed list on any missing / corrupt / empty value so the
 * demo always has something to show.
 */

import { DEFAULT_PROJECTS } from '@/data/projects';

const PROJECTS_KEY = 'projects';

export function getProjects(): string[] {
  let saved: unknown = null;
  try {
    saved = JSON.parse(localStorage.getItem(PROJECTS_KEY) ?? 'null');
  } catch {
    saved = null;
  }

  if (!Array.isArray(saved) || saved.length === 0) {
    return [...DEFAULT_PROJECTS];
  }
  return saved as string[];
}

export function saveProjects(projects: string[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

/** Add a project to the front of the library if it isn't already present. */
export function addProject(name: string): string[] {
  const projects = getProjects();
  if (!projects.includes(name)) {
    projects.unshift(name);
    saveProjects(projects);
  }
  return projects;
}
