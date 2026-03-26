import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { schoolConfig } from '../../config/schoolConfig';
import {
  FaChartBar,
  FaChartLine,
  FaPercentage,
  FaCalendar
} from 'react-icons/fa';
import AdminContainer from '../../components/admin/AdminContainer';
import StatsCard from '../../components/admin/StatsCard';
import LoadingState from '../../components/admin/LoadingState';

const AdminReports = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [items]);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/items');
      setItems(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error('[v0] Error fetching items:', error);
      toast.error('Failed to load report data');
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalItems = items.length;
    const lostItems = items.filter(i => i.itemType === 'Lost').length;
    const foundItems = items.filter(i => i.itemType === 'Found').length;
    const recoveredItems = items.filter(i => i.status === 'recovered').length;
    const verifiedItems = items.filter(i => i.verificationStatus === 'verified').length;
    const pendingItems = items.filter(i => !i.verificationStatus || i.verificationStatus === 'pending').length;
    const rejectedItems = items.filter(i => i.verificationStatus === 'rejected').length;

    const categoryCount = {};
    items.forEach(item => {
      if (item.category) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      }
    });

    const locationCount = {};
    items.forEach(item => {
      if (item.location) {
        locationCount[item.location] = (locationCount[item.location] || 0) + 1;
      }
    });

    setStats({
      totalItems,
      lostItems,
      foundItems,
      recoveredItems,
      verifiedItems,
      pendingItems,
      rejectedItems,
      recoveryRate: totalItems > 0 ? ((recoveredItems / totalItems) * 100).toFixed(1) : 0,
      verificationRate: totalItems > 0 ? ((verifiedItems / totalItems) * 100).toFixed(1) : 0,
      categoryCount: Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      locationCount: Object.entries(locationCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    });
  };

  if (loading) {
    return (
      <AdminContainer>
        <LoadingState type="full" />
      </AdminContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Reports | ${schoolConfig.name} Lost & Found`}</title>
      </Helmet>

      <AdminContainer>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">View detailed statistics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={FaChartBar}
            label="Total Items"
            value={stats.totalItems || 0}
            color="zetech-primary"
          />
          <StatsCard
            icon={FaChartBar}
            label="Lost Items"
            value={stats.lostItems || 0}
            color="red"
          />
          <StatsCard
            icon={FaChartBar}
            label="Found Items"
            value={stats.foundItems || 0}
            color="green"
          />
          <StatsCard
            icon={FaChartLine}
            label="Recovered"
            value={stats.recoveredItems || 0}
            color="zetech-secondary"
          />
        </div>

        {/* Verification & Recovery Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Verification Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Verified</span>
                  <span className="text-sm font-bold text-green-600">{stats.verifiedItems || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${stats.verificationRate || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{stats.verificationRate || 0}% verified</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Pending Review</span>
                  <span className="text-sm font-bold text-yellow-600">{stats.pendingItems || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${stats.totalItems ? ((stats.pendingItems / stats.totalItems) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Rejected</span>
                  <span className="text-sm font-bold text-red-600">{stats.rejectedItems || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${stats.totalItems ? ((stats.rejectedItems / stats.totalItems) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recovery Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Recovered Items</span>
                  <span className="text-sm font-bold text-zetech-secondary">{stats.recoveredItems || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-zetech-secondary h-2 rounded-full"
                    style={{ width: `${stats.recoveryRate || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{stats.recoveryRate || 0}% recovery rate</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Active Items</span>
                  <span className="text-sm font-bold text-blue-600">
                    {stats.totalItems - stats.recoveredItems}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${stats.totalItems ? (((stats.totalItems - stats.recoveredItems) / stats.totalItems) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category & Location Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Categories */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Items by Category</h3>
            {stats.categoryCount && stats.categoryCount.length > 0 ? (
              <div className="space-y-4">
                {stats.categoryCount.map(([category, count]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className="text-sm font-bold text-zetech-primary">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-zetech-primary h-2 rounded-full"
                        style={{ width: `${(count / stats.totalItems) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Items by Location</h3>
            {stats.locationCount && stats.locationCount.length > 0 ? (
              <div className="space-y-4">
                {stats.locationCount.map(([location, count]) => (
                  <div key={location}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 truncate">{location}</span>
                      <span className="text-sm font-bold text-zetech-secondary">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-zetech-secondary h-2 rounded-full"
                        style={{ width: `${(count / stats.totalItems) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>
      </AdminContainer>
    </>
  );
};

export default AdminReports;
