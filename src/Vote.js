import React, { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export default function Vote() {
  const [current, setCurrent] = useState({ text: "Waiting for question..." });
  const [rating, setRating] = useState(0);
  const [submittedForText, setSubmittedForText] = useState(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    // load current text
    fetch("/api/currentText").then(r=>r.json()).then(data=>{
      setCurrent(data || {});
      const voted = localStorage.getItem(`voted_${data?.id}`);
      if (voted) setSubmittedForText(data.id);
    });

    // negotiate SignalR connection
    fetch("/api/negotiate", { method: "POST" }).then(r=>r.json()).then(info=>{
      // info typically contains: url, accessToken
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(info.url, { accessTokenFactory: () => info.accessToken })
        .withAutomaticReconnect()
        .build();

      connection.on("newText", (data) => {
        setCurrent(data);
        setRating(0);
      });

      connection.start().catch(err => console.error(err));
      connectionRef.current = connection;
    }).catch(err=>console.error(err));

    return () => {
      if (connectionRef.current) connectionRef.current.stop().catch(()=>{});
    };
  }, []);

  async function submitVote(value) {
    if (!current?.id) return alert("No active text");
    if (localStorage.getItem(`voted_${current.id}`)) {
      return alert("You already voted for this text");
    }
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ textId: current.id, rating: value })
    });
    if (res.ok) {
      localStorage.setItem(`voted_${current.id}`, "1");
      setSubmittedForText(current.id);
      setRating(value);
      alert("Thanks for voting!");
    } else {
      alert("Error sending vote");
    }
  }

  return (
    <div style={{padding:20, textAlign:"center"}}>
      <h2>{current?.text || "Waiting for question..."}</h2>
      <div style={{fontSize:40}}>
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={()=>submitVote(n)} style={{fontSize:36, margin:6}}>
            {n <= rating ? "★" : "☆"} {n}
          </button>
        ))}
      </div>
      {submittedForText ? <p style={{color:"green"}}>You voted for this text.</p> : <p>Tap star to vote (1-5)</p>}
    </div>
  );
}
