import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Star, Quote, ChevronDown, HelpCircle, ChevronLeft, ChevronRight, MessageSquareQuote } from 'lucide-react';

export default function TestimonialsSection() {
  const [openFaq, setOpenFaq] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [testSliderIdx, setTestSliderIdx] = useState(0);

  // Robust Snapshot Parser
  const parseFirebaseSnapshot = (snapshot) => {
    const list = [];
    if (snapshot && snapshot.exists()) {
      const val = snapshot.val();
      if (Array.isArray(val)) {
        val.forEach((item, index) => {
          if (item) list.push({ id: item.id || index.toString(), ...item });
        });
      } else if (typeof val === 'object' && val !== null) {
        Object.keys(val).forEach((key) => {
          if (val[key]) {
            list.push({ id: key, ...val[key] });
          }
        });
      }
    }
    return list;
  };

  useEffect(() => {
    const unsubTestimonials = onValue(ref(rtdb, 'testimonials'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setTestimonials(list);
    });

    const unsubFaqs = onValue(ref(rtdb, 'faqs'), (snapshot) => {
      const list = parseFirebaseSnapshot(snapshot);
      setFaqs(list);
    });

    return () => { unsubTestimonials(); unsubFaqs(); };
  }, []);

  // Compute 3 visible testimonials for slider when count >= 4
  const isSliderMode = testimonials.length >= 4;
  const visibleTestimonials = isSliderMode
    ? [0, 1, 2].map(i => testimonials[(testSliderIdx + i) % testimonials.length]).filter(Boolean)
    : testimonials;

  return (
    <div className="space-y-16 my-16">
      {/* Testimonials / Customer & Service Feedback Section */}
      {testimonials.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <span className="text-xs font-black uppercase text-redPrimary tracking-wider flex items-center gap-1.5">
                <MessageSquareQuote className="w-4 h-4 text-redPrimary" /> Customer Feedback & Service Reviews ({testimonials.length})
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-white">Customer Feedback & Service Reviews</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real ratings and service feedback submitted by customers in Gangtok, Deorali & Singtam</p>
            </div>

            {/* Next / Prev Slider Buttons (Visible when 4 or more testimonials exist) */}
            {isSliderMode && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setTestSliderIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 hover:border-redPrimary text-slate-800 dark:text-white transition shadow-sm"
                  title="Previous Feedback"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-black text-slate-500 dark:text-slate-400 px-1">
                  {testSliderIdx + 1} / {testimonials.length}
                </span>

                <button
                  type="button"
                  onClick={() => setTestSliderIdx((prev) => (prev + 1) % testimonials.length)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 hover:border-redPrimary text-slate-800 dark:text-white transition shadow-sm"
                  title="Next Feedback"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Cards Grid with Framer Motion Slide Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={testSliderIdx}
              initial={{ opacity: 0, x: isSliderMode ? 20 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSliderMode ? -20 : 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {visibleTestimonials.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ y: -6 }}
                  className="web-card flex flex-col justify-between shadow-xl border-t-4 border-t-redPrimary bg-white dark:bg-neutral-900"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex text-amber-400">
                        {[...Array(parseInt(t.rating) || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-extrabold uppercase bg-redPrimary/10 text-redPrimary px-2.5 py-1 rounded-md">
                        Customer Feedback
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mb-6">"{t.text}"</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center text-xs">
                    <div>
                      <strong className="block font-bold text-slate-900 dark:text-white">{t.name}</strong>
                      <span className="text-[11px] text-slate-500">{t.location}</span>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-emerald-600/10 text-emerald-600 font-extrabold text-[10px] tracking-wide">
                      Service: {t.service || 'Verified Service'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Dot Indicators when in Slider Mode */}
          {isSliderMode && (
            <div className="flex justify-center gap-2 pt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTestSliderIdx(i)}
                  className={`h-2 rounded-full transition-all ${
                    testSliderIdx === i ? 'w-8 bg-redPrimary' : 'w-2 bg-slate-300 dark:bg-neutral-700 hover:bg-redPrimary/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAQ Accordion Section */}
      {faqs.length > 0 && (
        <div className="web-card max-w-3xl mx-auto shadow-2xl bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-neutral-800 pb-4">
            <HelpCircle className="w-7 h-7 text-redPrimary" />
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Frequently Asked Questions ({faqs.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">Everything you need to know about booking with HiMistri</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 text-left text-sm font-bold flex justify-between items-center bg-slate-50 dark:bg-neutral-800/40 hover:bg-slate-100 dark:hover:bg-neutral-700 transition text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-redPrimary' : 'text-slate-400'}`} />
                </button>
                {openFaq === index && (
                  <div className="p-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-darkSurface leading-relaxed border-t border-slate-200 dark:border-neutral-800">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
