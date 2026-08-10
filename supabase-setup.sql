-- Research Compass Supabase SQL Setup Script
-- Paste this script directly into the Supabase SQL Editor to create tables and insert mock data.

-- 1. Create Tables

CREATE TABLE IF NOT EXISTS "members" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "initials" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "responsibilities" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "uniId" TEXT,
  "phone" TEXT,
  "uniEmail" TEXT,
  "cv" TEXT,
  "privateEmail" TEXT
);

CREATE TABLE IF NOT EXISTS "papers" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "authors" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "venue" TEXT NOT NULL,
  "doi" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "keywords" JSONB NOT NULL,
  "abstract" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "progress" INTEGER NOT NULL,
  "analysis" JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS "tasks" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "assigneeId" TEXT NOT NULL,
  "due" TEXT NOT NULL,
  "labels" JSONB NOT NULL,
  "checklist" JSONB NOT NULL,
  "paperId" TEXT,
  "phaseId" TEXT,
  "comments" INTEGER NOT NULL,
  "attachments" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "notes" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "updated" TEXT NOT NULL,
  "tags" JSONB NOT NULL,
  "body" TEXT NOT NULL,
  "paperId" TEXT,
  "taskId" TEXT
);

CREATE TABLE IF NOT EXISTS "shots" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "tags" JSONB NOT NULL,
  "source" TEXT NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "paperId" TEXT,
  "hue" INTEGER NOT NULL,
  "comments" JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS "voiceNotes" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "seconds" INTEGER NOT NULL,
  "authorId" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "paperId" TEXT,
  "taskId" TEXT
);

CREATE TABLE IF NOT EXISTS "files" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "ext" TEXT NOT NULL,
  "folder" TEXT NOT NULL,
  "size" TEXT NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "date" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "links" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "tags" JSONB NOT NULL,
  "addedBy" TEXT NOT NULL,
  "paperId" TEXT
);

