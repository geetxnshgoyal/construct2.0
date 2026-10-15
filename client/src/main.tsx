import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// Epic Console Banner 🔥
console.log(
  '%c' +
  '\n' +
  '   ██████╗  ██████╗ ███╗   ██╗███████╗████████╗██████╗ ██╗   ██╗ ██████╗████████╗\n' +
  '  ██╔════╝ ██╔═══██╗████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██║   ██║██╔════╝╚══██╔══╝\n' +
  '  ██║      ██║   ██║██╔██╗ ██║███████╗   ██║   ██████╔╝██║   ██║██║        ██║   \n' +
  '  ██║      ██║   ██║██║╚██╗██║╚════██║   ██║   ██╔══██╗██║   ██║██║        ██║   \n' +
  '  ╚██████╗ ╚██████╔╝██║ ╚████║███████║   ██║   ██║  ██║╚██████╔╝╚██████╗   ██║   \n' +
  '   ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝   ╚═╝   \n' +
  '                                    2 . 0                                        \n',
  'color: #22d3ee; font-weight: bold; font-family: monospace;'
);

console.log(
  '%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  'color: #22d3ee;'
);

console.log(
  '%c⚡ Co%cNST%cruct %c2.0 ⚡',
  'color: #22d3ee; font-size: 28px; font-weight: bold; text-shadow: 0 0 10px #22d3ee;',
  'color: #fbbf24; font-size: 28px; font-weight: bold; text-shadow: 0 0 10px #fbbf24;',
  'color: #22d3ee; font-size: 28px; font-weight: bold; text-shadow: 0 0 10px #22d3ee;',
  'color: #a78bfa; font-size: 24px; font-weight: bold;'
);

console.log(
  '%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
  'color: #22d3ee;'
);

console.log(
  '%c🏗️  Building the Future of Innovation\n\n' +
  '%c🚀 Status: %cLIVE & READY%c\n' +
  '%c💡 Tech: %cReact + Vite + TypeScript, powered by Replit%c\n' +
  '%c🌐 Web: %chttps://nstconstruct.xyz%c\n' +
  '%c⚙️  Mode: %c' + (import.meta.env.DEV ? 'DEVELOPMENT 🔧' : 'PRODUCTION 🚀') + '%c',
  'color: #fbbf24; font-size: 18px; font-weight: bold;',
  'color: #a78bfa; font-size: 14px;', 'color: #10b981; font-weight: bold; background: #065f46; padding: 2px 8px; border-radius: 3px;', '',
  'color: #a78bfa; font-size: 14px;', 'color: #22d3ee; font-weight: bold;', '',
  'color: #a78bfa; font-size: 14px;', 'color: #34d399; font-weight: bold; text-decoration: underline;', '',
  'color: #a78bfa; font-size: 14px;', 'color: #fbbf24; font-weight: bold;', ''
);

console.log(
  '%c\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  'color: #374151;'
);

console.log(
  '%c🔥 Want to join the team? Check out opportunities!\n' +
  '%c📧 Contact: %cnoreply@nstconstruct.xyz%c\n' +
  '%c⭐ Star: %cgithub.com/geetxnshgoyal/construct2.0%c',
  'color: #f97316; font-size: 14px; font-weight: bold;',
  'color: #a78bfa; font-size: 13px;', 'color: #34d399; font-weight: bold;', '',
  'color: #a78bfa; font-size: 13px;', 'color: #fbbf24; font-weight: bold;', ''
);

console.log(
  '%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
  'color: #374151;'
);
// Only load analytics in production (disabled to prevent MIME type errors)
// const isDev = import.meta.env.DEV;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
