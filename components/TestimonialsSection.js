import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Nisha Kumari',
    location: 'Upper Syari, Gangtok',
    rating: 5,
    text: 'Booked a plumber for pipe leak repair. The mistri arrived within 25 minutes, fixed the issue cleanly, and charged exact transparent rate. Highly recommended in Gangtok!',
    service: 'Plumber Service'
  },
  {
    id: 2,
    name: 'Passang Lepcha',
    location: 'Deorali-Bazar, Sikkim',
    rating: 5,
    text: 'Great platform! Home tutor assigned for my child was background verified and very professional. Live order status tracking on website worked smoothly.',
    service: 'Home Tutor'
  },
  {
    id: 3,
    name: 'Karma Bhutia',
    location: 'Singtam, Sikkim',
    rating: 5,
    text: 'Doorstep barber service was clean, polite, and punctual. I paid via COD upon completion. Best technical manpower app in Sikkim.',
    service: 'Barber & Grooming'
  }
];

const FAQS = [
  {
    q: 'How fast does a HiMistri craftsman arrive at my doorstep in Gangtok?',
    a: 'HiMistri dispatches verified local mistris immediately upon order confirmation. Average arrival time across Upper Syari, Deorali, and Gangtok is 20-30 minutes.'
  },
  {
    q: 'Are all service partners background verified?',
    a: 'Yes! 100% of craftsmen, plumbers, electricians, tutors, and cleaners registered on HiMistri undergo ID verification and skill evaluation in Sikkim.'
  },
  {
    q: 'What payment methods are supported?',
    a: 'You can pay via Cash on Service (COD), Online UPI / QR Code, or Credit/Debit Cards after the service work is completed.'
  },
  {
    q: 'What is the order cancellation policy?',
    a: 'You can cancel any service order free of charge within 1 minute of placing it. After 1 minute, standard cancellation rules apply.'
  }
];

export default function TestimonialsSection() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="space-y-12 my-12">
      {/* Testimonials Section */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-black uppercase text-redPrimary tracking-wider">Customer Experience</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">Loved by 10,000+ Sikkim Residents</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real ratings and feedback from customers in Gangtok, Deorali & Singtam</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ y: -4 }}
              className="web-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-redPrimary/20" />
                </div>
                <p className="text-xs text-slate-300 dark:text-slate-300 leading-relaxed italic mb-4">"{t.text}"</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center text-xs">
                <div>
                  <strong className="block font-bold text-slate-900 dark:text-white">{t.name}</strong>
                  <span className="text-[11px] text-slate-500">{t.location}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-redPrimary/10 text-redPrimary font-bold text-[10px]">{t.service}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="web-card max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
          <HelpCircle className="w-5 h-5 text-redPrimary" />
          <h3 className="text-lg font-black">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <div key={index} className="border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-4 text-left text-xs font-bold flex justify-between items-center bg-slate-50 dark:bg-neutral-800/50 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === index ? 'rotate-180 text-redPrimary' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="p-4 text-xs text-slate-400 bg-white dark:bg-darkSurface leading-relaxed border-t border-slate-200 dark:border-neutral-800">
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
