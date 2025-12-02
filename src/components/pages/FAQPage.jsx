import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Package,
  Truck,
  FileText,
  ExternalLink,
  Send,
  Users,
  Globe
} from 'lucide-react';

const FAQPage = () => {
  const [activeTab, setActiveTab] = useState('products');

  const faqCategories = [
    { id: 'products', title: 'Products', icon: Package, description: 'Questions about our product range and quality' },
    { id: 'shipping', title: 'Shipping & Logistics', icon: Truck, description: 'Delivery, packaging, and logistics information' },
    { id: 'documentation', title: 'Documentation & Payments', icon: FileText, description: 'Payment terms, documentation, and compliance' }
  ];

  const faqData = {
    products: [
      { question: "What types of peanuts do you export?", answer: "We export various grades... (keep your content here)" },
      { question: "What is the moisture content and oil content of your peanuts?", answer: "Our peanuts maintain a maximum moisture content of 7%..." },
      { question: "Do you provide organic certified products?", answer: "Yes, we offer organic certified peanuts and peanut butter..." },
      { question: "What is the minimum order quantity (MOQ)?", answer: "MOQ varies by product; peanuts typically 20 MT..." },
      { question: "Can you provide product samples?", answer: "Yes — free samples up to 1 kg; dispatched within 2-3 business days." },
      { question: "What quality certifications do you have?", answer: "We hold FSSAI, IEC, RCMC, HACCP audits and ISO systems." }
    ],
    shipping: [
      { question: "Which ports do you ship from?", answer: "We primarily ship from Kandla Port (JNPT) and Mumbai Port (NSICT)..." },
      { question: "What are your standard packaging options?", answer: "25kg / 50kg jute bags, vacuum-sealed bags, custom private label." },
      { question: "How long does shipping take?", answer: "Transit times: USA/Canada 18-25 days, Europe 15-20 days, Middle East 7-12 days, etc." },
      { question: "Do you handle customs clearance?", answer: "Yes — we provide full documentation and work with clearing agents." },
      { question: "What is container loading capacity?", answer: "20ft ~18-20 MT, 40ft ~26-28 MT depending on packing." },
      { question: "Do you provide cargo insurance?", answer: "Yes — typically covering 110% invoice value; cost quoted per shipment." }
    ],
    documentation: [
      { question: "What are your payment terms?", answer: "We offer 30% advance / 70% against documents, LC, or open account for trusted customers." },
      { question: "Which currencies do you accept?", answer: "USD, EUR, GBP, AED and others on request." },
      { question: "What export documentation do you provide?", answer: "Commercial Invoice, Packing List, Bill of Lading, Certificate of Origin, Phytosanitary, QAR." },
      { question: "How do you ensure compliance?", answer: "Quality team keeps updated importing country regulations and issues required certificates." },
      { question: "Do you provide GSP?", answer: "Yes where applicable; we provide preferential certificates to eligible customers." },
      { question: "What is your refund/return policy?", answer: "Claims reported within 15 days with supporting docs; replacement/refund after verification." }
    ]
  };

  const contactInfo = [
    { icon: Mail, title: "Email Us", content: "info@sprada2global.com", action: "Send Email", link: "mailto:info@sprada2global.com" },
    { icon: Phone, title: "WhatsApp", content: "+91 98765 43210", action: "Chat Now", link: "https://wa.me/919876543210" },
    { icon: MapPin, title: "Visit Office", content: "Rajkot, Gujarat, India", action: "Get Directions", link: "#" }
  ];

  return (
    <div className="min-h-screen bg-[#E8E9E2]">
      {/* Header removed — App.jsx renders Header globally */}

      {/* Hero */}
      <section className="relative py-20 md:py-28 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(51,80,79,0.8), rgba(51,80,79,0.8)), url('https://static.wixstatic.com/media/a92b5b_3d78a40bff424f73bdc5fc63bbb58d60~mv2.png')"}}>
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12 text-center text-white">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <HelpCircle className="w-12 h-12 text-[#D7B15B] mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight">Frequently Asked Questions</h1>
            <p className="mt-3 text-sm sm:text-base md:text-lg max-w-3xl mx-auto text-white/90">Find answers about products, shipping, documentation, payments, and more. Still stuck? Contact our team.</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Tabs */}
      <section className="py-12 lg:py-20">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-8">
              <TabsList className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-2xl p-2 shadow">
                {faqCategories.map(category => (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-start gap-4 p-4 rounded-xl data-[state=active]:bg-[#33504F] data-[state=active]:text-white">
                    <category.icon className="w-7 h-7 text-[#D7B15B]" />
                    <div>
                      <h3 className="text-base font-heading font-semibold">{category.title}</h3>
                      <p className="text-xs opacity-80">{category.description}</p>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {faqCategories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                      <div className="bg-[#33504F] text-white p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-2">
                          <category.icon className="w-10 h-10 text-[#D7B15B]" />
                          <h2 className="text-xl md:text-2xl font-heading font-semibold">{category.title} FAQ</h2>
                        </div>
                        <p className="text-sm md:text-base opacity-90">{category.description}</p>
                      </div>

                      <div className="p-6 md:p-8">
                        <Accordion type="single" collapsible className="w-full space-y-4">
                          {faqData[category.id] && faqData[category.id].map((faq, index) => (
                            <AccordionItem key={index} value={`item-${category.id}-${index}`} className="border border-[#CFD0C8] rounded-xl">
                              <AccordionTrigger className="px-4 py-3">
                                <span className="text-sm md:text-base font-heading font-semibold text-[#33504F]">{faq.question}</span>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="pt-3 border-t border-[#CFD0C8]/50">
                                  <p className="text-sm md:text-base text-[#666666] leading-relaxed">{faq.answer}</p>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-[#CFD0C8]">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-semibold text-[#33504F]">Still Have Questions?</h2>
            <p className="text-sm sm:text-base text-[#666666] max-w-3xl mx-auto mt-2">Contact our experienced team for personalized assistance.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
            <Button className="w-full sm:w-auto bg-[#33504F] text-white py-3 px-6 rounded-lg flex items-center gap-2">Contact Our Team <MessageCircle className="w-4 h-4" /></Button>
            <Button variant="outline" className="w-full sm:w-auto border-2 border-[#33504F] text-[#33504F] py-3 px-6 rounded-lg flex items-center gap-2">Schedule a Call <Phone className="w-4 h-4" /></Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((c, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.03 }}>
                <Card className="text-center p-6 h-full bg-white hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="w-14 h-14 bg-[#33504F] rounded-full flex items-center justify-center mx-auto mb-4">
                      <c.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-[#33504F] mb-2">{c.title}</h3>
                    <p className="text-sm text-[#666666] mb-4">{c.content}</p>
                    <a href={c.link} target={c.link.startsWith('http') ? '_blank' : '_self'} rel="noreferrer">
                      <Button variant="outline" className="border-2 border-[#D7B15B] text-[#D7B15B] hover:bg-[#D7B15B] hover:text-white font-semibold rounded-lg px-4 py-2">
                        {c.action}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Extra Help */}
      <section className="py-12">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h3 className="text-2xl md:text-3xl font-heading font-semibold text-[#33504F] mb-3">Expert Support When You Need It</h3>
              <p className="text-sm md:text-base text-[#666666] mb-6">Our dedicated team brings experience in exports and international trade to help you at every step.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-[#D7B15B]" /><span className="text-sm text-[#666666]">Response within 24 hours</span></div>
                <div className="flex items-center gap-3"><Users className="w-5 h-5 text-[#D7B15B]" /><span className="text-sm text-[#666666]">Dedicated account managers</span></div>
                <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-[#D7B15B]" /><span className="text-sm text-[#666666]">Multi-language support</span></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 8 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <Card className="bg-white p-6 md:p-8 shadow-lg rounded-2xl">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-[#33504F] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-heading font-semibold text-[#33504F] mb-2">Quick Inquiry</h4>
                    <p className="text-sm text-[#666666]">Send your question and we will get back promptly.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#33504F] mb-2 block">Category</label>
                      <select className="w-full p-3 border border-[#CFD0C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7B15B] text-[#666666]">
                        <option>Select a category</option>
                        <option>Product Information</option>
                        <option>Shipping & Logistics</option>
                        <option>Documentation</option>
                        <option>Pricing & Payment</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#33504F] mb-2 block">Message</label>
                      <textarea rows={4} placeholder="Describe your question..." className="w-full p-3 border border-[#CFD0C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7B15B] text-[#666666] resize-none" />
                    </div>

                    <Button className="w-full bg-[#D7B15B] text-[#33504F] hover:bg-[#D7B15B]/90 font-semibold py-3 rounded-lg">Send Inquiry</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer removed — App.jsx renders Footer globally */}
    </div>
  );
};

export default FAQPage;