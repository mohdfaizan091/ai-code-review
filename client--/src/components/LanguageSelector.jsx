const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp'];

const LanguageSelector = ({ language, onChange }) => {
  return (
    <select
      value={language}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang} value={lang}>
          {lang}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;