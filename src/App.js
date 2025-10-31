import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Host from "./Host";
import Vote from "./Vote";
import Display from "./Display";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{padding:10}}>
        <Link to="/host" style={{marginRight:10}}>Host</Link>
        <Link to="/vote" style={{marginRight:10}}>Vote</Link>
        <Link to="/display">Display</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Host />} />
        <Route path="/host" element={<Host />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/display" element={<Display />} />
      </Routes>
    </BrowserRouter>
  );
}
