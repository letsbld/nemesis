import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                Protect Your Data with DLP Dashboard
                            </h1>
                            <p className="text-xl md:text-2xl mb-8">
                                Advanced data loss prevention solutions for your organization
                            </p>
                            <Link
                                href="/auth/login"
                                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-semibold mb-4">Real-time Monitoring</h3>
                                <p className="text-gray-600">
                                    Monitor sensitive data movement across your organization in real-time
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-semibold mb-4">Policy Management</h3>
                                <p className="text-gray-600">
                                    Create and manage data protection policies with ease
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
                                <p className="text-gray-600">
                                    Get detailed insights and analytics about your data security
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gray-50 py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold mb-8">Ready to Secure Your Data?</h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Start protecting your organization's sensitive information today
                        </p>
                        <Link
                            href="/contact"
                            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors inline-block"
                        >
                            Contact Us
                        </Link>
                    </div>
                </section>
            </div>
    );
}

