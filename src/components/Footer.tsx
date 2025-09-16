'use client';

import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-1">
                        <h3 className="text-lg font-bold mb-4">DLP Dashboard</h3>
                        <p className="text-gray-300 text-sm">
                            Protecting your data with advanced security solutions.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1">
                        <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-gray-300 hover:text-white text-sm">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="text-gray-300 hover:text-white text-sm">
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-300 hover:text-white text-sm">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-1">
                        <h3 className="text-lg font-bold mb-4">Contact Us</h3>
                        <ul className="space-y-2">
                            <li className="text-gray-300 text-sm">Email: info@dlp-dashboard.com</li>
                            <li className="text-gray-300 text-sm">Phone: +1 (555) 123-4567</li>
                            <li className="text-gray-300 text-sm">Address: 123 Security St, Cyber City</li>
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div className="col-span-1">
                        <h3 className="text-lg font-bold mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-300 hover:text-white">
                                LinkedIn
                            </a>
                            <a href="#" className="text-gray-300 hover:text-white">
                                Twitter
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p className="text-gray-300 text-sm">
                        © {new Date().getFullYear()} DLP Dashboard. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