CREATE TABLE IF NOT EXISTS "meetings" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "participants" JSONB NOT NULL,
  "agenda" JSONB NOT NULL,
  "decisions" JSONB NOT NULL,
  "actionItems" JSONB NOT NULL,
  "notes" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "events" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "attendees" JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS "phases" (
  "id" TEXT PRIMARY KEY,
  "index" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "start" TEXT NOT NULL,
  "end" TEXT NOT NULL,
  "progress" INTEGER NOT NULL,
  "members" JSONB NOT NULL,
  "deliverables" JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS "activity" (
  "id" TEXT PRIMARY KEY,
  "memberId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "object" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "kind" TEXT NOT NULL
);

-- 2. Disable Row Level Security (RLS) for Development Access
ALTER TABLE "members" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "papers" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "notes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "shots" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "voiceNotes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "files" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "links" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "meetings" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "phases" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "activity" DISABLE ROW LEVEL SECURITY;

-- 3. Clear existing values (Notice: members starts completely clean!)
TRUNCATE "members", "papers", "tasks", "notes", "shots", "voiceNotes", "files", "links", "meetings", "events", "phases", "activity";

-- 4. Seed Data (No seeded members inserted, members must register to log in)

INSERT INTO "papers" ("id", "title", "authors", "year", "venue", "doi", "url", "category", "keywords", "abstract", "status", "ownerId", "progress", "analysis") VALUES
('p1', 'Clinical BERT Embeddings for Early Sepsis Prediction from Unstructured Notes', 'Y. Zhang, P. Kumar, E. Sanchez', 2024, 'Journal of Biomedical Informatics', '10.1016/j.jbi.2024.104512', 'https://doi.org/10.1016/j.jbi.2024.104512', 'Medical Informatics', '["ClinicalBERT", "sepsis", "EHR", "transformers"]', 'We fine-tune a domain-adapted BERT encoder on 210k de-identified ICU progress notes to predict sepsis onset up to 6 hours in advance, outperforming structured-only baselines by 8.4 AUROC points.', 'Analyzing', 'm1', 72, '{"Dataset": "MIMIC-IV v2.2 — 38,412 ICU stays, 210k notes, Sepsis-3 labels.", "Results": "AUROC 0.892 vs 0.808 structured-only; AUPRC 0.611; earliest reliable alert at 5.2h median.", "Advantages": "Strong empirical gains, reproducible cohort definition, released preprocessing code.", "Methodology": "Retrospective cohort study; sliding 6h prediction windows; 5-fold patient-level cross validation; ablation over note types.", "Disadvantages": "Heavy compute, no interpretability analysis, ignores medication ordering signals.", "Research Gap": "No semantic layer — the model has no notion of clinical concept hierarchy or negation scope.", "Limitations": "Single-center data, no external validation, note timestamps assumed reliable.", "References": "Johnson et al. 2023 (MIMIC-IV); Singer et al. 2016 (Sepsis-3); Alsentzer et al. 2019.", "What We Can Use": "Their cohort extraction SQL and Sepsis-3 labelling logic; the late-fusion architecture.", "Important Quotes": "\\"Free-text notes contributed 63% of the predictive signal in the first six hours of admission.\\"", "Proposed Solution": "Domain-adapted ClinicalBERT encoder fused with a temporal structured-feature branch through late concatenation.", "Research Problem": "Structured vital-sign models miss early clinical signals that clinicians record only in free-text notes.", "Research Question": "Can contextual embeddings of nursing and physician notes improve 6-hour-ahead sepsis prediction over structured baselines?", "Evaluation Metrics": "AUROC, AUPRC, sensitivity at fixed 90% specificity, calibration (Brier score).", "What We Can Improve": "Inject ontology concepts (SNOMED CT) instead of raw wordpieces for interpretability.", "Machine Learning / AI Models": "ClinicalBERT, BioGPT baseline, XGBoost structured baseline, LSTM fusion head."}'),
('p2', 'A SNOMED CT-Grounded Ontology for Interoperable ICU Deterioration Alerts', 'L. Moretti, S. Oyelaran, H. Tanaka', 2023, 'AMIA Annual Symposium', '10.5555/amia.2023.0912', 'https://amia.org/proceedings/2023/0912', 'Ontologies', '["SNOMED CT", "OWL", "reasoning", "interoperability"]', 'An OWL-DL ontology aligning ICU deterioration concepts with SNOMED CT, enabling portable alerting rules across three hospital systems.', 'Important', 'm2', 90, '{}'),
('p3', 'Negation and Uncertainty Detection in Arabic-English Clinical Narratives', 'N. Haddad, R. El-Shafei', 2025, 'ACL Clinical NLP Workshop', '10.18653/v1/2025.clinicalnlp-1.14', 'https://aclanthology.org/2025.clinicalnlp-1.14', 'NLP', '["negation", "code-switching", "annotation"]', 'Presents a 12k-sentence bilingual corpus and a scope-aware tagger for negation and hedging in code-switched clinical text.', 'Reading', 'm4', 35, '{}'),
('p4', 'Benchmarking Gradient Boosting vs Deep Sequence Models on MIMIC-IV', 'K. Petrov, A. Rahimi, D. Whitfield', 2024, 'Machine Learning for Healthcare (MLHC)', '10.48550/arXiv.2404.11233', 'https://arxiv.org/abs/2404.11233', 'Machine Learning', '["benchmark", "XGBoost", "temporal models"]', 'A controlled comparison of 9 model families across 6 ICU prediction tasks, finding tuned gradient boosting competitive with transformers at 40x lower cost.', 'Completed', 'm3', 100, '{}'),
('p5', 'Federated Learning for Multi-Hospital Sepsis Models: A Feasibility Study', 'C. Nguyen, F. Bianchi', 2022, 'IEEE JBHI', '10.1109/JBHI.2022.3145566', 'https://doi.org/10.1109/JBHI.2022.3145566', 'Machine Learning', '["federated learning", "privacy"]', 'Evaluates FedAvg and FedProx across four simulated hospital silos, reporting a 3-point AUROC gap versus centralized training.', 'To Read', 'm3', 0, '{}'),
('p6', 'Explainability Requirements for Clinical Decision Support: A Survey of Clinicians', 'M. Alvarez, T. Bergström', 2023, 'Artificial Intelligence in Medicine', '10.1016/j.artmed.2023.102566', 'https://doi.org/10.1016/j.artmed.2023.102566', 'Software Engineering', '["XAI", "human factors", "CDSS"]', 'Interviews with 41 intensivists on what makes an alert trustworthy; concept-level explanations were preferred over feature attributions.', 'Analyzing', 'm4', 55, '{}'),
('p7', 'Data Leakage Pitfalls in Retrospective EHR Studies', 'S. Iqbal, J. Marchetti', 2021, 'Nature Digital Medicine', '10.1038/s41746-021-00512-6', 'https://doi.org/10.1038/s41746-021-00512-6', 'Data Science', '["leakage", "study design", "reproducibility"]', 'Catalogues 12 recurring leakage patterns in EHR modelling and proposes a preregistration checklist.', 'Rejected', 'm1', 20, '{}'),
('p8', 'Ontology-Enhanced Retrieval Augmented Generation for Clinical Q&A', 'P. Sharma, E. Dubois, W. Chen', 2025, 'NeurIPS Datasets & Benchmarks', '10.48550/arXiv.2503.00981', 'https://arxiv.org/abs/2503.00981', 'NLP', '["RAG", "ontology", "LLM"]', 'Grounds retrieval in a medical ontology graph, reducing hallucinated clinical claims by 41% versus dense-only retrieval.', 'Reading', 'm2', 28, '{}');

INSERT INTO "tasks" ("id", "title", "description", "status", "priority", "assigneeId", "due", "labels", "checklist", "paperId", "phaseId", "comments", "attachments") VALUES
('t1', 'Extract Sepsis-3 cohort from MIMIC-IV', 'Run cohort SQL, validate against published counts, export parquet snapshots.', 'progress', 'URGENT', 'm3', '2026-08-14', '["Dataset", "Research"]', '[{"done": true, "text": "Request PhysioNet credentials"}, {"done": true, "text": "Run admissions + chartevents join"}, {"done": false, "text": "Validate cohort size (38k stays)"}, {"done": false, "text": "Publish data dictionary"}]', 'p1', 'ph3', 6, 3),
('t2', 'Draft ontology class hierarchy in Protégé', 'Model deterioration concepts, align top 120 classes to SNOMED CT identifiers.', 'progress', 'HIGH', 'm2', '2026-08-18', '["Development", "Research"]', '[{"done": true, "text": "Define upper ontology"}, {"done": false, "text": "Map vitals concepts"}, {"done": false, "text": "Reasoner consistency check"}]', 'p2', 'ph4', 3, 2),
('t3', 'Complete analysis of ClinicalBERT paper', 'Fill all 16 analysis sections and mark reusable components.', 'review', 'HIGH', 'm1', '2026-08-11', '["Paper", "Research"]', '[{"done": true, "text": "Methodology section"}, {"done": true, "text": "Results + metrics"}, {"done": false, "text": "Research gap write-up"}]', 'p1', 'ph2', 8, 1),
('t4', 'Annotation guidelines v2 for negation scope', 'Incorporate reviewer feedback, add 20 bilingual examples.', 'todo', 'MEDIUM', 'm4', '2026-08-22', '["Documentation", "Research"]', '[{"done": true, "text": "Collect edge cases"}, {"done": false, "text": "Write examples"}]', 'p3', 'ph3', 2, 0),
('t5', 'Baseline XGBoost benchmark run', 'Reproduce MLHC benchmark numbers on our cohort split.', 'todo', 'HIGH', 'm3', '2026-08-25', '["Testing", "Dataset"]', '[{"done": false, "text": "Feature pipeline"}]', 'p4', 'ph5', 1, 0),
('t6', 'Prepare mid-term progress presentation', '12 slides: problem, gap, architecture, current results, timeline.', 'backlog', 'MEDIUM', 'm5', '2026-09-02', '["Presentation", "Documentation"]', '[]', NULL, 'ph8', 0, 1),
('t7', 'Systematic search: 2021–2025 sepsis NLP papers', 'Scopus + PubMed queries, dedupe, screen abstracts, log in library.', 'done', 'HIGH', 'm1', '2026-07-28', '["Research", "Paper"]', '[{"done": true, "text": "Define query string"}, {"done": true, "text": "Screen 240 abstracts"}, {"done": true, "text": "Import 42 candidates"}]', NULL, 'ph1', 4, 2),
('t8', 'Set up shared Zotero + BibTeX export', 'Group library synced to the thesis repository.', 'done', 'LOW', 'm5', '2026-07-20', '["Documentation"]', '[]', NULL, 'ph1', 1, 0),
('t9', 'Research gap matrix across 42 screened papers', 'Compare method, data, semantics, explainability columns.', 'review', 'URGENT', 'm4', '2026-08-09', '["Research", "Paper"]', '[{"done": true, "text": "Fill semantics column"}]', NULL, 'ph2', 5, 1),
('t10', 'Evaluate ethical approval requirements', 'IRB checklist for de-identified secondary data use.', 'backlog', 'LOW', 'm6', '2026-09-15', '["Documentation", "Research"]', '[]', NULL, 'ph3', 0, 0);

INSERT INTO "notes" ("id", "title", "type", "authorId", "updated", "tags", "body", "paperId", "taskId") VALUES
('n1', 'Literature Review — semantic layer is the recurring gap', 'Literature Review', 'm1', '2026-08-08', '["gap", "ontology", "survey"]', '## Pattern across 42 screened papers\nMost high-performing sepsis models are **purely statistical**. Only 4 of 42 use any controlled vocabulary.\n\n- 31 papers use MIMIC-III/IV\n- 9 papers report external validation\n- 4 papers use SNOMED CT or UMLS concepts\n\n### Why it matters\nClinicians in Alvarez & Bergström (2023) asked for *concept-level* explanations, not SHAP bars.\n\n> "Tell me which clinical concept fired, not which token."\n\n### Our angle\nMap note spans → ontology concepts → reasoner-derived risk factors, then feed concept activations to the classifier.', 'p1', NULL),
('n2', 'Meeting minutes — Weekly Research Sync (Aug 4)', 'Meeting', 'm5', '2026-08-04', '["minutes", "decisions"]', '### Attendees\nAhmed, Abdalla, Maria, Jumana, Ziad, Dr. Laila\n\n### Decisions\n1. Use MIMIC-IV v2.2 as the primary dataset.\n2. Compare ClinicalBERT vs tuned XGBoost as the two headline baselines.\n3. Ontology work moves ahead of implementation in the timeline.\n\n### Action items\n- [x] Ahmed → finish ClinicalBERT analysis\n- [ ] Maria → cohort extraction\n- [ ] Abdalla → Protégé class hierarchy', NULL, NULL),
('n3', 'Experiment log — negation tagger pilot', 'Experiment', 'm4', '2026-08-06', '["nlp", "negation", "pilot"]', '| Run | Model | F1 (negation) | Notes |\n|-----|-------|---------------|-------|\n| 01 | rule-based (NegEx) | 0.71 | fails on code-switched text |\n| 02 | BiLSTM-CRF | 0.79 | needs more data |\n| 03 | XLM-R fine-tune | 0.86 | best so far |\n\n\`\`\`python\nscope = tagger.predict(sent, lang="mixed")\n\`\`\`\n\nNext: annotate 500 more Arabic-English sentences.', 'p3', NULL),
('n4', 'Idea — concept activation dashboard for clinicians', 'Idea', 'm2', '2026-08-07', '["xai", "ui"]', 'Instead of a single risk score, show the **top 5 firing ontology concepts** with the note span that triggered each one.\n\n1. Concept: *Altered mental status* — "pt more confused overnight"\n2. Concept: *Tachypnea* — "RR 28, laboured"\n\nThis directly answers the explainability requirement from the clinician survey.', NULL, NULL),
('n5', 'Brainstorm — thesis chapter outline', 'Brainstorm', 'm5', '2026-08-01', '["thesis"]', '1. Introduction\n2. Background: sepsis, EHR, ontologies\n3. Related work\n4. Research gap\n5. Proposed system\n6. Implementation\n7. Evaluation\n8. Discussion & future work', NULL, NULL),
('n6', 'Research note — Sepsis-3 labelling rules', 'Research', 'm3', '2026-08-09', '["dataset", "labels"]', 'Sepsis onset = suspicion of infection (culture + antibiotics window) **and** SOFA increase >= 2.\n\n- Antibiotic window: -24h / +72h around culture\n- SOFA computed hourly, forward-filled max 6h\n- Exclude stays < 12h', 'p1', 't1');

INSERT INTO "shots" ("id", "title", "description", "tags", "source", "uploadedBy", "date", "paperId", "hue", "comments") VALUES
('s1', 'ClinicalBERT fusion architecture (Fig. 3)', 'Late-fusion diagram we plan to adapt with an ontology branch.', '["architecture", "figure"]', 'Zhang et al. 2024, p.7', 'm1', '2026-08-05', 'p1', 255, '[{"text": "We can swap the left branch for the reasoner output.", "author": "Abdalla Nasser"}]'),
('s2', 'SNOMED CT subtree — deterioration concepts', 'Protégé screenshot of the current class hierarchy draft.', '["ontology", "protege"]', 'Own work', 'm2', '2026-08-07', 'p2', 195, '[]'),
('s3', 'AUROC comparison across 9 model families', 'Benchmark table screenshot for the related-work chapter.', '["results", "benchmark"]', 'Petrov et al. 2024', 'm3', '2026-08-03', 'p4', 155, '[{"text": "Note the 40x cost difference — worth a slide.", "author": "Maria Fahmy"}]'),
('s4', 'Cohort flow diagram (CONSORT-style)', '38,412 stays after exclusions.', '["dataset", "figure"]', 'Own work', 'm3', '2026-08-08', NULL, 70, '[]'),
('s5', 'Annotation tool UI for negation spans', 'Prodigy-style interface used in the pilot.', '["nlp", "annotation"]', 'Own work', 'm4', '2026-08-06', 'p3', 300, '[]'),
('s6', 'Clinician preference survey results', 'Concept-level explanations preferred 3:1 over feature attributions.', '["xai", "survey"]', 'Alvarez & Bergström 2023', 'm4', '2026-08-02', 'p6', 25, '[]'),
('s7', 'System architecture v0.4', 'Ingestion → concept mapper → reasoner → risk model → alert UI.', '["architecture"]', 'Own work', 'm2', '2026-08-09', NULL, 220, '[{"text": "Add a feedback loop from clinician acknowledgement.", "author": "Dr. Laila Mansour"}]'),
('s8', 'Whiteboard — research gap matrix', 'Photo from the Aug 4 sync.', '["gap", "meeting"]', 'Lab whiteboard', 'm5', '2026-08-04', NULL, 120, '[]');

INSERT INTO "voiceNotes" ("id", "title", "seconds", "authorId", "date", "description", "paperId", "taskId") VALUES
('v1', 'Research meeting idea — concept activation view', 154, 'm2', '2026-08-07', 'Quick thought recorded after the sync about showing firing concepts to clinicians.', 'p6', NULL),
('v2', 'Supervisor feedback on methodology chapter', 372, 'm6', '2026-08-05', 'Dr. Laila''s comments on evaluation protocol and external validation.', NULL, 't3'),
('v3', 'Cohort extraction walkthrough', 248, 'm3', '2026-08-08', 'Explains the SQL joins and exclusion criteria for the team.', 'p1', 't1'),
('v4', 'Annotation edge cases to discuss', 96, 'm4', '2026-08-06', 'Three bilingual negation cases the guidelines don''t cover yet.', NULL, 't4');

INSERT INTO "files" ("id", "name", "ext", "folder", "size", "uploadedBy", "date") VALUES
('f1', 'Zhang_2024_ClinicalBERT_Sepsis.pdf', 'pdf', 'Research Papers', '3.4 MB', 'm1', '2026-08-05'),
('f2', 'Moretti_2023_ICU_Ontology.pdf', 'pdf', 'Research Papers', '2.1 MB', 'm2', '2026-08-02'),
('f3', 'mimiciv_cohort_v3.csv', 'csv', 'Datasets', '184 MB', 'm3', '2026-08-08'),
('f4', 'sofa_hourly_snapshot.xlsx', 'xlsx', 'Datasets', '27 MB', 'm3', '2026-08-08'),
('f5', 'architecture_v0.4.png', 'png', 'Screenshots', '820 KB', 'm2', '2026-08-09'),
('f6', 'midterm_progress.pptx', 'pptx', 'Presentations', '11 MB', 'm5', '2026-08-01'),
('f7', 'thesis_draft_ch1-3.docx', 'docx', 'Documentation', '1.8 MB', 'm5', '2026-08-07'),
('f8', 'weekly_sync_2026-08-04.mp3', 'mp3', 'Meeting Files', '42 MB', 'm5', '2026-08-04'),
('f9', 'negation_pilot_run03.json', 'json', 'Experiments', '640 KB', 'm4', '2026-08-06'),
('f10', 'demo_walkthrough.mp4', 'mp4', 'Presentations', '96 MB', 'm2', '2026-08-09'),
('f11', 'annotation_guidelines_v1.pdf', 'pdf', 'Documentation', '740 KB', 'm4', '2026-07-30'),
('f12', 'cohort_flow_diagram.jpg', 'jpg', 'Screenshots', '410 KB', 'm3', '2026-08-08');

INSERT INTO "links" ("id", "title", "url", "description", "category", "tags", "addedBy", "paperId") VALUES
('l1', 'PhysioNet — MIMIC-IV v2.2', 'https://physionet.org/content/mimiciv/2.2/', 'Primary dataset, requires credentialed access.', 'Dataset', '["dataset", "icu"]', 'm3', 'p1'),
('l2', 'SNOMED CT Browser', 'https://browser.ihtsdotools.org/', 'Concept lookup for ontology alignment.', 'Research Tool', '["ontology", "terminology"]', 'm2', 'p2'),
('l3', 'clinicalBERT — GitHub', 'https://github.com/EmilyAlsentzer/clinicalBERT', 'Reference implementation and pretrained weights.', 'GitHub', '["code", "nlp"]', 'm1', 'p1'),
('l4', 'Protégé Desktop', 'https://protege.stanford.edu/', 'OWL ontology editor used for the class hierarchy.', 'Research Tool', '["ontology"]', 'm2', NULL),
('l5', 'Sepsis-3 definition (JAMA)', 'https://jamanetwork.com/journals/jama/fullarticle/2492881', 'Canonical labelling criteria.', 'Paper', '["labels"]', 'm3', NULL),
('l6', 'MLHC 2024 benchmark talk', 'https://www.youtube.com/watch?v=mlhc2024', '20-min overview of the benchmark paper.', 'Video', '["benchmark"]', 'm3', 'p4'),
('l7', 'UMLS REST API docs', 'https://documentation.uts.nlm.nih.gov/rest/home.html', 'Concept normalization endpoints.', 'API', '["api", "terminology"]', 'm2', NULL),
('l8', 'scispaCy documentation', 'https://allenai.github.io/scispacy/', 'Entity linking pipeline candidate.', 'Documentation', '["nlp", "code"]', 'm4', 'p3');

INSERT INTO "meetings" ("id", "title", "date", "time", "participants", "agenda", "decisions", "actionItems", "notes") VALUES
('mt1', 'Weekly Research Meeting', '2026-08-11', '10:00 – 11:30', '["m1", "m2", "m3", "m4", "m5", "m6"]', '["Literature review status", "Dataset extraction progress", "Ontology development", "Timeline check"]', '["Use MIMIC-IV v2.2", "Compare ClinicalBERT vs tuned XGBoost", "Freeze ontology scope at 120 classes"]', '[{"text": "Analyze ClinicalBERT paper limitations section", "ownerId": "m1"}, {"text": "Prepare architecture v0.5 diagram", "ownerId": "m2"}, {"text": "Finish cohort validation counts", "ownerId": "m3"}]', 'Dr. Laila asked for an external validation plan before Phase 5.'),
('mt2', 'Supervisor Review — Methodology Chapter', '2026-08-13', '13:00 – 14:00', '["m1", "m5", "m6"]', '["Chapter 5 walkthrough", "Evaluation protocol", "Publication target"]', '["Target AMIA 2027 submission"]', '[{"text": "Rewrite evaluation protocol section", "ownerId": "m5"}]', 'Bring printed figures.'),
('mt3', 'Dataset Working Session', '2026-08-04', '15:00 – 17:00', '["m2", "m3", "m4"]', '["Cohort SQL review", "Feature dictionary", "Annotation sampling"]', '["Exclude stays under 12 hours", "Sample 500 notes for annotation"]', '[{"text": "Publish data dictionary", "ownerId": "m3"}]', 'Recording attached as a voice note.');

INSERT INTO "events" ("id", "title", "date", "time", "kind", "description", "attendees") VALUES
('e1', 'Weekly Research Meeting', '2026-08-11', '10:00', 'meeting', 'Full team sync', '["m1", "m2", "m3", "m4", "m5", "m6"]'),
('e2', 'Cohort extraction deadline', '2026-08-14', '23:59', 'deadline', 'Validated parquet snapshots due', '["m3"]'),
('e3', 'Supervisor Review', '2026-08-13', '13:00', 'meeting', 'Methodology chapter', '["m1", "m5", "m6"]'),
('e4', 'Phase 3 milestone — Dataset ready', '2026-08-20', '12:00', 'milestone', 'Dataset collection phase complete', '["m1", "m3"]'),
('e5', 'Ontology hierarchy draft due', '2026-08-18', '18:00', 'deadline', '120 aligned classes', '["m2"]'),
('e6', 'Reading block — RAG paper', '2026-08-12', '09:00', 'personal', 'Deep read + notes', '["m2"]'),
('e7', 'Mid-term presentation', '2026-09-02', '11:00', 'milestone', 'Faculty progress defense', '["m1", "m2", "m3", "m4", "m5"]'),
('e8', 'Annotation guidelines v2 due', '2026-08-22', '17:00', 'deadline', 'Send to Dr. Laila', '["m4"]'),
('e9', 'Lab seminar: Federated learning', '2026-08-26', '14:00', 'meeting', 'Guest talk', '["m1", "m3"]'),
('e10', 'Baseline benchmark results due', '2026-08-25', '23:59', 'deadline', 'XGBoost vs transformer', '["m3"]');

INSERT INTO "phases" ("id", "index", "name", "start", "end", "progress", "members", "deliverables") VALUES
('ph1', 1, 'Literature Review', '2026-06-01', '2026-07-15', 100, '["m1", "m4"]', '["42 screened papers", "Shared Zotero library"]'),
('ph2', 2, 'Research Gap Analysis', '2026-07-10', '2026-08-10', 85, '["m1", "m4", "m6"]', '["Gap matrix", "Positioning statement"]'),
('ph3', 3, 'Dataset Collection', '2026-08-01', '2026-08-20', 52, '["m3", "m4"]', '["MIMIC-IV cohort", "Annotation sample"]'),
('ph4', 4, 'System Design', '2026-08-15', '2026-09-10', 30, '["m2", "m1"]', '["Ontology v1", "Architecture spec"]'),
('ph5', 5, 'Implementation', '2026-09-05', '2026-10-25', 8, '["m2", "m3"]', '["Concept mapper", "Risk model service"]'),
('ph6', 6, 'Testing & Evaluation', '2026-10-20', '2026-11-20', 0, '["m3", "m4"]', '["Benchmark report", "Ablation study"]'),
('ph7', 7, 'Research Paper', '2026-11-01', '2026-12-15', 0, '["m1", "m5", "m6"]', '["AMIA submission draft"]'),
('ph8', 8, 'Final Presentation', '2026-12-10', '2027-01-10', 0, '["m1", "m5"]', '["Defense deck", "Demo video"]');

INSERT INTO "activity" ("id", "memberId", "action", "object", "time", "kind") VALUES
('a1', 'm3', 'uploaded', 'mimiciv_cohort_v3.csv', '12 min ago', 'file'),
('a2', 'm2', 'added a screenshot', 'System architecture v0.4', '1 h ago', 'image'),
('a3', 'm1', 'moved', 'Complete analysis of ClinicalBERT paper → Review', '2 h ago', 'task'),
('a4', 'm4', 'added a voice note', 'Annotation edge cases to discuss', '4 h ago', 'voice'),
('a5', 'm5', 'updated the note', 'Meeting minutes — Weekly Research Sync', '6 h ago', 'note'),
('a6', 'm6', 'commented on', 'System architecture v0.4', '8 h ago', 'comment'),
('a7', 'm2', 'added a paper', 'Ontology-Enhanced RAG for Clinical Q&A', 'Yesterday', 'paper'),
('a8', 'm1', 'completed', 'Systematic search: 2021–2025 sepsis NLP papers', 'Yesterday', 'task'),
('a9', 'm3', 'added a link', 'PhysioNet — MIMIC-IV v2.2', '2 days ago', 'file'),
('a10', 'm4', 'created a note', 'Experiment log — negation tagger pilot', '2 days ago', 'note');
