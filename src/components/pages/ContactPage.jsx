// src/components/pages/ContactPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image } from '../ui/image';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  MapPin,
  Mail,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

// Local asset uploaded by user (will be transformed to a URL on your side)
const LOCAL_MAP_IMAGE = '/mnt/data/a4001c1a-02ad-43ab-bf8f-cc61f3961c58.png';

// New address and email constants
const OFFICE_ADDRESS_LINE1 = '359, A R Mall, Mota Varachha, Surat';
const OFFICE_ADDRESS_LINE2 = 'Gujarat, India - 394101';
const OFFICE_GOOGLE_MAPS = 'https://www.google.com/maps/search/?api=1&query=359+A+R+Mall+Mota+Varachha+Surat+Gujarat+394101';
const CONTACT_EMAIL = 'sprada2globalexim@gmail.com';

// Google Maps embed URL (no API key required)
const OFFICE_MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(
  `${OFFICE_ADDRESS_LINE1} ${OFFICE_ADDRESS_LINE2}`
)}&output=embed`;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    productInterest: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // simulate API call — replace with actual API in production
      await new Promise(resolve => setTimeout(resolve, 900));
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        country: '',
        productInterest: '',
        message: ''
      });
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      console.error('Form submit error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Our Office',
      primary: OFFICE_ADDRESS_LINE1,
      secondary: OFFICE_ADDRESS_LINE2,
      action: 'Get Directions',
      actionHref: OFFICE_GOOGLE_MAPS,
      actionIcon: ExternalLink
    },
    {
      icon: Mail,
      title: 'Email Us',
      primary: CONTACT_EMAIL,
      secondary: CONTACT_EMAIL,
      action: 'Send Email',
      actionHref: `mailto:${CONTACT_EMAIL}`,
      actionIcon: Mail
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Business',
      primary: '+91 98765 43210',
      secondary: 'Available 24/7 for inquiries',
      action: 'Chat Now',
      actionHref: 'https://wa.me/919876543210',
      actionIcon: MessageSquare
    }
  ];

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 2:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
    { day: 'Emergency Support', hours: '24/7 Available' }
  ];

  const productOptions = [
    'Raw Peanuts',
    'Blanched Peanuts',
    'Roasted Peanuts',
    'Peanut Oil',
    'Peanut Butter',
    'Organic Peanuts',
    'Other Products'
  ];

  return (
    <div className="min-h-screen bg-[#E8E9E2]">
      {/* Page Header with World Map Background */}
      <section
        className="relative py-28 md:py-32 lg:py-40 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(232,233,226,0.95), rgba(232,233,226,0.95)), url('${LOCAL_MAP_IMAGE}')`
        }}
      >
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-[#33504F] mb-3">Contact Us</h1>
            <p className="text-sm sm:text-base md:text-lg text-[#666666] max-w-3xl mx-auto leading-relaxed">
              Ready to partner with India's leading peanut exporter? Get in touch with our team for premium quality products, competitive pricing, and reliable international shipping.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-10 lg:py-16 bg-white">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-[#33504F]">Get In Touch</h2>
            <p className="text-sm sm:text-base text-[#666666] max-w-2xl mx-auto mt-2">Multiple ways to connect with our export specialists</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((info, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.05 }} viewport={{ once: true }}>
                <Card className="h-full bg-[#CFD0C8] hover:shadow-xl transition-all duration-300 border-0 rounded-2xl">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-[#D7B15B] rounded-full flex items-center justify-center mx-auto mb-4">
                      <info.icon className="w-6 h-6 text-[#33504F]" aria-hidden />
                    </div>

                    <h3 className="text-lg font-heading font-semibold text-[#33504F] mb-1">{info.title}</h3>
                    <p className="text-sm text-[#33504F] font-medium">{info.primary}</p>
                    <p className="text-sm text-[#666666] mb-4">{info.secondary}</p>

                    <a href={info.actionHref} target="_blank" rel="noreferrer" className="inline-block">
                      <Button className="bg-[#33504F] text-white hover:bg-[#33504F]/90 font-semibold rounded-lg px-4 py-2 flex items-center gap-2">
                        {info.action}
                        <info.actionIcon className="w-4 h-4" aria-hidden />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Embedded Map */}
      <section className="py-10 lg:py-16 bg-[#E8E9E2]">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Form */}
            <motion.div initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="bg-white rounded-2xl p-6 sm:p-8 shadow">
              <h3 className="text-xl sm:text-2xl font-heading font-semibold text-[#33504F] mb-3">Send Us a Message</h3>
              <p className="text-sm text-[#666666] mb-4">Fill out the form and our export team will reply within 24 hours.</p>

              {isSubmitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="text-lg font-heading font-semibold text-[#33504F] mb-1">Message Sent!</h4>
                  <p className="text-sm text-[#666666]">Thanks — we'll respond within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium text-[#33504F] block mb-1">Full Name *</label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Your full name" />
                    </div>

                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-[#33504F] block mb-1">Email Address *</label>
                      <Input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="your.email@company.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="text-sm font-medium text-[#33504F] block mb-1">Phone Number</label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" />
                    </div>

                    <div>
                      <label htmlFor="company" className="text-sm font-medium text-[#33504F] block mb-1">Company Name</label>
                      <Input id="company" name="company" value={formData.company} onChange={handleInputChange} placeholder="Your company name" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="country" className="text-sm font-medium text-[#33504F] block mb-1">Country *</label>
                      <Input id="country" name="country" value={formData.country} onChange={handleInputChange} required placeholder="Your country" />
                    </div>

                    <div>
                      <label htmlFor="productInterest" className="text-sm font-medium text-[#33504F] block mb-1">Product Interest</label>
                      <select id="productInterest" name="productInterest" value={formData.productInterest} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-[#CFD0C8] rounded">
                        <option value="">Select a product</option>
                        {productOptions.map((p, i) => <option key={i} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="text-sm font-medium text-[#33504F] block mb-1">Message *</label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required rows={5} placeholder="Tell us about quantity, destination, and any specs..." />
                  </div>

                  <div>
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-[#33504F] text-white hover:bg-[#33504F]/90 font-semibold py-3 rounded-lg flex items-center justify-center gap-3">
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-white rounded-full border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>

            {/* Embedded responsive map */}
            <motion.div initial={{ opacity: 0, x: 8 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="rounded-2xl overflow-hidden shadow bg-white">
              <div className="w-full">
                {/* Map container: responsive aspect ratio */}
                <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full">
                  <iframe
                    title="Sprada2Global Office Location"
                    src={OFFICE_MAP_EMBED}
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>

                {/* Small overlay card with location text & button */}
                <div className="p-5">
                  <div className="bg-white/95 rounded-xl p-4 max-w-md mx-auto text-center shadow">
                    <MapPin className="w-10 h-10 text-[#D7B15B] mx-auto mb-3" />
                    <h4 className="text-lg font-heading font-semibold text-[#33504F] mb-1">Our Location</h4>
                    <p className="text-sm text-[#666666] mb-4">{OFFICE_ADDRESS_LINE1}<br />{OFFICE_ADDRESS_LINE2}</p>
                    <div className="flex gap-3 justify-center">
                      <a href={OFFICE_GOOGLE_MAPS} target="_blank" rel="noreferrer">
                        <Button className="bg-[#D7B15B] text-[#33504F]">Open in Maps <ExternalLink className="w-4 h-4 ml-2" /></Button>
                      </a>
                      <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block">
                        <Button className="bg-[#33504F] text-white">Email Us</Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hours */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-heading font-semibold text-[#33504F]">Business Hours</h2>
            <div className="w-16 h-1 bg-[#D7B15B] mx-auto my-4" />
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="bg-[#CFD0C8] rounded-2xl">
              <CardContent className="p-4 sm:p-6">
                {businessHours.map((s, i) => (
                  <div key={i} className={`flex items-center justify-between py-3 ${i !== businessHours.length - 1 ? 'border-b border-white/30' : ''}`}>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[#D7B15B]" />
                      <span className="text-sm lg:text-base font-medium text-[#33504F]">{s.day}</span>
                    </div>
                    <span className="text-sm lg:text-base text-[#666666]">{s.hours}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Certifications (unchanged) */}
      <section className="py-8 lg:py-12 bg-[#E8E9E2]">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-2xl font-heading font-semibold text-[#33504F]">Our Certifications & Compliance</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[ /* placeholder certs kept as-is; replace with real list if needed */ ].map((c, i) => (
              <div key={i} className="bg-white rounded-lg p-3 flex flex-col items-center text-center hover:shadow transition-shadow">
                <div className="w-14 h-14 bg-slate-100 rounded mb-2" />
                <div className="text-sm font-semibold text-[#33504F]">Certification</div>
                <div className="text-xs text-[#666666]">Details</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 lg:py-14 bg-[#33504F] text-white">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-heading font-semibold mb-3">Ready to Start Your Export Journey?</h2>
            <p className="text-sm sm:text-base lg:text-lg max-w-3xl mx-auto mb-6 text-white/90">Join satisfied customers worldwide who trust SPRADA2GLOBAL EXIM for premium peanuts and service.</p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center">
              <Button className="bg-[#D7B15B] text-[#33504F] px-6 py-2 rounded font-semibold">Request Quote</Button>
              <Button variant="outline" className="border-2 border-white text-white px-6 py-2 rounded font-semibold">Download Catalog</Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
