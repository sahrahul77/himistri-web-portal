import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Star, Quote, ChevronDown, HelpCircle } from 'lucide-react';

const DEFAULT_TESTIMONIALS = [
  { id: 't1', name: 'Passang Bhutia', location: 'Upper Syari, Gangtok', text: 'Booked a plumber for pipe leak repair. The mistri arrived within 25 minutes, fixed the issue cleanly, and charged exact transparent rate.', rating: 5, service: 'Plumber Service' },
  { id: 't2', name: 'Karma Lepcha', location: 'Deorali-Bazar, Sikkim', text: 'Great platform! Home tutor assigned for my child was background verified and very professional.', rating: 5, service: 'Home Tutor' },
  { id: 't3', name: 'Mohor Ghosh', location: 'Singtam, Sikkim', text: 'Doorstep barber service was clean, polite, and punctual. I paid via COD upon completion.', rating: 5, service: 'Barber & Grooming' }
];

const DEFAULT_FAQS = [
  { id: 'f1', q: 'How fast does a HiMistri craftsman arrive at my doorstep?', a: 'HiMistri dispatches verified local mistris immediately upon order confirmation. Average arrival time across Gangtok is 20-30 minutes.' },
  { id: 'f2', q: 'Are all service partners background verified?', a: 'Yes! 100% of craftsmen, plumbers, electricians, and cleaners registered on HiMistri undergo strict ID verification and skill tests.' },
  { id: 'f3', q: 'What payment methods are supported?', a: 'You can pay via Cash on Service (COD), Online UPI / QR Code, or Credit/Debit Cards after the service work is completed.' },
  { id: 'f4', q: 'What is the order cancellation policy?', a: 'You can cancel any service order free of charge within 1 minute of placing it on the platform.' }
];

export default function TestimonialsSection() {
  const [openFaq, setOpenFaq] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    const unsubTestimonials = onValue(ref(rtdb, 'testimonials'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setTestimonials(list);
    });

    const unsubFaqs = onValue(ref(rtdb, 'faqs'), (snapshot) => {
      const list = [];
      if (snapshot.exists()) snapshot.forEach((child) => list.push({ id: child.key, ...child.val() }));
      setFaqs(list);
    });

    return () => { unsubTestimonials(); unsubFaqs(); };
  }, []);

  // Combine default items with all new items added in Firebase Database
  const displayTestimonials = [...DEFAULT_TESTIMONIALS, ...testimonials];
  const displayFaqs = [...DEFAULT_FAQS, ...faqs];

  return (
    <div className="space-y-16 my-16">
      {/* Testimonials Section */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-black uppercase text-redPrimary tracking-wider">Customer Experience</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">Loved by 10,000+ Sikkim Residents</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Real ratings and feedback from customers in Gangtok, Deorali & Singtam</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayTestimonials.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ y: -6 }}
              className="web-card flex flex-col justify-between shadow-xl border-t-4 border-t-redPrimary"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(parseInt(t.rating) || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-redPrimary/20" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mb-6">"{t.text}"</p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center text-xs">
                <div>
                  <strong className="block font-bold text-slate-900 dark:text-white">{t.name}</strong>
                  <span className="text-[11px] text-slate-500">{t.location}</span>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-redPrimary/10 text-redPrimary font-bold text-[10px] tracking-wide">{t.service || 'Verified Customer'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="web-card max-w-3xl mx-auto shadow-2xl">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-neutral-800 pb-4">
          <HelpCircle className="w-7 h-7 text-redPrimary" />
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Everything you need to know about booking with HiMistri</p>
          </div>
        </div>

        <div className="space-y-3">
          {displayFaqs.map((faq, index) => (
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
    </div>
  );
}
