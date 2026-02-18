import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface ProjectListProps {
  onSelectProject: (project: string) => void;
  selectedProject?: string;
}

export const ProjectList = ({ onSelectProject, selectedProject }: ProjectListProps) => {
  const [projects, setProjects] = useState<string[]>([]);
  const [newProject, setNewProject] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleCreate = async () => {
    if (newProject && !projects.includes(newProject)) {
      setProjects([...projects, newProject]);
      onSelectProject(newProject);
      setNewProject('');
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-6 tracking-wide">Projects</h2>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {projects.map((project) => (
          <button
            key={project}
            onClick={() => onSelectProject(project)}
            className={`w-full text-left px-4 py-2 rounded transition-colors ${
              selectedProject === project
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-gray-800 text-gray-300'
            }`}
          >
            {project}
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <input
          type="text"
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          placeholder="New Project..."
          className="w-full bg-gray-800 text-white px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreate}
          disabled={!newProject}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Create Project
        </button>
      </div>
    </div>
  );
};
