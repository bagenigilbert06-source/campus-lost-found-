import React, { useContext, useState } from 'react';
import { useLoaderData, useNavigate} from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

const UpdateItems = () => {
    const item = useLoaderData();
    const { _id, itemType, title, description, category, location, dateLost, images, image } = item;
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [imageUrls, setImageUrls] = useState(images && images.length > 0 ? images : (image ? [image] : []));
    const [imageInput, setImageInput] = useState('');

    const handleAddImageUrl = () => {
        if (!imageInput.trim()) {
            toast.error('Please enter a valid image URL');
            return;
        }
        setImageUrls([...imageUrls, imageInput]);
        setImageInput('');
    };

    const handleRemoveImage = (index) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const handleUpdate = e => {
        e.preventDefault();
        
        if (imageUrls.length === 0) {
            toast.error('Please add at least one image');
            return;
        }

        const form = e.target;
        const itemType = form.itemType.value;
        const title = form.title.value;
        const description = form.description.value;
        const category = form.category.value;
        const location = form.location.value;
        const dateLost = form.dateLost.value;

        const newItem = {
            itemType,
            title,
            description,
            category,
            location,
            dateLost,
            images: imageUrls,
            email: user.email,
            name: user.displayName,
        };

        fetch(`http://localhost:3001/api/items/${_id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(newItem),
        })
            .then(res => res.json())
            .then(data => {
                console.log("[v0] Update response:", data);
                if (data.modifiedCount > 0 || data.success || data._id) {
                    toast.success("Item updated successfully!");
                    navigate('/myItems')

                } else {
                    toast.error("Item update failed.");
                }
            });
    };

    return (
        <div className="container mx-auto w-[70%] mb-10 mt-10 bg-white rounded-lg shadow-lg space-y-8">
             <Helmet>
                <title>Update Item - {schoolConfig.name}</title>
             </Helmet>
            <h2 className="text-3xl font-bold text-zetech-primary mb-6 text-center pt-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Update Item Details
            </h2>
            <form className="space-y-6 p-8 " onSubmit={handleUpdate}>
                {/* Post Type */}
                <div className="form-control">
                    <label htmlFor="postType" className="block text-sm font-medium text-zetech-primary">
                        Post Type
                    </label>
                    <select
                        id="postType"
                        name="itemType"
                        defaultValue={itemType}
                        className="select select-bordered w-full mt-2"
                    >
                        <option value="Lost">Lost</option>
                        <option value="Found">Found</option>
                        <option value="Recovered">Recovered</option>
                    </select>
                </div>

                {/* Image URLs */}
                <div className="form-control">
                    <label className="block text-sm font-medium text-zetech-primary">Images</label>
                    <div className="flex gap-2 mt-2 mb-2">
                        <input
                            type="url"
                            placeholder="Enter Image URL"
                            className="input input-bordered w-full"
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
                            Add
                        </button>
                    </div>

                    {/* Image Preview Grid */}
                    {imageUrls.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-semibold mb-2">Images ({imageUrls.length})</p>
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
                <div className="form-control">
                    <label className="block text-sm font-medium text-zetech-primary">Title</label>
                    <input
                        type="text"
                        name="title"
                        defaultValue={title}
                        placeholder="Title"
                        className="input input-bordered w-full mt-2"
                        required
                    />
                </div>

                {/* Description */}
                <div className="form-control">
                    <label className="block text-sm font-medium text-zetech-primary">Description</label>
                    <textarea
                        className="textarea textarea-bordered w-full mt-2"
                        placeholder="Description"
                        name="description"
                        defaultValue={description}
                        required
                    ></textarea>
                </div>

                {/* Category */}
                <div className="form-control">
                    <label className="block text-sm font-medium text-zetech-primary">Category</label>
                    <select
                        defaultValue={category}
                        name="category"
                        className="select select-bordered w-full mt-2"
                    >
                        <option>Pets</option>
                        <option>Documents</option>
                        <option>Gadgets</option>
                    </select>
                </div>

                {/* Location */}
                <div className="form-control">
                    <label className="block text-sm font-medium text-zetech-primary">Location</label>
                    <input
                        type="text"
                        name="location"
                        defaultValue={location}
                        placeholder="Where was the item lost?"
                        className="input input-bordered w-full mt-2"
                        required
                    />
                </div>

                {/* Date Lost */}
                <div className="form-control">
                    <label className="block text-sm font-medium text-zetech-primary">Date Lost</label>
                    <input
                        type="date"
                        name="dateLost"
                        defaultValue={dateLost}
                        className="input input-bordered w-full mt-2"
                        required
                    />
                </div>

                {/* User Info */}
                <div className="form-control">
                    <label className="block text-sm font-medium text-zetech-primary">Email</label>
                    <input
                        type="text"
                        defaultValue={user.email}
                        readOnly
                        className="input input-bordered w-full mt-2"
                    />
                </div>

                <div className="form-control">
                    <label className="block text-sm font-medium text-zetech-primary">Name</label>
                    <input
                        type="text"
                        defaultValue={user.displayName}
                        readOnly
                        className="input input-bordered w-full mt-2"
                    />
                </div>

                {/* Update Button */}
                <div className="form-control mt-6">
                    <button className="bg-zetech-primary text-white w-40 mx-auto py-2 px-4 rounded-lg shadow hover:bg-zetech-accent hover:shadow-md hover:scale-105 transition">
                        Update Item
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateItems;
