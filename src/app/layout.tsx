// src/app/layout.tsx
import { AuthProvider } from '@/app/contexts/AuthContext';
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
                {children}
            </AuthProvider>
        </ReactQueryProvider>
        </body>
        </html>
    );
}
