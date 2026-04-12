import { useState, useEffect } from 'react';
import './Typewriter.css';

const STACK = ['Kotlin', 'Swift', 'Node', 'TypeScript', 'Kubernetes', 'AWS', 'GCP', 'React Native', 'Firebase', 'MongoDB'];

const TYPE_SPEED = 80;
const DELETE_SPEED = 50;
const PAUSE_AFTER_TYPE = 1400;
const PAUSE_AFTER_DELETE = 300;

export default function Typewriter() {
  const [displayed, setDisplayed] = useState('');
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = STACK[index];

    if (!deleting && displayed === word) {
      const t = setTimeout(() => setDeleting(true), PAUSE_AFTER_TYPE);
      return () => clearTimeout(t);
    }

    if (deleting && displayed === '') {
      const t = setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % STACK.length);
      }, PAUSE_AFTER_DELETE);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setDisplayed(deleting ? word.slice(0, displayed.length - 1) : word.slice(0, displayed.length + 1));
    }, deleting ? DELETE_SPEED : TYPE_SPEED);

    return () => clearTimeout(t);
  }, [displayed, deleting, index]);

  return (
    <span className="typewriter">
      <span className="typewriter-prompt" aria-hidden="true">~/stack</span>
      <span className="typewriter-separator" aria-hidden="true"> — </span>
      <span className="typewriter-text" aria-live="polite">{displayed}</span>
      <span className="typewriter-cursor" aria-hidden="true" />
    </span>
  );
}
