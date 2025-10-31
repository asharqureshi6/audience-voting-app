import React, { useState, useEffect } from "react";
import QRCode from "qrcode.react";

export default function Host() {
  const [text, setText] = useState("");
  const [current, setCurrent] = useState({ text: "Waiting for a question..." });
  const siteBase = window.location.origin;

  async function sendText() {
    if (!text || text.trim()==="") return alert("Type a text first");
    const res = await fetch("/api/setText", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const body = await res.json();
    setCurrent(body);
    setText("");
  }

  useEffect(() => {
    // fetch current text on load
    fetch("/api/currentText").then(r=>r.json()).then(setCurrent).catch(()=>{});
  }, []);

  return (
    <div style={{padding:20}}>
      <h2>Host control</h2>
      <p>Current: <strong>{current?.text || "—"}</strong></p>
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={3} cols={60} />
      <div>
        <button onClick={sendText} style={{marginTop:10}}>Send to audience</button>
      </div>
      <hr />
      <h3>QR code for audience</h3>
      <p>Scan this from phones: <em>{siteBase}/vote</em></p>
      <QRCode value={`${siteBase}/vote`} size={200} />
    </div>
  );
}
