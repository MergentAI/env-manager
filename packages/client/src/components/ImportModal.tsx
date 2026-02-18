import { useState, useRef } from 'react';
import { parseEnv } from '../lib/envParser';
import toast from 'react-hot-toast';

interface Variable {
  key: string;
  value: string;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (variables: Variable[]) => void;
}

export const ImportModal = ({ isOpen, onClose, onImport }: ImportModalProps) => {
  const [content, setContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleImport = () => {
    if (!content.trim()) {
      onClose();
      return;
    }

    try {
      const variables = parseEnv(content);
      if (variables.length === 0) {
        toast.error('No valid variables found to import');
        return;
      }
      onImport(variables);
      setContent('');
      onClose();
      toast.success(`Imported ${variables.length} variables`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to parse content');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Import Environment Variables
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Paste your .env content below or upload a file.
          </p>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-4">
             <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload .env File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".env,text/plain"
              className="hidden"
            />
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="KEY=VALUE
ANOTHER_KEY=another_value"
          />
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Import Variables
          </button>
        </div>
      </div>
    </div>
  );
};
