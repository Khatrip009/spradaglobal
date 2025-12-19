// src/components/pages/ContactPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image } from '../ui/image';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import heroimage from "../../assets/contact-hero.jpg";
import {
  MapPin,
  Mail,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

// API helper
import { apiPost } from "../../lib/api";
import ContactHeroSection from '../ContactHeroSection';
import GetinTouchSection from '../GetinTouchSection';
import WorkingHours from './WorkingHoursSection';
import CertificateSection from '../CertificateSection';
import CTASection from '../CTASection';

// Local asset uploaded by user (currently unused, keep if you plan to show a static map image somewhere)
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

const ContactPage = ({ onRequestQuote }) => {
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
  const [submitError, setSubmitError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Map frontend fields to backend expected payload
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.company || null,
        country: formData.country || null,
        product_interest: formData.productInterest || null,
        message: formData.message || null
      };

      const res = await apiPost("/api/leads", payload);

      if (!res || res.ok !== true) {
        // backend returns { ok:false, error: '...' } on failure
        throw new Error(res?.error || "Failed to submit lead");
      }

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

      // hide success message after a while
      setTimeout(() => setIsSubmitted(false), 4000);
    } catch (err) {
      console.error("[ContactPage] lead submit error", err);
      setSubmitError(err.message || "Something went wrong. Please try again.");
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
    { day: 'Saturday', hours: '9:00 AM - 1:00 PM' },
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
   <div className="bg-[#E8E9E2]">



      {/* Page Header with World Map Background */}
      <ContactHeroSection/>
      
      {/* Contact Info Cards */}
      <GetinTouchSection/>
      

      {/* Contact Form + Embedded Map */}
<section className="py-10 lg:py-16 bg-[#E8E9E2]">
  <div className="max-w-7xl mx-auto px-6 lg:px-12">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
      
      {/* ================= FORM ================= */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl p-6 sm:p-8 shadow text-left w-full max-w-xl"
      >
        <h3 className="text-xl sm:text-2xl font-heading font-semibold text-[#33504F] mb-3">
          Send Us a Message
        </h3>
        <p className="text-sm text-[#666666] mb-4">
          Fill out the form and our export team will reply within 24 hours.
        </p>

        {submitError && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="py-8"
          >
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
            <h4 className="text-lg font-heading font-semibold text-[#33504F] mb-1">
              Message Sent!
            </h4>
            <p className="text-sm text-[#666666]">
              Thanks — we'll respond within 24 hours.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#33504F] block mb-1">
                  Full Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#33504F] block mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#33504F] block mb-1">
                  Phone Number
                </label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 72010 65465"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#33504F] block mb-1">
                  Company Name
                </label>
                <Input
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Your company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#33504F] block mb-1">
                  Country *
                </label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  placeholder="Your country"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#33504F] block mb-1">
                  Product Interest
                </label>
                <select
                  name="productInterest"
                  value={formData.productInterest}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border-2 border-[#CFD0C8] rounded"
                >
                  <option value="">Select a product</option>
                  {productOptions.map((p, i) => (
                    <option key={i} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#33504F] block mb-1">
                Message *
              </label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                placeholder="Tell us about quantity, destination, and any specs..."
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#33504F] text-white py-3 rounded-lg flex items-center justify-center gap-3"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}
      </motion.div>

      {/* ================= MAP ================= */}
      <motion.div
        initial={{ opacity: 0, x: 8 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl overflow-hidden shadow w-full"
      >
        <div className="relative aspect-[16/9] w-full">
          <iframe
            title="Sprada Office Location"
            src={OFFICE_MAP_EMBED}
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        <div className="p-6 text-center">
          <MapPin className="w-8 h-8 text-[#D7B15B] mx-auto mb-2" />
          <h4 className="font-semibold text-[#33504F]">Our Location</h4>
          <p className="text-sm text-[#666666] mt-1">
            {OFFICE_ADDRESS_LINE1}<br />{OFFICE_ADDRESS_LINE2}
          </p>
        </div>
      </motion.div>

    </div>
  </div>
</section>

      {/* Hours */}
      <WorkingHours/>
      
      {/* Certifications (unchanged placeholder) */}
      <CertificateSection/>
      

      {/* CTA */}
      <CTASection onRequestQuote={onRequestQuote} />

      
    </div>
  );
};

export default ContactPage;
