export type Role =
  | "Member"
  | "Supervisor"
  | "Team Leader";

export type Member = {
  id: string;
  name: string;
  initials: string;
  role: Role;
  email: string;
  responsibilities: string;
  color: string;
  password?: string | undefined;
  uniId?: string | undefined;
  phone?: string | undefined;
  uniEmail?: string | undefined;
  cv?: string | undefined;
  privateEmail?: string | undefined;
  githubUsername?: string | undefined;
  linkedinUrl?: string | undefined;
  cv_storage_path?: string | undefined;
  cv_mime_type?: string | undefined;
  cv_size_bytes?: number | undefined;
};

export type PaperStatus = "To Read" | "Reading" | "Analyzing" | "Completed" | "Important" | "Rejected";

export type Paper = {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  doi: string;
  url: string;
  category: string;
  keywords: string[];
  abstract: string;
  status: PaperStatus;
  ownerId: string;
  progress: number;
  analysis: Record<string, string>;
  storage_path?: string | undefined;
  mime_type?: string | undefined;
  size_bytes?: number | undefined;
};

export type TaskStatus = "backlog" | "todo" | "progress" | "review" | "done";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  due: string;
  labels: string[];
  checklist: { text: string; done: boolean }[];
  paperId?: string | undefined;
  phaseId?: string | undefined;
  comments: number;
  attachments: number;
};

export type Note = {
  id: string;
  title: string;
  type: "Research" | "Meeting" | "Idea" | "Literature Review" | "Experiment" | "Brainstorm";
  authorId: string;
  updated: string;
  tags: string[];
  body: string;
  paperId?: string | undefined;
  taskId?: string | undefined;
};

export type Shot = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  source: string;
  uploadedBy: string;
  date: string;
  paperId?: string | undefined;
  hue: number;
  comments: { author: string; text: string }[];
  url?: string | undefined;
  storage_path?: string | undefined;
  mime_type?: string | undefined;
  size_bytes?: number | undefined;
};

export type VoiceNote = {
  id: string;
  title: string;
  seconds: number;
  authorId: string;
  date: string;
  description: string;
  paperId?: string | undefined;
  taskId?: string | undefined;
  meetingId?: string | undefined;
  url?: string | undefined;
  storage_path?: string | undefined;
  mime_type?: string | undefined;
  size_bytes?: number | undefined;
};

export type ResearchFile = {
  id: string;
  name: string;
  ext: string;
  folder: string;
  size: string;
  uploadedBy: string;
  date: string;
  url?: string | undefined;
  storage_path?: string | undefined;
  mime_type?: string | undefined;
  size_bytes?: number | undefined;
  paperId?: string | undefined;
};

export type ResourceLink = {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  addedBy: string;
  paperId?: string | undefined;
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: string[];
  agenda: string[];
  decisions: string[];
  actionItems: { text: string; ownerId: string }[];
  notes: string;
};

export type EventKind = "meeting" | "deadline" | "milestone" | "personal";
export type CalEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  kind: EventKind;
  description: string;
  attendees: string[];
};

export type Comment = {
  id: string;
  user_id: string;
  project_id?: string | undefined;
  paper_id?: string | undefined;
  task_id?: string | undefined;
  note_id?: string | undefined;
  file_id?: string | undefined;
  shot_id?: string | undefined;
  parent_comment_id?: string | undefined;
  content: string;
  url?: string | undefined;
  storage_path?: string | undefined;
  mime_type?: string | undefined;
  size_bytes?: number | undefined;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  name?: string | undefined;
  is_group: boolean;
  paper_id?: string | undefined;
  task_id?: string | undefined;
  phase_id?: string | undefined;
  created_at: string;
};

export type ConversationMember = {
  conversation_id: string;
  member_id: string;
};

export type MessageType = "text" | "voice" | "image" | "file" | "link" | "system";

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: MessageType;
  content: string;
  reply_to_message_id?: string | undefined;
  url?: string | undefined;
  storage_path?: string | undefined;
  mime_type?: string | undefined;
  size_bytes?: number | undefined;
  created_at: string;
  updated_at: string;
  deleted_at?: string | undefined;
};

export type DbNotification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  is_read: boolean;
  link?: string | undefined;
  created_at: string;
};

export type Phase = {
  id: string;
  index: number;
  name: string;
  start: string;
  end: string;
  progress: number;
  members: string[];
  deliverables: string[];
};

export type Activity = {
  id: string;
  memberId: string;
  action: string;
  object: string;
  time: string;
  kind: "paper" | "task" | "note" | "file" | "voice" | "image" | "comment";
};

export const project = {
  name: "SehatMasr",
  topic: "Ontology-Driven Clinical NLP for Early Sepsis Risk Detection",
  institution: "Faculty of Computing · Graduation Research Group 07",
  phase: "Phase 3 · Dataset Collection",
  progress: 46,
};

