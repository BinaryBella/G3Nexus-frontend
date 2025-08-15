'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { Camera, Lock, User, Mail, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { clientService } from '@/app/lib/services/clientService';
import { Client, ClientEditPayload } from '@/app/lib/types';

interface ProfileFormData {
    name: string;
    contactNo: string;
    emailAddress: string;
    address: string;
    image?: string;
}

interface PasswordFormData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, updateUser } = useAuth();
    const [profileData, setProfileData] = useState<ProfileFormData>({
        name: '',
        contactNo: '',
        emailAddress: '',
        address: '',
        image: ''
    });
    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [showPasswords, setShowPasswords] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                if (user && user.email) {
                    try {
                        // Get client by email using the client service
                        const currentClient = await clientService.getClientByEmail(user.email);
                        
                        if (currentClient) {
                            const profile: ProfileFormData = {
                                name: currentClient.name || '',
                                contactNo: currentClient.contactNo || '',
                                emailAddress: currentClient.email || '',
                                address: currentClient.address || '',
                                image: currentClient.profileImageUrl || ''
                            };
                            
                            setProfileData(profile);
                            setPreviewImage(profile.image || null);
                        } else {
                            // Fallback to auth context data if client not found
                            const profile: ProfileFormData = {
                                name: '',
                                contactNo: '',
                                emailAddress: user.email || '',
                                address: '',
                                image: ''
                            };
                            setProfileData(profile);
                            setPreviewImage(null);
                        }
                    } catch (apiError) {
                        console.log('Could not fetch client details from API, using auth context:', apiError);
                        // Fallback to auth context data
                        const profile: ProfileFormData = {
                            name: '',
                            contactNo: '',
                            emailAddress: user.email || '',
                            address: '',
                            image: ''
                        };
                        setProfileData(profile);
                        setPreviewImage(null);
                    }
                } else {
                    setError('User not found');
                }
            } catch (error) {
                setError('Failed to load profile data');
                console.error('Error fetching profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleProfileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please select a valid image file (JPG, PNG, or GIF)');
                return;
            }

            // Clear any previous errors
            setError(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewImage(result);
                setProfileData((prev) => ({
                    ...prev,
                    image: result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Get the current client to find their ID and existing data
            const currentClient = await clientService.getClientByEmail(user?.email || '');
            
            if (!currentClient) {
                throw new Error('Client not found');
            }
            
            // Debug logging
            console.log('Current client:', currentClient);
            console.log('Client ID:', currentClient.clientId);
            
            // Validate that we have a valid client ID
            if (!currentClient.clientId || currentClient.clientId === 0) {
                throw new Error('Invalid client ID');
            }
            
            // Prepare the update data according to the API structure
            const updateData: ClientEditPayload = {
                clientId: currentClient.clientId,
                name: profileData.name,
                contactNo: profileData.contactNo,
                email: profileData.emailAddress,
                address: profileData.address,
                role: currentClient.role,
                isActive: currentClient.isActive,
                companyId: currentClient.companyId,
                profileImageUrl: profileData.image || ''
            };

            console.log('Update data being sent:', updateData);

            const response = await clientService.updateClient(updateData);

            if (response) {
                setSuccessMessage('Profile updated successfully!');
                
                // Update user context if needed (you may need to extend AuthUser interface)
                // updateUser({
                //     // Add any fields that need to be updated in the auth context
                // });
                
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setError('Failed to update profile');
            }
        } catch (error: any) {
            setError(error.message || 'Failed to update profile');
            console.error('Error updating profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsChangingPassword(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                setError('New passwords do not match');
                return;
            }
            if (passwordData.newPassword.length < 8) {
                setError('Password must be at least 8 characters long');
                return;
            }

            // Get the current client to find their ID
            const currentClient = await clientService.getClientByEmail(user?.email || '');
            
            if (!currentClient) {
                throw new Error('Client not found');
            }
            
            // Use the dedicated password update method
            const success = await clientService.updateClientPassword(currentClient.clientId, {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });

            if (success) {
                setSuccessMessage('Password changed successfully!');
                setPasswordData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setError('Failed to change password');
            }
        } catch (error: any) {
            setError(error.message || 'Failed to change password');
            console.error('Error changing password:', error);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#3450A3]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#3450A3] mb-2">
                        Profile Settings
                    </h1>
                    <p className="text-gray-600">
                        Manage your personal information and account settings
                    </p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">{successMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'profile'
                                        ? 'border-[#3450A3] text-[#3450A3] bg-white -mb-px'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <User className="w-4 h-4 inline mr-2" />
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'password'
                                        ? 'border-[#3450A3] text-[#3450A3] bg-white -mb-px'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Lock className="w-4 h-4 inline mr-2" />
                                Change Password
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Profile Image Section */}
                                    <div className="lg:col-span-1">
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="relative group">
                                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 border-4 border-white shadow-xl">
                                                    {previewImage ? (
                                                        <Image
                                                            src={previewImage}
                                                            alt="Profile"
                                                            width={128}
                                                            height={128}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                            <Camera className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute bottom-0 right-0 bg-[#3450A3] p-2.5 rounded-full text-white hover:bg-[#2a4086] transition-all shadow-lg group-hover:scale-110"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-900">Profile Photo</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    JPG, PNG or GIF (max. 5MB)
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="mt-2 text-xs text-[#3450A3] hover:text-[#2a4086] font-medium"
                                                >
                                                    Change photo
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Fields Section */}
                                    <div className="lg:col-span-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Name Field */}
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                    <User className="w-4 h-4 inline mr-2" />
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={profileData.name}
                                                    onChange={handleProfileInputChange}
                                                    className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-transparent transition-colors"
                                                    required
                                                    placeholder="Enter your full name"
                                                />
                                            </div>

                                            {/* Contact Number Field */}
                                            <div>
                                                <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Phone className="w-4 h-4 inline mr-2" />
                                                    Contact Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="contactNo"
                                                    name="contactNo"
                                                    value={profileData.contactNo}
                                                    onChange={handleProfileInputChange}
                                                    className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-transparent transition-colors"
                                                    required
                                                    placeholder="Enter your contact number"
                                                />
                                            </div>

                                            {/* Email Field (Read-only) */}
                                            <div className="md:col-span-2">
                                                <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Mail className="w-4 h-4 inline mr-2" />
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    id="emailAddress"
                                                    name="emailAddress"
                                                    value={profileData.emailAddress}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                                                    readOnly
                                                    placeholder="Email address"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                                            </div>

                                            {/* Address Field */}
                                            <div className="md:col-span-2">
                                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                                    <MapPin className="w-4 h-4 inline mr-2" />
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    id="address"
                                                    name="address"
                                                    value={profileData.address}
                                                    onChange={handleProfileInputChange}
                                                    className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-transparent transition-colors"
                                                    required
                                                    placeholder="Enter your address"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Form Buttons */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-6 py-3 bg-[#FFBF00] text-black rounded-lg hover:bg-[#e6ac00] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'password' && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                                <div className="space-y-4">
                                    {/* Old Password */}
                                    <div>
                                        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            <Lock className="w-4 h-4 inline mr-2" />
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.oldPassword ? "text" : "password"}
                                                id="oldPassword"
                                                name="oldPassword"
                                                value={passwordData.oldPassword}
                                                onChange={handlePasswordInputChange}
                                                className="w-full text-black px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-transparent transition-colors"
                                                required
                                                placeholder="Enter your current password"
                                            />
                                            {passwordData.oldPassword && (
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('oldPassword')}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPasswords.oldPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            <Lock className="w-4 h-4 inline mr-2" />
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.newPassword ? "text" : "password"}
                                                id="newPassword"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordInputChange}
                                                className="w-full text-black px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-transparent transition-colors"
                                                required
                                                minLength={8}
                                                placeholder="Enter new password (min 8 characters)"
                                            />
                                            {passwordData.newPassword && (
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('newPassword')}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPasswords.newPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Confirm New Password */}
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            <Lock className="w-4 h-4 inline mr-2" />
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirmPassword ? "text" : "password"}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordInputChange}
                                                className="w-full text-black px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3450A3] focus:border-transparent transition-colors"
                                                required
                                                minLength={8}
                                                placeholder="Confirm your new password"
                                            />
                                            {passwordData.confirmPassword && (
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPasswords.confirmPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Password Requirements */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• At least 8 characters long</li>
                                        <li>• Should contain letters and numbers</li>
                                        <li>• Avoid using personal information</li>
                                    </ul>
                                </div>

                                {/* Password Form Buttons */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPasswordData({
                                                oldPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                            setError(null);
                                        }}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isChangingPassword}
                                        className="px-6 py-3 bg-[#3450A3] text-white rounded-lg hover:bg-[#2a4086] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isChangingPassword ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Illustration */}
                <div className="hidden lg:block fixed bottom-4 right-4">
                    <Image
                        src="/images/profile.png"
                        alt="Profile illustration"
                        width={300}
                        height={240}
                        className="opacity-50"
                    />
                </div>
            </div>
        </div>
    );
}
