import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import AuthContext from '../context/Authcontext/AuthContext';
import { 
    FaShieldAlt, 
    FaHome, 
    FaBoxes, 
    FaCheckCircle, 
    FaUsers, 
    FaCog, 
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaArrowLeft
} from 'react-icons/fa';

const AdminLayout = () => {
    const { user, signOutUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const handleSignOut = async () => {
        try {
            await signOutUser();
            toast.success("Successfully signed out!");
            navigate("/admin-login");
        } catch {
            toast.error("Cannot sign out, please try again.");
        }
    };

    const navItems = [
        { path: '/admin', icon: FaHome, label: 'Dashboard', exact: true },
        { path: '/admin/items', icon: FaBoxes, label: 'All Items' },
        { path: '/admin/pending', icon: FaCheckCircle, label: 'Pending Verification' },
        { path: '/admin/users', icon: FaUsers, label: 'Users' },
        { path: '/admin/settings', icon: FaCog, label: 'Settings' },
    ];

    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const fallbackAvatar = "https://ui-avatars.com/api/?name=Admin&background=10b981&color=ffffff";

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster />
            
            {/* Mobile Header */}
            <div className="lg:hidden bg-zetech-primary text-white p-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                    <div className="flex items-center gap-2">
                        <FaShieldAlt className="text-xl" />
                        <span className="font-semibold">Admin Panel</span>
                    </div>
                </div>
                <div className="h-8 w-8 overflow-hidden rounded-full">
                    <img
                        src={user?.photoURL || fallbackAvatar}
                        alt={user?.displayName || "Admin"}
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>

            <div className="flex">
                {/* Sidebar Overlay for Mobile */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed lg:sticky top-0 left-0 h-screen w-64 bg-zetech-primary text-white
                    transform transition-transform duration-300 ease-in-out z-50
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="flex flex-col h-full">
                        {/* Sidebar Header */}
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded-lg">
                                    <FaShieldAlt className="text-2xl" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg">Security Office</h2>
                                    <p className="text-xs text-white/60">Admin Panel</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 overflow-y-auto">
                            <ul className="space-y-2">
                                {navItems.map((item) => (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                                ${isActive(item.path, item.exact) 
                                                    ? 'bg-white text-zetech-primary font-semibold' 
                                                    : 'text-white/80 hover:bg-white/10 hover:text-white'}
                                            `}
                                        >
                                            <item.icon className="text-lg" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            {/* Divider */}
                            <div className="my-6 border-t border-white/10" />

                            {/* Back to Main Site */}
                            <Link
                                to="/"
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200"
                            >
                                <FaArrowLeft className="text-lg" />
                                <span>Back to Main Site</span>
                            </Link>
                        </nav>

                        {/* User Section */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-lg">
                                <div className="h-10 w-10 overflow-hidden rounded-full">
                                    <img
                                        src={user?.photoURL || fallbackAvatar}
                                        alt={user?.displayName || "Admin"}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">
                                        {user?.displayName || "Admin"}
                                    </p>
                                    <p className="text-xs text-white/60 truncate">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                <FaSignOutAlt />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-h-screen lg:min-h-[calc(100vh)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
