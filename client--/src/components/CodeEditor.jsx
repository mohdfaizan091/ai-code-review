import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = forwardRef(({ code, onChange, language, onSubmit }, ref) => {
  const editorRef = useRef(null);
  const [ready, setReady] = useState(false);

  useImperativeHandle(ref, () => ({
    revealLine(line) {
      const editor = editorRef.current;
      if (!editor || !Number.isFinite(Number(line))) return;
      const target = Math.max(1, Number(line));
      editor.revealLineInCenter(target);
      editor.setPosition({ lineNumber: target, column: 1 });
      editor.focus();
      const decorations = editor.deltaDecorations([], [{
        range: new window.monaco.Range(target, 1, target, 1),
        options: { isWholeLine: true, className: 'review-line-highlight' },
      }]);
      window.setTimeout(() => editor.deltaDecorations(decorations, []), 2200);
    },
  }));

  const handleBeforeMount = (monaco) => monaco.editor.defineTheme('code-review-dark', {
    base: 'vs-dark', inherit: true, rules: [],
    colors: {
      'editor.background': '#171B24', 'editorGutter.background': '#171B24',
      'editor.lineHighlightBackground': '#202A3A', 'editorLineNumber.foreground': '#65708A',
      'editorLineNumber.activeForeground': '#D9E1EF', 'editorCursor.foreground': '#38BDF8',
      'editor.selectionBackground': '#31405B',
    },
  });

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    window.monaco = monaco;
    editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.Enter, () => onSubmit?.());
    setReady(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden" aria-label="Code editor">
      {!ready && <div className="editor-skeleton absolute inset-0 z-10 p-5" aria-label="Loading editor" role="status">
        <span className="skeleton-line w-2/3" /><span className="skeleton-line w-1/2" />
        <span className="skeleton-line w-5/6" /><span className="skeleton-line w-3/5" />
        <span className="skeleton-line w-4/5" /><span className="sr-only">Loading editor</span>
      </div>}
      <Editor height="100%" language={language} value={code} onChange={onChange}
        beforeMount={handleBeforeMount} onMount={handleMount} theme="code-review-dark"
        options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'off', padding: { top: 14 } }} />
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';
export default CodeEditor;
