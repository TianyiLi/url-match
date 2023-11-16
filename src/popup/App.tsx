import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { match } from 'path-to-regexp';
import useBoolean from './hooks/useBoolean';

export default function App() {
  const [allTabsInfo, setAllTabsInfo] = useState<
    { id: number; url: string; title?: string }[]
  >([]);

  const [refreshInstance, setRefresh] = useState({});

  useEffect(() => {
    chrome.tabs
      .query({
        currentWindow: true,
      })
      .then((tabs) => {
        setAllTabsInfo(
          tabs
            .filter((tab) => Boolean(tab.url))
            .filter((tab) => {
              return tab.url!.startsWith('http');
            })
            .map((tab) => ({ id: tab.id!, url: tab.url!, title: tab.title }))
        );
      });
  }, [refreshInstance]);

  const inputRef = useRef<HTMLInputElement>(null);
  const grepRef = useRef<HTMLInputElement>(null);
  const [urlToggle, setUrlToggle] = useState(false);

  const [addBaseUrl, setAddBaseUrl] = useBoolean()

  useLayoutEffect(() => {
    (async () => {
      const {
        rules = '',
        grep = '',
        urlToggle = false,
      } = await chrome.storage.local.get(['rules', 'grep', 'urlToggle']);
      inputRef.current!.value = rules;
      grepRef.current!.value = grep;
      setUrlToggle(urlToggle);
    })();
  }, []);

  function onToggle() {
    setUrlToggle((toggle) => {
      chrome.storage.local.set({ urlToggle: !toggle });
      return !toggle;
    });
  }

  function onFocus(id: number) {
    chrome.tabs.update(id, { active: true });
  }

  function CopyAll() {
    let tabValue = allTabsInfo.map((tab) => {
      const url = new URL(tab.url);
      return addBaseUrl ? `${url.origin}${url.pathname}` : url.pathname;
    });
    if (inputRef.current && inputRef.current.value) {
      const pickUpToken = grepRef.current?.value ?? '*';
      const urlMatch = match<Record<string, string>>(inputRef.current.value, {
        decode: decodeURIComponent,
      });

      const entry: string[] = [];

      const pickupTokenSet = new Set(pickUpToken.split(','));

      for (let link of tabValue) {
        const _info = urlMatch(link);
        if (!_info) continue;
        const { params } = _info;
        if (pickupTokenSet.has('*')) entry.push(JSON.stringify(params));
        const totalKey = Object.keys(params);
        const prepareKey = totalKey.filter((key) => pickupTokenSet.has(key));
        if (!prepareKey.length) continue;
        if (prepareKey.length === 1) {
          entry.push(params[prepareKey[0]] as string);
          continue;
        }
        const entries = prepareKey.map((key) => [key, params[key]]);
        entry.push(JSON.stringify(Object.fromEntries(entries)));
      }
      tabValue = entry;
      chrome.storage.local.set({
        grep: pickUpToken,
        rules: inputRef.current.value,
      });
    }
    navigator.clipboard.writeText(tabValue.join('\n'));
  }

  return (
    <div>
      <div
        style={{
          padding: '8px 16px',
          border: 'solid 1px black',
          cursor: 'pointer',
        }}
        onClick={() => setRefresh({})}
      >
        Refresh
      </div>
      <div
        style={{
          padding: '8px 16px',
          border: 'solid 1px black',
          cursor: 'pointer',
        }}
      >
        <label htmlFor="toggle-url">url is display?</label>
        <input
          type="checkbox"
          checked={urlToggle}
          id="toggle-url"
          onChange={onToggle}
        />
      </div>
      <div
        style={{
          padding: '8px 16px',
          border: 'solid 1px black',
          cursor: 'pointer',
        }}
      >
        <label htmlFor="toggle-copy-all">copy with host?</label>
        <input
          type="checkbox"
          checked={addBaseUrl}
          id="toggle-copy-all"
          onChange={setAddBaseUrl.toggle}
        />
      </div>
      <div
        style={{
          padding: '8px 16px',
          border: 'solid 1px black',
          cursor: 'pointer',
        }}
        onClick={CopyAll}
      >
        Copy All
      </div>
      <div>
        filter rules
        <input ref={inputRef} placeholder="urlMatch" />
        <input ref={grepRef} placeholder="token pickup, separate by ," />
      </div>
      {allTabsInfo.map((ele) => (
        <div
          style={{ cursor: 'pointer', padding: '8px 0px' }}
          key={ele.id}
          onClick={() => onFocus(ele.id)}
          title={urlToggle ? ele.title ?? ele.url : ele.url}
        >
          {urlToggle ? ele.url : ele.title ?? ele.url}
        </div>
      ))}
    </div>
  );
}
