// A custom hook combining useState + useEffect to fetch data — the pattern the
// video builds toward. The cleanup flag avoids setting state after unmount.
import { useState, useEffect } from 'react';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => { if (active) setData(json); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });

    // cleanup runs when url changes or the component unmounts
    return () => { active = false; };
  }, [url]);

  return { data, loading, error };
}
