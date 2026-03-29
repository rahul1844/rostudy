/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  TrendingUp, 
  Users, 
  Search, 
  CheckCircle2,
  AlertCircle,
  Layers,
  Globe,
  Award,
  ArrowRight,
  Download,
  FileText
} from 'lucide-react';

// --- Types ---
interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  summary: string[]; // For PPTX export
  image: string;
  bgColor: string;
  accentColor: string;
}

// --- Components ---

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
    <motion.div 
      className="h-full bg-orange-500"
      initial={{ width: 0 }}
      animate={{ width: `${((current + 1) / total) * 100}%` }}
      transition={{ duration: 0.3 }}
    />
  </div>
);

const SlideWrapper = ({ children, bgColor }: { children: React.ReactNode; bgColor: string; key?: React.Key }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={`w-full h-screen flex flex-col md:flex-row overflow-hidden ${bgColor}`}
  >
    {children}
  </motion.div>
);

const ContentSection = ({ title, subtitle, children, accentColor }: { title: string; subtitle?: string; children: React.ReactNode; accentColor: string }) => (
  <div className="flex-1 p-8 md:p-16 flex flex-col justify-center relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <span className={`text-xs font-bold uppercase tracking-widest ${accentColor} mb-4 block`}>
        Research Framework 2026
      </span>
      <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl md:text-2xl text-gray-600 font-light mb-8 italic">
          {subtitle}
        </p>
      )}
      <div className="space-y-6 text-lg text-gray-700 max-w-2xl">
        {children}
      </div>
    </motion.div>
  </div>
);

import pptxgen from "pptxgenjs";
import { jsPDF } from 'jspdf';

// --- Image Optimization Service ---
const getOptimizedImageUrl = (url: string, width = 1200, quality = 80) => {
  if (!url.includes('unsplash.com')) return url;
  const baseUrl = url.split('?')[0];
  return `${baseUrl}?q=${quality}&w=${width}&auto=format&fit=crop&fm=webp`;
};

