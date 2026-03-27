'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { User, Mail, CheckCircle, XCircle, Lock } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const t = useTranslations('dashboard.profilePage');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setName(data.name || '');
        setEmail(data.email || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      const updateData: any = {};
      if (name !== profile?.name) {
        updateData.name = name;
      }
      if (email !== profile?.email) {
        updateData.email = email;
      }

      if (Object.keys(updateData).length === 0) {
        setError(t('noChanges'));
        setUpdating(false);
        return;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('updateError'));
        return;
      }

      setSuccess(t('updateSuccess'));
      setProfile(data);
      setTimeout(() => {
        setSuccess('');
        if (updateData.email) {
          router.refresh();
        }
      }, 3000);
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordsDontMatch'));
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setPasswordError(t('passwordHint'));
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || t('changePasswordError'));
        return;
      }

      setPasswordSuccess(t('changePasswordSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(t('errorOccurred'));
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">{tCommon('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-ice font-orbitron">
          {t('title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-xl border border-lead/50">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-ice" size={24} />
              <h2 className="text-2xl font-bold text-text-primary font-orbitron">
                {t('profileInfo')}
              </h2>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500 text-green-400 p-3 rounded text-sm mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2 font-rajdhani">
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors font-rajdhani"
                  disabled={updating}
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2 font-rajdhani">
                  {t('email')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                    className="flex-1 bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors font-rajdhani"
                    disabled={updating}
                  />
                  {profile?.emailVerified ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-red-500" size={20} />
                  )}
                </div>
                <p className="text-xs text-text-quiet mt-1 font-rajdhani">
                  {profile?.emailVerified
                    ? t('emailVerified')
                    : t('emailNotVerified')}
                </p>
              </div>

              <button
                type="submit"
                disabled={updating || (name === profile?.name && email === profile?.email)}
                className="w-full py-3 bg-ice text-obsidian font-bold uppercase tracking-widest hover:bg-ice/80 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed font-orbitron"
              >
                {updating ? tCommon('loading') : t('update')}
              </button>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-lead/50">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-ice" size={24} />
              <h2 className="text-2xl font-bold text-text-primary font-orbitron">
                {t('changePassword')}
              </h2>
            </div>

            {passwordError && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded text-sm mb-4">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-500/20 border border-green-500 text-green-400 p-3 rounded text-sm mb-4">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2 font-rajdhani">
                  {t('currentPassword')}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors font-rajdhani"
                  required
                  disabled={changingPassword}
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2 font-rajdhani">
                  {t('newPassword')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-graphite/80 border border-lead p-3 rounded text-text-primary focus:border-ice outline-none transition-colors font-rajdhani"
                  required
                  minLength={8}
                  disabled={changingPassword}
                />
                <p className="text-xs text-text-quiet mt-1 font-rajdhani">
                  {t('passwordHint')}
                </p>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2 font-rajdhani">
                  {t('confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-graphite/80 border p-3 rounded text-text-primary focus:outline-none transition-colors font-rajdhani ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-lead focus:border-ice'
                  }`}
                  required
                  minLength={8}
                  disabled={changingPassword}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1 font-rajdhani">
                    {t('passwordsDontMatch')}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  changingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  newPassword.length < 8 ||
                  newPassword !== confirmPassword ||
                  !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)
                }
                className="w-full py-3 bg-purple text-text-primary font-bold uppercase tracking-widest hover:bg-purple/80 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed font-orbitron"
              >
                {changingPassword ? tCommon('loading') : t('changePassword')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
