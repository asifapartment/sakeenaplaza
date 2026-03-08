// app/dashboard/components/SettingsIndividual.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faSave,
    faTimes,
    faTrash,
    faExclamationTriangle,
    faLock,
    faSpinner,
    faUser,
    faEnvelope,
    faPhone,
    faWarning,
    faCheck,
    faXmark,
    faShieldAlt,
    faBell,
    faKey,
    faSync,
    faCalendar,
    faCreditCard,
    faUserCircle,
    faGlobe,
    faInfoCircle,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import UserActivity from './UserActivity';
import { useCsrf } from '@/context/CsrfContext';

/* Validation utilities */
const validateEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
};

const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name.trim());
};

// Enhanced Skeleton Loading Components
const ProfileFieldSkeleton = () => {
    return (
        <div className="group relative overflow-hidden bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 border border-neutral-700/30 rounded-xl p-4 animate-pulse">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-neutral-700 rounded-lg"></div>
                    <div className="h-4 w-24 bg-neutral-700 rounded"></div>
                </div>
                <div className="h-8 w-16 bg-neutral-700 rounded-lg"></div>
            </div>
            <div className="h-10 w-full bg-neutral-700 rounded-lg"></div>
        </div>
    );
};

const UserActivitySkeleton = () => {
    return (
        <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl overflow-hidden animate-pulse">
            <div className="p-6 border-b border-neutral-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-neutral-700/80 rounded-xl"></div>
                        <div>
                            <div className="h-5 w-40 bg-neutral-700 rounded mb-2"></div>
                            <div className="h-3 w-60 bg-neutral-700 rounded"></div>
                        </div>
                    </div>
                    <div className="h-9 w-32 bg-neutral-700 rounded-xl"></div>
                </div>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-neutral-800/30 rounded-xl">
                            <div className="h-10 w-10 bg-neutral-700 rounded-lg mt-1"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-neutral-700 rounded"></div>
                                <div className="flex items-center gap-4">
                                    <div className="h-3 w-20 bg-neutral-700 rounded"></div>
                                    <div className="h-3 w-16 bg-neutral-700 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function Settings() {
    const router = useRouter();
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        altEmail: '',
        phone: '',
        altPhone: ''
    });
    const {csrfToken} = useCsrf();
    const [originalData, setOriginalData] = useState({});
    const [activities, setActivities] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('profile');
    const [showActivityFilters, setShowActivityFilters] = useState(false);

    // Fetch user data with retry logic
    const fetchSettingsData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/dashboard/settings', {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/login');
                    return;
                }
                throw new Error('Failed to fetch settings data');
            }

            const settingsData = await response.json();
            const profileData = {
                name: settingsData.profile?.name || '',
                email: settingsData.profile?.email || '',
                altEmail: settingsData.profile?.altEmail || '',
                phone: settingsData.profile?.phone || '',
                altPhone: settingsData.profile?.altPhone || ''
            };

            setFormData(profileData);
            setOriginalData(profileData);
            setActivities(settingsData.activities || []);
        } catch (error) {
            console.error('Settings data fetch error:', error);
            setValidationErrors(prev => ({
                ...prev,
                fetch: 'Failed to load settings data. Please refresh the page.'
            }));
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchSettingsData();
    }, [fetchSettingsData]);

    const validateField = (field, value) => {
        switch (field) {
            case 'name':
                return validateName(value) ? '' : 'Name must be 2-50 characters and contain only letters and spaces';
            case 'altEmail':
                return !value || validateEmail(value) ? '' : 'Please enter a valid alternate email address';
            case 'altPhone':
                return !value || validatePhone(value) ? '' : 'Please enter a valid alternate phone number';
            default:
                return '';
        }
    };

    const handleEdit = (field) => {
        const editableFields = ['name', 'altEmail', 'altPhone'];
        if (editableFields.includes(field)) {
            setEditingField(field);
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };
    
    // In your SettingsIndividual.js component, update the performAccountDeletion function:

    const performAccountDeletion = async () => {
        setIsDeleting(true);
        setValidationErrors(prev => ({ ...prev, delete: undefined }));

        try {
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page.');
            }

            const password = window.prompt('Please enter your password to confirm account deletion:');

            if (!password) {
                setIsDeleting(false);
                return;
            }

            const confirmText = window.prompt('Type "DELETE" to confirm permanent account deletion:');

            if (confirmText !== 'DELETE') {
                setValidationErrors(prev => ({
                    ...prev,
                    delete: 'Please type DELETE to confirm account deletion'
                }));
                setIsDeleting(false);
                return;
            }

            const response = await fetch('/api/dashboard/settings', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({
                    password,
                    confirmText
                }),
                credentials: 'include'
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete account');
            }

            alert('Your account has been deleted successfully. You will be redirected to the home page.');
            router.push('/');

        } catch (error) {
            console.error('Account deletion error:', error);
            setValidationErrors(prev => ({
                ...prev,
                delete: error.message || 'Failed to delete account. Please try again.'
            }));
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };
    
    const handleSave = async (field) => {
        const value = formData[field];
        const error = validateField(field, value);

        if (error) {
            setValidationErrors(prev => ({ ...prev, [field]: error }));
            return;
        }

        setIsSaving(true);
        setSaveSuccess('');

        try {
            const response = await fetch('/api/dashboard/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ [field]: value }),
                credentials: 'include'
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to update profile');
            }

            setOriginalData(prev => ({ ...prev, [field]: value }));
            setEditingField(null);
            setSaveSuccess(`✅ ${field === 'name' ? 'Name' : field === 'altEmail' ? 'Alternate email' : 'Alternate phone'} updated successfully!`);

            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });

            // Refresh data
            await fetchSettingsData();

            // Auto-hide success message
            const timer = setTimeout(() => setSaveSuccess(''), 3000);
            return () => clearTimeout(timer);
        } catch (error) {
            console.error('Update error:', error);
            setValidationErrors(prev => ({
                ...prev,
                submit: error.message || 'Failed to update. Please try again.'
            }));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = (field) => {
        setFormData(prev => ({ ...prev, [field]: originalData[field] }));
        setEditingField(null);
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Enhanced profile field component
    const ProfileField = ({ label, field, type = 'text', editable = true, icon, description }) => {
        const isEditing = editingField === field && editable;
        const value = formData[field];
        const error = validationErrors[field];

        return (
            <div className="group relative overflow-hidden bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 border border-neutral-700/30 rounded-xl p-5 hover:border-amber-500/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            {icon && (
                                <div className="p-2 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-lg">
                                    <FontAwesomeIcon icon={icon} className="text-amber-400 text-sm" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-semibold text-neutral-100 mb-0.5">
                                    {label}
                                </label>
                                {description && (
                                    <p className="text-xs text-neutral-400">{description}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="flex items-center gap-2 ml-4">
                            <button
                                onClick={() => handleSave(field)}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-medium transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label={`Save ${label}`}
                            >
                                {isSaving ? (
                                    <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
                                ) : (
                                    <FontAwesomeIcon icon={faSave} className="text-xs" />
                                )}
                                <span>Save</span>
                            </button>

                            <button
                                onClick={() => handleCancel(field)}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent border border-neutral-700 text-sm text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600 transition-colors disabled:opacity-50"
                                aria-label={`Cancel editing ${label}`}
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                <span>Cancel</span>
                            </button>
                        </div>
                    ) : editable ? (
                        <button
                            onClick={() => handleEdit(field)}
                            disabled={isLoading || isSaving}
                            className="ml-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 text-sm text-neutral-200 hover:bg-neutral-800 hover:border-amber-500/30 hover:text-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                            aria-label={`Edit ${label}`}
                        >
                            <FontAwesomeIcon
                                icon={faEdit}
                                className="text-xs group-hover/btn:rotate-12 transition-transform"
                            />
                            <span>Edit</span>
                        </button>
                    ) : (
                        <div className="ml-4 p-2 bg-gradient-to-r from-neutral-800/30 to-neutral-900/30 border border-neutral-700/30 rounded-lg"
                            title="This field cannot be edited">
                            <FontAwesomeIcon icon={faLock} className="text-neutral-500 text-sm" />
                        </div>
                    )}
                </div>

                <div className="relative">
                    {isEditing ? (
                        <>
                            <input
                                type={type}
                                value={value}
                                onChange={(e) => handleInputChange(field, e.target.value)}
                                className={`w-full px-4 py-3 bg-neutral-800/50 border ${error ? 'border-rose-500/50' : 'border-neutral-700/50'
                                    } rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all`}
                                disabled={isSaving}
                                aria-invalid={!!error}
                                aria-describedby={error ? `${field}-error` : undefined}
                                autoFocus
                            />
                            {error && (
                                <div className="mt-2 flex items-start gap-2 text-rose-400 text-sm animate-fadeIn">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5 flex-shrink-0" />
                                    <span id={`${field}-error`}>{error}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-between">
                            <p className={`text-sm ${value ? 'text-neutral-100' : 'text-neutral-500'}`}>
                                {value || 'Not set'}
                            </p>
                            {value && field === 'email' && (
                                <span className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 rounded-full">
                                    Verified
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
        );
    };

    // Danger Zone Card Component
    const DangerZoneCard = () => (
        <div className="relative overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 border border-rose-700/30 rounded-2xl p-5 shadow-2xl shadow-black/20 group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative flex items-start gap-4 mb-5">
                <div className="flex-shrink-0 p-3 bg-gradient-to-r from-rose-500/10 to-rose-500/5 border border-rose-500/20 rounded-xl">
                    <FontAwesomeIcon icon={faWarning} className="text-rose-400 text-lg" />
                </div>

                <div className="flex-1">
                    <h2 className="text-xl font-bold text-rose-100 mb-1">Danger Zone</h2>
                    <p className="text-sm text-rose-300/80">
                        Permanent actions that cannot be undone
                    </p>
                </div>
            </div>

            <div className="relative space-y-4">
                <div className="p-4 bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 rounded-xl border border-neutral-700/30">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-sm font-semibold text-rose-100 mb-1">Delete Account</h3>
                            <p className="text-xs text-neutral-400">
                                Permanently remove your account and all data
                            </p>
                        </div>
                        <FontAwesomeIcon icon={faTrash} className="text-rose-400/50" />
                    </div>

                    <ul className="text-xs text-neutral-400 space-y-1 mb-4">
                        <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faTimes} className="text-rose-400 text-[10px]" />
                            <span>All bookings and payment history</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faTimes} className="text-rose-400 text-[10px]" />
                            <span>Personal information and preferences</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faTimes} className="text-rose-400 text-[10px]" />
                            <span>Access to your account</span>
                        </li>
                    </ul>

                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        disabled={isLoading || isSaving}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-rose-500 bg-gradient-to-r from-rose-900/30 to-rose-800/30 text-rose-400 hover:from-rose-900/50 hover:to-rose-800/50 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all group/delete disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon
                            icon={faTrash}
                            className="group-hover/delete:scale-110 transition-transform"
                        />
                        <span className="font-medium">Delete Account</span>
                    </button>
                </div>

                <div className="p-3 bg-gradient-to-br from-amber-500/5 to-amber-500/2 rounded-xl border border-amber-500/20">
                    <div className="flex items-start gap-2">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-300/80">
                            Account deletion is permanent and cannot be recovered. Please export any data you wish to keep.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Settings tabs
    const tabs = [
        { id: 'profile', label: 'Profile', icon: faUserCircle },
        { id: 'security', label: 'Security', icon: faShieldAlt },
        { id: 'notifications', label: 'Notifications', icon: faBell },
        { id: 'preferences', label: 'Preferences', icon: faGlobe },
    ];

    /* Loading skeleton */
    if (isLoading && !formData.name) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="h-8 w-48 bg-neutral-800 rounded-lg mb-2 animate-pulse"></div>
                    <div className="h-4 w-64 bg-neutral-800 rounded animate-pulse"></div>
                </div>

                {/* Tabs skeleton */}
                <div className="flex gap-2 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-12 w-32 bg-neutral-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main column skeleton */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl p-5 animate-pulse">
                            <div className="h-6 w-48 bg-neutral-700 rounded-lg mb-6"></div>
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <ProfileFieldSkeleton key={i} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar skeleton */}
                    <div className="space-y-6">
                        <UserActivitySkeleton />
                        <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl p-5 animate-pulse">
                            <div className="h-6 w-32 bg-neutral-700 rounded-lg mb-4"></div>
                            <div className="h-10 w-full bg-neutral-700 rounded-xl"></div>
                        </div>
                    </div>
                </div>

                {/* Animated Background Elements */}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-800/5 rounded-full blur-3xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-950 p-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                            Account Settings
                        </h1>
                        <p className="text-neutral-400 mt-1">
                            Manage your profile, security, and preferences
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-sm px-4 py-2 bg-neutral-800/50 border border-neutral-700/50 rounded-xl">
                            <span className="text-neutral-400">Member since </span>
                            <span className="text-amber-400 font-semibold">2024</span>
                        </div>
                        <button
                            onClick={fetchSettingsData}
                            disabled={isLoading || isSaving}
                            className="p-2.5 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 rounded-xl hover:border-amber-500/30 transition-all disabled:opacity-50"
                            aria-label="Refresh settings"
                        >
                            <FontAwesomeIcon
                                icon={isLoading ? faSpinner : faSync}
                                className={`text-neutral-400 hover:text-amber-400 ${isLoading ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Settings Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                    : 'bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 border-neutral-700/50 text-neutral-300 hover:bg-neutral-800 hover:border-amber-500/30 hover:text-amber-100'
                                }`}
                        >
                            <FontAwesomeIcon icon={tab.icon} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Success Message */}
            {saveSuccess && (
                <div className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 border border-emerald-700/50 backdrop-blur-sm rounded-xl text-emerald-100 shadow-2xl shadow-black/50 max-w-sm animate-slideIn z-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <FontAwesomeIcon icon={faCheck} className="text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{saveSuccess}</p>
                        </div>
                        <button
                            onClick={() => setSaveSuccess('')}
                            className="p-1 hover:bg-emerald-700/50 rounded-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-sm" />
                        </button>
                    </div>
                </div>
            )}

            {/* Error Messages */}
            {validationErrors.fetch && (
                <div className="mb-6 p-4 bg-gradient-to-r from-rose-900/20 to-transparent border border-rose-700/50 rounded-xl text-rose-100 animate-fadeIn">
                    <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-rose-400" />
                        <div className="flex-1">
                            <p className="text-sm">{validationErrors.fetch}</p>
                            <button
                                onClick={fetchSettingsData}
                                className="mt-2 text-xs text-rose-300 hover:text-rose-200 underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {validationErrors.submit && (
                <div className="mb-6 p-4 bg-gradient-to-r from-rose-900/20 to-transparent border border-rose-700/50 rounded-xl text-rose-100 animate-fadeIn">
                    <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-rose-400" />
                        <span className="text-sm">{validationErrors.submit}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Settings Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Information Card */}
                    {activeTab === 'profile' && (
                        <div className="relative overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl p-5 shadow-2xl shadow-black/20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl">
                                        <FontAwesomeIcon icon={faUser} className="text-amber-400 text-lg" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-neutral-100">Profile Information</h2>
                                        <p className="text-sm text-neutral-400">Manage your personal details</p>
                                    </div>
                                </div>
                                <div className="text-xs px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 border border-emerald-500/20 rounded-full">
                                    Complete
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <ProfileField
                                    label="Full Name"
                                    field="name"
                                    editable={true}
                                    icon={faUser}
                                    description="Your full name as displayed"
                                />
                                <ProfileField
                                    label="Primary Email"
                                    field="email"
                                    type="email"
                                    editable={false}
                                    icon={faEnvelope}
                                    description="Verified email address"
                                />
                                <ProfileField
                                    label="Alternate Email"
                                    field="altEmail"
                                    type="email"
                                    editable={true}
                                    icon={faEnvelope}
                                    description="Backup email for notifications"
                                />
                                <ProfileField
                                    label="Phone Number"
                                    field="phone"
                                    type="tel"
                                    editable={false}
                                    icon={faPhone}
                                    description="Primary contact number"
                                />
                                <ProfileField
                                    label="Alternate Phone"
                                    field="altPhone"
                                    type="tel"
                                    editable={true}
                                    icon={faPhone}
                                    description="Secondary contact number"
                                />
                            </div>
                        </div>
                    )}

                    {/* Other Tabs Content */}
                    {activeTab !== 'profile' && (
                        <div className="relative overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl p-8 shadow-2xl shadow-black/20">
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon
                                        icon={tabs.find(t => t.id === activeTab)?.icon || faUser}
                                        className="text-3xl text-neutral-500"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-neutral-100 mb-2">
                                    {tabs.find(t => t.id === activeTab)?.label} Settings
                                </h3>
                                <p className="text-neutral-400 text-sm max-w-md mx-auto">
                                    This section is under development. More features coming soon!
                                </p>
                                <button className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 text-neutral-300 rounded-xl text-sm hover:bg-neutral-800 hover:border-amber-500/30 hover:text-amber-100 transition-all">
                                    <span>View Roadmap</span>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* User Activity Card */}
                    <UserActivity
                        activities={activities}
                        loading={isLoading}
                        showFilters={showActivityFilters}
                        onRefresh={fetchSettingsData}
                        onViewAll={() => setShowActivityFilters(!showActivityFilters)}
                    />

                    {/* Danger Zone Card */}
                    <DangerZoneCard />

                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl p-5">
                        <h3 className="text-sm font-semibold text-neutral-300 mb-4">Account Overview</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-3 rounded-xl border border-neutral-700/30 text-center">
                                <div className="text-lg font-bold text-amber-400">5</div>
                                <div className="text-xs text-neutral-400 mt-1">Bookings</div>
                            </div>
                            <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-3 rounded-xl border border-neutral-700/30 text-center">
                                <div className="text-lg font-bold text-emerald-400">₹12,500</div>
                                <div className="text-xs text-neutral-400 mt-1">Total Spent</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-modal-title"
                    className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6"
                >
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
                        onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
                        aria-hidden="true"
                    />

                    <div className="relative w-full max-w-lg mx-auto">
                        <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50 rounded-2xl p-6 shadow-2xl shadow-black/50 z-10 animate-scaleIn">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="p-3 bg-gradient-to-r from-rose-500/10 to-rose-500/5 border border-rose-500/20 rounded-xl">
                                        <FontAwesomeIcon icon={faWarning} className="text-rose-400" size="lg" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 id="delete-modal-title" className="text-lg font-bold text-rose-100 mb-2">
                                        Confirm Account Deletion
                                    </h3>
                                    <div className="text-sm text-neutral-300 space-y-3">
                                        <p>This action <span className="font-semibold text-rose-400">cannot be undone</span> and will permanently:</p>

                                        <div className="bg-gradient-to-br from-neutral-800/40 to-neutral-900/40 p-4 rounded-xl border border-neutral-700/30">
                                            <ul className="space-y-2 text-xs">
                                                <li className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faUser} className="text-rose-400 text-xs" />
                                                    <span>Delete your profile and personal information</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCalendar} className="text-rose-400 text-xs" />
                                                    <span>Cancel all active bookings</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCreditCard} className="text-rose-400 text-xs" />
                                                    <span>Remove payment and booking history</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faKey} className="text-rose-400 text-xs" />
                                                    <span>Revoke all account access</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="p-3 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-lg">
                                            <p className="text-xs text-amber-300 flex items-start gap-2">
                                                <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5 flex-shrink-0" />
                                                <span>We recommend exporting your data before proceeding.</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={isDeleting}
                                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 border border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:border-neutral-600 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={performAccountDeletion}
                                    disabled={isDeleting}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500 bg-gradient-to-r from-rose-900/30 to-rose-800/30 text-rose-400 hover:from-rose-900/50 hover:to-rose-800/50 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/delete"
                                >
                                    {isDeleting ? (
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                    ) : (
                                        <FontAwesomeIcon icon={faTrash} className="group-hover/delete:scale-110 transition-transform" />
                                    )}
                                    <span className="font-semibold">Delete Permanently</span>
                                </button>
                            </div>

                            {validationErrors.delete && (
                                <div className="mt-4 p-3 bg-rose-900/20 border border-rose-700/50 rounded-xl animate-fadeIn">
                                    <p className="text-sm text-rose-300 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faExclamationTriangle} />
                                        {validationErrors.delete}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Animated Background Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-800/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}