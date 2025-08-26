import Image from "next/image";
import Link from "next/link";

export default function AccessDenied() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <Image
                src="/images/403.png"
                alt="403 Access Denied"
                width={420}
                height={420}
                className="mb-6"
            />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-lg text-gray-600 mb-6 text-center max-w-md">
                Sorry, you do not have permission to access this page.
            </p>
            <Link
                href="/"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Go to Home
            </Link>
        </div>
    );
}
