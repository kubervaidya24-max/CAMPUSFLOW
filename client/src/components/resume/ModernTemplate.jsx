import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Code,
  Calendar,
} from 'lucide-react';

export const ModernTemplate = ({ data }) => {
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
    <div className="resume-document bg-white text-slate-900 font-sans p-8 sm:p-12 shadow-2xl rounded-xl max-w-[850px] mx-auto border border-slate-200">
      {/* Header */}
      <header className="border-b-2 border-slate-900 pb-5 mb-6">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 uppercase">
          {personalInfo.fullName || 'Your Full Name'}
        </h1>
        {personalInfo.headline && (
          <p className="text-sm sm:text-base font-semibold text-indigo-700 mt-1 tracking-wide uppercase">
            {personalInfo.headline}
          </p>
        )}

        {/* Contact Strip */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-600 font-medium">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-700" />
              <span>{personalInfo.email}</span>
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-700" />
              <span>{personalInfo.phone}</span>
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-700" />
              <span>{personalInfo.location}</span>
            </span>
          )}
          {links.github && (
            <span className="flex items-center gap-1">
              <Github className="w-3.5 h-3.5 text-slate-700" />
              <span>{links.github.replace('https://', '')}</span>
            </span>
          )}
          {links.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3.5 h-3.5 text-slate-700" />
              <span>{links.linkedin.replace('https://', '')}</span>
            </span>
          )}
          {links.portfolio && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-700" />
              <span>{links.portfolio.replace('https://', '')}</span>
            </span>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {/* Professional Summary */}
        {personalInfo.summary && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 font-normal">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {/* Technical Skills */}
        {skills && skills.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Technical Skills
            </h2>
            <div className="space-y-1 text-xs">
              {skills.map((cat, idx) => (
                <div key={idx} className="flex items-baseline gap-2">
                  <span className="font-bold text-slate-900 min-w-[140px]">
                    {cat.category}:
                  </span>
                  <span className="text-slate-700">
                    {Array.isArray(cat.items) ? cat.items.join(', ') : cat.items}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Work / Practical Experience */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Experience
            </h2>
            <div className="space-y-3.5">
              {experience.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="text-sm font-bold text-slate-950">{exp.role}</span>
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

        {/* Technical Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Key Projects
            </h2>
            <div className="space-y-3.5">
              {projects.map((proj, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-950">{proj.title}</span>
                      {proj.role && (
                        <span className="text-[11px] font-normal text-slate-500 italic">
                          ({proj.role})
                        </span>
                      )}
                    </div>
                    {proj.repositoryUrl && (
                      <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                        <Code className="w-3 h-3 text-slate-400" />
                        {proj.repositoryUrl.replace('https://github.com/', 'gh/')}
                      </span>
                    )}
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="text-[11px] font-semibold text-slate-600 mb-1">
                      Technologies: {proj.technologies.join(', ')}
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

        {/* Education */}
        {education && education.length > 0 && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="text-sm font-bold text-slate-950">{edu.institution}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {edu.startDate} – {edu.current ? 'Expected ' + (edu.endDate || '2027') : edu.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>
                      {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                    </span>
                    {edu.grade && <span className="font-semibold text-slate-900">{edu.grade}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications & Achievements in 2 columns */}
        {(certifications?.length > 0 || achievements?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {certifications && certifications.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Certifications
                </h2>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {certifications.map((cert, idx) => (
                    <li key={idx}>
                      <span className="font-bold text-slate-900">{cert.name}</span>
                      <span className="text-slate-500 text-[11px] block">
                        {cert.issuer} {cert.issueDate && `• ${cert.issueDate}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {achievements && achievements.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Achievements
                </h2>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {achievements.map((ach, idx) => (
                    <li key={idx}>
                      <span className="font-bold text-slate-900">{ach.title}</span>
                      {ach.description && (
                        <span className="text-slate-600 text-[11px] block">{ach.description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate;
