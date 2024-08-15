import { useState } from 'react';
import { GenBack } from './components/genback';
import { RegexPage } from './components/regexPage';

export default function App() {
  const [fn, setFn] = useState('regex' as 'genback' | 'regex');

  return (
    <div>
      <button onClick={() => setFn('genback')} disabled={fn === 'genback'}>
        Genback
      </button>
      <button onClick={() => setFn('regex')} disabled={fn === 'regex'}>
        Regex
      </button>

      {fn === 'genback' && <GenBack />}
      {fn === 'regex' && <RegexPage />}
    </div>
  );
}
