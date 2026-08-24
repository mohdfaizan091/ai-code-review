import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#10131A] text-[#E7E9EE] font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-10 border-b border-[#20242F] bg-[#10131A]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <span className="w-5 h-5 rounded bg-[#E3B341] text-[#1B1500] flex items-center justify-center font-mono text-xs font-bold">&gt;_</span>
            Ai-Code-Review
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#8B92A5]">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How it works</a>
            <a
              href="https://github.com/mohdfaizan091/ai-code-review"
              target="_blank" rel="noreferrer"
              className="hover:text-white transition">
              GitHub
            </a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/editor')}
                  className="text-sm font-medium px-4 py-2 rounded-md bg-[#E3B341] text-[#1B1500] hover:bg-[#EEC565] transition">
                  Editor
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm px-4 py-2 rounded-md border border-[#2A2F3D] hover:border-[#5B6274] transition">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm px-4 py-2 rounded-md border border-[#2A2F3D] hover:border-[#5B6274] transition">
                  Log in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="text-sm font-medium px-4 py-2 rounded-md bg-[#E3B341] text-[#1B1500] hover:bg-[#EEC565] transition">
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#E3B341] uppercase mb-4">
            <span className="text-[#8A6B27]">// </span>AI code review
          </p>
          <h1 className="text-4xl md:text-[44px] leading-[1.15] font-bold tracking-tight mb-5">
            Ship code your<br />reviewer would <span className="text-[#E3B341]">approve</span>.
          </h1>
          <p className="text-[#8B92A5] text-base max-w-md mb-8">
            Paste your code, get structured feedback streamed live — severity-tagged
            issues, fixes, and a quality score, powered by Groq and rendered in an
            editor that feels like home.
          </p>
          <div className="flex items-center gap-5 mb-9">
            <button
              onClick={() => navigate('/editor')}
              className="px-6 py-3 rounded-lg bg-[#E3B341] text-[#1B1500] font-medium text-sm hover:bg-[#EEC565] transition">
              Start reviewing free
            </button>
            
          </div>
          <div className="flex gap-7 text-xs text-[#5B6274]">
            <div><span className="block text-lg font-bold text-white">80%</span>faster reviews</div>
            <div><span className="block text-lg font-bold text-white">&lt;2s</span>to first token</div>
            <div><span className="block text-lg font-bold text-white">5</span>languages</div>
          </div>
        </div>

        {/* Signature element: mock review panel */}
        <div className="rounded-xl border border-[#2A2F3D] bg-[#171B24] overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#20242F]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E2685E]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#E3B341]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#5FBD8A]"></span>
            <span className="ml-1.5 text-xs text-[#5B6274] font-mono">auth.controller.js</span>
          </div>
          <div className="py-4 font-mono text-[13px]">
            <div className="flex px-4 py-0.5">
              <span className="w-6 text-[#5B6274]">12</span>
              <span className="text-[#B9C4D6]"><span className="text-[#C88CDB]">async function</span> <span className="text-[#79B8E8]">loginUser</span>(req, res) {'{'}</span>
            </div>
            <div className="flex px-4 py-0.5 bg-[#241A1A]">
              <span className="w-6 text-[#5B6274]">13</span>
              <span className="text-white">  <span className="text-[#C88CDB]">const</span> token = jwt.sign(payload, SECRET);</span>
            </div>
            <div className="mx-4 mt-1 mb-2 ml-10 p-2.5 rounded-md text-xs bg-[#241A1A] border border-[#3A2323] text-[#F0A8A2] flex gap-2">
              <span className="shrink-0 mt-0.5 text-[10px] font-bold px-1.5 rounded bg-[#E2685E] text-[#2A0F0C] uppercase">high</span>
              Token isn't HttpOnly — vulnerable to XSS token theft.
            </div>
            <div className="flex px-4 py-0.5">
              <span className="w-6 text-[#5B6274]">14</span>
              <span className="text-[#B9C4D6]">  res.cookie(<span className="text-[#5FBD8A]">"token"</span>, token, {'{ httpOnly: '}<span className="text-[#C88CDB]">true</span>{' }'});</span>
            </div>
            <div className="flex px-4 py-0.5">
              <span className="w-6 text-[#5B6274]">15</span>
              <span className="text-[#5B6274]">  // rate limiting handled upstream</span>
            </div>
            <div className="mx-4 mt-1 mb-1 ml-10 p-2.5 rounded-md text-xs bg-[#17251E] border border-[#22392E] text-[#8FD4AC] flex gap-2">
              <span className="shrink-0 mt-0.5 text-[10px] font-bold px-1.5 rounded bg-[#5FBD8A] text-[#0C2318] uppercase">pass</span>
              Password check uses constant-time bcrypt compare.
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#20242F]">
            <span className="text-xs text-[#8B92A5]">Overall quality score</span>
            <span className="text-sm font-bold text-[#5FBD8A]">82 / 100</span>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="border-y border-[#20242F]">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap">
          {[
            ['SSE', 'Live token streaming'],
            ['JWT', 'HttpOnly cookie auth'],
            ['Monaco', 'Same editor as VS Code'],
            ['Guest', 'No sign-up required to try'],
          ].map(([label, desc], i) => (
            <div key={i} className="flex-1 min-w-[45%] md:min-w-0 text-center py-6 border-r last:border-r-0 border-[#20242F]">
              <span className="block text-xl font-bold">{label}</span>
              <span className="text-xs text-[#8B92A5]">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-lg mb-11">
          <p className="text-xs font-semibold tracking-widest text-[#E3B341] uppercase mb-3">
            <span className="text-[#8A6B27]">// </span>Features
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Everything a real reviewer checks for</h2>
          <p className="text-[#8B92A5] text-sm">Not a linter. Structured, contextual feedback on the things that actually break in production.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#20242F] border border-[#20242F] rounded-xl overflow-hidden">
          {[
            ['//', 'Live streaming review', 'Feedback appears token-by-token over SSE — no spinner, no waiting on a full response.'],
            ['!', 'Severity-tagged issues', 'Every issue is ranked high, medium, or low, so you fix what matters first.'],
            ['{ }', 'Structured JSON output', 'Issues, suggested fixes, and a quality score — parsed, not buried in prose.'],
            ['⌘', 'Monaco editor', 'The same editor that powers VS Code, with full syntax highlighting.'],
            ['◐', 'Guest mode', 'Try a full review with no account. Sign up only when you want history saved.'],
            ['↺', 'Review history', 'Every past review saved and searchable, paginated for quick recall.'],
          ].map(([icon, title, desc], i) => (
            <div key={i} className="bg-[#10131A] p-6">
              <div className="w-8 h-8 rounded-md bg-[#1E2330] flex items-center justify-center mb-4 text-[#E3B341] font-mono font-bold text-sm">{icon}</div>
              <h3 className="text-sm font-semibold mb-1.5">{title}</h3>
              <p className="text-[13px] text-[#8B92A5] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="max-w-lg mb-11">
          <p className="text-xs font-semibold tracking-widest text-[#E3B341] uppercase mb-3">
            <span className="text-[#8A6B27]">// </span>How it works
          </p>
          <h2 className="text-3xl font-bold tracking-tight">Three steps, one streamed response</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            ['01', 'Paste your code', 'Drop a function or a full file into the Monaco editor. Five languages supported.'],
            ['02', 'Watch it stream', 'Issues and suggestions render live as Groq analyzes your code, line by line.'],
            ['03', 'Fix and re-run', 'Apply the suggested fixes, re-run the review, and track your score improve.'],
          ].map(([n, title, desc], i) => (
            <div key={i}>
              <div className="font-mono text-xs text-[#E3B341] mb-3">{n}</div>
              <h3 className="text-base font-semibold mb-2">{title}</h3>
              <p className="text-[13.5px] text-[#8B92A5]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SPLIT */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-[#2A2F3D] bg-[#171B24] p-8 md:p-14 grid md:grid-cols-[1fr_360px] gap-10 items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#E3B341] uppercase mb-3">
              <span className="text-[#8A6B27]">// </span>Get started
            </p>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Your first review takes under a minute.</h2>
            <p className="text-[#8B92A5] text-sm mb-5">No credit card. No install. Just paste code and watch the feedback stream in.</p>
            <ul className="space-y-2 text-sm text-[#8B92A5]">
              {[
                'Free guest reviews, no account needed',
                'Full review history once you sign up',
                'Works with JavaScript, TypeScript, Python, Java, C++',
              ].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#5FBD8A] font-bold">✓</span>{t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#1E2330] border border-[#2A2F3D] rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-1">Start reviewing</h3>
            <p className="text-xs text-[#8B92A5] mb-5">Sign up or continue as a guest.</p>
            <button
              onClick={() => navigate('/register')}
              className="w-full mb-2.5 py-2.5 rounded-md text-sm font-medium bg-white text-[#14171E] hover:bg-[#EEE] transition">
              Continue with Google
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full mb-2.5 py-2.5 rounded-md text-sm font-medium border border-[#2A2F3D] hover:border-[#5B6274] transition">
              Continue with email
            </button>
            <button
              onClick={() => navigate('/editor')}
              className="block w-full text-center text-xs text-[#8B92A5] hover:text-white transition mt-3">
              Continue as guest →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#20242F] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <p className="text-xs text-[#5B6274]">© 2026 codereview.ai — built by Mohd Faizan</p>
          <div className="flex gap-6 text-xs text-[#8B92A5]">
            <a href="https://github.com/mohdfaizan091/ai-code-review" target="_blank" rel="noreferrer" className="hover:text-white transition">GitHub</a>
            <a href="https://www.linkedin.com/in/mohd-faizan-27270732a/" target="_blank" rel="noreferrer" className="hover:text-white transition">LinkedIn</a>
            <a href="https://ai-code-review-olive.vercel.app" target="_blank" rel="noreferrer" className="hover:text-white transition">Live demo</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;