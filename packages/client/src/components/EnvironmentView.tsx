import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

interface Variable {
  key: string;
  value: string;
}

interface EnvironmentViewProps {
  project: string;
  env: string;
  onDirtyChange: (isDirty: boolean) => void;
}

export const EnvironmentView = ({ project, env, onDirtyChange }: EnvironmentViewProps) => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Track initial state to determine dirtiness
  const initialVarsRef = useRef<string>('[]');

  useEffect(() => {
    fetchVariables();
  }, [project, env]);

  useEffect(() => {
    const currentVarsStr = JSON.stringify(variables);
    const isDirty = currentVarsStr !== initialVarsRef.current;
    onDirtyChange(isDirty);
  }, [variables, onDirtyChange]);

  const fetchVariables = async () => {
    setLoading(true);
    onDirtyChange(false); // Reset dirty state on load
    try {
      const data = await api.getEnvVars(project, env);
      const vars = Object.entries(data.variables || {}).map(([key, value]) => ({ key, value: String(value) }));
      setVariables(vars);
      initialVarsRef.current = JSON.stringify(vars);
    } catch (err) {
      setError('Failed to fetch variables');
      toast.error('Failed to load variables');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const varsObj = variables.reduce((acc, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      await api.saveEnvVars(project, env, varsObj);
      
      // Update initial ref to match saved state
      initialVarsRef.current = JSON.stringify(variables);
      onDirtyChange(false);
      
      toast.success('Environment variables saved successfully');
      setSaving(false);
    } catch (err) {
      setError('Failed to save variables');
      toast.error('Failed to save changes');
      setSaving(false);
    }
  };

  const addVariable = () => {
    setVariables([...variables, { key: '', value: '' }]);
  };

  const deleteVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const updateVariable = (index: number, key: string, value: string) => {
    const newVars = [...variables];
    newVars[index] = { key, value };
    setVariables(newVars);
  };

  if (loading) return <div className="text-gray-500 text-center py-8">Loading...</div>;
  
  const isDirty = JSON.stringify(variables) !== initialVarsRef.current;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Environment Variables</h3>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className={`font-medium py-2 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            saving || !isDirty
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
          }`}
        >
          {saving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4" role="alert">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4 mb-2 font-medium text-gray-500 text-sm uppercase tracking-wider">
          <div className="col-span-5">Key</div>
          <div className="col-span-6">Value</div>
          <div className="col-span-1 text-center">Action</div>
        </div>

        {variables.map((v, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center group">
            <div className="col-span-5">
              <input
                type="text"
                value={v.key}
                onChange={(e) => updateVariable(index, e.target.value, v.value)}
                placeholder="VARIABLE_NAME"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>
            <div className="col-span-6">
              <input
                type="text"
                value={v.value}
                onChange={(e) => updateVariable(index, v.key, e.target.value)}
                placeholder="value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>
            <div className="col-span-1 text-center">
              <button
                onClick={() => deleteVariable(index)}
                className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete variable"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addVariable}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Variable
        </button>
      </div>
    </div>
  );
};
