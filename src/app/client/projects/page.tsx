// src/app/client/projects/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ProjectCard from '@/app/components/ProjectCard';
import { useAuth } from '@/app/contexts/AuthContext';
import { projectService, Project } from '@/app/lib/services/projectService';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ProjectsPage = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Hero images for the carousel
    const heroImages = [
        {
            src: '/images/hero1.jpeg',
            alt: 'Professional workspace with team collaboration',
            title: 'Collaborative Project Management'
        },
        {
            src: '/images/hero2.png',
            alt: 'Modern office environment with digital screens',
            title: 'Digital Project Solutions'
        },
        {
            src: '/images/hero3.jpg',
            alt: 'Casual team meeting in contemporary office',
            title: 'Agile Team Workflows'
        }
    ];

    // Fetch projects based on user's client ID
    useEffect(() => {
        const fetchProjects = async () => {
            if (!user || !user.clientId) {
                setError('Client information not available');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const userProjects = await projectService.getProjectsByClient(user.clientId);
                setProjects(userProjects);
                setError(null);
            } catch (err) {
                console.error('Error fetching projects:', err);
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
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [heroImages.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section with Carousel */}
            <section className="relative h-96 overflow-hidden -mx-6 -mt-6">
                <div className="relative w-full h-full">
                    {heroImages.map((image, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url('${image.src}')` }}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <div className="text-center text-white px-4">
                                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                                            {image.title}
                                        </h1>
                                        <p className="text-xl md:text-2xl">
                                            Manage Your Projects with Ease
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
                    >
                        <ChevronLeftIcon className="h-6 w-6 text-white" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
                    >
                        <ChevronRightIcon className="h-6 w-6 text-white" />
                    </button>

                    {/* Slide Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {heroImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                    index === currentSlide
                                        ? 'bg-white'
                                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Listing Section */}
            <section className="py-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Projects</h2>
                    <p className="text-gray-600">
                        {user?.organizationName && `Projects for ${user.organizationName}`}
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 text-lg">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Projects Grid */}
                {!loading && !error && (
                    <>
                        {projects.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-gray-100 rounded-lg p-12">
                                    <img
                                        src="/images/project.png"
                                        alt="No projects"
                                        className="mx-auto mb-6 w-24 h-24 opacity-50"
                                    />
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                        No Projects Found
                                    </h3>
                                    <p className="text-gray-500">
                                        There are no projects associated with your account at this time.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <ProjectCard
                                        key={project.projectId}
                                        id={project.projectId.toString()}
                                        title={project.projectName}
                                        description={project.projectDescription}
                                        status={project.status}
                                        createdAt={new Date(project.creationDate).toLocaleDateString()}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default ProjectsPage;