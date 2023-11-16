import { useState } from 'react';

export default function useBoolean() {
  const [state, setState] = useState(false);

  return [
    state,
    {
      on() { setState(true); },
      off() {
        setState(false);
      },
      toggle() { setState(state => !state); }
    }
  ] as const;
}