export const members: Member[] = [
  {
    id: "m1",
    name: "Ahmed Kamal",
    initials: "AK",
    role: "Team Leader",
    email: "ahmed.kamal@uni.edu",
    responsibilities: "Literature review coordination, research gap analysis, paper writing",
    color: "255",
    password: "123456",
    githubUsername: "ahmed-kamal",
    linkedinUrl: "https://linkedin.com/in/ahmed-kamal",
    phone: "+201012345678",
    uniId: "20230101",
    uniEmail: "ahmed.kamal@cis.asu.edu.eg",
    privateEmail: "ahmed.k@gmail.com",
  },
  {
    id: "m2",
    name: "Abdalla Nasser",
    initials: "AN",
    role: "Team Leader", // Wait, Abdalla was Developer in prisma seed, but role enum is "Member" | "Supervisor" | "Team Leader". Let's use Team Leader or Member. Let's make him Team Leader or Member. In prisma/seed.js he was Developer, but role Role is Team Leader / Member / Supervisor. Let's make him Team Leader.
    email: "abdalla.nasser@uni.edu",
    responsibilities: "System architecture, API layer, ontology reasoning service",
    color: "195",
    password: "123456",
    githubUsername: "abdalla-nasser",
    linkedinUrl: "https://linkedin.com/in/abdalla-nasser",
    phone: "+201023456789",
    uniId: "20230102",
    uniEmail: "abdalla.nasser@cis.asu.edu.eg",
    privateEmail: "abdalla.n@gmail.com",
  },
  {
    id: "m3",
    name: "Maria Fahmy",
    initials: "MF",
    role: "Member",
    email: "maria.fahmy@uni.edu",
    responsibilities: "MIMIC-IV extraction, feature engineering, model benchmarking",
    color: "155",
    password: "123456",
    githubUsername: "maria-fahmy",
    linkedinUrl: "https://linkedin.com/in/maria-fahmy",
    phone: "+201034567890",
    uniId: "20230103",
    uniEmail: "maria.fahmy@cis.asu.edu.eg",
    privateEmail: "maria.f@gmail.com",
  },
  {
    id: "m4",
    name: "Jumana Saleh",
    initials: "JS",
    role: "Member",
    email: "jumana.saleh@uni.edu",
    responsibilities: "Clinical NLP survey, annotation guidelines, evaluation protocol",
    color: "300",
    password: "123456",
    githubUsername: "jumana-saleh",
    linkedinUrl: "https://linkedin.com/in/jumana-saleh",
    phone: "+201045678901",
    uniId: "20230104",
    uniEmail: "jumana.saleh@cis.asu.edu.eg",
    privateEmail: "jumana.s@gmail.com",
  },
  {
    id: "m5",
    name: "Ziad Hosny",
    initials: "ZH",
    role: "Member",
    email: "ziad.hosny@uni.edu",
    responsibilities: "Thesis document, figures, presentation decks, meeting minutes",
    color: "70",
    password: "123456",
    githubUsername: "ziad-hosny",
    linkedinUrl: "https://linkedin.com/in/ziad-hosny",
    phone: "+201056789012",
    uniId: "20230105",
    uniEmail: "ziad.hosny@cis.asu.edu.eg",
    privateEmail: "ziad.h@gmail.com",
  },
  {
    id: "m6",
    name: "Dr. Laila Mansour",
    initials: "LM",
    role: "Supervisor",
    email: "l.mansour@uni.edu",
    responsibilities: "Scientific supervision, methodology review, publication strategy",
    color: "25",
    password: "123456",
    githubUsername: "laila-mansour",
    linkedinUrl: "https://linkedin.com/in/laila-mansour",
    phone: "+201067890123",
    uniId: "20230106",
    uniEmail: "l.mansour@cis.asu.edu.eg",
    privateEmail: "laila.m@gmail.com",
  },
];

const emptyAnalysis = {};

