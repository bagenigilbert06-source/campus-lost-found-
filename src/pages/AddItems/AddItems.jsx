import React, { useContext, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

const AddItems = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState(''); // State to hold the image URL

    const handleAddItems = (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const initialData = Object.fromEntries(formData.entries());
        initialData.email = user?.email;
        initialData.name = user?.displayName;
        initialData.image = imageUrl; // Add the image URL to the data

        axios.post('http://localhost:3001/api/items', initialData, {
            headers: { 'Content-Type': 'application/json' },
        })
            .then((response) => {
                if (response.data.insertedId) {
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'Post has been added successfully!',
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    navigate('/allItems');
                }
            })
            .catch((error) => {
                console.error('Error adding post:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong! Please try again.',
                });
            });
    };

    return (
        <div className="lg:px-10 lg:py-10 w-[70%] mx-auto mb-5">
            <Helmet>
                <title>Add Lost & Found Item - {schoolConfig.name}</title>
            </Helmet>
            <form
                className="mx-auto p-10 m-14 bg-white rounded-xl shadow-lg space-y-6 hover:shadow-2xl transition-shadow duration-300"
                onSubmit={handleAddItems}
            >
                <h2 className="text-3xl font-bold text-zetech-primary mb-6">Add New Item</h2>

                {/* Post Type */}
                <div className="mb-4">
                    <label htmlFor="postType" className="block text-sm font-medium text-zetech-primary">
                        Post Type
                    </label>
                    <select
                        id="postType"
                        name="itemType"
                        className="select select-bordered w-full mt-2 focus:ring-zetech-primary"
                    >
                        <option>Post Type</option>
                        <option value="Lost">Lost</option>
                        <option value="Found">Found</option>
                        <option value="Recovered">Recovered</option>
                    </select>
                </div>

                {/* Image URL */}
                <div className="form-control mb-4">
                    <label className="label text-zetech-primary">
                        <span className="label-text">Image URL</span>
                    </label>
                    <input
                        type="text"
                        name="image"
                        placeholder="Enter Image URL"
                        className="input input-bordered w-full focus:ring-zetech-primary"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        required
                    />
                </div>

                {/* Title */}
                <div className="form-control mb-4">
                    <label className="label text-zetech-primary">
                        <span className="label-text">Title</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        className="input input-bordered w-full focus:ring-zetech-primary"
                        required
                    />
                </div>

                {/* Description */}
                <div className="form-control mb-4">
                    <label className="label text-zetech-primary">
                        <span className="label-text">Description</span>
                    </label>
                    <textarea
                        className="textarea textarea-bordered w-full focus:ring-zetech-primary"
                        placeholder="Description"
                        name="description"
                        required
                    ></textarea>
                </div>

                {/* Category */}
                <div className="form-control mb-4">
                    <label className="label text-zetech-primary">
                        <span className="label-text">Category</span>
                    </label>
                    <select
                        defaultValue="Pick a Category"
                        name="category"
                        className="select select-bordered w-full mt-2 focus:ring-zetech-primary"
                    >
                        <option>Pick a Category</option>
                        {schoolConfig.categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Location */}
                <div className="form-control mb-4">
                    <label className="label text-zetech-primary">
                        <span className="label-text">Location on Campus</span>
                    </label>
                    <select
                        name="location"
                        className="select select-bordered w-full mt-2 focus:ring-zetech-primary"
                        required
                    >
                        <option>Select Campus Location</option>
                        {schoolConfig.locations.map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Lost */}
                <div className="form-control mb-4">
                    <label className="label text-zetech-primary">
                        <span className="label-text">Date</span>
                    </label>
                    <input
                        type="date"
                        name="dateLost"
                        className="input input-bordered w-full focus:ring-zetech-primary"
                        required
                    />
                </div>

                {/* Contact Information - Email */}
                <div className="form-control mb-4">
                    <label className="label text-zetech-primary">
                        <span className="label-text">Email</span>
                    </label>
                    <input
                        type="text"
                        value={user?.email || ''}
                        readOnly
                        className="input input-bordered w-full focus:ring-zetech-primary"
                    />
                </div>

                {/* Contact Information - Name */}
                <div className="form-control mb-4">
                    <label className="label text-zetech-primary">
                        <span className="label-text">Name</span>
                    </label>
                    <input
                        type="text"
                        value={user?.displayName || ''}
                        readOnly
                        className="input input-bordered w-full focus:ring-zetech-primary"
                    />
                </div>

                {/* Submit Button */}
                <div className="form-control">
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-zetech-secondary to-orange-600 text-white mx-auto px-4 py-2 rounded-lg shadow-lg w-40 hover:scale-105 transform transition-all duration-300"
                    >
                        Add Post
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddItems;
