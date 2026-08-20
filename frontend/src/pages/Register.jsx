import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input, Button, Card } from '../components/ui';
import { Upload, User, Eye, EyeOff } from 'lucide-react';
import api from '../lib/axios';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onload = (e) => setAvatarPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('username', formData.username);
            data.append('email', formData.email);
            data.append('password', formData.password);
            if (avatar) data.append('avatar', avatar);

            await api.post('/users/register', data);

            toast.success('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            const msg = error.response?.data?.message || (error.response?.status === 502 ? 'Backend is waking up from sleep. Please try again in 15 seconds.' : 'Registration failed. Please check details.');
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
            <Card className="w-full max-w-md p-8 shadow-lg border border-gray-100 rounded-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-sm text-gray-500 mt-2">Join CampusBazaar with your college email</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Avatar Picker */}
                    <div className="flex justify-center mb-4">
                        <label className="relative cursor-pointer">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
                                    <User size={36} className="text-gray-400" />
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow">
                                <Upload size={14} className="text-white" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <Input
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                    />

                    <Input
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="johndoe"
                        required
                    />

                    <Input
                        label="College Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@college.ac.in"
                        required
                    />

                    <div className="relative">
                        <Input
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a strong password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="relative">
                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <Button type="submit" loading={isLoading} className="w-full py-2.5 font-medium">
                        Create Account
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Log in
                    </Link>
                </p>
            </Card>
        </div>
    );
}
