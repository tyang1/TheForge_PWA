import logo from './logo.svg';
import './App.css';
import React from 'react';
import Home from './Home';
import About from './About';
import Projects from './Projects';
import Contact from './Contact';
import { Route, Link, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route exact path="/about" element={<About />} />
        <Route exact path="/projects" element={<Projects />} />
        <Route exact path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}

export default App;
