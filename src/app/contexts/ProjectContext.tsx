'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project } from '@/app/lib/services/projectService';

// Define the shape of our project context
interface ProjectContextType {
    selectedProject: Project | null;
    setSelectedProject: (project: Project | null) => void;
    projectCache: Record<string, Project>;
    addToProjectCache: (projectId: string, project: Project) => void;
    clearProjectCache: () => void;
}

// Create the context
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Context provider component
export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projectCache, setProjectCache] = useState<Record<string, Project>>({});

    const addToProjectCache = (projectId: string, project: Project) => {
        setProjectCache(prev => ({
            ...prev,
            [projectId]: project
        }));
    };

    const clearProjectCache = () => {
        setProjectCache({});
        setSelectedProject(null);
    };

    const value: ProjectContextType = {
        selectedProject,
        setSelectedProject,
        projectCache,
        addToProjectCache,
        clearProjectCache
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

// Custom hook to use the project context
export const useProject = (): ProjectContextType => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
