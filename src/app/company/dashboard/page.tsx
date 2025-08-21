'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, FileText, ClipboardList, Bug, DollarSign, User, Bell, ChevronLeft, ChevronRight, Mail, Phone, MapPin, Globe, Twitter, Linkedin, Facebook, Instagram, ArrowUp } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import PerformanceCharts from '@/app/components/PerformanceCharts';

// Hero carousel data
const heroSlides = [
    {
        image: '/images/hero1.jpeg',
        title: 'Modern Project',
        subtitle: 'Management',
        description: 'Streamline workflows, boost productivity, and deliver exceptional results with our cutting-edge platform',
        badge: 'Welcome to your Command Center'
    },
    {
        image: '/images/hero2.png',
        title: 'Collaborative',
        subtitle: 'Workspace',
        description: 'Connect teams, share ideas, and build amazing projects together in our unified workspace environment',
        badge: 'Team Collaboration Hub'
    },
    {
        image: '/images/hero3.jpg',
        title: 'Smart',
        subtitle: 'Analytics',
        description: 'Make data-driven decisions with powerful insights and real-time reporting across all your projects',
        badge: 'Intelligent Dashboard'
    }
];

// Titles, icons, and routes for the sections
const sectionsConfig = [
    {
        title: 'Company Details',
        icon: Users,
        route: '/company/companies',
        description: 'Manage companies and their information'
    },
    {
        title: 'Client Details',
        icon: Users,
        route: '/company/clients',
        description: 'Manage clients and their information'
    },
    {
        title: 'Project Details',
        icon: FileText,
        route: '/company/projects',
        description: 'View and manage all projects'
    },
    {
        title: 'Requirement Details',
        icon: ClipboardList,
        route: '/company/requirements',
        description: 'Track project requirements'
    },
    {
        title: 'Bug Details',
        icon: Bug,
        route: '/company/bugs',
        description: 'Monitor and fix reported bugs'
    },
    {
        title: 'Financial Details',
        icon: DollarSign,
        route: '/company/financial',
        description: 'Track payments and invoices'
    },
    {
        title: 'Terms & Conditions',
        icon: FileText,
        route: '/company/terms',
        description: 'Manage terms and conditions'
    },
    {
        title: 'Employee Details',
        icon: User,
        route: '/company/employees',
        description: 'Manage team members'
    },
        {
        title: 'Quotation Details',
        icon: ClipboardList,
        route: '/company/quotations',
        description: 'Manage quotation history'
    }
];

const ProjectsPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Carousel Section */}
            <div className="relative h-96 overflow-hidden">
                {/* Carousel Slides */}
                {heroSlides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{ backgroundImage: `url('${slide.image}')` }}
                    >
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>

                        {/* Content */}
                        <div className="relative z-10 flex items-center justify-center h-full px-4">
                            <div className="text-center max-w-4xl mx-auto">
                                <div
                                    className={`inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 border border-white/30 transition-all duration-700 transform ${
                                        index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                    }`}
                                    style={{ transitionDelay: index === currentSlide ? '200ms' : '0ms' }}
                                >
                                    <Bell className="w-4 h-4 mr-2" />
                                    {slide.badge}
                                </div>

                                <h1
                                    className={`text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight transition-all duration-700 transform ${
                                        index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}
                                    style={{ transitionDelay: index === currentSlide ? '400ms' : '0ms' }}
                                >
                                    {slide.title}
                                    <span className="block bg-gradient-to-r from-[#ffbf00] to-[#ffbf00] bg-clip-text text-transparent">
                                        {slide.subtitle}
                                    </span>
                                </h1>

                                <p
                                    className={`text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed transition-all duration-700 transform ${
                                        index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}
                                    style={{ transitionDelay: index === currentSlide ? '600ms' : '0ms' }}
                                >
                                    {slide.description}
                                </p>

                                <div
                                    className={`mt-8 flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 transform ${
                                        index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}
                                    style={{ transitionDelay: index === currentSlide ? '800ms' : '0ms' }}
                                >
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentSlide
                                    ? 'bg-white scale-125'
                                    : 'bg-white/50 hover:bg-white/75'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
                    <div
                        className="h-full bg-gradient-to-r from-[#ffbf00] to-[#ffbf00] transition-all duration-300"
                        style={{ width: `${((currentSlide + 1) / heroSlides.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Dashboard Sections Container */}
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 relative">
                {/* Floating Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-100/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Dashboard Cards Section */}
                <div className="relative z-10 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Section Header */}
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center px-4 py-2 bg-blue-100/50 backdrop-blur-sm rounded-full text-blue-800 text-sm font-semibold mb-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                                Management Hub
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Your Control Center
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Access all your essential business tools and manage operations seamlessly from one unified dashboard
                            </p>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                            {sectionsConfig.map((section, index) => {
                                const Icon = section.icon;

                                // Map card titles to image filenames
                                const imageMap: { [key: string]: string } = {
                                    'Company Details': '/images/company.png',
                                    'Client Details': '/images/profile.png',
                                    'Project Details': '/images/project.png',
                                    'Requirement Details': '/images/reqs.png',
                                    'Bug Details': '/images/bug.png',
                                    'Financial Details': '/images/financial.png',
                                    'Terms & Conditions': '/images/terms.png',
                                    'Employee Details': '/images/profile.png',
                                    'Quotation Details': '/images/project-icon black.png',
                                };

                                const cardImage = imageMap[section.title] || '/images/project.png';

                                return (
                                    <Link
                                        key={index}
                                        href={section.route}
                                        className="block h-full group"
                                    >
                                        <div className="relative cursor-pointer transition-all duration-700 transform bg-white/90 backdrop-blur-xl text-gray-700 border border-white/60 h-64 rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-lg hover:bg-[#2a4086]">
                                            {/* Animated Background Gradient */}
                                            <div className="absolute inset-0 "></div>

                                            {/* Decorative Corner Element */}
                                            <div className="absolute -top-4 -right-4 w-24 h-24 from-blue-100/40 to-purple-100/40 rounded-full blur-xl transition-all duration-700 "></div>
                                            {/* Content Container */}
                                            <div className="relative z-10 flex-1 flex flex-col">
                                                {/* Icon Container */}
                                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 bg-gradient-to-br from-blue-50 to-blue-100">
                                                    <Icon className="h-8 w-8 transition-all duration-500 text-[#0f1b3f] group-hover:text-[#0f1b3f] group-hover:scale-110" />
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-xl font-bold leading-tight mb-3 transition-all duration-500 text-gray-900 group-hover:text-white">
                                                    {section.title}
                                                </h3>

                                                {/* Description */}
                                                <p className="text-sm leading-relaxed flex-1 transition-all duration-500 text-gray-600 group-hover:text-blue-100">
                                                    {section.description}
                                                </p>
                                            </div>
                                            {/* Decorative Image/Vector Bottom Right */}
                                            <img
                                                src={cardImage}
                                                alt="Decorative"
                                                className="absolute bottom-2 right-2 w-40 h-40 object-contain opacity-20 pointer-events-none select-none"
                                            />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Enhanced Performance Overview Section */}
                <div className="relative z-10 py-20 bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Stats Section Header */}
                        <div className="text-center mb-16">
                            <div
                                className="inline-flex items-center px-4 py-2 bg-blue-100/50 backdrop-blur-sm rounded-full text-blue-800 text-sm font-semibold mb-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                                Live Analytics
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Performance Overview
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Real-time insights into your business operations with interactive charts and detailed analytics
                            </p>
                        </div>

                        {/* Quick Stats Cards */}


                        {/* Interactive Charts Section */}
                        <PerformanceCharts />
                    </div>
                </div>

                {/* Footer Section */}
                <footer className="relative z-10 bg-gradient-to-br from-[#0f1b3f] to-[#2a4086] text-white">
                    {/* Main Footer Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Company Info */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-[#ffbf00] to-[#ffbf00] rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-[#0f1b3f]" />
                                    </div>
                                    <h3 className="text-xl font-bold">G3 Nexus</h3>
                                </div>
                                <p className="text-blue-200 leading-relaxed">
                                    Empowering businesses with innovative project management solutions and seamless collaboration tools.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#ffbf00] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#ffbf00] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#ffbf00] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                        <Facebook className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white/10 hover:bg-[#ffbf00] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold text-[#ffbf00]">Quick Links</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href="/company/projects" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                                            <span className="w-2 h-2 bg-[#ffbf00] rounded-full mr-3 transition-transform duration-300 group-hover:scale-125"></span>
                                            Projects
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/company/clients" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                                            <span className="w-2 h-2 bg-[#ffbf00] rounded-full mr-3 transition-transform duration-300 group-hover:scale-125"></span>
                                            Clients
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/company/employees" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                                            <span className="w-2 h-2 bg-[#ffbf00] rounded-full mr-3 transition-transform duration-300 group-hover:scale-125"></span>
                                            Team
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/company/financial" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                                            <span className="w-2 h-2 bg-[#ffbf00] rounded-full mr-3 transition-transform duration-300 group-hover:scale-125"></span>
                                            Financial
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Resources */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold text-[#ffbf00]">Resources</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                                            <span className="w-2 h-2 bg-[#ffbf00] rounded-full mr-3 transition-transform duration-300 group-hover:scale-125"></span>
                                            Documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                                            <span className="w-2 h-2 bg-[#ffbf00] rounded-full mr-3 transition-transform duration-300 group-hover:scale-125"></span>
                                            API Reference
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                                            <span className="w-2 h-2 bg-[#ffbf00] rounded-full mr-3 transition-transform duration-300 group-hover:scale-125"></span>
                                            Support Center
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                                            <span className="w-2 h-2 bg-[#ffbf00] rounded-full mr-3 transition-transform duration-300 group-hover:scale-125"></span>
                                            Community
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold text-[#ffbf00]">Contact Us</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-[#ffbf00]/20 rounded-lg flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-[#ffbf00]" />
                                        </div>
                                        <span className="text-blue-200">support@g3nexus.com</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-[#ffbf00]/20 rounded-lg flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-[#ffbf00]" />
                                        </div>
                                        <span className="text-blue-200">+1 (555) 123-4567</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-[#ffbf00]/20 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-[#ffbf00]" />
                                        </div>
                                        <span className="text-blue-200">123 Business Ave, Suite 100</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-[#ffbf00]/20 rounded-lg flex items-center justify-center">
                                            <Globe className="w-4 h-4 text-[#ffbf00]" />
                                        </div>
                                        <span className="text-blue-200">www.g3nexus.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="border-t border-white/10">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                                <div className="text-blue-200 text-sm">
                                    © 2025 G3 Nexus. All rights reserved. Built with friendly for better project management.
                                </div>
                                <div className="flex items-center space-x-6">
                                    <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors duration-300">
                                        Privacy Policy
                                    </a>
                                    <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors duration-300">
                                        Terms of Service
                                    </a>
                                    <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors duration-300">
                                        Cookie Policy
                                    </a>
                                    <button
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                        className="w-10 h-10 bg-[#ffbf00] hover:bg-[#ffbf00]/80 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                                    >
                                        <ArrowUp className="w-5 h-5 text-[#0f1b3f]" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            </div>
    );
};

export default ProjectsPage;
