import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Link } from 'react-router-dom';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import Swal from 'sweetalert2'; 
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';
import { FaCheckCircle, FaClock } from 'react-icons/fa';
import PlaceholderImage from '../../components/PlaceholderImage';

const MyItemsPage = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const axiosSecure = UseAxiosSecure();

  useEffect(() => {
    setLoading(true);
    axiosSecure.get(`/item?email=${user.email}`)
      .then(res => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.email]);

  const handleDelete = _id => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:3001/api/items/${_id}`, {
          method: 'DELETE',
        })
          .then(res => res.json())
          .then(data => {
            console.log("[v0] Delete response:", data);
            if (data.deletedCount > 0 || data.success || data.message) {
              Swal.fire("Deleted!", "Your item has been deleted.", "success");
              setPosts(posts.filter(post => post._id !== _id));
            } else {
              Swal.fire("Error!", "Item could not be deleted.", "error");
            }
          })
          .catch(() => Swal.fire("Error!", "An error occurred while deleting the item.", "error"));
      }
    });
  };

  return (
    <div className="p-10 pb-32 min-h-screen bg-zetech-light">
      <Helmet>
        <title>Manage My Items - {schoolConfig.name}</title>
      </Helmet>

      <h1 className="text-2xl font-bold text-zetech-primary mb-6">My Reported Items</h1>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-12 h-12 border-4 border-zetech-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center space-y-4 bg-white p-8 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-zetech-primary">You have no posts yet.</h2>
          <p className="text-lg text-gray-600">Add your first lost or found item to get started.</p>
          <Link to="/addItems">
            <button className="bg-zetech-primary text-white py-2 px-6 rounded-lg shadow hover:bg-zetech-accent hover:scale-105 transition">
              Report an Item
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const imageUrl = (post.images && post.images.length > 0) ? post.images[0] : post.image;
            const statusIcon = post.status === 'recovered' ? (
              <FaCheckCircle className="text-green-500" size={20} />
            ) : post.status === 'claimed' ? (
              <FaClock className="text-yellow-500" size={20} />
            ) : (
              <FaClock className="text-blue-500" size={20} />
            );
            
            return (
              <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border-l-4 border-zetech-primary">
                {/* Image Section */}
                <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden flex items-center justify-center">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.parentElement?.querySelector('[data-placeholder]')) {
                          e.target.parentElement.querySelector('[data-placeholder]').style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <div data-placeholder className="w-full h-full flex items-center justify-center">
                      <PlaceholderImage />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {statusIcon}
                    <span>{post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : 'Active'}</span>
                  </div>
                  {/* Item Type Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded-full ${
                    post.itemType === 'Lost' ? 'bg-red-500' :
                    post.itemType === 'Found' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}>
                    {post.itemType === 'Lost' ? '🔴' : post.itemType === 'Found' ? '🟢' : '✓'} {post.itemType}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-zetech-primary mb-2 line-clamp-2">{post.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Category:</strong> <span className="badge badge-sm badge-outline">{post.category}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Location:</strong> {post.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Date:</strong> {new Date(post.dateLost || post.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link to={`/update/${post._id}`} className="flex-1">
                      <button className="w-full bg-zetech-primary text-white py-2 rounded-lg shadow hover:shadow-md hover:scale-105 transition text-sm font-semibold">
                        Edit
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(post._id)} 
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg shadow hover:shadow-md hover:scale-105 transition text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyItemsPage;
