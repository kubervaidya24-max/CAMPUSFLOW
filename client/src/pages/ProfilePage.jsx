import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import {
  User as UserIcon,
  Mail,
  Building,
  GraduationCap,
  Calendar,
  Edit3,
  Github,
  Linkedin,
  Globe,
  BookOpen,
  Code,
  Compass,
  MapPin,
  BadgeCheck,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const isOwnProfile = !id || id === currentUser?._id;

  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['userProfile', id || currentUser?._id],
    queryFn: async () => {
      if (isOwnProfile) {
        return await userService.getMyProfile();
      }
      return await userService.getUserById(id);
    },
    staleTime: 10000,
  });

  const profileUser = profileData?.data?.user || (isOwnProfile ? currentUser : null);

  const roleStyles = {
    student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    faculty: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-xs font-medium">Loading user profile...</p>
      </div>
    );
  }

  if (isError || !profileUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-red-500/30 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-slate-400 text-xs mb-6 leading-relaxed">
            {error?.message || 'The user profile you are trying to view does not exist.'}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-lg shadow-indigo-600/25"
          >
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const isStudent = profileUser.role === 'student';
  const isFaculty = profileUser.role === 'faculty';
  const profile = profileUser.profile || {};
  const social = profile.socialLinks || {};

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Header Profile Card */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-sky-500 p-0.5 shadow-xl shadow-indigo-500/30 flex-shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profileUser.name}
                  className="w-full h-full object-cover rounded-[22px]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{ display: profile.avatar ? 'none' : 'flex' }}
                className="w-full h-full bg-slate-950 rounded-[22px] items-center justify-center text-2xl sm:text-3xl font-extrabold text-indigo-300"
              >
                {profileUser.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Name & Role Details */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {profileUser.name}
                </h1>
                <span
                  className={`text-xs font-semibold uppercase tracking-wider px-3 py-0.5 rounded-full border ${
                    roleStyles[profileUser.role] || roleStyles.student
                  }`}
                >
                  {profileUser.role}
                </span>
                {isFaculty && profile.designation && (
                  <span className="text-xs font-medium text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    {profile.designation}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  {profileUser.email}
                </span>
                {profile.department && (
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-sky-400" />
                    {profile.department}
                  </span>
                )}
                {isStudent && profile.semester && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    Semester {profile.semester}
                  </span>
                )}
                {isFaculty && profile.officeLocation && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {profile.officeLocation}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button: Edit Profile (if own profile) */}
          {isOwnProfile && (
            <Link
              to="/profile/edit"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/25"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Link>
          )}
        </div>
      </section>

      {/* Main Grid: Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Bio, Skills & Academic Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span>About & Biography</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {profile.bio ||
                (isOwnProfile
                  ? 'No bio provided yet. Click "Edit Profile" to introduce yourself, your academic goals, and project passions!'
                  : 'This user has not written a bio yet.')}
            </p>
          </div>

          {/* Student Skills & Interests */}
          {isStudent && (
            <>
              {/* Technical Skills */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Code className="w-4 h-4 text-sky-400" />
                  <span>Skills & Technical Stack</span>
                </h2>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-indigo-300 transition-colors shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs">No technical skills listed yet.</p>
                )}
              </div>

              {/* Academic Interests */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Interests & Research Areas</span>
                </h2>
                {profile.interests && profile.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium shadow-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs">No interests listed yet.</p>
                )}
              </div>
            </>
          )}

          {/* Faculty Subjects & Courses */}
          {isFaculty && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Subjects Taught & Academic Specializations</span>
              </h2>
              {profile.subjects && profile.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium shadow-sm"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs">No subjects listed yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Academic Info & Social Links */}
        <div className="space-y-6">
          {/* Academic Metadata Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <BadgeCheck className="w-4 h-4 text-indigo-400" />
              <span>Academic Details</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-400">Department</span>
                <span className="text-slate-200 font-medium">
                  {profile.department || 'Not Specified'}
                </span>
              </div>

              {isStudent && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">Current Semester</span>
                    <span className="text-slate-200 font-medium">
                      Semester {profile.semester || 1}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">Graduation Year</span>
                    <span className="text-slate-200 font-medium">
                      {profile.graduationYear || '2026'}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">College ID</span>
                    <span className="text-slate-200 font-mono font-medium">
                      {profile.collegeId || '—'}
                    </span>
                  </div>
                </>
              )}

              {isFaculty && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">Designation</span>
                    <span className="text-slate-200 font-medium">
                      {profile.designation || 'Faculty Member'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/50">
                    <span className="text-slate-400">Office / Cabin</span>
                    <span className="text-slate-200 font-medium">
                      {profile.officeLocation || '—'}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between py-1">
                <span className="text-slate-400">Member Since</span>
                <span className="text-slate-200 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {profileUser.createdAt
                    ? new Date(profileUser.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : '2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Social Links Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Connect & Portfolios</span>
            </h2>

            <div className="space-y-2.5">
              {social.github ? (
                <a
                  href={social.github.startsWith('http') ? social.github : `https://${social.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Github className="w-4 h-4 text-indigo-400" />
                    <span>GitHub Profile</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                </a>
              ) : (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/30 border border-slate-800/50 text-xs text-slate-500">
                  <Github className="w-4 h-4" />
                  <span>GitHub not added</span>
                </div>
              )}

              {social.linkedin ? (
                <a
                  href={social.linkedin.startsWith('http') ? social.linkedin : `https://${social.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Linkedin className="w-4 h-4 text-sky-400" />
                    <span>LinkedIn Profile</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                </a>
              ) : (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/30 border border-slate-800/50 text-xs text-slate-500">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn not added</span>
                </div>
              )}

              {social.portfolio ? (
                <a
                  href={social.portfolio.startsWith('http') ? social.portfolio : `https://${social.portfolio}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 text-xs text-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Personal Website</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                </a>
              ) : (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/30 border border-slate-800/50 text-xs text-slate-500">
                  <Globe className="w-4 h-4" />
                  <span>Website not added</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
