import React, { useContext, useEffect, useState } from 'react';
import { FiGrid, FiTable, FiMapPin, FiCalendar, FiUser } from 'react-icons/fi';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import { schoolConfig } from '../../config/schoolConfig';

const AllRecoveredItems = () => {
  const { user } = useContext(AuthContext);
  const [recoverItem, setRecoverItem] = useState([]);
  const [isGridLayout, setIsGridLayout] = useState(true);
  const [loading, setLoading] = useState(true);

  const axiosSecure = UseAxiosSecure();

  useEffect(() => {
    if (user && user.email) {
      axiosSecure
        .get(`/items/recovered?email=${user.email}`)
        .then((res) => {
          console.log('[v0] Recovered items response:', res.data);
          // Handle both formats: direct array or wrapped in success/data
          const items = res.data.data || res.data;
          setRecoverItem(Array.isArray(items) ? items : []);
          setLoading(false);
        })
        .catch((error) => {
          console.error('[v0] Error fetching recovered items:', error);
          setLoading(false);
          setRecoverItem([]);
        });
    }
  }, [user, axiosSecure]);

  // Toggle between grid and table layout
  const toggleLayout = () => {
    setIsGridLayout((prevLayout) => !prevLayout);
  };

  return (
    <div className="p-10 pb-32 min-h-screen bg-zetech-light">
      <Helmet>
        <title>Recovered Items - {schoolConfig.name}</title>
      </Helmet>

      <h1 className="text-2xl font-bold text-zetech-primary mb-6">Recovered Items</h1>

      {/* Button to toggle between grid and table view */}
      <div className="flex justify-end">
        <button
          onClick={toggleLayout}
          className={`mb-6 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${isGridLayout
              ? 'bg-zetech-primary text-white shadow-md transform hover:scale-105'
              : 'bg-gray-200 text-gray-600 hover:bg-zetech-primary hover:text-white'
            }`}
        >
          {isGridLayout ? (
            <h2 className="flex items-center gap-2">
              <FiTable className="text-lg" />
              Table View
            </h2>
          ) : (
            <h2 className="flex items-center gap-2">
              <FiGrid className="text-lg" />
              Grid View
            </h2>
          )}
        </button>
      </div>

      {/* Show Spinner while loading */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zetech-primary"></div>
        </div>
      )}

      {/* Conditional Rendering for Grid or Table Layout */}
      {!loading && (recoverItem.length > 0 ? (
        isGridLayout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recoverItem.map((item) => (
              <div key={item._id} className="border p-4 rounded-md bg-gray-50 shadow-sm hover:bg-gray-100">
                {/* Image */}
                <div className="mb-4">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-40 object-cover rounded-md" onError={(e) => {e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23e2e8f0" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%2364748b">No Image</text></svg>';}} />
                  ) : item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded-md" onError={(e) => {e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><rect fill="%23e2e8f0" width="300" height="200"/><text x="150" y="100" text-anchor="middle" fill="%2364748b">No Image</text></svg>';}} />
                  ) : (
                    <div className="w-full h-40 bg-gray-300 rounded-md flex items-center justify-center text-gray-500">
                      No image available
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>

                {/* Description */}
                <p className="text-gray-600">{item.description || 'No description available.'}</p>

                {/* Icons */}
                <div className="mt-4 text-sm text-gray-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <FiUser />
                    <span>{item.recoveredBy.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar />
                    <span>{new Date(item.recoveredDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin />
                    <span>{item.recoveredLocation || 'No location available'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
            <table className="min-w-full table-auto">
              <thead className="bg-blue-50">
                <tr className="text-zetech-primary">
                  <th className="border px-4 py-2">Image</th>
                  <th className="border px-4 py-2">Title</th>
                  <th className="border px-4 py-2">Description</th>
                  <th className="border px-4 py-2">Recovered By</th>
                  <th className="border px-4 py-2">Date</th>
                  <th className="border px-4 py-2">Location</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {recoverItem.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.title} className="w-16 h-16 object-cover rounded-md" onError={(e) => {e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e2e8f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%2364748b" font-size="10">No Image</text></svg>';}} />
                      ) : item.image ? (
                        <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-md" onError={(e) => {e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e2e8f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%2364748b" font-size="10">No Image</text></svg>';}} />
                      ) : (
                        <div className="w-16 h-16 bg-gray-300 rounded-md flex items-center justify-center text-gray-500">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="border px-4 py-2">{item.title}</td>
                    <td className="border px-4 py-2">{item.description || 'No description available.'}</td>
                    <td className="border px-4 py-2">{item.recoveredBy.name}</td>
                    <td className="border px-4 py-2">{new Date(item.recoveredDate).toLocaleDateString()}</td>
                    <td className="border px-4 py-2">{item.recoveredLocation || 'No location available'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center text-gray-600">
          <p className="text-xl font-semibold">No recovered items found.</p>
          <p>It seems like there are no items to display at the moment. Please check back later!</p>
        </div>
      ))}
    </div>
  );
};

export default AllRecoveredItems;
