import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, BarChart3, Shield, Play, ChevronDown, Sparkles, Mic, MessageSquare, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const testimonials = [
  {
    quote: "Callistro's AI agents doubled our qualified leads in just 2 months! The analytics are a game changer.",
    name: 'Priya S.',
    company: 'Sales Director, TechNova',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    quote: "We automated 80% of our outbound calls. Our team now focuses on closing, not chasing!",
    name: 'Rahul M.',
    company: 'VP Growth, FinEdge',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    quote: "The sentiment analysis and transcripts help us coach our reps and improve every week.",
    name: 'Aisha K.',
    company: 'CX Lead, Healthify',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll for nav links
  useEffect(() => {
    const handleNavClick = (e) => {
      const href = e.target.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    document.querySelectorAll('nav a[href^="#"]').forEach(a => {
      a.addEventListener('click', handleNavClick);
    });
    return () => {
      document.querySelectorAll('nav a[href^="#"]').forEach(a => {
        a.removeEventListener('click', handleNavClick);
      });
    };
  }, []);

  // Testimonial carousel auto-advance
  useEffect(() => {
    const timer = setTimeout(() => {
      setTestimonialIdx((testimonialIdx + 1) % testimonials.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [testimonialIdx]);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Subtle background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-48 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40 animate-pulse" style={{transform: `translateY(${scrollY * 0.3}px)`}}></div>
        <div className="absolute top-1/2 -left-48 w-80 h-80 bg-purple-50 rounded-full blur-3xl opacity-30 animate-pulse" style={{transform: `translateY(${scrollY * -0.3}px)`}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <Mic className="w-6 h-6 text-blue-600 animate-bounce" />
          <span className="text-xl font-bold text-gray-900">Callistro</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Features</a>
          <a href="#how" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">How it works</a>
          <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition shadow" onClick={() => navigate('/auth')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center px-6 pt-20 pb-32">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-blue-700">Meet the future of sales automation</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight text-gray-950">
            AI agents that
            <br />
            <span className="text-blue-600 animate-gradient-x bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-clip-text text-transparent">actually close deals</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Deploy voice-powered AI agents to qualify leads, handle customer support, and deliver personalized outreach. All without lifting a finger.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button className="group px-8 py-4 rounded-lg font-semibold text-base bg-blue-600 text-white hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 scale-100 hover:scale-105" onClick={() => navigate('/auth')}>
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
            <button className="px-8 py-4 rounded-lg font-semibold text-base border border-gray-300 text-gray-900 hover:bg-gray-50 transition duration-300 flex items-center justify-center gap-2 scale-100 hover:scale-105" onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}>
              <Play className="w-4 h-4 animate-pulse" />
              Watch Demo
            </button>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-gray-500 pt-4 animate-fade-in">
            Trusted by 500+ companies • No credit card required
          </p>
        </div>

        {/* Animated Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-blue-600" />
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 py-32 px-6 bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-950 mb-4">
              Everything your team needs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to scale your outreach and automate conversations
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {[
              {
                icon: Zap,
                title: "AI Voice Agents",
                desc: "Deploy intelligent agents that sound natural, understand context, and handle complex conversations 24/7 without fatigue",
                color: "blue"
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                desc: "Get instant insights on call quality, conversion rates, sentiment analysis, and detailed conversation transcripts",
                color: "purple"
              },
              {
                icon: MessageSquare,
                title: "Smart Lead Qualification",
                desc: "Automatically qualify leads based on custom criteria, score prospects, and route to your sales team instantly",
                color: "blue"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                desc: "Bank-grade encryption, SOC 2 compliant infrastructure, and enterprise-ready compliance at any scale",
                color: "purple"
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              const colorClass = feature.color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-purple-50 border-purple-200 text-purple-600';
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`p-8 rounded-2xl border transition duration-300 cursor-pointer scale-100 hover:scale-105 shadow-sm hover:shadow-lg ${
                    hoveredFeature === i 
                      ? 'border-gray-300 bg-white' 
                      : 'border-gray-200 bg-gray-50/50 hover:bg-white'
                  }`}
                >
                  <div className={`inline-flex p-3 rounded-lg mb-4 ${colorClass} animate-fade-in`}>
                    <Icon className={`w-6 h-6 ${hoveredFeature === i ? 'animate-bounce' : ''}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-950 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Large Feature Showcase */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="relative z-10">
              <h3 className="text-4xl font-bold mb-4">Integrates seamlessly with your stack</h3>
              <p className="text-lg text-white/90 mb-8 max-w-2xl">
                Connect Callistro to your CRM, communication tools, and existing workflows. No disruption, pure productivity.
              </p>
              <button className="px-6 py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-50 transition">
                See all integrations →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center text-gray-950 mb-20">
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Setup in minutes",
                desc: "Define your outreach goals, voice preferences, and conversation flows. No technical expertise needed."
              },
              {
                step: "02",
                title: "Deploy your agents",
                desc: "Launch AI agents to start making calls, qualifying leads, and engaging customers instantly."
              },
              {
                step: "03",
                title: "Monitor and optimize",
                desc: "Track performance in real-time, analyze insights, and continuously improve your outreach strategy."
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-gray-200 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold text-gray-950 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute -right-6 top-8 w-12 h-1 bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center text-gray-950 mb-20">
            Built for every team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Sales Teams",
                desc: "Automate lead qualification, follow-ups, and outreach to accelerate your sales cycle and close more deals faster."
              },
              {
                title: "Customer Support",
                desc: "Handle routine inquiries, provide instant support 24/7, and escalate complex issues to your support team seamlessly."
              },
              {
                title: "Market Research",
                desc: "Conduct at-scale surveys, gather customer feedback, and generate insights from thousands of conversations instantly."
              }
            ].map((useCase, i) => (
              <div key={i} className="p-8 rounded-xl border border-gray-200 bg-white hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-gray-950 mb-3">{useCase.title}</h3>
                <p className="text-gray-600 leading-relaxed">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold text-gray-600 mb-8">TRUSTED BY LEADING COMPANIES</p>
          <div className="flex flex-wrap items-center justify-center gap-12 text-gray-400">
            {['Slack', 'HubSpot', 'Salesforce', 'Intercom', 'Notion', 'Stripe'].map((company, i) => (
              <div key={i} className="text-sm font-semibold opacity-60 hover:opacity-100 transition">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: "500+", label: "Companies using Callistro" },
              { stat: "10M+", label: "Calls handled monthly" },
              { stat: "95%", label: "Customer satisfaction" },
              { stat: "24/7", label: "Uptime guaranteed" }
            ].map((item, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{item.stat}</div>
                <p className="text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-950 mb-6">
            Ready to transform your outreach?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join hundreds of companies already using Callistro to scale their operations. Start free today—no credit card required.
          </p>
          <button className="px-10 py-4 rounded-lg bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 inline-flex items-center gap-2" onClick={() => navigate('/auth')}>
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-gray-500 mt-6">30-day free trial • All features included • Cancel anytime</p>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <section className="relative z-10 py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Star className="w-8 h-8 text-yellow-400 inline-block animate-pulse" />
          </div>
          <div className="relative">
            <div className="transition-all duration-500">
              <img src={testimonials[testimonialIdx].avatar} alt={testimonials[testimonialIdx].name} className="mx-auto w-16 h-16 rounded-full mb-4 shadow-lg" />
              <blockquote className="text-xl text-gray-800 font-medium mb-4">“{testimonials[testimonialIdx].quote}”</blockquote>
              <div className="text-sm text-gray-500 font-semibold mb-2">{testimonials[testimonialIdx].name}</div>
              <div className="text-xs text-gray-400">{testimonials[testimonialIdx].company}</div>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button key={i} className={`w-3 h-3 rounded-full ${i === testimonialIdx ? 'bg-blue-600' : 'bg-gray-300'} transition`} onClick={() => setTestimonialIdx(i)} aria-label={`Show testimonial ${i+1}`}></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-6 border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mic className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-900">Callistro</span>
              </div>
            </div>
            {[
              { title: 'Product', items: ['Features', 'Security', 'Pricing'] },
              { title: 'Company', items: ['About', 'Blog', 'Careers'] },
              { title: 'Resources', items: ['Documentation', 'API', 'Support'] },
              { title: 'Legal', items: ['Privacy', 'Terms', 'Contact'] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-gray-900 mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-3">
                  {col.items.map((item, j) => (
                    <li key={j} className="text-sm text-gray-600 hover:text-gray-900 transition cursor-pointer">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
            <p>&copy; 2025 Callistro. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-gray-900 transition">Twitter</a>
              <a href="#" className="hover:text-gray-900 transition">LinkedIn</a>
              <a href="#" className="hover:text-gray-900 transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}