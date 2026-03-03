import React from 'react'
import { Wrench,Cog,Hammer,Bolt } from 'lucide-react'

const Ourservice = () => {
  return (
    <div>
      <section className="py-16 bg-white text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Services</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          We provide complete motor rewinding, inspection, and repair services with professional technicians.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex flex-col items-center gap-3 p-6 border rounded-xl hover:shadow-lg transition w-40">
            <Wrench size={32} className="text-blue-600"/>
            <span className="font-semibold">Motor Rewinding</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 border rounded-xl hover:shadow-lg transition w-40">
            <Cog size={32} className="text-blue-600"/>
            <span className="font-semibold">Inspection</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 border rounded-xl hover:shadow-lg transition w-40">
            <Hammer size={32} className="text-blue-600"/>
            <span className="font-semibold">Repair Work</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-6 border rounded-xl hover:shadow-lg transition w-40">
            <Bolt size={32} className="text-blue-600"/>
            <span className="font-semibold">Quality Testing</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Ourservice
