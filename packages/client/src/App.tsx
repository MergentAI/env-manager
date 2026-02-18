import { useState, useEffect } from 'react';
import { AuthGuard } from './components/AuthGuard';
import { ProjectList } from './components/ProjectList';
import { EnvironmentView } from './components/EnvironmentView';
import { api } from './lib/api';

function App() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [environments, setEnvironments] = useState<string[]>(['local', 'alpha', 'prod']);
  const [selectedEnv, setSelectedEnv] = useState('local');
  const [newEnvName, setNewEnvName] = useState('');

  useEffect(() => {
    if (selectedProject) {
      loadEnvironments(selectedProject);
    }
  }, [selectedProject]);

  const loadEnvironments = async (project: string) => {
    try {
      const envs = await api.getEnvironments(project);
      // Ensure default envs are always present for options, but prioritize fetched ones
      const uniqueEnvs = Array.from(new Set([...envs, 'local', 'alpha', 'prod']));
      setEnvironments(uniqueEnvs);
      if (!uniqueEnvs.includes(selectedEnv)) {
        setSelectedEnv(uniqueEnvs[0] || 'local');
      }
    } catch (e) {
      console.error("Failed to load environments", e);
    }
  };

  const handleAddEnv = () => {
    if (newEnvName && !environments.includes(newEnvName)) {
      setEnvironments([...environments, newEnvName]);
      setSelectedEnv(newEnvName);
      setNewEnvName('');
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <ProjectList 
          selectedProject={selectedProject || undefined} 
          onSelectProject={setSelectedProject} 
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
            <h1 className="text-xl font-bold text-gray-800">
              {selectedProject || 'Select a Project'}
            </h1>
            
            <div className="flex items-center space-x-4">
              {selectedProject && (
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {environments.map((env) => (
                      <button
                        key={env}
                        onClick={() => setSelectedEnv(env)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          selectedEnv === env
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {env}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center border-l pl-2 ml-2 border-gray-300">
                    <input 
                      type="text" 
                      placeholder="New Env..." 
                      className="w-24 px-2 py-1 text-sm border border-gray-300 rounded mr-1 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newEnvName}
                      onChange={(e) => setNewEnvName(e.target.value)}
                    />
                    <button 
                      onClick={handleAddEnv}
                      disabled={!newEnvName}
                      className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => api.logout()}
                className="text-gray-500 hover:text-red-600 text-sm font-medium flex items-center transition-colors"
                title="Logout / Change Key"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">
            {selectedProject ? (
              <div className="max-w-5xl mx-auto">
                <EnvironmentView 
                  key={`${selectedProject}-${selectedEnv}`} 
                  project={selectedProject} 
                  env={selectedEnv} 
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">No project selected</h3>
                <p className="mt-1 text-gray-500">Create or select a project from the sidebar.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

export default App;
