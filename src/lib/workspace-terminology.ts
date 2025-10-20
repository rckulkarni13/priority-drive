import { WorkspaceType } from "@/types";

export interface WorkspaceTerminology {
  domain: {
    singular: string;
    plural: string;
  };
  pillar: {
    singular: string;
    plural: string;
  };
  theme: {
    singular: string;
    plural: string;
  };
}

export function getWorkspaceTerminology(type: WorkspaceType): WorkspaceTerminology {
  switch (type) {
    case 'work':
      return {
        domain: { singular: 'Domain', plural: 'Domains' },
        pillar: { singular: 'Strategic Pillar', plural: 'Strategic Pillars' },
        theme: { singular: 'Theme', plural: 'Themes' },
      };
    case 'school':
      return {
        domain: { singular: 'Subject', plural: 'Subjects' },
        pillar: { singular: 'Learning Goal', plural: 'Learning Goals' },
        theme: { singular: 'Topic', plural: 'Topics' },
      };
    case 'home':
      return {
        domain: { singular: 'Area', plural: 'Areas' },
        pillar: { singular: 'Goal', plural: 'Goals' },
        theme: { singular: 'Project', plural: 'Projects' },
      };
    case 'custom':
    default:
      return {
        domain: { singular: 'Domain', plural: 'Domains' },
        pillar: { singular: 'Pillar', plural: 'Pillars' },
        theme: { singular: 'Theme', plural: 'Themes' },
      };
  }
}
