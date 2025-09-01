// src/app/layout.tsx
import { AuthProvider } from '@/app/contexts/AuthContext';
import { ProjectProvider } from '@/app/contexts/ProjectContext';
import { ReactQueryProvider } from './react-query-provider';
import './globals.css';

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>
        <ReactQueryProvider>
            <AuthProvider>
                <ProjectProvider>
                    {children}
                </ProjectProvider>
            </AuthProvider>
        </ReactQueryProvider>
        </body>
        </html>
    );
}
