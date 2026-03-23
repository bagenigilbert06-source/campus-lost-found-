import React, { useState, useEffect } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import { GlassSearchBar, GlassCard, GlassButton } from '../../components/glass';
import ItemsCard from '../Home/ItemsCard';

const AllItems = () => {
    const items = useLoaderData();
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    
    const categories = [...new Set(items.map(item => item.category))];
    const suggestions = [...new Set(items.map(item => item.title))].slice(0, 8);

    useEffect(() => {
        setLoading(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchValue(searchValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchValue]);

    const filteredItems = items.filter(
        (item) =>
            (selectedCategory ? item.category === selectedCategory : true) &&
            (
                item.title?.toLowerCase().includes(debouncedSearchValue.toLowerCase()) || 
                item.location?.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
                item.category?.toLowerCase().includes(debouncedSearchValue.toLowerCase())
            )
    );

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <Helmet>
                <title>Lost & Found Items - {schoolConfig.name}</title>
            </Helmet>
            
            {/* Header Section */}
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-4xl md:text-5xl font-bold gradient-text-green mb-3">
                    Discover Items
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-semibold text-lg">
                    Find what you're looking for or list lost and found items easily!
                </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
                className="mb-6 flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="w-full max-w-3xl">
                    <GlassSearchBar
                        placeholder="Search by title, location, or category..."
                        value={searchValue}
                        onSearch={setSearchValue}
                        suggestions={suggestions}
                        onSuggestionClick={(suggestion) => setSearchValue(suggestion)}
                    />
                </div>
            </motion.div>

            {/* Horizontal Categories Bar */}
            <motion.div
                className="mb-8 overflow-x-auto pb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <div className="flex gap-3 min-w-min">
                    {/* All Categories Button */}
                    <motion.button
                        onClick={() => setSelectedCategory('')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                            !selectedCategory
                                ? 'glass-button-primary shadow-lg'
                                : 'glass-button-secondary hover:scale-105'
                        }`}
                    >
                        <span>🏷️</span>
                        <span>All</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            !selectedCategory 
                                ? 'bg-white/25 text-white' 
                                : 'bg-slate-400 dark:bg-slate-600 text-slate-800 dark:text-slate-200'
                        }`}>
                            {items.length}
                        </span>
                    </motion.button>

                    {/* Category Buttons */}
                    {categories.map((category, idx) => (
                        <motion.button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                                selectedCategory === category
                                    ? 'glass-button-primary shadow-lg'
                                    : 'glass-button-secondary hover:scale-105'
                            }`}
                        >
                            <span className="capitalize">{category}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                selectedCategory === category
                                    ? 'bg-white/25 text-white'
                                    : 'bg-slate-400 dark:bg-slate-600 text-slate-800 dark:text-slate-200'
                            }`}>
                                {items.filter(i => i.category === category).length}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Main Content Section */}
            <motion.div
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
            >
                    {loading ? (
                        <div className="flex justify-center items-center h-96">
                            <div className="glass-card-default p-8 rounded-2xl">
                                <div className="w-16 h-16 border-4 border-zetech-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-center text-slate-600 dark:text-slate-400 font-semibold">
                                    Loading items...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <ItemsCard 
                                        key={item._id} 
                                        item={item}
                                        delay={0}
                                    />
                                ))
                            ) : (
                                <motion.div
                                    className="col-span-full text-center py-16"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="glass-card-default p-12 rounded-2xl inline-block">
                                        <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                            No items found
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Try adjusting your search or category filters
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
            </motion.div>

            {/* Footer Section */}
            <motion.div
                className="text-center mt-16 mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
            >
                <Link to="/addItems">
                    <GlassButton
                        variant="primary"
                        size="lg"
                    >
                        Post Your Item
                    </GlassButton>
                </Link>
            </motion.div>
        </div>
    );
};

export default AllItems;