const ImageSection = ({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) => {
  const optimizedSrc = getOptimizedImageUrl(src);
  const srcSet = `
    ${getOptimizedImageUrl(src, 640)} 640w,
    ${getOptimizedImageUrl(src, 1024)} 1024w,
    ${getOptimizedImageUrl(src, 1920)} 1920w
  `;

  return (
    <div className="hidden md:block flex-1 relative overflow-hidden bg-slate-100">
      <motion.img
        key={optimizedSrc}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        src={optimizedSrc}
        srcSet={srcSet}
        sizes="(max-width: 768px) 100vw, 50vw"
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className="absolute inset-0 w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const exportToPPTX = () => {
    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.defineLayout({ name: "CUSTOM", width: 13.33, height: 7.5 });
    
    slides.forEach((slide) => {
      const s = pres.addSlide();
      
      // Add background color (approximate)
      s.background = { color: "F8FAFC" };
      
      // Add Title
      s.addText(slide.title, {
        x: 0.5, y: 0.5, w: "90%",
        fontSize: 32,
        bold: true,
        color: "1E293B",
        fontFace: "Arial"
      });

      // Add Subtitle
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: 0.5, y: 1.1, w: "90%",
          fontSize: 18,
          italic: true,
          color: "64748B",
          fontFace: "Arial"
        });
      }

      // Add Summary Points
      s.addText(
        slide.summary.map(point => ({ text: point, options: { bullet: true, color: "334155", lineSpacing: 24 } })),
        {
          x: 0.5, y: 2.0, w: "50%",
          fontSize: 16,
          color: "334155",
          fontFace: "Arial"
        }
      );

      // Add Image Placeholder (Note: pptxgenjs requires base64 or URL for images)
      // Since we use Unsplash URLs, we can try to add them directly
      s.addImage({
        path: getOptimizedImageUrl(slide.image, 1200), // High resolution for PPT
        x: 6.5, y: 1.0, w: 6.0, h: 5.5,
        sizing: { type: "cover", w: 6.0, h: 5.5 }
      });

      // Add Footer
      s.addText("RoStudy Research Framework 2026 | rostudy.com", {
        x: 0.5, y: 7.0, w: "90%",
        fontSize: 10,
        color: "94A3B8",
        align: "center"
      });
    });

    pres.writeFile({ fileName: "RoStudy_Presentation_2026.pptx" });
  };

  const loadImageAsDataURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const exportToPDF = async () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [1280, 720] // 16:9
    });

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (i > 0) doc.addPage([1280, 720], 'landscape');

      // Background
      doc.setFillColor(248, 250, 252); // F8FAFC
      doc.rect(0, 0, 1280, 720, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(30, 41, 59); // 1E293B
      doc.text(slide.title, 50, 50);

      // Subtitle
      if (slide.subtitle) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(18);
        doc.setTextColor(100, 116, 139); // 64748B
        doc.text(slide.subtitle, 50, 85);
      }

      // Summary Points
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.setTextColor(51, 65, 85); // 334155
      let yPos = 150;
      slide.summary.forEach(point => {
        doc.text(`• ${point}`, 50, yPos);
        yPos += 25;
      });

      // Image
      try {
        const dataUrl = await loadImageAsDataURL(getOptimizedImageUrl(slide.image, 1200));
        doc.addImage(dataUrl, 'JPEG', 650, 100, 580, 520);
      } catch (error) {
        console.error('Error loading image for PDF:', error);
      }

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // 94A3B8
      doc.text("RoStudy Research Framework 2026 | rostudy.com", 640, 680, { align: 'center' });
    }

    doc.save("RoStudy_Presentation_2026.pdf");
  };

  const slides: Slide[] = [
    {
      id: 0,
      title: "RoStudy: Your Premier Coaching Hub",
      subtitle: "Empowering Students Across India with Verified Quality",
      bgColor: "bg-white",
      accentColor: "text-orange-600",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
      summary: [
        "Digital marketplace for student potential",
        "Personalized learning journeys",
        "Verified coaching options across India",
        "Industry-leading aggregator model"
      ],
      content: (
        <div className="space-y-4">
          <p>A digital marketplace designed to unlock student potential through personalized learning journeys and verified coaching options.</p>
          <div className="flex items-center gap-4 mt-8">
            <div className="p-4 bg-orange-100 rounded-full">
              <Globe className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">RoStudy Platform Analysis</p>
              <p className="text-sm text-gray-500">Industry-Leading Aggregator Model</p>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); exportToPPTX(); }}
            className="mt-8 flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-md text-sm"
          >
            Download 16:9 PPTX <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); exportToPDF(); }}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-white text-orange-600 border-2 border-orange-600 rounded-full font-bold hover:bg-orange-50 transition-all shadow-md text-sm"
          >
            Download PDF <FileText className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      id: 1,
      title: "The RoStudy Mission",
      subtitle: "Innovation in Educational Discovery",
      bgColor: "bg-slate-50",
      accentColor: "text-blue-600",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
      summary: [
        "Connecting expert coaches with students",
        "700+ coaching options available",
        "Eliminating 'Ghost Reviews' via verification",
        "Discovery-to-Delivery pipeline"
      ],
      content: (
        <ul className="space-y-4">
          <li className="flex gap-3">
            <CheckCircle2 className="text-blue-600 shrink-0" />
            <span>Connecting expert coaches with students seeking academic success.</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="text-blue-600 shrink-0" />
            <span>Providing a "Discovery-to-Delivery" pipeline for 700+ coaching options.</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle2 className="text-blue-600 shrink-0" />
            <span>Eliminating "Ghost Reviews" through a rigorous verification process.</span>
          </li>
        </ul>
      )
    },
    {
      id: 2,
      title: "Current Market Reach",
      subtitle: "Scaling Across Strategic Hubs",
      bgColor: "bg-orange-50",
      accentColor: "text-orange-700",
      image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=2076&auto=format&fit=crop",
      summary: [
        "700+ Coaching Options",
        "5+ Major Cities",
        "Active in Raipur, Chhattisgarh",
        "Rapid national expansion plans"
      ],
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-orange-100">
            <h3 className="text-4xl font-black text-orange-600 mb-1">700+</h3>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Coaching Options</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-orange-100">
            <h3 className="text-4xl font-black text-orange-600 mb-1">5+</h3>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Major Cities</p>
          </div>
          <div className="col-span-2 p-6 bg-white rounded-2xl shadow-sm border border-orange-100">
            <p className="text-gray-700 font-medium">Active presence in key educational hubs like Raipur, Chhattisgarh, with rapid national expansion plans.</p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "The Problem: 90% Confusion",
      subtitle: "The Paradox of Choice",
      bgColor: "bg-red-50",
      accentColor: "text-red-600",
      image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=2070&auto=format&fit=crop",
      summary: [
        "90% confusion rate in institute selection",
        "Information asymmetry in the market",
        "Lack of transparent data for students",
        "RoStudy as the critical intermediary"
      ],
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-red-600 w-8 h-8 shrink-0" />
            <div>
              <h4 className="font-bold text-xl">Information Asymmetry</h4>
              <p className="text-gray-600">Students often face a "90% confusion rate" when selecting institutes due to lack of transparent data.</p>
            </div>
          </div>
          <div className="p-6 bg-white rounded-xl border-l-4 border-red-600 shadow-sm">
            <p className="text-red-800 font-medium italic">"RoStudy serves as the critical intermediary to reduce this market friction."</p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Personalized Discovery",
      subtitle: "Matching Interests to Opportunities",
      bgColor: "bg-indigo-50",
      accentColor: "text-indigo-600",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      summary: [
        "Student Profile Feature for recommendations",
        "Curated collections for competitive exams",
        "Direct bridge to top-quality coaching",
        "Matching interests to opportunities"
      ],
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="font-bold text-indigo-900">Student Profile Feature</p>
            <p className="text-sm">Personalized recommendations designed to match specific learning interests and goals.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="font-bold text-indigo-900">Curated Collections</p>
            <p className="text-sm">Extensive programs carefully curated for various competitive exams and skill development.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="font-bold text-indigo-900">Expert Connectivity</p>
            <p className="text-sm">Direct bridge between students and top-quality coaching services.</p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Verified Excellence",
      subtitle: "Trust as a Service",
      bgColor: "bg-emerald-50",
      accentColor: "text-emerald-600",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop",
      summary: [
        "Rigorous verification process",
        "Physical and academic legitimacy checks",
        "Quality signaling via community feedback",
        "Trust as a Service model"
      ],
      content: (
        <div className="space-y-6">
          <p>RoStudy ensures every listed coaching center undergoes a verification process to protect student interests.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-emerald-100">
              <ShieldCheck className="text-emerald-600 mb-2" />
              <p className="text-xs font-bold uppercase">Verified Centers</p>
              <p className="text-[10px] text-gray-500">Physical and academic legitimacy checks.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-emerald-100">
              <Award className="text-emerald-600 mb-2" />
              <p className="text-xs font-bold uppercase">Quality Signaling</p>
              <p className="text-[10px] text-gray-500">Real feedback from the RoStudy community.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "Community Voice",
      subtitle: "Real Success Stories",
      bgColor: "bg-amber-50",
      accentColor: "text-amber-700",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
      summary: [
        "Trusted coaching and supportive tutors",
        "Hassle-free bookings in Raipur",
        "Real student success stories",
        "Community-driven credibility"
      ],
      content: (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl shadow-sm italic text-gray-600 relative">
            <span className="text-4xl absolute -top-2 -left-2 text-amber-200">"</span>
            RoStudy transformed my coaching selection! Trusted Coaching, supportive tutors, and personalized attention.
            <p className="mt-4 font-bold text-gray-900 not-italic">— Neha Gavde, Student</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm italic text-gray-600 relative">
            <span className="text-4xl absolute -top-2 -left-2 text-amber-200">"</span>
            Recently booked my Verified Coaching in Raipur effortlessly. Highly recommended for hassle-free bookings!
            <p className="mt-4 font-bold text-gray-900 not-italic">— Sumit Pandey, Student</p>
          </div>
        </div>
      )
    },
    {
      id: 7,
      title: "The Aggregator Model",
      subtitle: "Economic Leverage & Scalability",
      bgColor: "bg-gray-900",
      accentColor: "text-orange-400",
      image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2006&auto=format&fit=crop",
      summary: [
        "Asset-light strategy",
        "Focus on the digital interface",
        "Network effects for scalability",
        "Virtuous cycle of growth"
      ],
      content: (
        <div className="text-white space-y-8">
          <div>
            <h3 className="text-6xl font-black text-orange-400">Asset-Light</h3>
            <p className="text-gray-400 uppercase tracking-widest text-sm">Focusing on the Digital Interface</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 rounded-xl">
              <Users className="text-orange-400 mb-2" />
              <p className="text-sm">Network Effects</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl">
              <TrendingUp className="text-orange-400 mb-2" />
              <p className="text-sm">Virtuous Cycle</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 8,
      title: "Tri-Pillar Architecture",
      subtitle: "The RoStudy Framework",
      bgColor: "bg-white",
      accentColor: "text-blue-600",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
      summary: [
        "Verification: Legitimacy checks",
        "Analytical: Decision support tools",
        "Transactional: Hassle-free enrollment",
        "Comprehensive framework for EdTech"
      ],
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 border border-blue-100 rounded-2xl bg-blue-50/30">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">V</div>
            <div>
              <p className="font-bold">Verification</p>
              <p className="text-xs text-gray-500">Onboarding physical & academic legitimacy.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border border-blue-100 rounded-2xl bg-blue-50/30">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">A</div>
            <div>
              <p className="font-bold">Analytical</p>
              <p className="text-xs text-gray-500">Decision Support via personalized profiles.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border border-blue-100 rounded-2xl bg-blue-50/30">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">T</div>
            <div>
              <p className="font-bold">Transactional</p>
              <p className="text-xs text-gray-500">Hassle-free bookings & demo scheduling.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 9,
      title: "For Coaching Owners",
      subtitle: "Grow Your Business with RoStudy",
      bgColor: "bg-slate-900",
      accentColor: "text-orange-500",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
      summary: [
        "Free listing for coaching centers",
        "Direct student connectivity",
        "Business growth tools",
        "Access to thousands of active searchers"
      ],
      content: (
        <div className="text-white space-y-6">
          <p className="text-xl">Connect with thousands of students actively searching for quality education.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-orange-500" />
              <span>Free Listing (No payment required now)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-orange-500" />
              <span>Direct Student Connectivity</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-orange-500" />
              <span>Business Growth Tools</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 10,
      title: "The Analytical Pillar",
      subtitle: "Data-Driven Decision Support",
      bgColor: "bg-blue-50",
      accentColor: "text-blue-700",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      summary: [
        "Nearest coaching locator",
        "Personalized recommendations",
        "Subject-specific selection tools",
        "Data-driven decision support"
      ],
      content: (
        <div className="space-y-4">
          <p>Empowering students with tools to filter by location, exam type, and performance metrics.</p>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 bg-white rounded-xl shadow-sm flex justify-between items-center">
              <span className="font-medium">Nearest Coaching Locator</span>
              <Search className="w-4 h-4 text-blue-400" />
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm flex justify-between items-center">
              <span className="font-medium">Personalized Recommendations</span>
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="p-4 bg-white rounded-xl shadow-sm flex justify-between items-center">
              <span className="font-medium">Subject-Specific Selection</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 11,
      title: "The Transactional Pillar",
      subtitle: "Hassle-Free Enrollment",
      bgColor: "bg-purple-50",
      accentColor: "text-purple-700",
      image: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62",
      summary: [
        "Demo class bookings",
        "Simplified enrollment process",
        "Direct booking functionality",
        "Facilitating the 'last mile' journey"
      ],
      content: (
        <div className="space-y-6">
          <p>Facilitating the "last mile" of the student journey through demo class bookings and simplified enrollment.</p>
          <div className="flex gap-4">
            <div className="flex-1 p-6 bg-white rounded-3xl text-center border-2 border-purple-100">
              <BookOpen className="mx-auto mb-2 text-purple-600" />
              <p className="text-xs font-bold">Demo Classes</p>
            </div>
            <div className="flex-1 p-6 bg-white rounded-3xl text-center border-2 border-purple-100">
              <CheckCircle2 className="mx-auto mb-2 text-purple-600" />
              <p className="text-xs font-bold">Direct Booking</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 italic">"Trusted Coaching, supportive tutors, and personalized attention."</p>
        </div>
      )
    },
    {
      id: 12,
      title: "Revenue Diversification",
      subtitle: "Sustainable Growth Model",
      bgColor: "bg-zinc-50",
      accentColor: "text-zinc-800",
      image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=2070&auto=format&fit=crop",
      summary: [
        "Freemium subscription model",
        "SaaS-like predictable cash flow",
        "Lead generation monetization",
        "Sustainable growth strategy"
      ],
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-zinc-200">
            <h4 className="font-bold">Freemium Subscription</h4>
            <p className="text-sm text-gray-600">Basic vs. Premium models for coaching centers.</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-zinc-200">
            <h4 className="font-bold">SaaS-Like Cash Flow</h4>
            <p className="text-sm text-gray-600">Ensuring steady and predictable revenue streams.</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-zinc-200">
            <h4 className="font-bold">Lead Generation</h4>
            <p className="text-sm text-gray-600">Monetizing high-intent student discovery.</p>
          </div>
        </div>
      )
    },
    {
      id: 13,
      title: "The Future of EdTech",
      subtitle: "Digitally Integrated Marketplaces",
      bgColor: "bg-blue-900",
      accentColor: "text-blue-300",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
      summary: [
        "Digitally integrated marketplaces",
        "Transparency and trust",
        "Student-centric innovation",
        "Empowering offline institutes"
      ],
      content: (
        <div className="text-white space-y-6">
          <p className="text-xl font-light leading-relaxed">
            RoStudy serves as a critical intermediary that reduces market friction and protects student interests in a tech-driven economy.
          </p>
          <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-md">
            <p className="text-blue-300 font-bold mb-2">Core Values</p>
            <ul className="text-sm space-y-2">
              <li>• Transparency & Trust</li>
              <li>• Student-Centric Innovation</li>
              <li>• Empowering Offline Institutes</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 14,
      title: "Digital OS for Institutes",
      subtitle: "A Complete Management Ecosystem",
      bgColor: "bg-slate-900",
      accentColor: "text-blue-400",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998",
      summary: [
        "Fee management automation",
        "Real-time schedule sync",
        "Student attendance tracking",
        "Data-driven growth insights"
      ],
      content: (
        <div className="text-white space-y-6">
          <p className="text-xl">RoStudy isn't just a marketplace; it's a complete Operating System for coaching centers.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
              <Layers className="text-blue-400 mb-2" />
              <p className="font-bold">Fee Management</p>
              <p className="text-xs text-gray-400">Automated tracking and secure collections.</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
              <ChevronRight className="text-blue-400 mb-2" />
              <p className="font-bold">Schedule Sync</p>
              <p className="text-xs text-gray-400">Real-time class and batch updates.</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
              <Users className="text-blue-400 mb-2" />
              <p className="font-bold">Student Tracking</p>
              <p className="text-xs text-gray-400">Monitor attendance and performance.</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl border border-white/20">
              <TrendingUp className="text-blue-400 mb-2" />
              <p className="font-bold">Growth Tools</p>
              <p className="text-xs text-gray-400">Data-driven insights for expansion.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 15,
      title: "Secure & Confident",
      subtitle: "Eliminating the 'Gamble' in Education",
      bgColor: "bg-emerald-900",
      accentColor: "text-emerald-400",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop",
      summary: [
        "Secure payment processing",
        "Vetted centers for quality",
        "Eliminating the 'gamble' in selection",
        "Building a layer of trust"
      ],
      content: (
        <div className="text-white space-y-6">
          <p className="text-xl leading-relaxed">Finding the right coaching shouldn't feel like a gamble. RoStudy builds a layer of trust between students and centers.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl">
              <ShieldCheck className="text-emerald-400 w-8 h-8" />
              <div>
                <p className="font-bold">Secure Payments</p>
                <p className="text-sm text-gray-300">Safe and transparent transaction processing.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl">
              <Award className="text-emerald-400 w-8 h-8" />
              <div>
                <p className="font-bold">Verified Confidence</p>
                <p className="text-sm text-gray-300">Every center is vetted for quality and legitimacy.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 16,
      title: "Leadership Spotlight",
      subtitle: "The Vision Behind RoStudy",
      bgColor: "bg-white",
      accentColor: "text-orange-600",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop", // CEO Placeholder
      summary: [
        "Rahul Kumar Rai, Founder & CEO",
        "Mission to democratize quality education",
        "Bridging gaps through technology",
        "Leading digital transformation in EdTech"
      ],
      content: (
        <div className="space-y-6">
          <div className="p-8 bg-orange-50 rounded-3xl border border-orange-100">
            <h3 className="text-3xl font-black text-gray-900 mb-2">Rahul Kumar Rai</h3>
            <p className="text-orange-600 font-bold uppercase tracking-widest text-sm mb-4">Founder & CEO</p>
            <p className="text-gray-600 italic leading-relaxed">
              "Our mission is to democratize access to quality education by bridging the gap between students and verified coaching centers through technology."
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Strategic Visionary</p>
              <p className="text-sm text-gray-500">Leading the digital transformation of Indian EdTech.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 17,
      title: "Connect & Follow",
      subtitle: "Join the Future of Coaching",
      bgColor: "bg-slate-50",
      accentColor: "text-blue-600",
      image: "https://images.unsplash.com/photo-1611944212129-29977ae1398c?q=80&w=2070&auto=format&fit=crop",
      summary: [
        "Follow RoStudy on LinkedIn",
        "Join the future of coaching",
        "Stay updated with milestones",
        "Engage with industry insights"
      ],
      content: (
        <div className="space-y-8">
          <p className="text-xl text-gray-700">Stay updated with our latest milestones and industry insights on LinkedIn.</p>
          <a 
            href="https://www.linkedin.com/posts/ros-education_rostudy-edtech-coaching-activity-7367518974579769345-uUjZ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#0077b5] text-white rounded-full font-bold hover:bg-[#005582] transition-all shadow-lg"
          >
            Follow us on LinkedIn <ArrowRight className="w-4 h-4" />
          </a>
          <div className="p-6 bg-white rounded-2xl border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">LinkedIn Activity</p>
            <p className="text-sm text-gray-600 font-medium">
              "The future of coaching is here. Are you ready to be part of it? #RoStudy #EdTech #DigitalIndia"
            </p>
          </div>
        </div>
      )
    },
    {
      id: 18,
      title: "Conclusion",
      subtitle: "Rostudy as a Critical Intermediary",
      bgColor: "bg-white",
      accentColor: "text-orange-600",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
      summary: [
        "Contact: info@rostudy.com",
        "Phone: +91 8602769158",
        "Location: Chhattisgarh, India",
        "Key Themes: Aggregator Model, Trust, Scalability"
      ],
      content: (
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-800">Contact our support team:</p>
            <p className="text-sm text-gray-500">📧 info@rostudy.com</p>
            <p className="text-sm text-gray-500">📞 +91 8602769158</p>
            <p className="text-sm text-gray-500">📍 Chhattisgarh, India</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Market Fragmentation", "Information Intermediary", "Cognitive Dissonance", "Aggregator Model"].map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500 uppercase tracking-tighter">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setCurrentSlide(0)}
              className="flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors shadow-lg"
            >
              Restart Presentation <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={exportToPPTX}
              className="flex items-center gap-2 px-8 py-4 bg-white text-orange-600 border-2 border-orange-600 rounded-full font-bold hover:bg-orange-50 transition-colors shadow-lg"
            >
              Download 16:9 PPTX <Download className="w-4 h-4" />
            </button>
            <button 
              onClick={exportToPDF}
              className="flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-lg"
            >
              Download PDF <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    }
  ];

  // Preload next image
  useEffect(() => {
    const nextIndex = (currentSlide + 1) % slides.length;
    const nextImg = new Image();
    const nextSrc = slides[nextIndex].image;
    nextImg.src = getOptimizedImageUrl(nextSrc);
  }, [currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans selection:bg-orange-200">
      <ProgressBar current={currentSlide} total={slides.length} />

      {/* Export Button */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
        <button 
          onClick={exportToPPTX}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all text-sm font-medium"
          title="Download PowerPoint"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download PPTX</span>
        </button>
        <button 
          onClick={exportToPDF}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all text-sm font-medium"
          title="Download PDF"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Download PDF</span>
        </button>
      </div>
      
      <AnimatePresence mode="wait">
        <SlideWrapper key={slide.id} bgColor={slide.bgColor}>
          <ContentSection 
            title={slide.title} 
            subtitle={slide.subtitle} 
            accentColor={slide.accentColor}
          >
            {slide.content}
          </ContentSection>
          <ImageSection src={slide.image} alt={slide.title} priority={true} />
        </SlideWrapper>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-8 flex items-center gap-4 z-50">
        <button 
          onClick={prevSlide}
          className="p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all text-gray-900 border border-gray-100"
          aria-label="Previous slide"
        >
          <ChevronLeft />
        </button>
        <div className="px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg text-sm font-bold text-gray-900 border border-gray-100">
          {currentSlide + 1} / {slides.length}
        </div>
        <button 
          onClick={nextSlide}
          className="p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all text-gray-900 border border-gray-100"
          aria-label="Next slide"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Branding */}
      <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Project</p>
          <p className="text-xs font-bold text-gray-900">ROSTUDY FRAMEWORK</p>
        </div>
        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black">
          R
        </div>
      </div>
    </div>
  );
}
