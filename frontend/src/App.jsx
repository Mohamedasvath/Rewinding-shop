import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layouts/Navbar"

import Home from "./pages/Home";
import ServiceRequestForm from "./components/Request form/ServiceRequestForm";
import TrackService from "./components/track/TrackService";
import AboutSection from "./components/about/Aboutsection";
// import Track from "./pages/Track";
// import AdminLogin from "./pages/AdminLogin";
// import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>

      {/* Global Layout */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
       <Route path="/request" element={<ServiceRequestForm />} /> 
        <Route path="/track" element={<TrackService />} /> 
         <Route path="/about" element={<AboutSection />} />
        {/* <Route path="/dashboard" element={<Dashboard />} />  */}
      </Routes>

    </BrowserRouter>
  );
}
