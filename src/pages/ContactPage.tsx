import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, User, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="container px-4 py-16 mx-auto">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-cyrobox-primary rounded-2xl flex items-center justify-center">
                <div className="relative w-12 h-12">
                  <svg viewBox="0 0 32 32" className="w-full h-full">
                    <path 
                      d="M16 2 L28 8 L28 20 L16 26 L4 20 L4 8 Z" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                    <path 
                      d="M8 12 L16 16 L24 12" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                    <path 
                      d="M8 16 L16 20 L24 16" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                    <path 
                      d="M8 20 L16 24 L24 20" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Contact CYROBOX
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get in touch with us to learn more about our AI solutions, cybersecurity services, 
              or to discuss how MocKinvi can help you or your organization.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information & Form */}
      <div className="py-16">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Get In Touch
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  We'd love to hear from you. Whether you have a question about our services, 
                  pricing, or anything else, our team is ready to answer all your questions.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyrobox-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Address</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      7th floor, Manjeera Trinity corporate, V-Quartet, 703, eSeva Ln, K P H B Phase 3, Kukatpally, Hyderabad, Telangana 500072
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyrobox-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                    <a 
                      href="mailto:contact@cyrobox.in" 
                      className="text-cyrobox-primary hover:underline text-sm"
                    >
                      contact@cyrobox.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyrobox-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
                    <a 
                      href="tel:+918309547129" 
                      className="text-cyrobox-primary hover:underline text-sm"
                    >
                      +91-8309547129
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyrobox-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Founder</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      G Naveen Kumar
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-cyrobox-primary/10 p-6 rounded-xl">
                <h3 className="font-semibold text-cyrobox-primary mb-2">Business Hours</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                  Saturday: 9:00 AM - 1:00 PM IST<br />
                  Sunday: Closed
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-cyrobox-primary hover:bg-cyrobox-primary-dark"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;