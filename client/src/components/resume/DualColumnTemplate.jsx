import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Calendar,
  GraduationCap,
  Award,
  Wrench,
} from 'lucide-react';

export const DualColumnTemplate = ({ data }) => {
  const {
    personalInfo = {},
    education = [],
    skills = [],
    projects = [],
    experience = [],
    certifications = [],
    achievements = [],
    links = {},
  } = data || {};

  return (
    <div className="resume-document bg-white text-slate-900 font-sans shadow-2xl rounded-xl max-w-[850px] mx-auto border border-slate-200 overflow-hidden flex flex-col md:flex-row">
      {/* LEFT SIDEBAR */}
      <aside className="w-full md:w-[32%] bg-slate-900 text-slate-100 p-6 sm:p-7 space-y-6 flex-shrink-0">
        {/* Contact Info */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 border-b border-slate-800 pb-1">
            Contact
          </h2>
          <div className="space-y-2 text-xs text-slate-300">
            {personalInfo.email && (
              <div className="flex items-start gap-2 break-all">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{personalInfo.location}</span>
              </div>
            )}
          </div>
        </section>

        {/* Links */}
        {(links.github || links.linkedin || links.portfolio) && (
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 border-b border-slate-800 pb-1">
              Links
            </h2>
            <div className="space-y-2 text-xs text-slate-300">
              {links.github && (
                <div className="flex items-center gap-2 break-all">
                  <Github className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{links.github.replace('https://', '')}</span>
                </div>
              )}
              {links.linkedin && (
                <div className="flex items-center gap-2 break-all">
                  <Linkedin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{links.linkedin.replace('https://', '')}</span>
                </div>
              )}
              {links.portfolio && (
                <div className="flex items-center gap-2 break-all">
                  <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{links.portfolio.replace('https://', '')}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Technical Skills */}
        {skills && skills.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              <span>Skills</span>
            </h2>
            <div className="space-y-3 text-xs">
              {skills.map((cat, idx) => (
                <div key={idx}>
                  <span className="font-bold text-slate-200 block mb-1">{cat.category}</span>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(cat.items) ? cat.items : [cat.items]).map((item, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education in Sidebar */}
        {education && education.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Education</span>
            </h2>
            <div className="space-y-2.5 text-xs text-slate-300">
              {education.map((edu, idx) => (
                <div key={idx}>
                  <span className="font-bold text-white block">{edu.institution}</span>
                  <span className="text-[11px] text-indigo-300 block">
                    {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                  </span>
                  {edu.grade && (
                    <span className="text-[10px] text-emerald-400 block font-semibold">
                      {edu.grade}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications in Sidebar */}
        {certifications && certifications.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Certifications</span>
            </h2>
            <div className="space-y-2 text-xs text-slate-300">
              {certifications.map((cert, idx) => (
                <div key={idx}>
                  <span className="font-bold text-white block">{cert.name}</span>
                  <span className="text-[10px] text-slate-400 block">
                    {cert.issuer} {cert.issueDate && `• ${cert.issueDate}`}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="w-full md:w-[68%] p-7 sm:p-9 space-y-6">
        {/* Name & Headline */}
        <header className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-black text-slate-950 tracking-tight uppercase">
            {personalInfo.fullName || 'Your Full Name'}
          </h1>
          {personalInfo.headline && (
            <p className="text-sm font-bold text-indigo-700 mt-0.5 tracking-wide">
              {personalInfo.headline}
            </p>
          )}
        </header>

        {/* Professional Summary */}
        {personalInfo.summary && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
              Profile
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 font-normal">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-3">
              Professional Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-950">
                    <span className="text-sm font-bold">{exp.role}</span>
                    <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-indigo-700 mb-1">
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </div>
                  {exp.description && <p className="text-slate-700 mb-1">{exp.description}</p>}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                      {exp.highlights.map((item, hIdx) => (
                        <li key={hIdx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-3">
              Key Projects
            </h2>
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-950">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold">{proj.title}</span>
                      {proj.role && (
                        <span className="text-[11px] font-normal text-slate-500 italic">
                          ({proj.role})
                        </span>
                      )}
                    </div>
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="text-[11px] font-semibold text-slate-600 mb-1">
                      Stack: {proj.technologies.join(', ')}
                    </div>
                  )}
                  {proj.description && <p className="text-slate-700 mb-1">{proj.description}</p>}
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                      {proj.highlights.map((item, hIdx) => (
                        <li key={hIdx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-2">
              Key Achievements
            </h2>
            <div className="space-y-2 text-xs">
              {achievements.map((ach, idx) => (
                <div key={idx}>
                  <span className="font-bold text-slate-950">{ach.title}</span>
                  {ach.description && <p className="text-slate-700 text-[11px]">{ach.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default DualColumnTemplate;