export const papers: Paper[] = [
  {
    id: "p1",
    title: "Clinical BERT Embeddings for Early Sepsis Prediction from Unstructured Notes",
    authors: "Y. Zhang, P. Kumar, E. Sanchez",
    year: 2024,
    venue: "Journal of Biomedical Informatics",
    doi: "10.1016/j.jbi.2024.104512",
    url: "https://doi.org/10.1016/j.jbi.2024.104512",
    category: "Medical Informatics",
    keywords: ["ClinicalBERT", "sepsis", "EHR", "transformers"],
    abstract:
      "We fine-tune a domain-adapted BERT encoder on 210k de-identified ICU progress notes to predict sepsis onset up to 6 hours in advance, outperforming structured-only baselines by 8.4 AUROC points.",
    status: "Analyzing",
    ownerId: "m1",
    progress: 72,
    analysis: {
      "Research Problem":
        "Structured vital-sign models miss early clinical signals that clinicians record only in free-text notes.",
      "Research Question":
        "Can contextual embeddings of nursing and physician notes improve 6-hour-ahead sepsis prediction over structured baselines?",
      "Proposed Solution":
        "Domain-adapted ClinicalBERT encoder fused with a temporal structured-feature branch through late concatenation.",
      Methodology:
        "Retrospective cohort study; sliding 6h prediction windows; 5-fold patient-level cross validation; ablation over note types.",
      Dataset: "MIMIC-IV v2.2 — 38,412 ICU stays, 210k notes, Sepsis-3 labels.",
      "Machine Learning / AI Models": "ClinicalBERT, BioGPT baseline, XGBoost structured baseline, LSTM fusion head.",
      "Evaluation Metrics": "AUROC, AUPRC, sensitivity at fixed 90% specificity, calibration (Brier score).",
      Results: "AUROC 0.892 vs 0.808 structured-only; AUPRC 0.611; earliest reliable alert at 5.2h median.",
      Limitations: "Single-center data, no external validation, note timestamps assumed reliable.",
      Advantages: "Strong empirical gains, reproducible cohort definition, released preprocessing code.",
      Disadvantages: "Heavy compute, no interpretability analysis, ignores medication ordering signals.",
      "What We Can Use": "Their cohort extraction SQL and Sepsis-3 labelling logic; the late-fusion architecture.",
      "What We Can Improve": "Inject ontology concepts (SNOMED CT) instead of raw wordpieces for interpretability.",
      "Research Gap": "No semantic layer — the model has no notion of clinical concept hierarchy or negation scope.",
      "Important Quotes":
        "\"Free-text notes contributed 63% of the predictive signal in the first six hours of admission.\"",
      References: "Johnson et al. 2023 (MIMIC-IV); Singer et al. 2016 (Sepsis-3); Alsentzer et al. 2019.",
    },
  },
  {
    id: "p2",
    title: "A SNOMED CT-Grounded Ontology for Interoperable ICU Deterioration Alerts",
    authors: "L. Moretti, S. Oyelaran, H. Tanaka",
    year: 2023,
    venue: "AMIA Annual Symposium",
    doi: "10.5555/amia.2023.0912",
    url: "https://amia.org/proceedings/2023/0912",
    category: "Ontologies",
    keywords: ["SNOMED CT", "OWL", "reasoning", "interoperability"],
    abstract:
      "An OWL-DL ontology aligning ICU deterioration concepts with SNOMED CT, enabling portable alerting rules across three hospital systems.",
    status: "Important",
    ownerId: "m2",
    progress: 90,
    analysis: emptyAnalysis,
  },
  {
    id: "p3",
    title: "Negation and Uncertainty Detection in Arabic-English Clinical Narratives",
    authors: "N. Haddad, R. El-Shafei",
    year: 2025,
    venue: "ACL Clinical NLP Workshop",
    doi: "10.18653/v1/2025.clinicalnlp-1.14",
    url: "https://aclanthology.org/2025.clinicalnlp-1.14",
    category: "NLP",
    keywords: ["negation", "code-switching", "annotation"],
    abstract:
      "Presents a 12k-sentence bilingual corpus and a scope-aware tagger for negation and hedging in code-switched clinical text.",
    status: "Reading",
    ownerId: "m4",
    progress: 35,
    analysis: emptyAnalysis,
  },
  {
    id: "p4",
    title: "Benchmarking Gradient Boosting vs Deep Sequence Models on MIMIC-IV",
    authors: "K. Petrov, A. Rahimi, D. Whitfield",
    year: 2024,
    venue: "Machine Learning for Healthcare (MLHC)",
    doi: "10.48550/arXiv.2404.11233",
    url: "https://arxiv.org/abs/2404.11233",
    category: "Machine Learning",
    keywords: ["benchmark", "XGBoost", "temporal models"],
    abstract:
      "A controlled comparison of 9 model families across 6 ICU prediction tasks, finding tuned gradient boosting competitive with transformers at 40x lower cost.",
    status: "Completed",
    ownerId: "m3",
    progress: 100,
    analysis: emptyAnalysis,
  },
  {
    id: "p5",
    title: "Federated Learning for Multi-Hospital Sepsis Models: A Feasibility Study",
    authors: "C. Nguyen, F. Bianchi",
    year: 2022,
    venue: "IEEE JBHI",
    doi: "10.1109/JBHI.2022.3145566",
    url: "https://doi.org/10.1109/JBHI.2022.3145566",
    category: "Machine Learning",
    keywords: ["federated learning", "privacy"],
    abstract:
      "Evaluates FedAvg and FedProx across four simulated hospital silos, reporting a 3-point AUROC gap versus centralized training.",
    status: "To Read",
    ownerId: "m3",
    progress: 0,
    analysis: emptyAnalysis,
  },
  {
    id: "p6",
    title: "Explainability Requirements for Clinical Decision Support: A Survey of Clinicians",
    authors: "M. Alvarez, T. Bergström",
    year: 2023,
    venue: "Artificial Intelligence in Medicine",
    doi: "10.1016/j.artmed.2023.102566",
    url: "https://doi.org/10.1016/j.artmed.2023.102566",
    category: "Software Engineering",
    keywords: ["XAI", "human factors", "CDSS"],
    abstract:
      "Interviews with 41 intensivists on what makes an alert trustworthy; concept-level explanations were preferred over feature attributions.",
    status: "Analyzing",
    ownerId: "m4",
    progress: 55,
    analysis: emptyAnalysis,
  },
  {
    id: "p7",
    title: "Data Leakage Pitfalls in Retrospective EHR Studies",
    authors: "S. Iqbal, J. Marchetti",
    year: 2021,
    venue: "Nature Digital Medicine",
    doi: "10.1038/s41746-021-00512-6",
    url: "https://doi.org/10.1038/s41746-021-00512-6",
    category: "Data Science",
    keywords: ["leakage", "study design", "reproducibility"],
    abstract:
      "Catalogues 12 recurring leakage patterns in EHR modelling and proposes a preregistration checklist.",
    status: "Rejected",
    ownerId: "m1",
    progress: 20,
    analysis: emptyAnalysis,
  },
  {
    id: "p8",
    title: "Ontology-Enhanced Retrieval Augmented Generation for Clinical Q&A",
    authors: "P. Sharma, E. Dubois, W. Chen",
    year: 2025,
    venue: "NeurIPS Datasets & Benchmarks",
    doi: "10.48550/arXiv.2503.00981",
    url: "https://arxiv.org/abs/2503.00981",
    category: "NLP",
    keywords: ["RAG", "ontology", "LLM"],
    abstract:
      "Grounds retrieval in a medical ontology graph, reducing hallucinated clinical claims by 41% versus dense-only retrieval.",
    status: "Reading",
    ownerId: "m2",
    progress: 28,
    analysis: emptyAnalysis,
  },
];

