// src/app/client/projects/page.tsx
import React from 'react';
import Navbar from '@/app/components/Navbar';
import ProjectCard from '@/app/components/ProjectCard';

// You can replace this with actual data fetching
const projectsData = [
    {
        id: '1',
        title: 'Custom CRM System',
        description: 'Manage customer relationships effectively',
        status: 'Active',
        createdAt: '2024-03-15',
    },
    {
        id: '2',
        title: 'E-commerce Platform',
        description: 'Optimize customer data management',
        status: 'In Progress',
        createdAt: '2024-03-10',
    },
    {
        id: '3',
        title: 'Mobile App Development',
        description: 'Boost your online business',
        status: 'Planning',
        createdAt: '2024-03-05',
    },
];

const ProjectsPage = () => {
    return (
        <div className="relative w-full min-h-screen">
            {/* Background Image with Opacity */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-70"
                style={{ backgroundImage: "url('/images/background-image.png')" }}
            ></div>

            {/* Content on Top of the Background */}
            <div className="relative z-10 w-full h-full">
                {/* Navbar */}
                <Navbar />

                {/* Page Content */}
                <section className="container mx-auto py-8 px-4">
                    <div className="flex justify-center items-center mt-52 mb-28">
                        <h1 className="text-4xl md:text-6xl font-bold text-[#3450A3]">
                            Manage Your Projects with Ease
                        </h1>
                    </div>

                    {/* Project Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projectsData.map((project) => (
                            <ProjectCard
                                key={project.id}
                                id={project.id}
                                title={project.title}
                                description={project.description}
                                status={project.status}
                                createdAt={project.createdAt}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProjectsPage;