import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import { FaMapMarkerAlt, FaBuilding, FaSearch, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const CampusDirectory = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Campus locations organized by category
    const campusLocations = [
        // Academic Buildings
        {
            id: 1,
            name: 'Main Academic Block',
            category: 'academic',
            description: 'Primary lecture halls and classrooms',
            floor: 'Ground - 4th Floor',
            lostFoundContact: 'Room 101, Ground Floor',
            phone: schoolConfig.contact.phone
        },
        {
            id: 2,
            name: 'Science & Technology Block',
            category: 'academic',
            description: 'Computer labs, science laboratories',
            floor: 'Ground - 3rd Floor',
            lostFoundContact: 'Lab Reception, Ground Floor',
            phone: schoolConfig.contact.phone
        },
        {
            id: 3,
            name: 'Business School Building',
            category: 'academic',
            description: 'Business and management classrooms',
            floor: 'Ground - 2nd Floor',
            lostFoundContact: 'Admin Office, 1st Floor',
            phone: schoolConfig.contact.phone
        },
        // Administrative
        {
            id: 4,
            name: 'Administration Block',
            category: 'admin',
            description: 'Main administrative offices, registrar',
            floor: 'Ground - 2nd Floor',
            lostFoundContact: 'Reception, Ground Floor',
            phone: schoolConfig.contact.phone
        },
        {
            id: 5,
            name: 'Security Office',
            category: 'admin',
            description: 'Campus security and lost & found center',
            floor: 'Ground Floor',
            lostFoundContact: 'Main Security Desk',
            phone: schoolConfig.contact.phone,
            isMainLostFound: true
        },
        // Student Services
        {
            id: 6,
            name: 'Student Center',
            category: 'services',
            description: 'Student affairs, clubs, recreation',
            floor: 'Ground - 1st Floor',
            lostFoundContact: 'Information Desk',
            phone: schoolConfig.contact.phone
        },
        {
            id: 7,
            name: 'Library',
            category: 'services',
            description: 'Main campus library and study areas',
            floor: 'Ground - 3rd Floor',
            lostFoundContact: 'Circulation Desk, Ground Floor',
            phone: schoolConfig.contact.phone
        },
        {
            id: 8,
            name: 'Cafeteria',
            category: 'services',
            description: 'Main dining hall and food court',
            floor: 'Ground Floor',
            lostFoundContact: 'Cafeteria Manager Office',
            phone: schoolConfig.contact.phone
        },
        // Sports & Recreation
        {
            id: 9,
            name: 'Sports Complex',
            category: 'sports',
            description: 'Gymnasium, sports fields, fitness center',
            floor: 'Ground - 1st Floor',
            lostFoundContact: 'Sports Office',
            phone: schoolConfig.contact.phone
        },
        {
            id: 10,
            name: 'Swimming Pool',
            category: 'sports',
            description: 'Olympic-size swimming pool and changing rooms',
            floor: 'Ground Floor',
            lostFoundContact: 'Pool Reception',
            phone: schoolConfig.contact.phone
        },
        // Other Facilities
        {
            id: 11,
            name: 'Parking Area A',
            category: 'other',
            description: 'Main student parking lot',
            floor: 'Outdoor',
            lostFoundContact: 'Security Booth',
            phone: schoolConfig.contact.phone
        },
        {
            id: 12,
            name: 'Parking Area B',
            category: 'other',
            description: 'Staff and visitor parking',
            floor: 'Outdoor',
            lostFoundContact: 'Security Booth',
            phone: schoolConfig.contact.phone
        },
        {
            id: 13,
            name: 'Hostel Block A',
            category: 'housing',
            description: 'Student dormitory - Male',
            floor: 'Ground - 4th Floor',
            lostFoundContact: 'Hostel Warden Office',
            phone: schoolConfig.contact.phone
        },
        {
            id: 14,
            name: 'Hostel Block B',
            category: 'housing',
            description: 'Student dormitory - Female',
            floor: 'Ground - 4th Floor',
            lostFoundContact: 'Hostel Warden Office',
            phone: schoolConfig.contact.phone
        }
    ];

    const categories = [
        { id: 'all', name: 'All Locations', icon: FaMapMarkerAlt },
        { id: 'academic', name: 'Academic', icon: FaBuilding },
        { id: 'admin', name: 'Administration', icon: FaBuilding },
        { id: 'services', name: 'Student Services', icon: FaBuilding },
        { id: 'sports', name: 'Sports & Recreation', icon: FaBuilding },
        { id: 'housing', name: 'Housing', icon: FaBuilding },
        { id: 'other', name: 'Other', icon: FaMapMarkerAlt }
    ];

    const filteredLocations = campusLocations.filter(location => {
        const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            location.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || location.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-zetech-light to-white py-8 px-4">
            <Helmet>
                <title>Campus Directory | {schoolConfig.name} Lost & Found</title>
            </Helmet>

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-zetech-primary font-poppins mb-2">
                        Campus Directory
                    </h1>
                    <p className="text-gray-600">
                        Find campus locations and their lost & found contact points
                    </p>
                </div>

                {/* Main Lost & Found Center Card */}
                <div className="bg-gradient-to-r from-zetech-primary to-zetech-dark text-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <FaMapMarkerAlt className="text-3xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Main Lost & Found Center</h2>
                                <p className="opacity-90">Security Office, Ground Floor</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <FaPhone />
                                <span>{schoolConfig.contact.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaEnvelope />
                                <span>{schoolConfig.contact.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaClock />
                                <span>Mon-Fri: 8AM - 5PM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search locations..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zetech-primary"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                        selectedCategory === cat.id
                                            ? 'bg-zetech-primary text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Locations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLocations.map(location => (
                        <div 
                            key={location.id} 
                            className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition ${
                                location.isMainLostFound ? 'border-2 border-zetech-secondary' : ''
                            }`}
                        >
                            {location.isMainLostFound && (
                                <span className="inline-block bg-zetech-secondary text-white text-xs px-2 py-1 rounded mb-3">
                                    Main Lost & Found
                                </span>
                            )}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-zetech-light rounded-full flex items-center justify-center flex-shrink-0">
                                    <FaBuilding className="text-zetech-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-zetech-primary">{location.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-gray-500">
                                            <strong>Floors:</strong> {location.floor}
                                        </p>
                                        <p className="text-gray-500">
                                            <strong>Lost Items:</strong> {location.lostFoundContact}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredLocations.length === 0 && (
                    <div className="text-center py-12">
                        <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No locations found matching your search.</p>
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-12 bg-zetech-light rounded-xl p-6 text-center">
                    <h3 className="text-lg font-bold text-zetech-primary mb-2">
                        Can not find a location?
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Contact the main security office for assistance locating lost items across campus.
                    </p>
                    <a 
                        href={`tel:${schoolConfig.contact.phone}`}
                        className="inline-flex items-center gap-2 bg-zetech-primary text-white px-6 py-3 rounded-lg hover:bg-zetech-dark transition"
                    >
                        <FaPhone />
                        Call Security Office
                    </a>
                </div>
            </div>
        </div>
    );
};

export default CampusDirectory;