export const ANALYSIS_SECTIONS = [
  "Research Problem",
  "Research Question",
  "Proposed Solution",
  "Methodology",
  "Dataset",
  "Machine Learning / AI Models",
  "Evaluation Metrics",
  "Results",
  "Limitations",
  "Advantages",
  "Disadvantages",
  "What We Can Use",
  "What We Can Improve",
  "Research Gap",
  "Important Quotes",
  "References",
];

export const TASK_COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To Do" },
  { id: "progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Completed" },
];

export const LABELS = [
  "Research",
  "Development",
  "Dataset",
  "Paper",
  "Meeting",
  "Documentation",
  "Presentation",
  "Testing",
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Extract Sepsis-3 cohort from MIMIC-IV",
    description: "Run cohort SQL, validate against published counts, export parquet snapshots.",
    status: "progress",
    priority: "URGENT",
    assigneeId: "m3",
    due: "2026-08-14",
    labels: ["Dataset", "Research"],
    checklist: [
      { text: "Request PhysioNet credentials", done: true },
      { text: "Run admissions + chartevents join", done: true },
      { text: "Validate cohort size (38k stays)", done: false },
      { text: "Publish data dictionary", done: false },
    ],
    paperId: "p1",
    phaseId: "ph3",
    comments: 6,
    attachments: 3,
  },
  {
    id: "t2",
    title: "Draft ontology class hierarchy in Protégé",
    description: "Model deterioration concepts, align top 120 classes to SNOMED CT identifiers.",
    status: "progress",
    priority: "HIGH",
    assigneeId: "m2",
    due: "2026-08-18",
    labels: ["Development", "Research"],
    checklist: [
      { text: "Define upper ontology", done: true },
      { text: "Map vitals concepts", done: false },
      { text: "Reasoner consistency check", done: false },
    ],
    paperId: "p2",
    phaseId: "ph4",
    comments: 3,
    attachments: 2,
  },
  {
    id: "t3",
    title: "Complete analysis of ClinicalBERT paper",
    description: "Fill all 16 analysis sections and mark reusable components.",
    status: "review",
    priority: "HIGH",
    assigneeId: "m1",
    due: "2026-08-11",
    labels: ["Paper", "Research"],
    checklist: [
      { text: "Methodology section", done: true },
      { text: "Results + metrics", done: true },
      { text: "Research gap write-up", done: false },
    ],
    paperId: "p1",
    phaseId: "ph2",
    comments: 8,
    attachments: 1,
  },
  {
    id: "t4",
    title: "Annotation guidelines v2 for negation scope",
    description: "Incorporate reviewer feedback, add 20 bilingual examples.",
    status: "todo",
    priority: "MEDIUM",
    assigneeId: "m4",
    due: "2026-08-22",
    labels: ["Documentation", "Research"],
    checklist: [
      { text: "Collect edge cases", done: true },
      { text: "Write examples", done: false },
    ],
    paperId: "p3",
    phaseId: "ph3",
    comments: 2,
    attachments: 0,
  },
  {
    id: "t5",
    title: "Baseline XGBoost benchmark run",
    description: "Reproduce MLHC benchmark numbers on our cohort split.",
    status: "todo",
    priority: "HIGH",
    assigneeId: "m3",
    due: "2026-08-25",
    labels: ["Testing", "Dataset"],
    checklist: [{ text: "Feature pipeline", done: false }],
    paperId: "p4",
    phaseId: "ph5",
    comments: 1,
    attachments: 0,
  },
  {
    id: "t6",
    title: "Prepare mid-term progress presentation",
    description: "12 slides: problem, gap, architecture, current results, timeline.",
    status: "backlog",
    priority: "MEDIUM",
    assigneeId: "m5",
    due: "2026-09-02",
    labels: ["Presentation", "Documentation"],
    checklist: [],
    phaseId: "ph8",
    comments: 0,
    attachments: 1,
  },
  {
    id: "t7",
    title: "Systematic search: 2021–2025 sepsis NLP papers",
    description: "Scopus + PubMed queries, dedupe, screen abstracts, log in library.",
    status: "done",
    priority: "HIGH",
    assigneeId: "m1",
    due: "2026-07-28",
    labels: ["Research", "Paper"],
    checklist: [
      { text: "Define query string", done: true },
      { text: "Screen 240 abstracts", done: true },
      { text: "Import 42 candidates", done: true },
    ],
    phaseId: "ph1",
    comments: 4,
    attachments: 2,
  },
  {
    id: "t8",
    title: "Set up shared Zotero + BibTeX export",
    description: "Group library synced to the thesis repository.",
    status: "done",
    priority: "LOW",
    assigneeId: "m5",
    due: "2026-07-20",
    labels: ["Documentation"],
    checklist: [],
    phaseId: "ph1",
    comments: 1,
    attachments: 0,
  },
  {
    id: "t9",
    title: "Research gap matrix across 42 screened papers",
    description: "Compare method, data, semantics, explainability columns.",
    status: "review",
    priority: "URGENT",
    assigneeId: "m4",
    due: "2026-08-09",
    labels: ["Research", "Paper"],
    checklist: [{ text: "Fill semantics column", done: true }],
    phaseId: "ph2",
    comments: 5,
    attachments: 1,
  },
  {
    id: "t10",
    title: "Evaluate ethical approval requirements",
    description: "IRB checklist for de-identified secondary data use.",
    status: "backlog",
    priority: "LOW",
    assigneeId: "m6",
    due: "2026-09-15",
    labels: ["Documentation", "Research"],
    checklist: [],
    phaseId: "ph3",
    comments: 0,
    attachments: 0,
  },
];

