import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Link } from 'react-router-dom';
import UseAxiosSecure from '../../Hooks/UseAxiosSecure';
import Swal from 'sweetalert2'; 
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

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
        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="table w-full">
            <thead className="bg-blue-50">
              <tr className="text-zetech-primary">
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Date Lost</th>
                <th>Update Info</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {posts.map((post) => (
                <tr key={post._id} className="border-b">
                  <td>
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <img src={post.image} alt={post.title} className="object-cover" />
                      </div>
                    </div>
                  </td>
                  <td className="font-semibold">{post.title}</td>
                  <td><span className="badge badge-ghost badge-sm">{post.category}</span></td>
                  <td className="text-sm">{post.location}</td>
                  <td className="text-sm">{post.dateLost}</td>
                  <td>
                    <Link to={`/update/${post._id}`}>
                      <button className="bg-zetech-primary text-white py-2 px-4 rounded-lg shadow hover:bg-zetech-accent hover:scale-105 transition">
                        Update
                      </button>
                    </Link>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(post._id)} className="bg-gradient-to-r from-red-400 to-red-600 text-white py-2 px-4 rounded-lg shadow hover:scale-105 transition">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyItemsPage;
