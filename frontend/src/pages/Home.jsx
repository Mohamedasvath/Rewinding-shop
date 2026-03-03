import React from 'react'
import Hero from "../components/home/Hero"
import Featurecard from '../components/home/Featurecard'
import QuickStats from '../components/home/QuickStats'
import TechnicianSection from "../components/home/technicians/TechnicianSection";
import BeforeAfterSection from '../components/home/BeforeAfterSection';
import TestimonialsSlider from '../components/home/TestimonialsSlider';
import Footer from '../components/home/Footer';
import WorkshopStatus from '../components/home/WorkshopStatus';
import Ourservice from '../components/home/Ourservice';

const Home = () => {
  return (
    <div>
    <Hero/>
     {/* <TechnicianSection/> */}
     {/* <Ourservice/>
     <BeforeAfterSection/>
     <WorkshopStatus/>
     <TestimonialsSlider/>
    <QuickStats/> */}
    <Footer/>
   
    </div>
  )
}

export default Home