export const notes: Note[] = [
  {
    id: "n1",
    title: "Literature Review — semantic layer is the recurring gap",
    type: "Literature Review",
    authorId: "m1",
    updated: "2026-08-08",
    tags: ["gap", "ontology", "survey"],
    paperId: "p1",
    body: `## Pattern across 42 screened papers
Most high-performing sepsis models are **purely statistical**. Only 4 of 42 use any controlled vocabulary.

- 31 papers use MIMIC-III/IV
- 9 papers report external validation
- 4 papers use SNOMED CT or UMLS concepts

### Why it matters
Clinicians in Alvarez & Bergström (2023) asked for *concept-level* explanations, not SHAP bars.

> "Tell me which clinical concept fired, not which token."

### Our angle
Map note spans → ontology concepts → reasoner-derived risk factors, then feed concept activations to the classifier.`,
  },
  {
    id: "n2",
    title: "Meeting minutes — Weekly Research Sync (Aug 4)",
    type: "Meeting",
    authorId: "m5",
    updated: "2026-08-04",
    tags: ["minutes", "decisions"],
    body: `### Attendees
Ahmed, Abdalla, Maria, Jumana, Ziad, Dr. Laila

### Decisions
1. Use MIMIC-IV v2.2 as the primary dataset.
2. Compare ClinicalBERT vs tuned XGBoost as the two headline baselines.
3. Ontology work moves ahead of implementation in the timeline.

### Action items
- [x] Ahmed → finish ClinicalBERT analysis
- [ ] Maria → cohort extraction
- [ ] Abdalla → Protégé class hierarchy`,
  },
  {
    id: "n3",
    title: "Experiment log — negation tagger pilot",
    type: "Experiment",
    authorId: "m4",
    updated: "2026-08-06",
    tags: ["nlp", "negation", "pilot"],
    paperId: "p3",
    body: `| Run | Model | F1 (negation) | Notes |
|-----|-------|---------------|-------|
| 01 | rule-based (NegEx) | 0.71 | fails on code-switched text |
| 02 | BiLSTM-CRF | 0.79 | needs more data |
| 03 | XLM-R fine-tune | 0.86 | best so far |

\`\`\`python
scope = tagger.predict(sent, lang="mixed")
\`\`\`

Next: annotate 500 more Arabic-English sentences.`,
  },
  {
    id: "n4",
    title: "Idea — concept activation dashboard for clinicians",
    type: "Idea",
    authorId: "m2",
    updated: "2026-08-07",
    tags: ["xai", "ui"],
    body: `Instead of a single risk score, show the **top 5 firing ontology concepts** with the note span that triggered each one.

1. Concept: *Altered mental status* — "pt more confused overnight"
2. Concept: *Tachypnea* — "RR 28, laboured"

This directly answers the explainability requirement from the clinician survey.`,
  },
  {
    id: "n5",
    title: "Brainstorm — thesis chapter outline",
    type: "Brainstorm",
    authorId: "m5",
    updated: "2026-08-01",
    tags: ["thesis"],
    body: `1. Introduction
2. Background: sepsis, EHR, ontologies
3. Related work
4. Research gap
5. Proposed system
6. Implementation
7. Evaluation
8. Discussion & future work`,
  },
  {
    id: "n6",
    title: "Research note — Sepsis-3 labelling rules",
    type: "Research",
    authorId: "m3",
    updated: "2026-08-09",
    tags: ["dataset", "labels"],
    paperId: "p1",
    taskId: "t1",
    body: `Sepsis onset = suspicion of infection (culture + antibiotics window) **and** SOFA increase >= 2.

- Antibiotic window: -24h / +72h around culture
- SOFA computed hourly, forward-filled max 6h
- Exclude stays < 12h`,
  },
];

