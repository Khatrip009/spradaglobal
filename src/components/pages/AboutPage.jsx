import React from 'react';
import { motion } from 'framer-motion';
import { Image } from '../ui/image';
import { Card, CardContent } from '../ui/card';
import { CheckCircle, Globe, Award, Target, Heart } from 'lucide-react';

const AboutPage = () => {
  const values = [
    { icon: Award, title: "Quality Excellence", description: "We maintain the highest standards in every aspect of our operations." },
    { icon: Heart, title: "Customer Focus", description: "Our customers' success is our priority." },
    { icon: Globe, title: "Global Vision", description: "We connect local farmers with global markets." },
    { icon: Target, title: "Innovation", description: "We continuously improve processes and adopt new technologies." },
  ];

  const milestones = [
    { year: "2015", title: "Company Founded", description: "Started with a vision to connect Indian agriculture with global markets" },
    { year: "2017", title: "First International Export", description: "Successfully exported our first shipment to Southeast Asia" },
    { year: "2019", title: "ISO Certification", description: "Achieved international quality certifications" },
    { year: "2021", title: "50+ Countries", description: "Expanded our reach to over 50 countries worldwide" },
    { year: "2023", title: "Sustainable Practices", description: "Implemented eco-friendly packaging and sustainable sourcing" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-12 sm:py-20 bg-light-grey">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          <div className="text-center mb-8 sm:mb-12">
            <motion.h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-semibold text-foreground mb-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>About Sprada2Global Exim</motion.h1>
            <motion.p className="text-base sm:text-lg text-dark-grey max-w-3xl mx-auto leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              We are a leading agricultural export company dedicated to bringing the finest Indian produce to global markets.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground mb-4">Our Story</h2>
              <p className="text-base sm:text-lg text-dark-grey mb-4 leading-relaxed">Founded in 2015 with a simple vision: to bridge the gap between India's agriculture and global demand.</p>
              <p className="text-base sm:text-lg text-dark-grey mb-6 leading-relaxed">We work with over 500 farmers and serve customers in more than 50 countries.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-primary mb-1">500+</div>
                  <div className="text-sm sm:text-base text-dark-grey">Partner Farmers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-heading font-bold text-primary mb-1">50+</div>
                  <div className="text-sm sm:text-base text-dark-grey">Countries Served</div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <Image src="https://static.wixstatic.com/media/a92b5b_4e70f573f78f4e7691beff67f2bb0e38~mv2.png" alt="Our Story" width={600} className="w-full h-auto rounded-lg shadow-lg" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-20 bg-light-grey">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <Card className="h-full p-6 text-center">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><Target className="w-5 h-5 text-primary" /></div>
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-2">Our Mission</h3>
                  <p className="text-sm text-dark-grey leading-relaxed">To be the bridge that connects India's finest agricultural produce with global markets.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
              <Card className="h-full p-6 text-center">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><Globe className="w-5 h-5 text-primary" /></div>
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-2">Our Vision</h3>
                  <p className="text-sm text-dark-grey leading-relaxed">To become the most trusted partner for agricultural exports from India.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground mb-2">Our Core Values</h2>
            <p className="text-base text-dark-grey max-w-3xl mx-auto">These values guide every decision we make and every relationship we build.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.08 }} viewport={{ once: true }}>
                <Card className="h-full text-center p-4 hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><value.icon className="w-5 h-5 text-primary" /></div>
                    <h3 className="text-lg font-heading font-medium text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-dark-grey leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 sm:py-20 bg-light-grey">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground mb-2">Our Journey</h2>
            <p className="text-base text-dark-grey max-w-3xl mx-auto">Key milestones that have shaped our growth and success.</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary hidden lg:block"></div>
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.08 }} viewport={{ once: true }} className={`flex flex-col lg:flex-row items-start lg:items-center gap-4 ${i % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}>
                  <div className="lg:w-1/2">
                    <Card className="p-4">
                      <CardContent className="p-0">
                        <div className="text-xl font-heading font-bold text-primary mb-1">{m.year}</div>
                        <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{m.title}</h3>
                        <p className="text-sm text-dark-grey">{m.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="hidden lg:block w-4 h-4 bg-primary rounded-full border-4 border-white shadow-lg relative z-10"></div>
                  <div className="lg:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team & Commitment (responsive) */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground mb-2">Leadership Team</h2>
            <p className="text-base text-dark-grey max-w-3xl mx-auto">Meet the experienced professionals who lead our company.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Rajesh Sharma", position: "Founder & CEO", image: "https://static.wixstatic.com/media/a92b5b_5afd3cf49a02417fb44c41b4a2c3ee39~mv2.png" },
              { name: "Priya Patel", position: "Head of Operations", image: "https://static.wixstatic.com/media/a92b5b_180b86a84278480187de41ab450638c3~mv2.png" },
              { name: "Amit Kumar", position: "Quality Assurance Manager", image: "https://static.wixstatic.com/media/a92b5b_2936e94e8fdf4456954a40ccc7fc82d1~mv2.png" }
            ].map((member, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: idx * 0.06 }} viewport={{ once: true }}>
                <Card className="text-center p-4 hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-light-grey">
                      <Image src={member.image} alt={member.name} width={128} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-1">{member.name}</h3>
                    <p className="text-sm text-dark-grey">{member.position}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-primary text-white">
        <div className="max-w-[100rem] mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-semibold mb-4">Our Commitment to Excellence</h2>
              <p className="text-base mb-4 leading-relaxed">We strive to improve processes, enhance quality standards, and strengthen relationships with farmers and customers.</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" /><span className="text-sm">Rigorous quality control at every stage</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" /><span className="text-sm">Sustainable farming practices</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" /><span className="text-sm">Fair trade practices</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" /><span className="text-sm">Continuous innovation</span></li>
              </ul>
            </div>

            <div>
              <Image src="https://static.wixstatic.com/media/a92b5b_baebfd36763e4c8d875fe058dac2bc8c~mv2.png" alt="Our Commitment" width={600} className="w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
