
// src/pages/ServicesPage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Image } from '../ui/image';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Package,
  Globe,
  Users,
  Search,
  Target,
  Shield,
  FileText,
  Truck,
  Clock,
  Award,
  Headphones,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

const ServicesPage = () => {
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const hasMarkedHeader = !!document.querySelector('[data-global-header]');
    const hasMarkedFooter = !!document.querySelector('[data-global-footer]');
    const hasHeaderElement = !!document.querySelector('header');
    const hasFooterElement = !!document.querySelector('footer');
    setShowHeader(!(hasMarkedHeader || hasHeaderElement));
    setShowFooter(!(hasMarkedFooter || hasFooterElement));
  }, []);

  const mainServices = [
    { icon: Package, title: "Export Services", description: "Comprehensive export solutions", features: ["Direct sourcing","Quality testing","Export docs","Logistics"] },
    { icon: Globe, title: "Import Services", description: "Trusted import solutions", features: ["Global suppliers","Compliance support","Inspection","Warehousing"] },
    { icon: Users, title: "Supplier Network", description: "Verified suppliers and farmers", features: ["Verified partnerships","Sustainable sourcing","Traceability"] }
  ];

  const workflowSteps = [
    { step: "01", title: "Consultation", description: "Understand requirements", icon: Search },
    { step: "02", title: "Sourcing", description: "Procurement & QC", icon: Target },
    { step: "03", title: "Quality Assurance", description: "Testing & certification", icon: Shield },
    { step: "04", title: "Processing", description: "Packing for export", icon: Package },
    { step: "05", title: "Documentation", description: "Export documents & compliance", icon: FileText },
    { step: "06", title: "Logistics", description: "Shipping & delivery", icon: Truck }
  ];

  const serviceBenefits = [
    { icon: Clock, title: "Timely Delivery", description: "Reliable logistics and tracking" },
    { icon: Award, title: "Certified Quality", description: "International certifications" },
    { icon: Users, title: "Expert Team", description: "Experienced industry professionals" },
    { icon: Globe, title: "Global Reach", description: "Serving 50+ countries" },
    { icon: TrendingUp, title: "Competitive Pricing", description: "Optimized sourcing & pricing" },
    { icon: Headphones, title: "24/7 Support", description: "Round-the-clock support" }
  ];

  const certifications = [
    { name: "IEC", description: "Import Export Code" },
    { name: "MSME", description: "MSME Registration" },
    { name: "RCMC", description: "Registration Cum Membership" },
    { name: "FSSAI", description: "Food Safety Authority" },
    { name: "GST", description: "Goods & Services Tax" },
    { name: "ISO", description: "International Standardization" }
  ];

  return (
    <div className="min-h-screen bg-[#E8E9E2]">
      {showHeader && <div data-global-header><Header /></div>}

      <section
        className="relative py-24 md:py-32 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(51,80,79,0.7), rgba(51,80,79,0.7)), url('https://static.wixstatic.com/media/a92b5b_0639b7c270564484ae1c9783c04496ad~mv2.png')"
        }}
      >
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold"
          >
            Our Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-3 text-sm sm:text-base md:text-lg max-w-3xl mx-auto"
          >
            Comprehensive agricultural trade solutions connecting premium Indian produce with global markets.
          </motion.p>
        </div>
      </section>

      <section className="py-12 lg:py-20">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-[#33504F]">Core Services</h2>
            <p className="text-sm sm:text-base text-[#666666] mt-2">Specialized solutions for global agricultural trade.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {mainServices.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              >
                <Card className="h-full bg-white shadow-lg rounded-2xl">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-[#D7B15B]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <s.icon className="w-7 h-7 text-[#D7B15B]" />
                      </div>
                      <h3 className="text-lg font-heading font-semibold text-[#33504F]">{s.title}</h3>
                      <p className="text-sm text-[#666666] mt-2">{s.description}</p>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {(s.features ?? []).map((f, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-[#666666]">
                          <CheckCircle className="w-4 h-4 text-[#D7B15B] mt-1 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full bg-[#33504F] text-white py-2 rounded-lg">Learn More</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-12 lg:py-20 bg-[#CFD0C8]">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-heading font-semibold text-[#33504F]">Our Workflow</h3>
            <p className="text-sm text-[#666666] mt-2">Systematic approach to ensure quality, compliance, and timely delivery.</p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-[#D7B15B] transform -translate-y-1/2 z-0" />
            <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
              {workflowSteps.map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.04 }}
                  className="text-center"
                >
                  <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg border-4 border-[#D7B15B]">
                    <w.icon className="w-8 h-8 text-[#33504F]" />
                  </div>
                  <div className="bg-[#D7B15B] text-white rounded-full w-8 h-8 mx-auto mb-3 flex items-center justify-center text-sm font-bold">{w.step}</div>
                  <h4 className="text-sm font-heading font-semibold text-[#33504F] mb-1">{w.title}</h4>
                  <p className="text-xs text-[#666666]">{w.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 lg:py-20">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-heading font-semibold text-[#33504F]">Why Choose Our Services</h3>
            <p className="text-sm text-[#666666] mt-2">Advantages of partnering with us for agricultural trade.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceBenefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
              >
                <Card className="text-center p-6">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-[#D7B15B]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <b.icon className="w-7 h-7 text-[#D7B15B]" />
                    </div>
                    <h4 className="text-lg font-heading font-semibold text-[#33504F] mb-2">{b.title}</h4>
                    <p className="text-sm text-[#666666]">{b.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & CTA */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12 text-center">
          <h4 className="text-lg font-heading font-semibold text-[#33504F] mb-4">Certified & Compliant</h4>
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            {certifications.map((c, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-[#D7B15B]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-8 h-8 text-[#D7B15B]" />
                </div>
                <div className="text-sm font-semibold text-[#33504F]">{c.name}</div>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-[#666666] mb-6">Contact us to discuss how our services can help you succeed in global markets.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-[#D7B15B] text-[#33504F] px-6 py-2 rounded font-semibold">Get Service Quote</Button>
              <Button variant="outline" className="border-2 border-[#33504F] text-[#33504F] px-6 py-2 rounded font-semibold">Schedule Consultation</Button>
            </div>
          </div>
        </div>
      </section>

      {showFooter && <div data-global-footer><Footer /></div>}
    </div>
  );
};

export default ServicesPage;
