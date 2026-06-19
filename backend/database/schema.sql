CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL CHECK (length(company_name) >= 2),
  job_title TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('Internship', 'Full_time', 'Part_time')),
  status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'Interviewing', 'Offer', 'Rejected')),
  applied_date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS applications_updated_at
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
  UPDATE applications SET updated_at = datetime('now') WHERE id = OLD.id;
END;
