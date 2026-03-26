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
    const [imageUrls, setImageUrls] = useState([]); // State to hold multiple image URLs
    const [imageInput, setImageInput] = useState(''); // Temp input for new image URL

    const handleAddImageUrl = () => {
        if (!imageInput.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Empty URL',
                text: 'Please enter a valid image URL',
            });
            return;
        }
        setImageUrls([...imageUrls, imageInput]);
        setImageInput('');
    };

    const handleRemoveImage = (index) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const handleAddItems = (e) => {
        e.preventDefault();

        // Validate required fields
        if (imageUrls.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please provide at least one image URL',
            });
            return;
        }

        if (!user?.email) {
            Swal.fire({
                icon: 'error',
                title: 'Authentication Error',
                text: 'Please log in to add an item',
            });
            return;
        }

        const formData = new FormData(e.target);
        const initialData = Object.fromEntries(formData.entries());
        initialData.email = user?.email;
        initialData.name = user?.displayName;
        initialData.images = imageUrls; // Send images array
        delete initialData.image; // Remove the old image field
        
        console.log("[v0] Submitting form with data:", initialData);

        axios.post('http://localhost:3001/api/items', initialData, {
            headers: { 'Content-Type': 'application/json' },
        })
            .then((response) => {
                console.log("[v0] Add items response:", response.data);
                // Check for various success indicators from the API
                if (response.status === 201 || response.data.insertedId || response.data._id || response.data.success) {
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        title: 'Post has been added successfully!',
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    navigate('/allItems');
                } else {
                    throw new Error('Unexpected response from server');
                }
            })
            .catch((error) => {
                console.error('[v0] Error adding post:', error.response?.data || error.message);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error.response?.data?.message || 'Something went wrong! Please try again.',
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

                {/* Image URLs */}
                <div className="form-control mb-4">
                    <label className="label text-zetech-primary">
                        <span className="label-text">Images (Add at least one)</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="url"
                            placeholder="Enter Image URL (e.g., https://example.com/image.jpg)"
                            className="input input-bordered w-full focus:ring-zetech-primary"
                            value={imageInput}
                            onChange={(e) => setImageInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddImageUrl();
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="btn btn-primary text-white px-6"
                        >
                            Add Image
                        </button>
                    </div>

                    {/* Image Preview Grid */}
                    {imageUrls.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-semibold mb-2">Added Images ({imageUrls.length})</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {imageUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-20 object-cover rounded-lg border-2 border-zetech-primary"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e2e8f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%2364748b" font-size="10">Invalid</text></svg>';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
