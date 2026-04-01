import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ItemsCard from './ItemsCard';

const LatestItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
    fetch(`${apiUrl}/items`)
            .then((res) => res.json())
            .then((response) => {
                const data = Array.isArray(response) ? response : response.data || [];
                console.log("[LatestItems] Items response:", response);

                const sortedItems = data
                    .map((item) => ({
                      ...item,
                      _sortDate: new Date(item.dateLost || item.createdAt || item.date || Date.now()),
                    }))
                    .sort((a, b) => b._sortDate - a._sortDate);

                const latestItems = sortedItems.slice(0, 6);
                setItems(latestItems);
            })
            .catch((error) => {
                console.error('Error fetching items:', error);
                setItems([]);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="container mx-auto px-6 py-12">
            {/* Header Section */}
            <div className="text-center mb-10">
                <motion.h2 
                  className="text-4xl md:text-5xl font-bold mb-3"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Latest Items on Campus
                </motion.h2>
                <motion.p 
                  className="text-lg text-slate-600 dark:text-slate-400 font-medium"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Check out the most recently reported lost & found items!
                </motion.p>
            </div>

            {/* Loader */}
            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-zetech-primary border-solid"></div>
                </div>
            ) : (
                <>
                    {/* Items Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                        {items.length > 0 ? (
                            items.map((item) => <ItemsCard key={item._id} item={item} />)
                        ) : (
                            <p className="text-center text-gray-500 col-span-full text-lg font-medium">
                                No items reported yet.
                            </p>
                        )}
                    </div>

                    {/* Footer Section */}
                    <motion.div 
                      className="text-center pt-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Link to="/allItems">
                            <motion.button 
                              className="glass-button-primary px-8 py-3 text-base font-semibold"
                              whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}
                              whileTap={{ scale: 0.98 }}
                            >
                                See All Items
                            </motion.button>
                        </Link>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default LatestItems;
