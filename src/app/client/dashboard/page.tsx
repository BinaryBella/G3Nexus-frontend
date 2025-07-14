'use client';

import React, { useState, useEffect } from 'react';
import ProjectCard from '@/app/components/ProjectCard';
import { useAuth } from '@/app/contexts/AuthContext';
import { projectService, Project } from '@/app/lib/services/projectService';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '@/app/lib/services';

const DashboardPage = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Hero carousel data with casual project environment images
    const heroSlides = [
        {
            image: '/images/hero1.jpeg',
            title: 'Collaborative',
            subtitle: 'Project Management',
            description: 'Work together seamlessly on projects with real-time collaboration and progress tracking',
            badge: 'Welcome to Your Projects'
        },
        {
            image: '/images/hero2.png',
            title: 'Digital',
            subtitle: 'Project Solutions',
            description: 'Modern tools and workflows designed to streamline your project development process',
            badge: 'Innovation Hub'
        },
        {
            image: '/images/hero3.jpg',
            title: 'Agile',
            subtitle: 'Team Workflows',
            description: 'Adaptive project management that grows with your team and evolving requirements',
            badge: 'Agile Excellence'
        }
    ];

    // Fetch projects based on user's client ID
    useEffect(() => {
        const fetchProjects = async () => {
            // Using dummy data for demonstration
            try {
                var user = authService.getCurrentUser();
                console.log('Current user:', user);

                setLoading(true);
                var projects = await projectService.getProjectsByClient(user.email);
                setProjects(projects);
                setError(null);
            } catch (err) {
                console.error('Error loading projects:', err);
                setError('Failed to load projects. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [user]);

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [heroSlides.length]);

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
                                {/* Badge */}
                                <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-200 text-sm font-semibold mb-6">
                                    <SparklesIcon className="w-4 h-4 mr-2" />
                                    {slide.badge}
                                </div>

                                {/* Title */}
                                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                                    <span className="block">{slide.title}</span>
                                    <span className="block bg-gradient-to-r from-[#ffbf00] to-[#ffbf00] bg-clip-text text-transparent">{slide.subtitle}</span>
                                </h1>

                                {/* Description */}
                                <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                                    {slide.description}
                                </p>
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
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
                    aria-label="Next slide"
                >
                    <ChevronRightIcon className="w-6 h-6" />
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

            {/* Projects Listing Section */}
            <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-blue-50/30 relative">
                {/* Floating Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-100/15 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-4 py-2 bg-blue-100/50 backdrop-blur-sm rounded-full text-blue-800 text-sm font-semibold mb-4">
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            Your Portfolio
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Active Projects
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            {user?.organizationName ?
                                `Explore and manage all projects for ${user.organizationName}` :
                                'Discover your ongoing projects and track their progress'
                            }
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                                <div className="absolute inset-0 rounded-full bg-blue-50/20"></div>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 text-center shadow-lg">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircleIcon className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-red-600 mb-2">Oops! Something went wrong</h3>
                            <p className="text-red-600 mb-6">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Projects Grid */}
                    {!loading && !error && (
                        <>
                            {projects.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-gray-100">
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <img
                                                src="/images/project.png"
                                                alt="No projects"
                                                className="w-12 h-12 opacity-50"
                                            />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-700 mb-3">
                                            No Projects Yet
                                        </h3>
                                        <p className="text-gray-500 max-w-md mx-auto">
                                            Your project portfolio is waiting to be filled. New projects will appear here once they're assigned to your organization.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap justify-center gap-8">
                                    {projects.map((project) => (
                                        <div className="w-full sm:w-80 lg:w-96">
                                            <ProjectCard
                                                key={project.projectId}
                                                id={project.projectId.toString()}
                                                title={project.projectName}
                                                description={project.projectDescription}
                                                status={project.status}
                                                createdAt={new Date(project.creationDate).toLocaleDateString()}
                                                projectType={project.projectType}
                                                budget={project.estimatedBudget}
                                                project={project}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;
