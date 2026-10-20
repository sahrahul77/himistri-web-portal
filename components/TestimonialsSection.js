import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Star, Quote, ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

export default function TestimonialsSection() {
  const [openFaq, setOpenFaq] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const unsubTestimonials = onValue(ref(rtdb, 'testimonials'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      }
      setTestimonials(list);
    });

    const unsubFaqs = onValue(ref(rtdb, 'faqs'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      }
      setFaqs(list);
    });

    return () => {
      unsubTestimonials();
      unsubFaqs();
    };
  }, []);

  return (
    <div className="space-y-12 my-12">
      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <div>
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-black uppercase text-redPrimary tracking-wider">Customer Experience</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1">Loved by 10,000+ Sikkim Residents</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real ratings and feedback from customers in Gangtok, Deorali & Singtam</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ y: -4 }}
                className="web-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-amber-400">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-redPrimary/20" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">"{t.text}"</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center text-xs">
                  <div>
                    <strong className="block font-bold text-slate-900 dark:text-white">{t.name}</strong>
                    <span className="text-[11px] text-slate-500">{t.location}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-redPrimary/10 text-redPrimary font-bold text-[10px]">{t.service || 'Verified Customer'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Accordion Section */}
      {faqs.length > 0 && (
        <div className="web-card max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-neutral-800 pb-3">
            <HelpCircle className="w-5 h-5 text-redPrimary" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 text-left text-xs font-bold flex justify-between items-center bg-slate-50 dark:bg-neutral-800/50 hover:bg-slate-100 dark:hover:bg-neutral-800 transition text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === index ? 'rotate-180 text-redPrimary' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="p-4 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-darkSurface leading-relaxed border-t border-slate-200 dark:border-neutral-800">
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
