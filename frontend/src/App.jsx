import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Auth from './pages/Auth/Auth'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user/auth" element={<Auth role="user" />} />
        <Route path="/provider/auth" element={<Auth role="provider" />} />
      </Routes>
    </Router>
  )
}

export default App