export const shots: Shot[] = [
  {
    id: "s1",
    title: "ClinicalBERT fusion architecture (Fig. 3)",
    description: "Late-fusion diagram we plan to adapt with an ontology branch.",
    tags: ["architecture", "figure"],
    source: "Zhang et al. 2024, p.7",
    uploadedBy: "m1",
    date: "2026-08-05",
    paperId: "p1",
    hue: 255,
    comments: [{ author: "Abdalla Nasser", text: "We can swap the left branch for the reasoner output." }],
  },
  {
    id: "s2",
    title: "SNOMED CT subtree — deterioration concepts",
    description: "Protégé screenshot of the current class hierarchy draft.",
    tags: ["ontology", "protege"],
    source: "Own work",
    uploadedBy: "m2",
    date: "2026-08-07",
    paperId: "p2",
    hue: 195,
    comments: [],
  },
  {
    id: "s3",
    title: "AUROC comparison across 9 model families",
    description: "Benchmark table screenshot for the related-work chapter.",
    tags: ["results", "benchmark"],
    source: "Petrov et al. 2024",
    uploadedBy: "m3",
    date: "2026-08-03",
    paperId: "p4",
    hue: 155,
    comments: [{ author: "Maria Fahmy", text: "Note the 40x cost difference — worth a slide." }],
  },
  {
    id: "s4",
    title: "Cohort flow diagram (CONSORT-style)",
    description: "38,412 stays after exclusions.",
    tags: ["dataset", "figure"],
    source: "Own work",
    uploadedBy: "m3",
    date: "2026-08-08",
    hue: 70,
    comments: [],
  },
  {
    id: "s5",
    title: "Annotation tool UI for negation spans",
    description: "Prodigy-style interface used in the pilot.",
    tags: ["nlp", "annotation"],
    source: "Own work",
    uploadedBy: "m4",
    date: "2026-08-06",
    paperId: "p3",
    hue: 300,
    comments: [],
  },
  {
    id: "s6",
    title: "Clinician preference survey results",
    description: "Concept-level explanations preferred 3:1 over feature attributions.",
    tags: ["xai", "survey"],
    source: "Alvarez & Bergström 2023",
    uploadedBy: "m4",
    date: "2026-08-02",
    paperId: "p6",
    hue: 25,
    comments: [],
  },
  {
    id: "s7",
    title: "System architecture v0.4",
    description: "Ingestion → concept mapper → reasoner → risk model → alert UI.",
    tags: ["architecture"],
    source: "Own work",
    uploadedBy: "m2",
    date: "2026-08-09",
    hue: 220,
    comments: [{ author: "Dr. Laila Mansour", text: "Add a feedback loop from clinician acknowledgement." }],
  },
  {
    id: "s8",
    title: "Whiteboard — research gap matrix",
    description: "Photo from the Aug 4 sync.",
    tags: ["gap", "meeting"],
    source: "Lab whiteboard",
    uploadedBy: "m5",
    date: "2026-08-04",
    hue: 120,
    comments: [],
  },
];

export const voiceNotes: VoiceNote[] = [
  {
    id: "v1",
    title: "Research meeting idea — concept activation view",
    seconds: 154,
    authorId: "m2",
    date: "2026-08-07",
    description: "Quick thought recorded after the sync about showing firing concepts to clinicians.",
    paperId: "p6",
  },
  {
    id: "v2",
    title: "Supervisor feedback on methodology chapter",
    seconds: 372,
    authorId: "m6",
    date: "2026-08-05",
    description: "Dr. Laila's comments on evaluation protocol and external validation.",
    taskId: "t3",
  },
  {
    id: "v3",
    title: "Cohort extraction walkthrough",
    seconds: 248,
    authorId: "m3",
    date: "2026-08-08",
    description: "Explains the SQL joins and exclusion criteria for the team.",
    paperId: "p1",
    taskId: "t1",
  },
  {
    id: "v4",
    title: "Annotation edge cases to discuss",
    seconds: 96,
    authorId: "m4",
    date: "2026-08-06",
    description: "Three bilingual negation cases the guidelines don't cover yet.",
    taskId: "t4",
  },
];

export const files: ResearchFile[] = [
  { id: "f1", name: "Zhang_2024_ClinicalBERT_Sepsis.pdf", ext: "pdf", folder: "Research Papers", size: "3.4 MB", uploadedBy: "m1", date: "2026-08-05" },
  { id: "f2", name: "Moretti_2023_ICU_Ontology.pdf", ext: "pdf", folder: "Research Papers", size: "2.1 MB", uploadedBy: "m2", date: "2026-08-02" },
  { id: "f3", name: "mimiciv_cohort_v3.csv", ext: "csv", folder: "Datasets", size: "184 MB", uploadedBy: "m3", date: "2026-08-08" },
  { id: "f4", name: "sofa_hourly_snapshot.xlsx", ext: "xlsx", folder: "Datasets", size: "27 MB", uploadedBy: "m3", date: "2026-08-08" },
  { id: "f5", name: "architecture_v0.4.png", ext: "png", folder: "Screenshots", size: "820 KB", uploadedBy: "m2", date: "2026-08-09" },
  { id: "f6", name: "midterm_progress.pptx", ext: "pptx", folder: "Presentations", size: "11 MB", uploadedBy: "m5", date: "2026-08-01" },
  { id: "f7", name: "thesis_draft_ch1-3.docx", ext: "docx", folder: "Documentation", size: "1.8 MB", uploadedBy: "m5", date: "2026-08-07" },
  { id: "f8", name: "weekly_sync_2026-08-04.mp3", ext: "mp3", folder: "Meeting Files", size: "42 MB", uploadedBy: "m5", date: "2026-08-04" },
  { id: "f9", name: "negation_pilot_run03.json", ext: "csv", folder: "Experiments", size: "640 KB", uploadedBy: "m4", date: "2026-08-06" },
  { id: "f10", name: "demo_walkthrough.mp4", ext: "mp4", folder: "Presentations", size: "96 MB", uploadedBy: "m2", date: "2026-08-09" },
  { id: "f11", name: "annotation_guidelines_v1.pdf", ext: "pdf", folder: "Documentation", size: "740 KB", uploadedBy: "m4", date: "2026-07-30" },
  { id: "f12", name: "cohort_flow_diagram.jpg", ext: "jpg", folder: "Screenshots", size: "410 KB", uploadedBy: "m3", date: "2026-08-08" },
];

