import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange, language }) => {
  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
        }}
      />
    </div>
  );
};

export default CodeEditor;