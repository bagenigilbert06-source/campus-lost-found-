import React, { useContext } from 'react';
import { useLoaderData, useNavigate} from 'react-router-dom';
import AuthContext from '../../context/Authcontext/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { schoolConfig } from '../../config/schoolConfig';

const UpdateItems = () => {
    const item = useLoaderData();
    const { _id, itemType, title, description, category, location, dateLost, image } = item;
    const { user } = useContext(AuthContext);
    const navigate = useNavigate()

    const handleUpdate = e => {
        e.preventDefault();
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
            email: user.email,
            name: user.displayName,
        };

        fetch(`https://b10a11-server-side-noorjahan220.vercel.app/itemUpdate/${_id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(newItem),
        })
            .then(res => res.json())
            .then(data => {
                if (data.modifiedCount > 0) {
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

                {/* Image Upload */}
                <div className="form-control">
                    <label className="block text-sm font-medium text-zetech-primary">Upload Image URL</label>
                    <input
                        type="text"
                        name="image"
                        defaultValue={image}
                        placeholder="Enter Image URL"
                        className="input input-bordered w-full mt-2"
                        required
                    />
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
