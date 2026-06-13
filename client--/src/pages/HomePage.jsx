import { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';

const HomePage = () => {
  const [code, setCode] = useState('// write your code here');
  const [language, setLanguage] = useState('javascript');

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700">
        <h1 className="text-xl font-semibold">AI Code Review</h1>
        <div className="flex items-center gap-4">
          <LanguageSelector language={language} onChange={setLanguage} />
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
            Review Code
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <CodeEditor
          code={code}
          onChange={setCode}
          language={language}
        />
      </div>

    </div>
  );
};

export default HomePage;