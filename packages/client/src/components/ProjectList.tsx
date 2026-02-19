import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { ConfirmModal } from "./ConfirmModal";

interface ProjectListProps {
  onSelectProject: (project: string) => void;
  selectedProject?: string;
}

export const ProjectList = ({
  onSelectProject,
  selectedProject,
}: ProjectListProps) => {
  const [projects, setProjects] = useState<string[]>([]);
  const [newProject, setNewProject] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const handleCreate = async () => {
    if (newProject && !projects.includes(newProject)) {
      setProjects([...projects, newProject]);
      onSelectProject(newProject);
      setNewProject("");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, project: string) => {
    e.stopPropagation();
    setProjectToDelete(project);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      try {
        await api.deleteProject(projectToDelete);
        window.location.reload();
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
    setProjectToDelete(null);
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-6 tracking-wide">Projects</h2>

      <div className="flex-1 overflow-y-auto space-y-2">
        {projects.map((project) => (
          <div
            key={project}
            onClick={() => onSelectProject(project)}
            className={`group w-full text-left px-4 py-2 rounded transition-colors flex items-center justify-between cursor-pointer ${
              selectedProject === project
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            <span className="truncate flex-1">{project}</span>
            <button
              onClick={(e) => handleDeleteClick(e, project)}
              className={`p-1 rounded hover:bg-red-500 hover:text-white transition-opacity ${
                selectedProject === project
                  ? "text-blue-200"
                  : "text-gray-500 opacity-0 group-hover:opacity-100"
              }`}
              title="Delete project"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
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

      <div className="mt-auto pt-4 border-t border-gray-800 text-center">
        <a
          href="https://www.npmjs.com/package/easyenvmanager"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-1 group"
        >
          <span>Get the CLI on npm</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <ConfirmModal
        isOpen={!!projectToDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
};