export const links: ResourceLink[] = [
  { id: "l1", title: "PhysioNet — MIMIC-IV v2.2", url: "https://physionet.org/content/mimiciv/2.2/", description: "Primary dataset, requires credentialed access.", category: "Dataset", tags: ["dataset", "icu"], addedBy: "m3", paperId: "p1" },
  { id: "l2", title: "SNOMED CT Browser", url: "https://browser.ihtsdotools.org/", description: "Concept lookup for ontology alignment.", category: "Research Tool", tags: ["ontology", "terminology"], addedBy: "m2", paperId: "p2" },
  { id: "l3", title: "clinicalBERT — GitHub", url: "https://github.com/EmilyAlsentzer/clinicalBERT", description: "Reference implementation and pretrained weights.", category: "GitHub", tags: ["code", "nlp"], addedBy: "m1", paperId: "p1" },
  { id: "l4", title: "Protégé Desktop", url: "https://protege.stanford.edu/", description: "OWL ontology editor used for the class hierarchy.", category: "Research Tool", tags: ["ontology"], addedBy: "m2" },
  { id: "l5", title: "Sepsis-3 definition (JAMA)", url: "https://jamanetwork.com/journals/jama/fullarticle/2492881", description: "Canonical labelling criteria.", category: "Paper", tags: ["labels"], addedBy: "m3" },
  { id: "l6", title: "MLHC 2024 benchmark talk", url: "https://www.youtube.com/watch?v=mlhc2024", description: "20-min overview of the benchmark paper.", category: "Video", tags: ["benchmark"], addedBy: "m3", paperId: "p4" },
  { id: "l7", title: "UMLS REST API docs", url: "https://documentation.uts.nlm.nih.gov/rest/home.html", description: "Concept normalization endpoints.", category: "API", tags: ["api", "terminology"], addedBy: "m2" },
  { id: "l8", title: "scispaCy documentation", url: "https://allenai.github.io/scispacy/", description: "Entity linking pipeline candidate.", category: "Documentation", tags: ["nlp", "code"], addedBy: "m4", paperId: "p3" },
];

export const meetings: Meeting[] = [
  {
    id: "mt1",
    title: "Weekly Research Meeting",
    date: "2026-08-11",
    time: "10:00 – 11:30",
    participants: ["m1", "m2", "m3", "m4", "m5", "m6"],
    agenda: ["Literature review status", "Dataset extraction progress", "Ontology development", "Timeline check"],
    decisions: ["Use MIMIC-IV v2.2", "Compare ClinicalBERT vs tuned XGBoost", "Freeze ontology scope at 120 classes"],
    actionItems: [
      { text: "Analyze ClinicalBERT paper limitations section", ownerId: "m1" },
      { text: "Prepare architecture v0.5 diagram", ownerId: "m2" },
      { text: "Finish cohort validation counts", ownerId: "m3" },
    ],
    notes: "Dr. Laila asked for an external validation plan before Phase 5.",
  },
  {
    id: "mt2",
    title: "Supervisor Review — Methodology Chapter",
    date: "2026-08-13",
    time: "13:00 – 14:00",
    participants: ["m1", "m5", "m6"],
    agenda: ["Chapter 5 walkthrough", "Evaluation protocol", "Publication target"],
    decisions: ["Target AMIA 2027 submission"],
    actionItems: [{ text: "Rewrite evaluation protocol section", ownerId: "m5" }],
    notes: "Bring printed figures.",
  },
  {
    id: "mt3",
    title: "Dataset Working Session",
    date: "2026-08-04",
    time: "15:00 – 17:00",
    participants: ["m2", "m3", "m4"],
    agenda: ["Cohort SQL review", "Feature dictionary", "Annotation sampling"],
    decisions: ["Exclude stays under 12 hours", "Sample 500 notes for annotation"],
    actionItems: [{ text: "Publish data dictionary", ownerId: "m3" }],
    notes: "Recording attached as a voice note.",
  },
];

export const events: CalEvent[] = [
  { id: "e1", title: "Weekly Research Meeting", date: "2026-08-11", time: "10:00", kind: "meeting", description: "Full team sync", attendees: ["m1", "m2", "m3", "m4", "m5", "m6"] },
  { id: "e2", title: "Cohort extraction deadline", date: "2026-08-14", time: "23:59", kind: "deadline", description: "Validated parquet snapshots due", attendees: ["m3"] },
  { id: "e3", title: "Supervisor Review", date: "2026-08-13", time: "13:00", kind: "meeting", description: "Methodology chapter", attendees: ["m1", "m5", "m6"] },
  { id: "e4", title: "Phase 3 milestone — Dataset ready", date: "2026-08-20", time: "12:00", kind: "milestone", description: "Dataset collection phase complete", attendees: ["m1", "m3"] },
  { id: "e5", title: "Ontology hierarchy draft due", date: "2026-08-18", time: "18:00", kind: "deadline", description: "120 aligned classes", attendees: ["m2"] },
  { id: "e6", title: "Reading block — RAG paper", date: "2026-08-12", time: "09:00", kind: "personal", description: "Deep read + notes", attendees: ["m2"] },
  { id: "e7", title: "Mid-term presentation", date: "2026-09-02", time: "11:00", kind: "milestone", description: "Faculty progress defense", attendees: ["m1", "m2", "m3", "m4", "m5"] },
  { id: "e8", title: "Annotation guidelines v2 due", date: "2026-08-22", time: "17:00", kind: "deadline", description: "Send to Dr. Laila", attendees: ["m4"] },
  { id: "e9", title: "Lab seminar: Federated learning", date: "2026-08-26", time: "14:00", kind: "meeting", description: "Guest talk", attendees: ["m1", "m3"] },
  { id: "e10", title: "Baseline benchmark results due", date: "2026-08-25", time: "23:59", kind: "deadline", description: "XGBoost vs transformer", attendees: ["m3"] },
];

