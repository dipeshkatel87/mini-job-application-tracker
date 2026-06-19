import { Briefcase, Calendar, Check, Edit3, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createApplication, deleteApplication, getApplications, updateApplication } from "./api";
import type { ApplicationFormData, ApplicationStatus, JobApplication, JobType } from "./types";

const statuses: (ApplicationStatus | "All")[] = ["All", "Applied", "Interviewing", "Offer", "Rejected"];
const jobTypes: JobType[] = ["Internship", "Full_time", "Part_time"];

const emptyForm: ApplicationFormData = {
  companyName: "",
  jobTitle: "",
  jobType: "Internship",
  status: "Applied",
  appliedDate: new Date().toISOString().slice(0, 10),
  notes: ""
};

function label(value: string) {
  return value.replace("_", "-");
}

export function App() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [status, setStatus] = useState<ApplicationStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ApplicationFormData>(emptyForm);
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      setApplications(await getApplications({ status, search }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = window.setTimeout(loadApplications, 250);
    return () => window.clearTimeout(handle);
  }, [status, search]);

  const stats = useMemo(() => {
    return statuses.slice(1).map((item) => ({
      status: item,
      count: applications.filter((application) => application.status === item).length
    }));
  }, [applications]);

  const startEdit = (application: JobApplication) => {
    setEditing(application);
    setSelected(null);
    setForm({
      companyName: application.companyName,
      jobTitle: application.jobTitle,
      jobType: application.jobType,
      status: application.status,
      appliedDate: application.appliedDate.slice(0, 10),
      notes: application.notes ?? ""
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const validateForm = () => {
    if (form.companyName.trim().length < 2) return "Company name must be at least 2 characters.";
    if (!form.jobTitle.trim()) return "Job title is required.";
    if (!form.appliedDate) return "Applied date is required.";
    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateApplication(editing.id, form);
      } else {
        await createApplication(form);
      }
      resetForm();
      await loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save application");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (application: JobApplication) => {
    const confirmed = window.confirm(`Delete application for ${application.jobTitle} at ${application.companyName}?`);
    if (!confirmed) return;

    setError("");
    await deleteApplication(application.id);
    if (selected?.id === application.id) setSelected(null);
    await loadApplications();
  };

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">InternSathi assignment</p>
          <h1>Mini Job Application Tracker</h1>
        </div>
        <div className="summary">
          <Briefcase aria-hidden="true" />
          <span>{applications.length} applications</span>
        </div>
      </section>

      <section className="workspace">
        <aside className="panel form-panel">
          <div className="panel-title">
            <h2>{editing ? "Edit application" : "Add application"}</h2>
            {editing && (
              <button className="icon-button" type="button" onClick={resetForm} title="Cancel edit">
                <X size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="application-form">
            <label>
              Company Name
              <input
                value={form.companyName}
                onChange={(event) => setForm({ ...form, companyName: event.target.value })}
                minLength={2}
                required
              />
            </label>
            <label>
              Job Title
              <input
                value={form.jobTitle}
                onChange={(event) => setForm({ ...form, jobTitle: event.target.value })}
                required
              />
            </label>
            <label>
              Job Type
              <select value={form.jobType} onChange={(event) => setForm({ ...form, jobType: event.target.value as JobType })}>
                {jobTypes.map((item) => (
                  <option key={item} value={item}>
                    {label(item)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as ApplicationStatus })}
              >
                {statuses.slice(1).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Applied Date
              <input
                type="date"
                value={form.appliedDate}
                onChange={(event) => setForm({ ...form, appliedDate: event.target.value })}
                required
              />
            </label>
            <label>
              Notes
              <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={4} />
            </label>

            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? <Loader2 className="spin" size={18} /> : editing ? <Check size={18} /> : <Plus size={18} />}
              {editing ? "Update" : "Create"}
            </button>
          </form>
        </aside>

        <section className="content">
          <div className="toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search company or job title"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="status-tabs" aria-label="Filter by status">
              {statuses.map((item) => (
                <button className={status === item ? "active" : ""} key={item} type="button" onClick={() => setStatus(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="stat-grid">
            {stats.map((item) => (
              <div className="stat" key={item.status}>
                <span>{item.status}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>

          {error && <p className="message error">{error}</p>}

          <div className="table-wrap">
            {loading ? (
              <div className="empty-state">
                <Loader2 className="spin" />
                <span>Loading applications</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <Briefcase />
                <span>No applications found</span>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Job Title</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <strong>{application.companyName}</strong>
                        <span>{label(application.jobType)}</span>
                      </td>
                      <td>{application.jobTitle}</td>
                      <td>
                        <span className={`badge ${application.status.toLowerCase()}`}>{application.status}</span>
                      </td>
                      <td>
                        <Calendar size={16} />
                        {new Date(application.appliedDate).toLocaleDateString()}
                      </td>
                      <td>
                        <button type="button" onClick={() => setSelected(application)}>
                          View
                        </button>
                        <button className="icon-button" type="button" onClick={() => startEdit(application)} title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button className="icon-button danger" type="button" onClick={() => handleDelete(application)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </section>

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <article className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="panel-title">
              <h2>{selected.jobTitle}</h2>
              <button className="icon-button" type="button" onClick={() => setSelected(null)} title="Close">
                <X size={18} />
              </button>
            </div>
            <dl>
              <div>
                <dt>Company</dt>
                <dd>{selected.companyName}</dd>
              </div>
              <div>
                <dt>Job Type</dt>
                <dd>{label(selected.jobType)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{selected.status}</dd>
              </div>
              <div>
                <dt>Applied Date</dt>
                <dd>{new Date(selected.appliedDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt>Notes</dt>
                <dd>{selected.notes || "No notes added"}</dd>
              </div>
            </dl>
          </article>
        </div>
      )}
    </main>
  );
}
