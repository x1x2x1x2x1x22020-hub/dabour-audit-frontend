export interface AuditClient {
  id: string;
  name: string;
  arabicName: string;
  industry: string;
  financialYear: string;
  auditPartner: string;
  status: "Planning" | "Risk Assessment" | "Substantive Testing" | "Finalization" | "Completed";
  progress: number;
  openFindings: number;
}

export interface AMLSearchResult {
  id: string;
  fullName: string;
  nationality: string;
  type: "Individual" | "Entity";
  listSource: "UN Sanctions" | "OFAC" | "EU Consolidated" | "PEP Database" | "None" | string;
  status: "Flagged" | "Clear" | "Under Review";
  riskScore: number; // 0 to 100
  details: string;
  sources?: Array<{ title: string; uri: string }>;
  isLive?: boolean;
}

export interface MaterialityState {
  benchmark: "ProfitBeforeTax" | "TotalAssets" | "Revenue" | "TotalEquity";
  customValue: number;
  overallPercentage: number;
  performancePercentage: number;
  trivialPercentage: number;
}

export interface RiskComment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface RiskItem {
  id: string;
  description: string;
  descriptionAr?: string;
  assertion: string;
  likelihood: 1 | 2 | 3 | 4 | 5; // Y-axis
  impact: 1 | 2 | 3 | 4 | 5;     // X-axis
  inherentRisk: "High" | "Medium" | "Low";
  controlRisk: "High" | "Medium" | "Low";
  detectionRisk: "High" | "Medium" | "Low";
  plannedResponse: string;
  plannedResponseAr?: string;
  controlDescription?: string;
  controlDescriptionAr?: string;
  assignedAuditors?: string[];
  trend?: "up" | "down" | "stable";
  comments?: RiskComment[];
}

export interface PreEngagementItem {
  id: string;
  section: "ISA 210" | "ISA 220" | "ISQM 1" | "Independence";
  label: string;
  labelAr: string;
  status: "Completed" | "In_Progress" | "Not_Started" | "Not_Applicable";
  comments: string;
  signee: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: "Engagement Partner" | "Audit Manager" | "Senior Auditor" | "Junior Associate" | "Sami AI Copilot";
  assignedAreas: string[];
}

export interface TimelineMilestone {
  id: string;
  title: string;
  titleAr: string;
  dueDate: string;
  status: "Completed" | "Active" | "Pending";
  owner: string;
}

export interface Workpaper {
  id: string;
  ref: string;
  title: string;
  titleAr?: string;
  section: string;
  sectionAr?: string;
  checkedBy?: string;
  checkedOutAt?: string;
  status: "Completed" | "Draft" | "In Review";
  contentMarkdown?: string;
  contentMarkdownAr?: string;
}

export interface AuditProcedure {
  id: string;
  section: string; // e.g., Cash, Revenue, Assets, Equity
  ref: string;
  description: string;
  descriptionAr: string;
  assertion: string;
  evidence: string;
  status: "Completed" | "Pending" | "In Progress";
  signOffBy?: string;
  workpaperRef?: string;
  evidenceFiles?: string[]; // uploaded evidence filenames
}