export const phases: Phase[] = [
  { id: "ph1", index: 1, name: "Literature Review", start: "2026-06-01", end: "2026-07-15", progress: 100, members: ["m1", "m4"], deliverables: ["42 screened papers", "Shared Zotero library"] },
  { id: "ph2", index: 2, name: "Research Gap Analysis", start: "2026-07-10", end: "2026-08-10", progress: 85, members: ["m1", "m4", "m6"], deliverables: ["Gap matrix", "Positioning statement"] },
  { id: "ph3", index: 3, name: "Dataset Collection", start: "2026-08-01", end: "2026-08-20", progress: 52, members: ["m3", "m4"], deliverables: ["MIMIC-IV cohort", "Annotation sample"] },
  { id: "ph4", index: 4, name: "System Design", start: "2026-08-15", end: "2026-09-10", progress: 30, members: ["m2", "m1"], deliverables: ["Ontology v1", "Architecture spec"] },
  { id: "ph5", index: 5, name: "Implementation", start: "2026-09-05", end: "2026-10-25", progress: 8, members: ["m2", "m3"], deliverables: ["Concept mapper", "Risk model service"] },
  { id: "ph6", index: 6, name: "Testing & Evaluation", start: "2026-10-20", end: "2026-11-20", progress: 0, members: ["m3", "m4"], deliverables: ["Benchmark report", "Ablation study"] },
  { id: "ph7", index: 7, name: "Research Paper", start: "2026-11-01", end: "2026-12-15", progress: 0, members: ["m1", "m5", "m6"], deliverables: ["AMIA submission draft"] },
  { id: "ph8", index: 8, name: "Final Presentation", start: "2026-12-10", end: "2027-01-10", progress: 0, members: ["m1", "m5"], deliverables: ["Defense deck", "Demo video"] },
];

export const activity: Activity[] = [
  { id: "a1", memberId: "m3", action: "uploaded", object: "mimiciv_cohort_v3.csv", time: new Date(Date.now() - 12 * 60 * 1000).toISOString(), kind: "file" },
  { id: "a2", memberId: "m2", action: "added a screenshot", object: "System architecture v0.4", time: new Date(Date.now() - 60 * 60 * 1000).toISOString(), kind: "image" },
  { id: "a3", memberId: "m1", action: "moved", object: "Complete analysis of ClinicalBERT paper → Review", time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), kind: "task" },
  { id: "a4", memberId: "m4", action: "added a voice note", object: "Annotation edge cases to discuss", time: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), kind: "voice" },
  { id: "a5", memberId: "m5", action: "updated the note", object: "Meeting minutes — Weekly Research Sync", time: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), kind: "note" },
  { id: "a6", memberId: "m6", action: "commented on", object: "System architecture v0.4", time: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), kind: "comment" },
  { id: "a7", memberId: "m2", action: "added a paper", object: "Ontology-Enhanced RAG for Clinical Q&A", time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), kind: "paper" },
  { id: "a8", memberId: "m1", action: "completed", object: "Systematic search: 2021–2025 sepsis NLP papers", time: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), kind: "task" },
  { id: "a9", memberId: "m3", action: "added a link", object: "PhysioNet — MIMIC-IV v2.2", time: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), kind: "file" },
  { id: "a10", memberId: "m4", action: "created a note", object: "Experiment log — negation tagger pilot", time: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), kind: "note" },
];

export const progressSeries = [
  { week: "W22", papers: 4, tasks: 3, progress: 6 },
  { week: "W24", papers: 11, tasks: 8, progress: 14 },
  { week: "W26", papers: 19, tasks: 14, progress: 22 },
  { week: "W28", papers: 27, tasks: 21, progress: 29 },
  { week: "W30", papers: 34, tasks: 27, progress: 35 },
  { week: "W31", papers: 38, tasks: 33, progress: 40 },
  { week: "W32", papers: 42, tasks: 38, progress: 46 },
];

export const notifications = [
  { id: "nt1", title: "Dr. Laila mentioned you", body: "\"Add a feedback loop from clinician acknowledgement.\"", time: "8 h", unread: true, link: "/papers/p1" },
  { id: "nt2", title: "Task due tomorrow", body: "Complete analysis of ClinicalBERT paper", time: "10 h", unread: true, link: "/tasks" },
  { id: "nt3", title: "Paper assigned to you", body: "Ontology-Enhanced RAG for Clinical Q&A", time: "1 d", unread: true, link: "/papers/p2" },
  { id: "nt4", title: "Meeting reminder", body: "Weekly Research Meeting · Tue 10:00", time: "1 d", unread: false, link: "/calendar" },
  { id: "nt5", title: "New file in Datasets", body: "mimiciv_cohort_v3.csv uploaded by Maria", time: "2 d", unread: false, link: "/media" },
];