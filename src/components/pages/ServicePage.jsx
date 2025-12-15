
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
import ServicePageProcess from '../ServicePageProcess';
import CoreServicePage from '../CoreServicePage';
import ServiceHeroSection from '../ServiceHeroSection';
import WhyChooseUsSection from '../WhytoChooseUsServicePage';
import CertificateSection from '../CertificateSection';
import ReviewSection from '../ReviewSection';

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

      {/*Service hero Section*/}
      <ServiceHeroSection/>
           {/* Benefits */}
      <WhyChooseUsSection/>
      {/*Our Services*/}
      <CoreServicePage/>
      {/* Workflow */}
      <ServicePageProcess/>
 
      {/* Certificate Section */}
      <CertificateSection/>
      {/* What our Clients Says */}
      <ReviewSection/>

      {showFooter && <div data-global-footer><Footer /></div>}
    </div>
  );
};



export default ServicesPage;
