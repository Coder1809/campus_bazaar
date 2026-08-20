import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { Package, Users, Clock, ShieldCheck, MessageSquare, ShoppingBag, PlusCircle, Inbox } from 'lucide-react';
import useAuthStore from '../stores/authStore';

const features = [
    {
        icon: Package,
        title: 'Share Items',
        description: 'Rent, sell, or give away items you no longer need.'
    },
    {
        icon: Users,
        title: 'Campus Community',
        description: 'Connect with fellow students at your university.'
    },
    {
        icon: Clock,
        title: 'Smart Reminders',
        description: 'Never forget a return date with automatic reminders.'
    },
    {
        icon: ShieldCheck,
        title: 'Verified Deals',
        description: 'Structured rental agreements and handoff tracking.'
    },
    {
        icon: MessageSquare,
        title: 'Real-Time Chat',
        description: 'Communicate securely with transaction partners.'
    },
];

const actionCards = [
    {
        icon: ShoppingBag,
        title: 'Browse Items',
        description: 'Discover items shared by your campus community.',
        to: '/items'
    },
    {
        icon: PlusCircle,
        title: 'List an Item',
        description: 'Share, rent, or sell something you own.',
        to: '/my-items/new'
    },
    {
        icon: Inbox,
        title: 'Request Inbox',
        description: 'Manage incoming and outgoing trade requests.',
        to: '/requests'
    }
];

export default function Home() {
    const { isAuthenticated } = useAuthStore();

    return (
        <div className="space-y-12 md:space-y-16 py-4 md:py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <section className="text-center py-8 md:py-12 flex flex-col items-center justify-center">
                <div className="max-w-3xl mx-auto px-2">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                        Share More, <span className="text-blue-600">Spend Less</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
                        The campus sharing platform where students rent, sell, and share items with each other.
                        {!isAuthenticated && ' Join your university community today.'}
                    </p>
                    {!isAuthenticated && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-md mx-auto">
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold shadow-sm rounded-xl">
                                    Get Started
                                </Button>
                            </Link>
                            <Link to="/items" className="w-full sm:w-auto">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-xl border-gray-300">
                                    Browse Items
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Quick Access Grid (Authenticated) */}
            {isAuthenticated && (
                <section className="max-w-4xl mx-auto">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {actionCards.map((card, index) => (
                            <Link key={index} to={card.to} className="group">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md group-hover:border-blue-200 transition-all text-center h-full flex flex-col items-center justify-center">
                                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                                        <card.icon className="text-blue-600" size={28} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.title}</h3>
                                    <p className="text-sm text-gray-500 leading-normal">{card.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Features Section (non-authenticated) */}
            {!isAuthenticated && (
                <section className="max-w-5xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 tracking-tight mb-10 md:mb-12">
                        Why CampusBazaar?
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all flex flex-col items-start"
                            >
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                                    <feature.icon className="text-blue-600" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA Section (non-authenticated) */}
            {!isAuthenticated && (
                <section className="max-w-4xl mx-auto">
                    <div className="bg-blue-600 rounded-2xl p-8 sm:p-12 text-center text-white shadow-sm">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                            Ready to start sharing?
                        </h2>
                        <p className="text-blue-100 mb-8 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
                            Join hundreds of students who are already saving money and reducing waste
                            by sharing items on CampusBazaar.
                        </p>
                        <Link to="/register">
                            <Button size="lg" variant="secondary" className="px-8 py-3.5 text-base font-semibold rounded-xl">
                                Sign Up with Campus Email
                            </Button>
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
}
