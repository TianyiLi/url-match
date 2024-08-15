import { useCallback, useState } from 'react';
import { detectNewline } from 'detect-newline';
export function GenBack() {
  const [state, setState] = useState('');
  const open = useCallback(() => {
    const list = state.split(detectNewline(state) ?? '\n');
    list.forEach((item) => {
      chrome.tabs.create({
        url: item,
      });
    });
  }, [state]);
  return (
    <div>
      <button onClick={open}>open</button>
      <input placeholder='host: optional' />
      <textarea onChange={(e) => setState(e.target.value)} />
    </div>
  );
}
