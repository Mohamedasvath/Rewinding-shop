import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Ramesh Kumar",
    role: "Factory Owner",
    text: "Excellent motor rewinding service. My industrial motor works like brand new now.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Sathish Raj",
    role: "Pump Operator",
    text: "Quick delivery and transparent tracking system. Highly professional technicians.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/75.jpg"
  },
  {
    name: "Arun Prakash",
    role: "Engineer",
    text: "Very reliable workshop. They diagnosed the issue perfectly and fixed it fast.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/45.jpg"
  }
];

export default function TestimonialsSlider() {
  const [index, setIndex] = useState(0);

  const next = () =>
    setIndex((prev) => (prev + 1) % testimonials.length);

  const prev = () =>
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  /* Auto slide */
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-[#f8fbff] to-white">

      {/* Heading */}
      <div className="text-center mb-14 px-6">
        <h2 className="text-4xl font-bold">What Our Customers Say</h2>
        <p className="text-gray-600 mt-3">
          Real feedback from our satisfied motor service clients
        </p>
      </div>

      {/* Slider */}
      <div className="relative max-w-3xl mx-auto px-6">

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-10 text-center border"
          >
            {/* Avatar */}
            <img
              src={testimonials[index].image}
              alt=""
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border"
            />

            {/* Name */}
            <h3 className="text-xl font-semibold">
              {testimonials[index].name}
            </h3>

            <p className="text-sm text-gray-500 mb-3">
              {testimonials[index].role}
            </p>

            {/* Stars */}
            <div className="flex justify-center mb-4">
              {Array.from({ length: testimonials[index].rating }).map(
                (_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400"/>
                )
              )}
            </div>

            {/* Review */}
            <p className="text-gray-600 italic">
              "{testimonials[index].text}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow p-3 rounded-full hover:scale-110 transition"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow p-3 rounded-full hover:scale-110 transition"
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
