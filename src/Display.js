import React, { useEffect, useState } from "react";

export default function Display() {
  const [results, setResults] = useState(null);

  useEffect(() => {
    async function load() {
      const r = await fetch("/api/results");
      const body = await r.json();
      setResults(body);
    }
    load();

    // poll every 3 seconds for simplicity (you can also subscribe to SignalR)
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{padding:20}}>
      <h2>Live Results</h2>
      {results && results.current ? (
        <>
          <p>Question: <strong>{results.current.text}</strong></p>
          <p>Votes: {results.count}</p>
          <p>Average rating: {results.average ? (results.average.toFixed(2)) : "—"}</p>
        </>
      ) : <p>No active text</p>}
    </div>
  );
}
