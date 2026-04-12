import './Characters.css';

function StickFigure() {
  return (
    <svg
      viewBox="0 0 16 30"
      width="14"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="8" cy="3.5" r="3" fill="currentColor" stroke="none" />
      {/* Body */}
      <line x1="8" y1="6.5" x2="8" y2="19" />
      {/* Arms */}
      <line className="sf-larm" x1="8" y1="11" x2="2" y2="17" />
      <line className="sf-rarm" x1="8" y1="11" x2="14" y2="17" />
      {/* Legs */}
      <line className="sf-lleg" x1="8" y1="19" x2="4" y2="28" />
      <line className="sf-rleg" x1="8" y1="19" x2="12" y2="28" />
    </svg>
  );
}

function Dog() {
  return (
    <svg
      viewBox="0 0 26 16"
      width="26"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      {/* Body */}
      <line x1="6" y1="6" x2="20" y2="6" />
      {/* Head */}
      <circle cx="3" cy="4" r="3" fill="currentColor" stroke="none" />
      {/* Ear */}
      <line x1="1.5" y1="1.5" x2="4.5" y2="0" />
      {/* Tail */}
      <line className="dog-tail" x1="20" y1="6" x2="24" y2="1" />
      {/* Legs */}
      <line className="dog-fl" x1="8"  y1="6" x2="6"  y2="16" />
      <line className="dog-fr" x1="10" y1="6" x2="12" y2="16" />
      <line className="dog-bl" x1="16" y1="6" x2="14" y2="16" />
      <line className="dog-br" x1="18" y1="6" x2="20" y2="16" />
    </svg>
  );
}

function renderChar(type) {
  if (type === 'dog')    return <Dog />;
  if (type === 'jumper') return <span className="sf-bounce"><StickFigure /></span>;
  if (type === 'runner') return <span className="runner-lean"><StickFigure /></span>;
  return <StickFigure />;
}

// Negative delay = animation starts already mid-way through (spread across screen on load)
const CHARS = [
  { id: 1, type: 'walker', color: '#3f3f46', dur: '20s', delay: '-3s'  },
  { id: 2, type: 'runner', color: '#52525b', dur: '9s',  delay: '-4s'  },
  { id: 3, type: 'dog',    color: '#3f3f46', dur: '13s', delay: '-2s'  },
  { id: 4, type: 'jumper', color: '#52525b', dur: '16s', delay: '-8s'  },
  { id: 5, type: 'waver',  color: '#3f3f46', dur: '17s', delay: '-13s' },
  { id: 6, type: 'walker', color: '#3f3f46', dur: '24s', delay: '-18s' },
  { id: 7, type: 'dog',    color: '#3f3f46', dur: '19s', delay: '-7s'  },
];

export default function Characters() {
  return (
    <div className="char-stage" aria-hidden="true">
      {CHARS.map(({ id, type, color, dur, delay }) => (
        <div
          key={id}
          className={`char-wrap char-${type}`}
          style={{ '--dur': dur, '--delay': delay, color }}
        >
          {renderChar(type)}
        </div>
      ))}
    </div>
  );
}
