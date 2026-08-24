const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp'];

const LanguageSelector = ({ language, onChange }) => {
  return (
    <select
      value={language}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#171B24] text-[#E7E9EE] px-3 py-2 rounded-lg border border-[#2A2F3D] focus:outline-none focus:border-[#5B6274]"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang} value={lang} className="bg-[#171B24] text-[#E7E9EE]">
          {lang}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;