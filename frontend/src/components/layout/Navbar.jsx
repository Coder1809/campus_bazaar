import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Package, Search, MessageSquare, Inbox, ArrowLeftRight, Plus } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useNotificationStore from '../../stores/notificationStore';
import { Avatar } from '../ui';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const { user, isAuthenticated, logout } = useAuthStore();
    const { unreadCount } = useNotificationStore();
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
        setShowDropdown(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const authenticatedNavLinks = [
        { to: '/items', label: 'Browse', icon: Search, title: 'Browse items shared by students' },
        { to: '/my-items', label: 'My Items', icon: Package, title: "Items you've listed" },
        { to: '/requests', label: 'Inbox', icon: Inbox, title: "Requests and offers you've sent or received" },
        { to: '/transactions', label: 'Deals', icon: ArrowLeftRight, title: 'Your accepted deals and pickups' },
        { to: '/chats', label: 'Chats', icon: MessageSquare, title: 'Your conversations' },
    ];

    const publicNavLinks = [
        { to: '/items', label: 'Browse Marketplace', icon: Search, title: 'Browse items shared by students' },
    ];

    const currentNavLinks = isAuthenticated ? authenticatedNavLinks : publicNavLinks;

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Left: Brand & Main Navigation */}
                    <div className="flex items-center gap-6 lg:gap-8 min-w-0">
                        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                <span className="text-white font-black text-lg">C</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-extrabold text-gray-900 tracking-tight">CampusBazaar</span>
                                {isAuthenticated && user?.college && (
                                    <span className="hidden xl:inline-block px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-100 truncate max-w-[140px]">
                                        {user.college}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {currentNavLinks.map((link) => {
                                const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to + '/'));
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        title={link.title}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            isActive 
                                                ? 'text-blue-600 bg-blue-50/80 shadow-xs' 
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                                        }`}
                                    >
                                        <link.icon size={17} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Actions & User Menu */}
                    <div className="flex items-center gap-3 shrink-0">
                        {isAuthenticated ? (
                            <>
                                {/* Quick Post Button */}
                                <Link
                                    to="/my-items/new"
                                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm transition-all hover:shadow-md"
                                >
                                    <Plus size={15} strokeWidth={2.5} />
                                    <span>List Item</span>
                                </Link>

                                {/* Notification Bell */}
                                <Link 
                                    to="/notifications" 
                                    className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                    aria-label="Notifications"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* User Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all text-left"
                                        aria-expanded={showDropdown}
                                    >
                                        <Avatar src={user?.avatar} name={user?.fullName} size="sm" />
                                        <span className="hidden sm:block text-sm font-semibold text-gray-800 max-w-[110px] truncate">
                                            {user?.fullName?.split(' ')[0] || user?.username || 'User'}
                                        </span>
                                    </button>

                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                            <div className="px-4 py-2.5 border-b border-gray-100">
                                                <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>
                                            <Link
                                                to="/profile"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                            >
                                                <User size={16} className="text-gray-400" />
                                                My Profile
                                            </Link>
                                            <Link
                                                to="/my-items"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                            >
                                                <Package size={16} className="text-gray-400" />
                                                My Listed Items
                                            </Link>
                                            <div className="border-t border-gray-100 my-1" />
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50/80 transition-colors text-left"
                                            >
                                                <LogOut size={16} />
                                                Log Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Link 
                                    to="/login" 
                                    className="px-3.5 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all"
                                >
                                    Log In
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Hamburger Toggle */}
                        <button
                            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label={isOpen ? 'Close menu' : 'Open menu'}
                        >
                            {isOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {isOpen && (
                    <div className="md:hidden py-3 border-t border-gray-100 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        {currentNavLinks.map((link) => {
                            const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to + '/'));
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    title={link.title}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                        isActive 
                                            ? 'text-blue-600 bg-blue-50 font-bold' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    <link.icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}

                        {isAuthenticated && (
                            <div className="pt-2">
                                <Link
                                    to="/my-items/new"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm"
                                >
                                    <Plus size={16} />
                                    <span>List a New Item</span>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
