// frontend/src/components/UserProfile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import FollowButton from './FollowButton';
import CreatePost from './CreatePost';
import MessageUserButton from './MessageUserButton';
import UserAvatar from './UserAvatar';
import toast from 'react-hot-toast';
import { Camera, Grid3X3, Save, Trash2, UploadCloud, UserCheck, Users, X } from 'lucide-react';

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [socialUsers, setSocialUsers] = useState([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/${userId}/profile`),
        api.get(`/users/${userId}/posts?limit=30`)
      ]);

      setProfile(profileRes.data.data);
      setPosts(postsRes.data.data);
      setIsFollowing(profileRes.data.data.is_following);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const fetchSocialUsers = async (type) => {
    try {
      setSocialLoading(true);
      const response = await api.get(`/users/${userId}/${type}?limit=50`);
      setSocialUsers(response.data.data || []);
    } catch {
      setSocialUsers([]);
      toast.error(`Failed to load ${type}`);
    } finally {
      setSocialLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'followers' || tab === 'following') {
      fetchSocialUsers(tab);
    }
  };

  const handleProfilePostCreated = (post) => {
    setPosts((current) => [post, ...current.filter((item) => item.id !== post.id)]);
    setActiveTab('posts');
    toast.success('Post shared to the social feed');
  };

  const handleFollowChange = (nextFollowing) => {
    setIsFollowing(nextFollowing);
    setProfile((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        followers_count: Math.max(0, (current.followers_count || 0) + (nextFollowing ? 1 : -1))
      };
    });
  };

  const handleDeleteProfilePost = async (postId) => {
    if (!window.confirm('Delete this post?')) {
      return;
    }

    try {
      await api.delete(`/posts/${postId}`);
      setPosts((current) => current.filter((post) => post.id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchUserProfile}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12">User not found</div>;
  }

  const isOwnProfile = currentUser?.id === userId;

  const displayName = profile.name || profile.username || 'Cook';
  const username = profile.username || profile.email?.split('@')[0] || 'cook';

  const handleOwnProfileChange = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }

    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error('Please choose an image smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setAvatarPreview(dataUrl);
      handleOwnProfileChange('avatar_url', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const clearAvatarSelection = () => {
    setAvatarPreview('');
    handleOwnProfileChange('avatar_url', '');
  };

  const handleOwnProfileSave = async () => {
    try {
      setSavingProfile(true);
      const payload = {
        name: profile.name || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || ''
      };
      const response = await api.put('/user/profile', payload);
      const updatedUser = response.data?.data?.user;

      setProfile((current) => ({
        ...current,
        ...(updatedUser || {})
      }));

      if (updatedUser) {
        updateUser(updatedUser);
      }

      setAvatarPreview('');

      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="glass-card overflow-hidden p-0 bg-white/40 border-white/60 backdrop-blur-md shadow-lg shadow-amber-500/5">
        <div className="flex flex-col gap-3 border-b border-white/40 bg-white/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <h1 className="font-display text-xl text-slate-950">@{username}</h1>
          {isOwnProfile && (
            <CreatePost
              onPostCreated={handleProfilePostCreated}
              buttonLabel="Add Post"
              allowImageOnly
            />
          )}
        </div>

        <div className="px-5 py-6 sm:px-8">
          <div className="grid gap-6 sm:grid-cols-[10rem_1fr] sm:items-start">
            <div className="flex justify-center sm:block">
              <UserAvatar
                name={displayName}
                src={profile.avatar_url}
                size={128}
                className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-amber-300/70 object-cover shadow-[0_18px_40px_rgba(15,23,42,0.45)]"
                textClassName="text-4xl font-black text-slate-950"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words font-display text-3xl text-slate-950">{displayName}</h2>
                  <p className="mt-1 text-sm text-slate-600">{profile.bio || 'Digital creator'}</p>
                </div>

                {!isOwnProfile && (
                  <div className="flex flex-wrap gap-3">
                    <MessageUserButton
                      userId={userId}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/85 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                    />
                    <FollowButton
                      userId={userId}
                      isFollowing={isFollowing}
                      onFollowChange={handleFollowChange}
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center sm:max-w-md">
                <button className="rounded-2xl border border-white/60 bg-white/50 p-4 transition-all hover:bg-white/70 shadow-sm" onClick={() => handleTabChange('posts')}>
                  <p className="text-2xl font-bold text-slate-950">{posts.length}</p>
                  <p className="mt-1 text-xs font-semibold text-amber-700 tracking-wide uppercase">posts</p>
                </button>
                <button className="rounded-2xl border border-white/60 bg-white/50 p-4 transition-all hover:bg-white/70 shadow-sm" onClick={() => handleTabChange('followers')}>
                  <p className="text-2xl font-bold text-slate-950">{profile.followers_count || 0}</p>
                  <p className="mt-1 text-xs font-semibold text-amber-700 tracking-wide uppercase">followers</p>
                </button>
                <button className="rounded-2xl border border-white/60 bg-white/50 p-4 transition-all hover:bg-white/70 shadow-sm" onClick={() => handleTabChange('following')}>
                  <p className="text-2xl font-bold text-slate-950">{profile.following_count || 0}</p>
                  <p className="mt-1 text-xs font-semibold text-amber-700 tracking-wide uppercase">following</p>
                </button>
              </div>

              {isOwnProfile && (
                <div className="mt-6 rounded-3xl border border-white/60 bg-white/40 p-4 backdrop-blur-md shadow-sm">
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Profile Photo URL
                  </label>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="url"
                      value={profile.avatar_url || ''}
                      onChange={(event) => handleOwnProfileChange('avatar_url', event.target.value)}
                      placeholder="https://example.com/your-photo.jpg"
                      className="flex-1 rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-sm"
                    />
                  </div>
                  <div className="mt-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white">
                      <UploadCloud className="h-4 w-4" />
                      Upload photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarFileChange}
                      />
                    </label>
                    <p className="mt-2 text-xs text-slate-500">Uploads are stored as profile image data. Use images under 2MB.</p>
                  </div>
                  {profile.avatar_url && (
                    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/75 p-3">
                      <UserAvatar
                        name={displayName}
                        src={profile.avatar_url}
                        size={52}
                        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full object-cover"
                        textClassName="font-bold text-slate-950"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">Preview</p>
                        <p className="truncate text-xs text-slate-500">{avatarPreview ? 'Uploaded image ready to save' : 'Current profile image'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={clearAvatarSelection}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleOwnProfileSave}
                      disabled={savingProfile}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {savingProfile ? 'Saving...' : 'Save Photo'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-white/8 bg-white/70">
        <div className="grid grid-cols-3 border-b border-white/8">
          <ProfileTab
            active={activeTab === 'posts'}
            icon={<Grid3X3 className="h-4 w-4" />}
            label="Posts"
            onClick={() => handleTabChange('posts')}
          />
          <ProfileTab
            active={activeTab === 'followers'}
            icon={<Users className="h-4 w-4" />}
            label="Followers"
            onClick={() => handleTabChange('followers')}
          />
          <ProfileTab
            active={activeTab === 'following'}
            icon={<UserCheck className="h-4 w-4" />}
            label="Following"
            onClick={() => handleTabChange('following')}
          />
        </div>

        <div className="p-2 sm:p-3">
          {activeTab === 'posts' && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-900">
                    {(post.image_url || post.recipe_image_url) ? (
                      <img
                        src={post.image_url || post.recipe_image_url}
                        alt={post.recipe_name || 'Photo post'}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:opacity-90"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center text-sm text-slate-700">
                        <Camera className="h-8 w-8 text-amber-600" />
                        {post.recipe_name || 'Photo post'}
                      </div>
                    )}
                    {isOwnProfile && (
                      <button
                        className="absolute right-2 top-2 rounded-full bg-slate-950/75 p-2 text-rose-200 opacity-0 transition hover:bg-rose-500/30 group-hover:opacity-100"
                        onClick={() => handleDeleteProfilePost(post.id)}
                        title="Delete post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full p-16 text-center text-slate-400">
                  No posts yet.
                </div>
              )}
            </div>
          )}

          {(activeTab === 'followers' || activeTab === 'following') && (
            <div className="divide-y divide-white/8 px-3 sm:px-5">
              {socialLoading ? (
                <p className="py-8 text-center text-slate-400">Loading...</p>
              ) : socialUsers.length > 0 ? (
                socialUsers.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar
                        name={item.name || 'Cook'}
                        src={item.avatar_url}
                        size={48}
                        className="flex shrink-0 items-center justify-center overflow-hidden rounded-full object-cover"
                        textClassName="font-bold text-slate-950"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{item.name || 'Cook'}</p>
                        <p className="truncate text-xs text-slate-500">{item.bio || 'Kitchen creator'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-12 text-center text-slate-400">No {activeTab} yet.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const ProfileTab = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 px-2 py-4 text-[11px] font-bold uppercase tracking-[0.16em] transition sm:px-3 sm:text-xs ${
      active
        ? 'border-b-2 border-amber-300 text-slate-950'
        : 'text-slate-500 hover:bg-white/80 hover:text-slate-950'
    }`}
  >
    <span className="shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);
