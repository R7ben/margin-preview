/*
 * MARGIN / Quiet Instrument style contract:
 * Calm technology with a Swiss-influenced information hierarchy. Recovery is the first visual anchor;
 * deep ocean frames the interface, blue marks protected recovery infrastructure, and the four state colors
 * communicate actual Recovery Margin changes. Keep whitespace generous, language observational, and agency intact.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  Check,
  ChevronDown,
  Circle,
  CircleCheck,
  ClipboardList,
  Clock3,
  Dumbbell,
  FileText,
  Home,
  Info,
  Leaf,
  LockKeyhole,
  Menu,
  MessageCircleQuestion,
  Moon,
  PenLine,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TriangleAlert,
  Upload,
  Users,
  X,
  Brain,
} from "lucide-react";

type Screen = "onboarding" | "dashboard" | "mirror" | "triage" | "planner" | "reflection" | "import";
type CognitiveLoad = "Low" | "Medium" | "High";
type TaskCategory = "mental" | "social" | "physical" | "errands";
type TriageOutcome = "full" | "partial" | "failure" | null;
type TaskOutcomeValue = "Easy" | "Fine" | "Hard" | "Disaster";
type TaskOutcomeRecord = { taskId: number; taskName: string; outcome: TaskOutcomeValue; timestamp: number };
type EnergyResponse = "Rough" | "Okay" | "Ready";
type EnergyCheckIn = { date: string; response: EnergyResponse };
type MoodValue = "Drained" | "Okay" | "Good" | "Energized";
type MoodCheckIn = { date: string; value: MoodValue };
type ChatMessage = { role: "user" | "assistant"; content: string };
type RiskAssessment = { score: number; label: "Low" | "Moderate" | "High" | "Critical"; trend: "improving" | "stable" | "worsening"; trendSlope: number };

type FixedCommitment = {
  id: number;
  name: string;
  days: string[];
  startTime: string;
  endTime: string;
  hours: number;
};

type FlexibleTask = {
  id: number;
  name: string;
  estimatedHours: number;
  cognitiveLoad: CognitiveLoad;
  deadline: string;
  deferred: boolean;
  category: TaskCategory;
};

type RecoveryBlock = {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  type: string;
  locked: boolean;
};

type Suggestion = {
  range: string;
  midpoint: number;
  cognitiveLoad: CognitiveLoad;
  category: TaskCategory;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const RING_CIRCUMFERENCE = 2 * Math.PI * 86;
function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3 L3.5 3 L3.5 8" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 21 L20.5 21 L20.5 16" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3 L20.5 3 L20.5 8" stroke="var(--teal)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 21 L3.5 21 L3.5 16" stroke="var(--teal)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const initialFixedCommitments: FixedCommitment[] = [
  { id: 1, name: "Seminar", days: ["Tue", "Thu"], startTime: "10:00", endTime: "12:00", hours: 4 },
  { id: 2, name: "Campus shift", days: ["Fri"], startTime: "14:00", endTime: "19:00", hours: 5 },
  { id: 3, name: "Lectures", days: ["Mon", "Wed"], startTime: "09:00", endTime: "12:00", hours: 6 },
  { id: 4, name: "Studio lab", days: ["Wed"], startTime: "14:00", endTime: "17:00", hours: 3 },
];

const initialTasks: FlexibleTask[] = [
  { id: 1, name: "Readings for seminar", estimatedHours: 4, cognitiveLoad: "Medium", deadline: "Thu", deferred: false, category: "mental" },
  { id: 2, name: "Research synthesis", estimatedHours: 3, cognitiveLoad: "High", deadline: "Thu", deferred: false, category: "mental" },
  { id: 3, name: "Problem set", estimatedHours: 2.5, cognitiveLoad: "High", deadline: "Thu", deferred: false, category: "mental" },
  { id: 4, name: "Case study", estimatedHours: 4, cognitiveLoad: "High", deadline: "Thu", deferred: false, category: "mental" },
  { id: 5, name: "Laundry", estimatedHours: 2, cognitiveLoad: "Low", deadline: "Sat", deferred: false, category: "physical" },
  { id: 6, name: "Society discussion", estimatedHours: 1.5, cognitiveLoad: "Medium", deadline: "Fri", deferred: false, category: "social" },
];

const DEFAULT_RECOVERY_BLOCKS: RecoveryBlock[] = [
  { id: 101, day: "Tuesday", startTime: "18:00", endTime: "19:00", type: "Physical break", locked: false },
  { id: 102, day: "Thursday", startTime: "18:30", endTime: "19:30", type: "Screen-free wind-down", locked: false },
  { id: 103, day: "Sunday", startTime: "10:00", endTime: "11:00", type: "Sleep extension", locked: false },
];

const IMPORTED_TIMETABLE: FixedCommitment[] = [
  { id: 901, name: "Design studio", days: ["Mon", "Wed"], startTime: "09:00", endTime: "11:00", hours: 4 },
  { id: 902, name: "Statistics lab", days: ["Thu"], startTime: "14:00", endTime: "16:00", hours: 2 },
];

const suggestionFor = (value: string): Suggestion => {
  const name = value.toLowerCase();
  if (/(lab report|essay|literature review|assignment)/.test(name)) return { range: "3–4 hrs", midpoint: 3.5, cognitiveLoad: "High", category: "mental" };
  if (/(tutorial|lecture|class)/.test(name)) return { range: "1–2 hrs", midpoint: 1.5, cognitiveLoad: "Medium", category: "mental" };
  if (/(meeting|discussion|sync|social)/.test(name)) return { range: "0.5–2 hrs", midpoint: 1.25, cognitiveLoad: "Medium", category: "social" };
  if (/(email|admin|errand)/.test(name)) return { range: "0.5–1 hr", midpoint: 0.75, cognitiveLoad: "Low", category: "errands" };
  if (/(exam|presentation|viva)/.test(name)) return { range: "2–4 hrs", midpoint: 3, cognitiveLoad: "High", category: "mental" };
  if (/(exercise|gym|sport)/.test(name)) return { range: "1–2 hrs", midpoint: 1.5, cognitiveLoad: "Medium", category: "physical" };
  return { range: "1 hr", midpoint: 1, cognitiveLoad: "Medium", category: "mental" };
};

const QUICK_ADD_PRESETS: { name: string; hours: number; displayCategory: string }[] = [
  { name: "Assignment", hours: 3, displayCategory: "Mental" },
  { name: "Gym", hours: 1, displayCategory: "Physical" },
  { name: "Errand", hours: 0.5, displayCategory: "Errands" },
  { name: "Social", hours: 2, displayCategory: "Social" },
  { name: "Presentation", hours: 3, displayCategory: "Mental" },
  { name: "Meeting", hours: 1, displayCategory: "Social" },
];

const parseTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
};

const durationBetween = (start: string, end: string) => {
  const duration = parseTime(end) - parseTime(start);
  return Number((duration > 0 ? duration : duration + 24).toFixed(1));
};

const longestConsecutive = (values: boolean[]) => {
  let longest = 0;
  let current = 0;
  values.forEach((isHigh) => {
    current = isHigh ? current + 1 : 0;
    longest = Math.max(longest, current);
  });
  return longest;
};

const formatHours = (hours: number) => {
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} hrs`;
};

const formatShortHours = (hours: number) => {
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}h`;
};

const TOTAL_WEEK_HOURS = 168;

const capacityPercent = (availableHours: number, totalHours: number = TOTAL_WEEK_HOURS) => {
  return Math.round(Math.max(0, Math.min(1, availableHours / totalHours)) * 100);
};

const statusFor = (margin: number) => {
  if (margin < 0) return { label: "Breached", color: "#8B0000", soft: "#FFF5F5", copy: "Recovery floor exceeded" };
  if (margin <= 5) return { label: "Critical", color: "#C1121F", soft: "#FFF8F8", copy: "Very little margin remains" };
  if (margin <= 20) return { label: "Tightening", color: "#F4A261", soft: "#FFF9F1", copy: "Margin is getting narrow" };
  return { label: "Comfortable", color: "#2D6A4F", soft: "#F3F8F5", copy: "Room remains around your commitments" };
};

const dailyStatusFor = (margin: number) => {
  if (margin < 0) return statusFor(-1);
  if (margin <= 5) return statusFor(5);
  if (margin <= 10) return statusFor(10);
  return statusFor(21);
};

const CATEGORY_BREAKDOWN_ITEMS: { key: "mental" | "physical" | "time" | "social" | "errands"; label: string; color: string }[] = [
  { key: "mental", label: "Mental", color: "var(--navy)" },
  { key: "physical", label: "Physical", color: "var(--metric-green)" },
  { key: "time", label: "Time", color: "var(--warning-amber)" },
  { key: "social", label: "Social", color: "#2196a6" },
  { key: "errands", label: "Errands", color: "#a0a8ab" },
];
const MOOD_OPTIONS: { value: MoodValue; emoji: string }[] = [
  { value: "Drained", emoji: "😩" },
  { value: "Okay", emoji: "😐" },
  { value: "Good", emoji: "🙂" },
  { value: "Energized", emoji: "⚡" },
];

const moodMeta = (value: MoodValue) => {
  if (value === "Drained") return { emoji: "😩", color: "#C1121F" };
  if (value === "Okay") return { emoji: "😐", color: "#F4A261" };
  if (value === "Good") return { emoji: "🙂", color: "#2D6A4F" };
  return { emoji: "⚡", color: "#1E5943" };
};

const energyMeta = (response: EnergyResponse) => {
  if (response === "Rough") return { emoji: "😮‍💨", color: "#C1121F" };
  if (response === "Okay") return { emoji: "😐", color: "#F4A261" };
  return { emoji: "💪", color: "#2D6A4F" };
};

const categoryLabel = (category: TaskCategory) => {
  if (category === "social") return "Social";
  if (category === "physical") return "Physical";
  if (category === "errands") return "Errands";
  return "Mental";
};

const categoryIcon = (category: TaskCategory) => {
  if (category === "social") return Users;
  if (category === "physical") return Dumbbell;
  if (category === "errands") return ClipboardList;
  return Brain;
};

const cognitiveRank: Record<CognitiveLoad, number> = { High: 3, Medium: 2, Low: 1 };

const pickMustDo = (tasks: FlexibleTask[]) => {
  const active = tasks.filter((task) => !task.deferred);
  if (!active.length) return null;
  const maxRank = Math.max(...active.map((task) => cognitiveRank[task.cognitiveLoad]));
  const candidates = active.filter((task) => cognitiveRank[task.cognitiveLoad] === maxRank);
  return candidates.reduce((nearest, task) => (DAYS.indexOf(task.deadline) < DAYS.indexOf(nearest.deadline) ? task : nearest), candidates[0]);
};

const pickMaintenance = (tasks: FlexibleTask[], excludeId?: number) => {
  const active = tasks.filter((task) => !task.deferred && task.id !== excludeId);
  if (!active.length) return null;
  const minRank = Math.min(...active.map((task) => cognitiveRank[task.cognitiveLoad]));
  return active.find((task) => cognitiveRank[task.cognitiveLoad] === minRank) ?? null;
};

const nextRecoveryBlock = (blocks: RecoveryBlock[]) => {
  const locked = blocks.filter((block) => block.locked);
  if (!locked.length) return null;
  const dayIndex = (block: RecoveryBlock) => { const index = DAYS.indexOf(block.day.slice(0, 3)); return index === -1 ? 7 : index; };
  return locked.reduce((soonest, block) => (dayIndex(block) < dayIndex(soonest) ? block : soonest), locked[0]);
};

const MOOD_STRAIN: Record<MoodValue, number> = { Energized: 0, Good: 1, Okay: 2, Drained: 3 };
const ENERGY_STRAIN: Record<EnergyResponse, number> = { Ready: 0, Okay: 1.5, Rough: 3 };
const CHECKIN_QUALITY_SCORE: Record<MoodValue | EnergyResponse, number> = { Drained: 0, Rough: 0, Okay: 1, Good: 2, Ready: 2, Energized: 3 };

// Least-squares linear regression over the check-in strain series (index vs. strain score),
// giving a real slope for "is the student trending toward burnout" rather than a guess.
const linearRegressionSlope = (values: number[]) => {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((sum, y) => sum + y, 0) / n;
  let numerator = 0;
  let denominator = 0;
  values.forEach((y, x) => {
    numerator += (x - xMean) * (y - yMean);
    denominator += (x - xMean) ** 2;
  });
  return denominator === 0 ? 0 : numerator / denominator;
};

const predictBurnoutRisk = ({ calculation, moodCheckIns, energyCheckIns }: { calculation: CalculationShape; moodCheckIns: MoodCheckIn[]; energyCheckIns: EnergyCheckIn[] }): RiskAssessment => {
  const series = [
    ...moodCheckIns.map((entry) => ({ time: new Date(entry.date).getTime(), strain: MOOD_STRAIN[entry.value] })),
    ...energyCheckIns.map((entry) => ({ time: new Date(entry.date).getTime(), strain: ENERGY_STRAIN[entry.response] })),
  ].sort((a, b) => a.time - b.time);

  const trendSlope = linearRegressionSlope(series.map((point) => point.strain));
  const latestStrain = series.length ? series[series.length - 1].strain / 3 : 0.4;
  const lowestMargin = Math.min(...calculation.dailyMargins);
  const marginPressure = Math.max(0, Math.min(1, (10 - lowestMargin) / 10));
  const runPressure = Math.min(1, calculation.longestRun / 5);
  const trendPressure = Math.max(0, Math.min(1, trendSlope / 2));

  const score = Math.round(100 * Math.min(1, 0.4 * marginPressure + 0.25 * runPressure + 0.25 * latestStrain + 0.1 * trendPressure));
  const label: RiskAssessment["label"] = score >= 75 ? "Critical" : score >= 50 ? "High" : score >= 25 ? "Moderate" : "Low";
  const trend: RiskAssessment["trend"] = trendSlope > 0.15 ? "worsening" : trendSlope < -0.15 ? "improving" : "stable";

  return { score, label, trend, trendSlope: Number(trendSlope.toFixed(2)) };
};

// Retrieval step of the RAG loop: pulls the student's own locally-stored data (schedule, check-ins,
// outcomes) into a structured context block so the model answers from real facts, not invented ones.
const buildUserContext = ({ calculation, tasks, moodCheckIns, energyCheckIns, taskOutcomes, sleepHours, decompHours, risk }: { calculation: CalculationShape; tasks: FlexibleTask[]; moodCheckIns: MoodCheckIn[]; energyCheckIns: EnergyCheckIn[]; taskOutcomes: TaskOutcomeRecord[]; sleepHours: number; decompHours: number; risk: RiskAssessment }) => {
  const activeTasks = tasks.filter((task) => !task.deferred);
  const taskLines = activeTasks.length ? activeTasks.map((task) => `- ${task.name} (${task.estimatedHours}h, ${task.cognitiveLoad} load, ${categoryLabel(task.category)}, due ${task.deadline})`).join("\n") : "- none scheduled";
  const dayLines = DAYS.map((day, index) => `${day} ${formatShortHours(calculation.dailyMargins[index])}`).join(", ");
  const recentMoods = moodCheckIns.slice(-7).map((entry) => `${entry.date}: ${entry.value}`).join("; ") || "none logged";
  const recentEnergy = energyCheckIns.slice(-7).map((entry) => `${entry.date}: ${entry.response}`).join("; ") || "none logged";
  const outcomeLines = taskOutcomes.slice(-5).map((entry) => `${entry.taskName}: ${entry.outcome}`).join("; ") || "none logged";

  return `USER'S CURRENT WEEK (retrieved from their local schedule and check-ins):
Recovery Margin: ${formatHours(calculation.margin)} (${calculation.status.label})
Recovery Floor: ${sleepHours}h sleep + ${decompHours}h decompression, protected nightly
Daily margin by day: ${dayLines}
Longest consecutive high-load run: ${calculation.longestRun} day(s)
Active tasks this week:
${taskLines}
Recent mood check-ins: ${recentMoods}
Recent energy check-ins: ${recentEnergy}
Recent task outcome feedback: ${outcomeLines}
Computed burnout risk (regression over check-in trend + schedule pressure): ${risk.score}/100, ${risk.label}, trend ${risk.trend}`;
};

const localFallbackReply = (risk: RiskAssessment, calculation: CalculationShape) => {
  const lowestDayIndex = calculation.dailyMargins.reduce((lowest, margin, index, margins) => (margin < margins[lowest] ? index : lowest), 0);
  const pressuredDay = DAYS[lowestDayIndex];
  if (risk.label === "Critical") return `Based on your schedule, ${pressuredDay} is already breached and your recent check-ins show sustained strain (risk ${risk.score}/100). Adding anything new this week isn't advisable — defer or triage something first.`;
  if (risk.label === "High") return `Your margin is tight and ${pressuredDay} is your pressure point (risk ${risk.score}/100, trend ${risk.trend}). A short task might fit, but anything over an hour will likely push ${pressuredDay} into deficit.`;
  if (risk.label === "Moderate") return `You have some room this week (risk ${risk.score}/100), though ${pressuredDay} is worth watching. Should be manageable if you keep it small.`;
  return `Your week has healthy margin and your recent check-ins look steady (risk ${risk.score}/100). This looks affordable.`;
};

function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [sleepHours, setSleepHours] = useState(7);
  const [decompHours, setDecompHours] = useState(1);
  const [fixedCommitments, setFixedCommitments] = useState<FixedCommitment[]>(initialFixedCommitments);
  const [tasks, setTasks] = useState<FlexibleTask[]>(initialTasks);
  const [recoveryBlocks, setRecoveryBlocks] = useState<RecoveryBlock[]>([]);
  const [overrideCount, setOverrideCount] = useState(0);
  const [triageMarginOverride, setTriageMarginOverride] = useState<number | null>(null);
  const [triageOutcomeDeficit, setTriageOutcomeDeficit] = useState<number | null>(null);
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const [showConsequencePreview, setShowConsequencePreview] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const [importReviewed, setImportReviewed] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickHours, setQuickHours] = useState(1);
  const [draftName, setDraftName] = useState("");
  const [draftHours, setDraftHours] = useState(1);
  const [draftDeadline, setDraftDeadline] = useState("Thu");
  const [draftEstimateTouched, setDraftEstimateTouched] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [confirmBreach, setConfirmBreach] = useState(false);
  const [selectedTriage, setSelectedTriage] = useState<number[]>([]);
  const [triageOutcome, setTriageOutcome] = useState<TriageOutcome>(null);
  const [showCommitmentForm, setShowCommitmentForm] = useState(false);
  const [commitmentName, setCommitmentName] = useState("");
  const [commitmentDays, setCommitmentDays] = useState<string[]>([]);
  const [commitmentStart, setCommitmentStart] = useState("09:00");
  const [commitmentEnd, setCommitmentEnd] = useState("11:00");
  const [plannerMessage, setPlannerMessage] = useState("");
  const [recoveryQuality, setRecoveryQuality] = useState<"Fully" | "Partially" | "Not really" | null>(null);
  const [recoveryQualityDismissed, setRecoveryQualityDismissed] = useState(false);
  const [taskOutcomes, setTaskOutcomes] = useState<TaskOutcomeRecord[]>([]);
  const [energyCheckIns, setEnergyCheckIns] = useState<EnergyCheckIn[]>([]);
  const [moodCheckIns, setMoodCheckIns] = useState<MoodCheckIn[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  const todayKey = new Date().toDateString();
  const showMorningCheckIn = !moodCheckIns.some((entry) => entry.date === todayKey);
  const todayEnergyCheckIn = energyCheckIns.find((entry) => entry.date === todayKey) ?? null;

  const calculation = useMemo(() => {
    const fixedTotal = fixedCommitments.reduce((sum, item) => sum + item.hours, 0);
    const recoveryBlockTotal = recoveryBlocks.filter((block) => block.locked).reduce((sum, block) => sum + durationBetween(block.startTime, block.endTime), 0);
    const tier2Total = sleepHours * 7 + decompHours * 7 + recoveryBlockTotal;
    const availableCapacity = 168 - fixedTotal - tier2Total;
    const flexTotal = tasks.filter((task) => !task.deferred).reduce((sum, task) => sum + task.estimatedHours, 0);
    const margin = availableCapacity - flexTotal;
    const dailyFixed = DAYS.map((day) => fixedCommitments.filter((commitment) => commitment.days.includes(day)).reduce((sum, commitment) => sum + commitment.hours / Math.max(commitment.days.length, 1), 0));
    const dailyRecoveryBlocks = DAYS.map((day) => recoveryBlocks.filter((block) => block.locked && block.day.slice(0, 3) === day).reduce((sum, block) => sum + durationBetween(block.startTime, block.endTime), 0));
    const dailyTask = DAYS.map((day) => tasks.filter((task) => !task.deferred && task.deadline === day).reduce((sum, task) => sum + task.estimatedHours, 0) + tasks.filter((task) => !task.deferred && !task.deadline).reduce((sum, task) => sum + task.estimatedHours / 7, 0));
    const dailyMargins = DAYS.map((_, index) => 24 - sleepHours - decompHours - dailyFixed[index] - dailyRecoveryBlocks[index] - dailyTask[index]);
    const highLoad = dailyMargins.map((dailyMargin, index) => dailyMargin < 5 || dailyTask[index] > 6);
    const longestRun = longestConsecutive(highLoad);
    const concentratedDays = dailyMargins.filter((dayMargin) => dayMargin < 5).length;
    const status = statusFor(margin);
    const distributionWarning = margin > 20 && concentratedDays >= 3;
    const activeTasks = tasks.filter((task) => !task.deferred);
    const categoryBreakdown = {
      mental: activeTasks.filter((task) => task.category === "mental").reduce((sum, task) => sum + task.estimatedHours, 0),
      physical: activeTasks.filter((task) => task.category === "physical").reduce((sum, task) => sum + task.estimatedHours, 0),
      social: activeTasks.filter((task) => task.category === "social").reduce((sum, task) => sum + task.estimatedHours, 0),
      errands: activeTasks.filter((task) => task.category === "errands").reduce((sum, task) => sum + task.estimatedHours, 0),
      time: fixedTotal,
    };
    return { fixedTotal, recoveryBlockTotal, tier2Total, availableCapacity, flexTotal, margin, dailyMargins, dailyFixed, dailyRecoveryBlocks, dailyTask, longestRun, distributionWarning, status, categoryBreakdown };
  }, [decompHours, fixedCommitments, recoveryBlocks, sleepHours, tasks]);

  const draftSuggestion = useMemo(() => suggestionFor(draftName), [draftName]);
  const quickSuggestion = useMemo(() => suggestionFor(quickName), [quickName]);
  const normalizedDraftHours = Number.isFinite(draftHours) ? Math.max(0, draftHours) : 0;
  const projectedMargin = calculation.margin - normalizedDraftHours;
  const projectedStatus = statusFor(projectedMargin);
  const deadlineIndex = Math.max(0, DAYS.indexOf(draftDeadline));
  const draftDailyHours = normalizedDraftHours / (deadlineIndex + 1);
  const projectedDailyTask = calculation.dailyTask.map((taskHours, index) => taskHours + (index <= deadlineIndex ? draftDailyHours : 0));
  const projectedDailyMargins = calculation.dailyMargins.map((margin, index) => margin - (index <= deadlineIndex ? draftDailyHours : 0));
  const projectedHighLoad = projectedDailyMargins.map((dailyMargin, index) => dailyMargin < 5 || projectedDailyTask[index] > 6);
  const predictedHighLoadDays = longestConsecutive(projectedHighLoad);
  const lowestDayIndex = projectedDailyMargins.reduce((lowest, margin, index, margins) => margin < margins[lowest] ? index : lowest, 0);
  const consequenceDay = DAYS[lowestDayIndex];
  const dailyBreachAmount = Math.max(0, -projectedDailyMargins[lowestDayIndex]);
  const sleepImpact = dailyBreachAmount > 0 ? Math.min(sleepHours, Math.round(dailyBreachAmount * 2) / 2) : 0;
  const triageItems = tasks.filter((task) => !task.deferred); // Tier 3 only; RecoveryBlock records never enter this list.
  const selectedRecovery = triageItems.filter((task) => selectedTriage.includes(task.id)).reduce((sum, task) => sum + task.estimatedHours, 0);
  const triageBaseMargin = triageMarginOverride ?? calculation.margin;
  const remainingDeficit = triageOutcomeDeficit ?? Math.max(0, -triageBaseMargin - selectedRecovery);
  const deferCandidate = triageItems.length ? triageItems.reduce((best, task) => (task.estimatedHours > best.estimatedHours ? task : best), triageItems[0]) : null;
  const showEnergyCheckIn = Math.min(...calculation.dailyMargins) < 5 && !todayEnergyCheckIn;

  const loadPattern = useMemo(() => {
    const active = tasks.filter((task) => !task.deferred);
    if (!active.length) return { label: "Light mental", recommendation: "Sleep extension first.", category: "mental" as TaskCategory };
    const totals = active.reduce((acc, task) => ({ ...acc, [task.category]: (acc[task.category] ?? 0) + task.estimatedHours }), { mental: 0, social: 0, physical: 0, errands: 0 } as Record<TaskCategory, number>);
    const total = active.reduce((sum, task) => sum + task.estimatedHours, 0);
    if (totals.mental / total > 0.5) return { label: "Heavy mental", recommendation: "Physical activity recommended. No screens.", category: "mental" as TaskCategory };
    if (totals.social / total > 0.3) return { label: "Heavy social", recommendation: "Solo time. Low stimulus.", category: "social" as TaskCategory };
    if (totals.physical / total > 0.5) return { label: "Heavy physical", recommendation: "Rest and light movement.", category: "physical" as TaskCategory };
    return { label: "Mixed", recommendation: "Sleep extension first.", category: "mental" as TaskCategory };
  }, [tasks]);

  useEffect(() => {
    if (!draftEstimateTouched) setDraftHours(draftSuggestion.midpoint);
  }, [draftEstimateTouched, draftSuggestion.midpoint]);

  const startMirror = (name = "", hours = 1) => {
    setDraftName(name);
    setDraftHours(hours);
    setDraftEstimateTouched(Boolean(name));
    setConfirmBreach(false);
    setShowActions(false);
    setScreen("mirror");
  };

  const addTask = (isOverride = false) => {
    const name = draftName.trim() || "Untitled commitment";
    const suggestion = suggestionFor(name);
    const task: FlexibleTask = {
      id: Date.now(),
      name,
      estimatedHours: Math.max(0.5, Number(draftHours) || suggestion.midpoint),
      cognitiveLoad: suggestion.cognitiveLoad,
      deadline: draftDeadline,
      deferred: false,
      category: suggestion.category,
    };
    const nextOverrideCount = isOverride ? overrideCount + 1 : overrideCount;
    setTasks((current) => [...current, task]);
    setOverrideCount(nextOverrideCount);
    setConfirmBreach(false);
    setDraftEstimateTouched(false);
    setDraftName("");
    setDraftHours(1);
    setTriageOutcome(null);
    setTriageOutcomeDeficit(null);
    setTriageMarginOverride(null);
    setSelectedTriage([]);
    setScreen(isOverride && nextOverrideCount >= 3 ? "triage" : "dashboard");
  };

  const addTaskWithDefer = (deferId: number) => {
    setTasks((current) => current.map((task) => (task.id === deferId ? { ...task, deferred: true } : task)));
    addTask(false);
  };

  const recordTaskOutcome = (task: FlexibleTask, outcome: TaskOutcomeValue) => {
    setTaskOutcomes((current) => [...current, { taskId: task.id, taskName: task.name, outcome, timestamp: Date.now() }]);
    setTasks((current) => current.filter((item) => item.id !== task.id));
  };

  const deleteTaskSilently = (id: number) => {
    setTasks((current) => current.filter((item) => item.id !== id));
  };

  const respondEnergyCheckIn = (response: EnergyResponse) => {
    setEnergyCheckIns((current) => [...current.filter((entry) => entry.date !== todayKey), { date: todayKey, response }]);
  };

  const respondMorningCheckIn = (value: MoodValue) => {
    setMoodCheckIns((current) => [...current.filter((entry) => entry.date !== todayKey), { date: todayKey, value }]);
  };

  const addItFromPreview = () => {
    setShowConsequencePreview(false);
    addTask(false);
  };

  const addAndDeferFromPreview = () => {
    setShowConsequencePreview(false);
    if (deferCandidate) addTaskWithDefer(deferCandidate.id);
    else addTask(false);
  };

  const addAnywayOverrideFromPreview = () => {
    setShowConsequencePreview(false);
    addTask(true);
  };

  // A breach is either the weekly capacity running out or any single day the projection pushes negative.
  const breachesFloor = projectedMargin < 0 || dailyBreachAmount > 0;

  const handleAddAnyway = () => {
    // confirmBreach means the student already came back through "See impact"; don't re-open the preview.
    if (!showConsequencePreview && !confirmBreach) {
      setShowConsequencePreview(true);
      return;
    }
    addTask(breachesFloor);
  };

  const openConsequenceImpact = () => {
    setShowConsequencePreview(false);
    setConfirmBreach(true);
    setShowActions(true);
  };

  const rescheduleFromPreview = () => {
    setShowConsequencePreview(false);
    openTriage(projectedMargin);
  };

  const openImport = () => {
    setImportFileName("");
    setImportReviewed(false);
    setScreen("import");
  };

  const approveImportedSchedule = () => {
    setFixedCommitments((current) => [...current, ...IMPORTED_TIMETABLE]);
    setImportReviewed(false);
    setImportFileName("");
    setScreen("onboarding");
  };

  const saveCommitment = () => {
    if (!commitmentName.trim() || !commitmentDays.length) return;
    setFixedCommitments((current) => [...current, {
      id: Date.now(),
      name: commitmentName.trim(),
      days: commitmentDays,
      startTime: commitmentStart,
      endTime: commitmentEnd,
      hours: Number((durationBetween(commitmentStart, commitmentEnd) * commitmentDays.length).toFixed(1)),
    }]);
    setCommitmentName("");
    setCommitmentDays([]);
    setShowCommitmentForm(false);
  };

  const protectBlock = (id: number) => {
    setRecoveryBlocks((current) => (current.length ? current : DEFAULT_RECOVERY_BLOCKS).map((block) => block.id === id ? { ...block, locked: true } : block));
    setPlannerMessage("Recovery block locked into your week.");
  };

  const lockAllSuggested = () => {
    setRecoveryBlocks((current) => (current.length ? current : DEFAULT_RECOVERY_BLOCKS).map((block) => ({ ...block, locked: true })));
    setPlannerMessage("Suggested recovery blocks are now part of your protected schedule.");
  };

  const applyTriage = () => {
    if (!selectedTriage.length) return;
    const released = selectedRecovery;
    const deficitBeforeSelection = Math.max(0, -triageBaseMargin);
    const deficitAfterSelection = Math.max(0, deficitBeforeSelection - released);
    setTasks((current) => current.map((task) => selectedTriage.includes(task.id) ? { ...task, deferred: true } : task));
    setTriageOutcomeDeficit(deficitAfterSelection);
    if (deficitAfterSelection === 0) setTriageOutcome("full");
    else if (released > 0) setTriageOutcome("partial");
    else setTriageOutcome("failure");
    setSelectedTriage([]);
  };

  const openQuickCheck = () => {
    setQuickName("");
    setQuickHours(1);
    setShowQuickCheck(true);
  };

  const navTo = (next: Screen) => {
    setTriageOutcome(null);
    setTriageOutcomeDeficit(null);
    setPlannerMessage("");
    if (next !== "triage") setTriageMarginOverride(null);
    setScreen(next);
  };

  const openTriage = (margin?: number) => {
    setTriageMarginOverride(typeof margin === "number" ? margin : null);
    setTriageOutcomeDeficit(null);
    navTo("triage");
  };

  const isDarkScreen = screen === "mirror" || screen === "planner" || screen === "reflection" || screen === "import";

  return (
    <div className={`app-shell ${isDarkScreen ? "app-shell-dark" : "app-shell-light"}${screen === "dashboard" ? " app-shell-dashboard" : ""}`}>
      <div className="app-frame">
        <Header screen={screen} isDark={isDarkScreen} onBack={() => navTo("dashboard")} onMenu={() => setDrawerOpen(true)} />
        <AnimatePresence mode="wait" initial={false}>
        <motion.div key={screen} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: "easeOut" }}>
        {screen === "onboarding" ? (
          <Onboarding
            sleepHours={sleepHours}
            decompHours={decompHours}
            fixedCommitments={fixedCommitments}
            availableCapacity={calculation.availableCapacity}
            tier2Total={calculation.tier2Total}
            fixedTotal={calculation.fixedTotal}
            showCommitmentForm={showCommitmentForm}
            setSleepHours={setSleepHours}
            setDecompHours={setDecompHours}
            setFixedCommitments={setFixedCommitments}
            setShowCommitmentForm={setShowCommitmentForm}
            commitmentName={commitmentName}
            commitmentDays={commitmentDays}
            commitmentStart={commitmentStart}
            commitmentEnd={commitmentEnd}
            setCommitmentName={setCommitmentName}
            setCommitmentDays={setCommitmentDays}
            setCommitmentStart={setCommitmentStart}
            setCommitmentEnd={setCommitmentEnd}
            saveCommitment={saveCommitment}
                  onStart={() => navTo("dashboard")}
                  onImport={openImport}
                />
        ) : (
          <>
            <main className="page-wrap">
              {screen === "dashboard" && (
                <Dashboard
                  calculation={calculation}
                  tasks={tasks}
                  recoveryBlocks={recoveryBlocks.length ? recoveryBlocks : DEFAULT_RECOVERY_BLOCKS}
                  showEnergyCheckIn={showEnergyCheckIn}
                  showMorningCheckIn={showMorningCheckIn}
                  onMorningCheckInRespond={respondMorningCheckIn}
                  onAddTask={() => startMirror()}
                  onQuickCheck={openQuickCheck}
                  recoveryQualityBlock={recoveryBlocks.find((block) => block.locked) ?? null}
                  recoveryQuality={recoveryQuality}
                  recoveryQualityDismissed={recoveryQualityDismissed}
                  onRecoveryQuality={(quality) => { setRecoveryQuality(quality); setRecoveryQualityDismissed(true); }}
                  onPlanner={() => navTo("planner")}
                  onReflection={() => navTo("reflection")}
                  onTriage={() => openTriage()}
                  onRecordOutcome={recordTaskOutcome}
                  onDeleteTaskSilently={deleteTaskSilently}
                  onEnergyRespond={respondEnergyCheckIn}
                />
              )}
              {screen === "mirror" && (
                <CommitmentMirror
                  draftName={draftName}
                  draftHours={draftHours}
                  draftDeadline={draftDeadline}
                  projectedMargin={projectedMargin}
                  projectedStatus={projectedStatus}
                  consequenceDay={consequenceDay}
                  dailyBreachAmount={dailyBreachAmount}
                  sleepImpact={sleepImpact}
                  predictedHighLoadDays={predictedHighLoadDays}
                  showActions={showActions}
                  confirmBreach={confirmBreach}
                  setDraftName={(value) => { setDraftName(value); setDraftEstimateTouched(false); }}
                  setDraftHours={(value) => { setDraftHours(value); setDraftEstimateTouched(true); }}
                  setDraftDeadline={setDraftDeadline}
                  setShowActions={setShowActions}
                  onAddAnyway={handleAddAnyway}
                  onTriage={() => openTriage(projectedMargin)}
                  onSplit={() => { setDraftHours(Math.max(0.5, Math.round(draftHours / 2 * 10) / 10)); setShowActions(false); }}
                  onFindSlot={() => { setDraftDeadline(DAYS[(lowestDayIndex + 2) % 7]); setShowActions(false); }}
                  onDefer={() => openTriage(projectedMargin)}
                />
              )}
              {screen === "triage" && (
                <Triage
                  calculation={calculation}
                  displayMargin={triageBaseMargin}
                  items={triageItems}
                  selectedTriage={selectedTriage}
                  selectedRecovery={selectedRecovery}
                  remainingDeficit={remainingDeficit}
                  overrideCount={overrideCount}
                  outcome={triageOutcome}
                  onToggle={(id) => setSelectedTriage((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
                  onApply={applyTriage}
                  onContinue={() => { setTriageOutcome(null); setTriageOutcomeDeficit(null); }}
                  onProceed={() => navTo("dashboard")}
                  onPlanner={() => navTo("planner")}
                  onDashboard={() => navTo("dashboard")}
                />
              )}
              {screen === "planner" && (
                <RecoveryPlanner
                  loadPattern={loadPattern}
                  recoveryBlocks={recoveryBlocks}
                  plannerMessage={plannerMessage}
                  onProtect={protectBlock}
                  onLockAll={lockAllSuggested}
                  onSkip={() => navTo("dashboard")}
                />
              )}
              {screen === "reflection" && (
                <Reflection
                  calculation={calculation}
                  overrideCount={overrideCount}
                  taskOutcomes={taskOutcomes}
                  moodCheckIns={moodCheckIns}
                  energyCheckIns={energyCheckIns}
                  onNextWeek={() => navTo("onboarding")}
                  onAdjust={() => navTo("onboarding")}
                />
              )}
              {screen === "import" && (
                <ImportCommitments
                  fileName={importFileName}
                  reviewed={importReviewed}
                  onFile={(name) => { setImportFileName(name); setImportReviewed(false); }}
                  onContinue={() => setImportReviewed(true)}
                  onApprove={approveImportedSchedule}
                  onManual={() => navTo("onboarding")}
                />
              )}
            </main>
          </>
        )}
        </motion.div>
        </AnimatePresence>
        {showQuickCheck && (
          <QuickCheck
            name={quickName}
            hours={quickHours}
            suggestion={quickSuggestion}
            calculation={calculation}
            sleepHours={sleepHours}
            decompHours={decompHours}
            energyCheckIn={todayEnergyCheckIn}
            tasks={tasks}
            moodCheckIns={moodCheckIns}
            energyCheckIns={energyCheckIns}
            taskOutcomes={taskOutcomes}
            setName={setQuickName}
            setHours={setQuickHours}
            onClose={() => setShowQuickCheck(false)}
            onAdd={() => { setShowQuickCheck(false); startMirror(quickName, quickHours); }}
          />
        )}
        {showConsequencePreview && (
          <ConsequencePreview
            projectedMargin={projectedMargin}
            consequenceDay={consequenceDay}
            deferCandidate={deferCandidate}
            onAddIt={addItFromPreview}
            onAddAndDefer={addAndDeferFromPreview}
            onSeeOptions={openConsequenceImpact}
            onDeferToNextWeek={rescheduleFromPreview}
            onAddAnywayOverride={addAnywayOverrideFromPreview}
          />
        )}
        {screen !== "onboarding" && screen !== "import" && screen !== "triage" && <BottomTabBar active={screen} onNavigate={navTo} />}
      </div>
      <NavDrawer open={drawerOpen} activeScreen={screen} onNavigate={(next) => { navTo(next); setDrawerOpen(false); }} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

const NAV_ITEMS: { id: Screen; label: string; icon: ReactNode; sub?: boolean }[] = [
  { id: "dashboard", label: "Today", icon: <Home size={18} /> },
  { id: "onboarding", label: "Recovery Floor Setup", icon: <ShieldCheck size={15} />, sub: true },
  { id: "mirror", label: "Add Task", icon: <Plus size={18} /> },
  { id: "planner", label: "Recovery Planner", icon: <Moon size={18} /> },
  { id: "reflection", label: "Weekly Reflection", icon: <BarChart3 size={18} /> },
  { id: "import", label: "Import Schedule", icon: <Upload size={18} /> },
];

const BOTTOM_TAB_ICONS: Record<string, ReactNode> = {
  Home: <Home size={20} />,
  Plus: <Plus size={20} />,
  Leaf: <Leaf size={20} />,
  BarChart2: <BarChart3 size={20} />,
};

function BottomTabBar({ active, onNavigate }: { active: Screen; onNavigate: (s: Screen) => void }) {
  const tabs = [
    { screen: "dashboard", label: "Today", icon: "Home" },
    { screen: "mirror", label: "Add Task", icon: "Plus" },
    { screen: "planner", label: "Planner", icon: "Leaf" },
    { screen: "reflection", label: "Reflect", icon: "BarChart2" },
  ] as const;
  return (
    <nav className="bottom-tab-bar">
      {tabs.map((t) => (
        <button key={t.screen} className={`bottom-tab ${active === t.screen ? "bottom-tab-active" : ""}`} onClick={() => onNavigate(t.screen)}>
          {BOTTOM_TAB_ICONS[t.icon]}
          <span className="bottom-tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

function NavDrawer({ open, activeScreen, onNavigate, onClose }: { open: boolean; activeScreen: Screen; onNavigate: (screen: Screen) => void; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="nav-drawer-backdrop" onClick={onClose}>
      <aside className="nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation" onClick={(event) => event.stopPropagation()}>
        <div className="nav-drawer-head">
          <div className="brand-lockup"><BrandMark className="brand-mark" /><span className="brand-wordmark">MARGIN</span></div>
          <button className="icon-button" aria-label="Close menu" onClick={onClose}><X size={18} /></button>
        </div>
        <nav className="nav-drawer-list">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} className={`nav-drawer-item ${item.sub ? "nav-drawer-item-sub" : ""} ${activeScreen === item.id ? "nav-drawer-item-active" : ""}`} onClick={() => onNavigate(item.id)}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </div>
  );
}

function Header({ screen, isDark, onBack, onMenu }: { screen: Screen; isDark: boolean; onBack: () => void; onMenu: () => void }) {
  return (
    <header className={`topbar ${isDark ? "topbar-dark" : "topbar-light"}`}>
      <div className="topbar-inner">
        <button className="hamburger-btn" aria-label="Menu" onClick={onMenu}><Menu size={20} /></button>
        <div className="brand-lockup">
          <BrandMark className="brand-mark" />
          <span className="brand-wordmark">MARGIN</span>
        </div>
        <span className="topbar-spacer" aria-hidden="true" />
      </div>
      {screen !== "dashboard" && <button className="topbar-back" aria-label="Back to dashboard" onClick={onBack}><ArrowLeft size={14} /> Back</button>}
    </header>
  );
}

function Onboarding(props: {
  sleepHours: number;
  decompHours: number;
  fixedCommitments: FixedCommitment[];
  availableCapacity: number;
  tier2Total: number;
  fixedTotal: number;
  showCommitmentForm: boolean;
  setSleepHours: (value: number) => void;
  setDecompHours: (value: number) => void;
  setFixedCommitments: (value: FixedCommitment[]) => void;
  setShowCommitmentForm: (value: boolean) => void;
  commitmentName: string;
  commitmentDays: string[];
  commitmentStart: string;
  commitmentEnd: string;
  setCommitmentName: (value: string) => void;
  setCommitmentDays: (value: string[]) => void;
  setCommitmentStart: (value: string) => void;
  setCommitmentEnd: (value: string) => void;
  saveCommitment: () => void;
  onStart: () => void;
  onImport: () => void;
}) {
  const { sleepHours, decompHours, fixedCommitments, availableCapacity, tier2Total, fixedTotal } = props;
  const capacityStatus = statusFor(availableCapacity);
  const ONBOARD_RING_CIRC = 2 * Math.PI * 54;
  return (
        <main className="page-wrap onboarding-wrap">
          <div className="onboarding-tagline">
            <p>"Before your tasks, Set your limits"</p>
            <span className="onboarding-subtagline">"Fuel first. Work second"</span>
          </div>

          <section className="card capacity-panel">
            <div className="capacity-panel-top"><span className="card-label"><SlidersHorizontal size={12} /> Live calculation</span><button className="primary-button capacity-start-button" onClick={props.onStart}>Start Planning <ArrowRight size={15} /></button></div>
            <div className="capacity-hero-row">
              <div className="capacity-ring">
                <svg className="capacity-ring-svg" viewBox="0 0 140 140">
                  <circle className="capacity-ring-track" cx="70" cy="70" r="54" />
                  <circle className="capacity-ring-fill" cx="70" cy="70" r="54" style={{ stroke: capacityStatus.color, strokeDasharray: ONBOARD_RING_CIRC, strokeDashoffset: ONBOARD_RING_CIRC * (1 - Math.max(0, Math.min(1, availableCapacity / 168))) }} />
                </svg>
                <div className="capacity-ring-center"><strong style={{ color: capacityStatus.color }}>{capacityPercent(availableCapacity)}%</strong><span>available</span></div>
              </div>
              <div className="capacity-hero-stat">
                <span className="capacity-number">{formatHours(availableCapacity)}</span>
                <span className="capacity-state" style={{ color: capacityStatus.color }}><span className="status-dot" style={{ background: capacityStatus.color }} />{capacityStatus.label}</span>
              </div>
            </div>
            <div className="math-list"><div><span>Total hours</span><span>168 hrs</span></div><div><span>Recovery Floor</span><span>{formatHours(tier2Total)}</span></div><div><span>Fixed commitments</span><span>{formatHours(fixedTotal)}</span></div><div className="math-result"><span>Available</span><span>{formatHours(availableCapacity)}</span></div></div>
          </section>

          <section className="card">
            <div className="section-kicker"><Moon size={14} /><span>Recovery Floor</span></div>
            <p className="section-caption">Your non-negotiable baseline for rest</p>
            <RangeCard icon={<Moon size={18} />} label="Minimum sleep per night" value={`${sleepHours} hrs`} note="Protected every night. Non-negotiable." min={4} max={12} step={0.5} inputValue={sleepHours} onChange={props.setSleepHours} />
            <RangeCard icon={<Leaf size={18} />} label="Minimum daily decompression" value={`${decompHours} hr${decompHours === 1 ? "" : "s"}`} note="Screen-free wind-down, walks, anything that isn't work." min={0.5} max={4} step={0.5} inputValue={decompHours} onChange={props.setDecompHours} />
          </section>

          <section className="card">
            <div className="section-kicker"><CalendarDays size={14} /><span>Fix Commitments</span></div>
            <p className="section-caption">Your non-negotiable schedule</p>
            <div className="commitment-list">
              {fixedCommitments.map((commitment) => (
                <div key={commitment.id} className="commitment-row">
                  <div><strong>{commitment.name}</strong><span>{commitment.days.join(" · ")} · {commitment.startTime}–{commitment.endTime}</span></div>
                  <div className="flex items-center gap-3"><span className="hours-chip">{formatShortHours(commitment.hours)}</span><button className="icon-button" aria-label={`Delete ${commitment.name}`} onClick={() => props.setFixedCommitments(fixedCommitments.filter((item) => item.id !== commitment.id))}><Trash2 size={16} /></button></div>
                </div>
              ))}
            </div>
            {props.showCommitmentForm ? (
              <div className="inline-form">
                <label className="field-label">Commitment name<input className="text-input" placeholder="e.g. Lab shift" value={props.commitmentName} onChange={(event) => props.setCommitmentName(event.target.value)} /></label>
                <div><span className="field-label">Days</span><div className="day-picker">{DAYS.map((day) => <button key={day} className={`day-toggle ${props.commitmentDays.includes(day) ? "day-toggle-active" : ""}`} onClick={() => props.setCommitmentDays(props.commitmentDays.includes(day) ? props.commitmentDays.filter((item) => item !== day) : [...props.commitmentDays, day])}>{day}</button>)}</div></div>
                <div className="grid grid-cols-2 gap-3"><label className="field-label">Start time<input type="time" className="text-input" value={props.commitmentStart} onChange={(event) => props.setCommitmentStart(event.target.value)} /></label><label className="field-label">End time<input type="time" className="text-input" value={props.commitmentEnd} onChange={(event) => props.setCommitmentEnd(event.target.value)} /></label></div>
                <div className="form-actions"><button className="secondary-button" onClick={() => props.setShowCommitmentForm(false)}>Cancel</button><button className="primary-button" onClick={props.saveCommitment}>Save commitment</button></div>
              </div>
            ) : <button className="add-commitment-row" onClick={() => props.setShowCommitmentForm(true)}><Plus size={16} /> Add Commitment</button>}
          </section>

          <button className="primary-button" onClick={props.onImport}><CalendarDays size={17} /> Import Schedule</button>
        </main>
  );
}

function RangeCard({ icon, label, value, note, min, max, step, inputValue, onChange }: { icon: ReactNode; label: string; value: string; note: string; min: number; max: number; step: number; inputValue: number; onChange: (value: number) => void }) {
  return <div className="range-card"><div className="range-card-head"><div className="range-icon">{icon}</div><div><span className="range-label">{label}</span><p>{note}</p></div><strong>{value}</strong></div><input aria-label={label} type="range" min={min} max={max} step={step} value={inputValue} onChange={(event) => onChange(Number(event.target.value))} /></div>;
}

function Dashboard({ calculation, tasks, recoveryBlocks, showEnergyCheckIn, showMorningCheckIn, onMorningCheckInRespond, onAddTask, onQuickCheck, recoveryQualityBlock, recoveryQualityDismissed, onRecoveryQuality, onPlanner, onReflection, onTriage, onRecordOutcome, onDeleteTaskSilently, onEnergyRespond }: { calculation: ReturnType<typeof useCalculationShape>; tasks: FlexibleTask[]; recoveryBlocks: RecoveryBlock[]; showEnergyCheckIn: boolean; showMorningCheckIn: boolean; onMorningCheckInRespond: (value: MoodValue) => void; onAddTask: () => void; onQuickCheck: () => void; recoveryQualityBlock: RecoveryBlock | null; recoveryQuality: "Fully" | "Partially" | "Not really" | null; recoveryQualityDismissed: boolean; onRecoveryQuality: (quality: "Fully" | "Partially" | "Not really") => void; onPlanner: () => void; onReflection: () => void; onTriage: () => void; onRecordOutcome: (task: FlexibleTask, outcome: TaskOutcomeValue) => void; onDeleteTaskSilently: (id: number) => void; onEnergyRespond: (response: EnergyResponse) => void }) {
  const [showFullWeek, setShowFullWeek] = useState(false);
  const [pendingOutcomeId, setPendingOutcomeId] = useState<number | null>(null);
  const pendingOutcomeIdRef = useRef<number | null>(null);
  useEffect(() => { pendingOutcomeIdRef.current = pendingOutcomeId; }, [pendingOutcomeId]);
  const [showFabHint, setShowFabHint] = useState(() => typeof window !== "undefined" && !window.localStorage.getItem("marginFabHintSeen"));
  useEffect(() => {
    if (!showFabHint) return;
    const timer = setTimeout(() => { setShowFabHint(false); window.localStorage.setItem("marginFabHintSeen", "1"); }, 3200);
    return () => clearTimeout(timer);
  }, [showFabHint]);
  const dismissFabHint = () => { setShowFabHint(false); window.localStorage.setItem("marginFabHintSeen", "1"); };
  const requestDelete = (id: number) => {
    setPendingOutcomeId(id);
    setTimeout(() => {
      if (pendingOutcomeIdRef.current === id) {
        onDeleteTaskSilently(id);
        setPendingOutcomeId(null);
      }
    }, 5000);
  };
  const status = calculation.status;
  const scale = Math.max(calculation.availableCapacity, calculation.flexTotal + Math.max(calculation.margin, 0), 1);
  const lowestDayIndex = calculation.dailyMargins.reduce((lowest, margin, index, margins) => (margin < margins[lowest] ? index : lowest), 0);
  const lowestDay = DAYS[lowestDayIndex];
  const anyRiskDay = calculation.dailyMargins.some((margin) => margin < 2);
  const headline = status.label === "Critical" || status.label === "Breached" ? "Two things need to move." : calculation.distributionWarning || anyRiskDay ? `${lowestDay} needs attention.` : "You're protected this week.";
  const showRiskLine = headline !== "You're protected this week.";
  const activeTasks = tasks.filter((task) => !task.deferred);
  const mustDo = pickMustDo(tasks);
  const maintenance = pickMaintenance(tasks, mustDo?.id);
  const nextBlock = nextRecoveryBlock(recoveryBlocks);
  const outcomeEmojis: { value: TaskOutcomeValue; icon: string }[] = [{ value: "Easy", icon: "🔥" }, { value: "Fine", icon: "🙂" }, { value: "Hard", icon: "😵" }, { value: "Disaster", icon: "💀" }];
  const renderTaskRow = (task: FlexibleTask, tag?: string) => {
    const Icon = categoryIcon(task.category);
    if (pendingOutcomeId === task.id) return <div className="task-row" key={task.id}><div className="outcome-feedback-row"><span>{task.name} — how did it go?</span><div className="outcome-emoji-group">{outcomeEmojis.map((item) => <button key={item.value} className="outcome-emoji-button" aria-label={item.value} onClick={() => { onRecordOutcome(task, item.value); setPendingOutcomeId(null); }}>{item.icon}</button>)}</div></div></div>;
    return <div className="task-row" key={task.id}><div className="task-leading">{tag && <span className={`lock-in-tag lock-in-tag-${tag.toLowerCase().replace(/[^a-z]/g, "")}`}>{tag}</span>}<div className={`task-icon task-icon-${task.category}`}><Icon size={15} /></div><div><strong>{task.name}</strong><span>{formatHours(task.estimatedHours)} · {categoryLabel(task.category)} load · due {task.deadline}</span></div></div><button className="icon-button" aria-label={`Delete ${task.name}`} onClick={() => requestDelete(task.id)}><Trash2 size={16} /></button></div>;
  };
  const moodPillTone: Record<MoodValue, string> = { Drained: "pill-negative", Okay: "pill-neutral", Good: "pill-neutral", Energized: "pill-positive" };
  const energyPillTone: Record<EnergyResponse, string> = { Rough: "pill-negative", Okay: "pill-neutral", Ready: "pill-positive" };
  const totalCategoryHours = Object.values(calculation.categoryBreakdown).reduce((sum, value) => sum + value, 0);
  const maxDailyMargin = Math.max(...calculation.dailyMargins, 1);
  return <div className="dashboard-page">
    {showMorningCheckIn && <section className="card checkin-card"><span className="card-label">How do you feel today?</span><div className="pill-row">{MOOD_OPTIONS.map((option) => <button key={option.value} className={`pill pill-button ${moodPillTone[option.value]}`} onClick={() => onMorningCheckInRespond(option.value)}>{option.value}</button>)}</div></section>}
    {recoveryQualityBlock && !recoveryQualityDismissed && <RecoveryQualityCard block={recoveryQualityBlock} onSelect={onRecoveryQuality} />}
    {showEnergyCheckIn && <section className="card checkin-card"><span className="card-label">Heading into today...</span><div className="pill-row"><button className="pill pill-button pill-negative" onClick={() => onEnergyRespond("Rough")}>Rough</button><button className="pill pill-button pill-neutral" onClick={() => onEnergyRespond("Okay")}>Okay</button><button className="pill pill-button pill-positive" onClick={() => onEnergyRespond("Ready")}>Ready</button></div></section>}
    <div className="dashboard-intro"><p className="eyebrow">Your week</p><h1 className="page-heading">Your Week</h1><p className="dashboard-subtitle">With recovery view</p><button className="text-action dashboard-reflection-link" onClick={onReflection}><BarChart3 size={14} /> Weekly Reflection</button></div>
    <section className="card hero-margin-card">
      <div className="hero-card-head"><span className="card-label">Recovery Margin</span><div className="status-pill" style={{ color: status.color, borderColor: `${status.color}44`, background: `${status.color}10` }}><span className="status-dot" style={{ background: status.color }} />{status.label}</div></div>
      <div className="progress-ring-wrap">
        <svg className="progress-ring-svg" viewBox="0 0 200 200">
          <circle className="progress-ring-track" cx="100" cy="100" r="86" />
          <circle className="progress-ring-fill" cx="100" cy="100" r="86" style={{ stroke: status.color, strokeDasharray: RING_CIRCUMFERENCE, strokeDashoffset: RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, calculation.margin / scale))) }} />
        </svg>
        <div className="progress-ring-center">
          <div className="margin-number" style={{ color: status.color }}>{capacityPercent(calculation.margin)}%</div>
          <p className="margin-hours-secondary">{formatHours(calculation.margin)} available</p>
          <span className="trend-copy"><span className="trend-arrow">{calculation.flexTotal > 0 ? "↓" : "→"}</span> {calculation.flexTotal > 0 ? "Shrinking" : "Holding"}</span>
        </div>
      </div>
      <p className="hero-substat">{headline}{showRiskLine ? ` Your week has room. ${lowestDay} doesn't.` : ""}</p>
      <div className="margin-footer"><span>{status.copy}</span><span className="trend-copy"><small>{calculation.flexTotal > 0 ? `was ${formatHours(calculation.margin + calculation.flexTotal)} before flexible commitments` : "no flexible commitments are using the margin"}</small></span></div>
      {calculation.distributionWarning && <div className="distribution-warning"><TriangleAlert size={16} /> Recovery concentrated later in the week</div>}
      {calculation.margin <= 0 && <button className="triage-callout" onClick={onTriage}><TriangleAlert size={17} /> Recovery deficit detected <ArrowRight size={16} /></button>}
    </section>
    <section className="card week-glance-card">
      <span className="card-label">Week at Glance</span>
      <div className="week-glance-list">{DAYS.map((day, index) => { const dayStatus = dailyStatusFor(calculation.dailyMargins[index]); const width = Math.max(8, Math.min(100, (calculation.dailyMargins[index] / maxDailyMargin) * 100)); return <div key={day} className="week-glance-row"><span className="week-glance-day">{day}</span><span className="week-glance-track"><span className="week-glance-fill" style={{ width: `${width}%`, background: dayStatus.color }} title={`${day}: ${dayStatus.label} · ${formatShortHours(calculation.dailyMargins[index])}`} /></span></div>; })}</div>
      <p className="side-note">Bars include your Recovery Floor, fixed load, and deadline-weighted tasks.</p>
    </section>
    <section className="card category-breakdown-card">
      <span className="card-label">Available Capacity by Category</span>
      <div className="category-breakdown-bar">
        {CATEGORY_BREAKDOWN_ITEMS.map((item) => {
          const hours = calculation.categoryBreakdown[item.key];
          const width = totalCategoryHours > 0 ? (hours / totalCategoryHours) * 100 : 0;
          return width > 0 ? <div key={item.key} className="category-breakdown-segment" style={{ width: `${width}%`, background: item.color }} title={`${item.label}: ${formatHours(hours)}`} /> : null;
        })}
      </div>
      <div className="category-breakdown-legend">
        {CATEGORY_BREAKDOWN_ITEMS.map((item) => <div className="category-breakdown-legend-item" key={item.key}><span className="category-breakdown-dot" style={{ background: item.color }} />{item.label}<span className="category-breakdown-hours">{formatShortHours(calculation.categoryBreakdown[item.key])}</span></div>)}
      </div>
    </section>
    {!showFullWeek ? (
      <section className="card tasks-panel lock-in-panel">
        <div className="tasks-head"><div><span className="card-label">Today's Lock In</span><p className="card-subtitle">Things that matter most</p></div></div>
        <div className="task-list">
          {mustDo ? renderTaskRow(mustDo, "Must-do") : <div className="empty-state"><FileText size={19} /><span>No must-do task right now.</span></div>}
          {maintenance ? renderTaskRow(maintenance, "Maintenance") : <div className="empty-state"><FileText size={19} /><span>No maintenance task right now.</span></div>}
          {nextBlock ? <div className="task-row"><div className="task-leading"><span className="lock-in-tag lock-in-tag-recovery">Recovery</span><div className="task-icon task-icon-recovery"><LockKeyhole size={15} /></div><div><strong>{nextBlock.type}</strong><span>{nextBlock.day} · {nextBlock.startTime}–{nextBlock.endTime}</span></div></div></div> : <div className="task-row"><div className="task-leading"><span className="lock-in-tag lock-in-tag-recovery">Recovery</span><div className="task-icon task-icon-recovery"><LockKeyhole size={15} /></div><div><strong>No recovery block locked yet</strong><span>Protect one before the week fills up.</span></div></div><button className="text-action" onClick={onPlanner}>Open planner</button></div>}
        </div>
      </section>
    ) : (
      <>
        <section className="card load-panel"><div className="load-panel-head"><div><span className="card-label">How the week is allocated</span><p className="card-subtitle">Recovery stays first. Obligations use what remains.</p></div><button className="text-action" onClick={onPlanner}><Leaf size={16} /> Open planner</button></div><div className="telemetry-grid">{[
          { label: "Recovery Floor", value: calculation.tier2Total, good: true },
          { label: "Fixed Load", value: calculation.fixedTotal, good: calculation.fixedTotal <= calculation.availableCapacity },
          { label: "Flex Tasks", value: calculation.flexTotal, good: calculation.flexTotal <= calculation.margin + calculation.flexTotal },
          { label: "Recovery Margin", value: Math.max(calculation.margin, 0), good: calculation.margin >= 5 },
        ].map((item) => <div className="telemetry-card" key={item.label}><span className="telemetry-label">{item.label} {item.good && <CircleCheck size={12} />}</span><strong className="telemetry-value">{formatHours(item.value)}</strong></div>)}</div></section>
        <section className="card tasks-panel"><div className="tasks-head"><div><span className="card-label">Flexible commitments</span><p className="card-subtitle">These compete for the margin. They can be deferred in Triage.</p></div><span className="task-count">{activeTasks.length} active</span></div>{activeTasks.length ? <div className="task-list">{activeTasks.map((task) => renderTaskRow(task))}</div> : <div className="empty-state"><FileText size={19} /><span>No flexible tasks yet. Add one to see its cost.</span></div>}<button className="text-action" onClick={() => setShowFullWeek(false)}>← Back to Lock In</button></section>
      </>
    )}
    <div className="dashboard-actions">
      {!showFullWeek ? <button className="secondary-button" onClick={() => setShowFullWeek(true)}>Show Full Week</button> : <button className="secondary-button" onClick={() => setShowFullWeek(false)}>← Back to Lock In</button>}
      <button className="primary-button" onClick={onAddTask}><Plus size={18} /> Add Task</button>
      <button className="secondary-button" onClick={onPlanner}><Leaf size={17} /> Recovery Planner</button>
    </div>
    <div className="quick-check-fab-wrap">
      {showFabHint && <span className="quick-check-fab-hint">Can I afford this?</span>}
      <button className="quick-check-fab" aria-label="Can I afford this? Quick check" onClick={() => { dismissFabHint(); onQuickCheck(); }}><MessageCircleQuestion size={22} /></button>
    </div>
  </div>;
}

type CalculationShape = { fixedTotal: number; recoveryBlockTotal: number; tier2Total: number; availableCapacity: number; flexTotal: number; margin: number; dailyMargins: number[]; dailyFixed: number[]; dailyRecoveryBlocks: number[]; dailyTask: number[]; longestRun: number; distributionWarning: boolean; status: ReturnType<typeof statusFor>; categoryBreakdown: { mental: number; physical: number; social: number; errands: number; time: number } };
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
const useCalculationShape = null as unknown as () => CalculationShape;

function CommitmentMirror({ draftName, draftHours, draftDeadline, projectedMargin, projectedStatus, consequenceDay, dailyBreachAmount, sleepImpact, predictedHighLoadDays, showActions, confirmBreach, setDraftName, setDraftHours, setDraftDeadline, setShowActions, onAddAnyway, onTriage, onSplit, onFindSlot, onDefer }: { draftName: string; draftHours: number; draftDeadline: string; projectedMargin: number; projectedStatus: ReturnType<typeof statusFor>; consequenceDay: string; dailyBreachAmount: number; sleepImpact: number; predictedHighLoadDays: number; showActions: boolean; confirmBreach: boolean; setDraftName: (value: string) => void; setDraftHours: (value: number) => void; setDraftDeadline: (value: string) => void; setShowActions: (value: boolean) => void; onAddAnyway: () => void; onTriage: () => void; onSplit: () => void; onFindSlot: () => void; onDefer: () => void }) {
  const stageTwo = projectedMargin < 0;
  const TRADE_RING_CIRC = 2 * Math.PI * 54;
  const beforePercent = capacityPercent(projectedMargin + draftHours);
  const afterPercent = capacityPercent(projectedMargin);
  const beforeStage = statusFor(projectedMargin + draftHours);
  return <div className="mirror-page">
    <section className="card mirror-tradeoff-card">
      <div className="section-kicker"><SlidersHorizontal size={14} /><span>Trade Off</span></div>
      <div className="trade-ring-row">
        <div className="trade-ring">
          <svg className="trade-ring-svg" viewBox="0 0 140 140">
            <circle className="trade-ring-track" cx="70" cy="70" r="54" />
            <circle className="trade-ring-fill" cx="70" cy="70" r="54" style={{ stroke: beforeStage.color, strokeDasharray: TRADE_RING_CIRC, strokeDashoffset: TRADE_RING_CIRC * (1 - Math.max(0, Math.min(1, beforePercent / 100))) }} />
          </svg>
          <span className="trade-ring-value" style={{ color: beforeStage.color }}>{beforePercent}%</span>
        </div>
        <ArrowRight size={20} className="trade-ring-arrow" />
        <div className="trade-ring">
          <svg className="trade-ring-svg" viewBox="0 0 140 140">
            <circle className="trade-ring-track" cx="70" cy="70" r="54" />
            <circle className="trade-ring-fill" cx="70" cy="70" r="54" style={{ stroke: projectedStatus.color, strokeDasharray: TRADE_RING_CIRC, strokeDashoffset: TRADE_RING_CIRC * (1 - Math.max(0, Math.min(1, afterPercent / 100))) }} />
          </svg>
          <span className="trade-ring-value" style={{ color: projectedStatus.color }}>{afterPercent}%</span>
        </div>
      </div>
      <div className="trade-hours-row"><strong>{formatHours(projectedMargin + draftHours)}</strong><ArrowRight size={15} /><strong style={{ color: projectedStatus.color }}>{formatHours(projectedMargin)}</strong></div>
      <p className="trade-caption">Recovery Margin</p>
      <div className="why-row"><Info size={15} /><p>{sleepImpact > 0 ? `This task overlaps your protected recovery window on ${consequenceDay}.` : `This task uses ${formatHours(draftHours)} of the margin currently available.`}</p></div>
      {sleepImpact > 0 && <div className="consequence consequence-major"><Moon size={20} /><span><strong>{consequenceDay} sleep</strong><small>{formatShortHours(7)} → {formatShortHours(Math.max(0, 7 - sleepImpact))}</small></span></div>}
      {predictedHighLoadDays >= 3 && <div className="consequence"><TriangleAlert size={19} /><span><strong>{predictedHighLoadDays} consecutive high-load days ahead</strong><small>Task load concentrates around your existing commitments.</small></span></div>}
      {stageTwo && <div className="consequence"><ShieldCheck size={19} /><span><strong>Recovery floor breached by {formatHours(dailyBreachAmount || Math.abs(projectedMargin))} on {consequenceDay}</strong><small>The protected floor is the first thing this schedule would cut.</small></span></div>}
      {stageTwo && <button className="triage-callout triage-callout-light" onClick={onTriage}><TriangleAlert size={17} /> Triage becomes the clearest next option <ArrowRight size={16} /></button>}
    </section>

    <section className="card mirror-input-card">
      <div className="section-kicker"><span>Input</span></div>
      <div className="quick-add-grid">{QUICK_ADD_PRESETS.map((preset) => { const Icon = categoryIcon(suggestionFor(preset.name).category); return <button key={preset.name} type="button" className="quick-add-tile" onClick={() => { setDraftName(preset.name); setDraftHours(preset.hours); }}><Icon size={15} /><span><strong>{preset.name}</strong><small>{formatShortHours(preset.hours)} · {preset.displayCategory}</small></span></button>; })}</div>
      <label className="field-label">Other task/commitment?<input autoFocus className="task-input" placeholder="Type here..." value={draftName} onChange={(event) => setDraftName(event.target.value)} /></label>
      <div className="mirror-field-row">
        <label className="field-label">Est time<input className="number-input" type="number" min="0.5" step="0.5" value={draftHours} onChange={(event) => setDraftHours(Number(event.target.value))} /></label>
        <label className="field-label">Day<select className="text-input" value={draftDeadline} onChange={(event) => setDraftDeadline(event.target.value)}>{DAYS.map((day) => <option key={day} value={day}>{day}</option>)}</select></label>
      </div>
      <button className={`primary-button ${stageTwo ? "primary-button-danger" : ""}`} onClick={onAddAnyway}>{stageTwo && confirmBreach ? "I understand this breaches my recovery floor" : "Add Task"} <ArrowRight size={16} /></button>
    </section>

    <section className="card mirror-easier-card">
      <span className="card-label">Easier options?</span>
      <div className="button-stack">
        <button className="option-pill option-pill-teal" onClick={onSplit}><SlidersHorizontal size={15} /> Split into 2 × {formatShortHours(Math.max(0.5, draftHours / 2))}</button>
        <button className="option-pill option-pill-blue" onClick={onDefer}><RotateCcw size={15} /> Defer something first</button>
        <button className="option-pill option-pill-blue2" onClick={onFindSlot}><CalendarDays size={15} /> Find a slot</button>
      </div>
    </section>
    <div className="agency-note"><ShieldCheck size={17} /><span>There is no hard lock. The choice remains yours, with the cost visible.</span></div>
  </div>;
}

function ConsequencePreview({ projectedMargin, consequenceDay, deferCandidate, onAddIt, onAddAndDefer, onSeeOptions, onDeferToNextWeek, onAddAnywayOverride }: { projectedMargin: number; consequenceDay: string; deferCandidate: FlexibleTask | null; onAddIt: () => void; onAddAndDefer: () => void; onSeeOptions: () => void; onDeferToNextWeek: () => void; onAddAnywayOverride: () => void }) {
  if (projectedMargin >= 10) {
    return <div className="sheet-backdrop consequence-backdrop" role="dialog" aria-modal="true" aria-labelledby="consequence-preview-title"><div className="consequence-modal"><div className="modal-kicker"><ShieldCheck size={17} /> Consequence Preview</div><h2 id="consequence-preview-title">This fits safely.</h2><p className="modal-lede">Your margin holds at <strong>{formatHours(projectedMargin)}</strong>. You're protected.</p><div className="modal-actions"><button className="primary-button" onClick={onAddIt}>Add it</button></div></div></div>;
  }
  if (projectedMargin >= 0) {
    return <div className="sheet-backdrop consequence-backdrop" role="dialog" aria-modal="true" aria-labelledby="consequence-preview-title"><div className="consequence-modal"><div className="modal-kicker"><TriangleAlert size={17} /> Consequence Preview</div><h2 id="consequence-preview-title">This fits, but something should move.</h2><p className="modal-lede">Adding this tightens your margin to <strong>{formatHours(projectedMargin)}</strong>. {deferCandidate ? <>{deferCandidate.name} on {deferCandidate.deadline} is the best candidate to defer.</> : null}</p><div className="modal-actions"><button className="primary-button" onClick={onAddAndDefer}>Add it{deferCandidate ? ` + defer ${deferCandidate.name}` : ""}</button><button className="secondary-button" onClick={onSeeOptions}>See options</button></div></div></div>;
  }
  return <div className="sheet-backdrop consequence-backdrop" role="dialog" aria-modal="true" aria-labelledby="consequence-preview-title"><div className="consequence-modal"><div className="modal-kicker"><TriangleAlert size={17} /> Consequence Preview</div><h2 id="consequence-preview-title">Not this week.</h2><p className="modal-lede">This breaches your recovery floor on <strong>{consequenceDay}</strong>. I can help next week after {consequenceDay}.</p><div className="modal-actions"><button className="primary-button" onClick={onDeferToNextWeek}>Defer to next week</button><button className="text-button" onClick={onAddAnywayOverride}>Add anyway</button></div></div></div>;
}

function RecoveryQualityCard({ block, onSelect }: { block: RecoveryBlock; onSelect: (quality: "Fully" | "Partially" | "Not really") => void }) {
  return <section className="recovery-quality-card" aria-labelledby="quality-title"><div className="quality-kicker"><ShieldCheck size={16} /> Recovery quality check-in</div><h2 id="quality-title">{block.type} yesterday ({block.startTime}–{block.endTime})</h2><p>Did it restore you?</p><div className="quality-actions"><button onClick={() => onSelect("Fully")}>Fully</button><button onClick={() => onSelect("Partially")}>Partially</button><button onClick={() => onSelect("Not really")}>Not really</button></div></section>;
}

function ImportCommitments({ fileName, reviewed, onFile, onContinue, onApprove, onManual }: { fileName: string; reviewed: boolean; onFile: (name: string) => void; onContinue: () => void; onApprove: () => void; onManual: () => void }) {
  return <div className="import-page">
    <div className="screen-title-block"><h1>Import Schedule</h1></div>
    {reviewed ? (
      <section className="card import-card">
        <div className="section-kicker"><CalendarDays size={14} /><span>Confirm fixed load</span></div>
        <div className="import-file-chip"><Check size={16} /> {fileName || "Sample university timetable"}</div>
        <p className="import-note">These classes will be added as Fixed Load before you approve them.</p>
        <div className="import-class-list">{IMPORTED_TIMETABLE.map((item) => <div className="commitment-row" key={item.id}><div><strong>{item.name}</strong><span>{item.days.join(" · ")} · {item.startTime}–{item.endTime}</span></div><span className="hours-chip">{formatShortHours(item.hours)}</span></div>)}</div>
        <button className="secondary-button import-back-button" onClick={() => onFile("")}>Choose another file</button>
      </section>
    ) : (
      <section className="card import-card">
        <div className="section-kicker"><Upload size={14} /><span>Choose a source</span></div>
        <div className="import-source-group">
          <span className="import-source-label"><Upload size={14} /> Upload timetable</span>
          <label className="import-source-button">
            <Upload size={15} /> Upload Timetable
            <input className="file-input" type="file" accept=".pdf,.csv,image/*" onChange={(event) => onFile(event.target.files?.[0]?.name ?? "")} />
          </label>
          <span className="import-source-caption">PDF, CSV, or image</span>
        </div>
        <div className="import-divider"><span>OR</span></div>
        <div className="import-source-group">
          <span className="import-source-label"><CalendarCheck2 size={14} /> Import calendar</span>
          <button className="import-source-button" onClick={() => onFile("Sample university timetable.pdf")}><CalendarCheck2 size={15} /> Import Calendar</button>
          <span className="import-source-caption">Import from Google Calendar</span>
        </div>
        <div className="import-divider"><span>OR</span></div>
        <div className="import-source-group">
          <span className="import-source-label"><PenLine size={14} /> Enter manually</span>
          <button className="import-source-button" onClick={onManual}><PenLine size={15} /> Enter Manually</button>
        </div>
        {fileName && <div className="import-file-chip"><Check size={16} /> {fileName}</div>}
      </section>
    )}
    <button className="primary-button" onClick={reviewed ? onApprove : onContinue}>{reviewed ? "Approve Fixed Load" : "Continue"} <ArrowRight size={17} /></button>
  </div>;
}

function Triage({ calculation, displayMargin, items, selectedTriage, selectedRecovery, remainingDeficit, overrideCount, outcome, onToggle, onApply, onContinue, onProceed, onPlanner, onDashboard }: { calculation: CalculationShape; displayMargin: number; items: FlexibleTask[]; selectedTriage: number[]; selectedRecovery: number; remainingDeficit: number; overrideCount: number; outcome: TriageOutcome; onToggle: (id: number) => void; onApply: () => void; onContinue: () => void; onProceed: () => void; onPlanner: () => void; onDashboard: () => void }) {
  const displayStatus = statusFor(displayMargin);
  const hasDeficit = displayMargin < 0;
  if (outcome === "failure") return <FailureState onProtect={onPlanner} onDashboard={onDashboard} />;
  return <div className="triage-page"><div className="screen-header"><div><p className="eyebrow">Triage <span>Rebalancing, not task management</span></p><h1 className="page-heading">{hasDeficit ? "Recovery deficit detected." : "Free up time, proactively."}</h1><p className="lede compact">{hasDeficit ? "Release flexible commitments to restore your Recovery Margin." : "Your Recovery Margin is comfortable. Releasing commitments here is optional, not required."}</p>{overrideCount >= 3 && <p className="override-alert">You've overridden {overrideCount} warnings. Please rebalance before continuing.</p>}</div><div className="triage-margin"><span>Recovery Margin</span><strong style={{ color: displayStatus.color }}>{formatHours(displayMargin)}</strong></div></div><section className="card triage-card"><div className="triage-note"><LockKeyhole size={15} /> Recovery blocks are never suggested here.</div>{outcome === "full" ? <div className="outcome-panel outcome-full"><CircleCheck size={23} /><div><strong>Recovery Margin restored.</strong><p>The selected flexible commitments moved out of this week.</p></div><button className="secondary-button" onClick={onDashboard}>Return to Dashboard</button></div> : outcome === "partial" ? <div className="outcome-panel outcome-partial"><TriangleAlert size={23} /><div><strong>Partial rebalancing applied. {formatHours(remainingDeficit)} deficit remains.</strong><p>Would you like to continue adjusting or proceed with the remaining deficit?</p></div><div className="outcome-actions"><button className="secondary-button" onClick={onContinue}>Continue Adjusting</button><button className="primary-button" onClick={onProceed}>Proceed Anyway</button></div></div> : <><div className="triage-list">{items.length ? items.map((task) => <button key={task.id} className={`triage-item ${selectedTriage.includes(task.id) ? "triage-item-selected" : ""}`} onClick={() => onToggle(task.id)}><span className="triage-check">{selectedTriage.includes(task.id) ? <Check size={17} /> : <Circle size={19} />}</span><span className="triage-item-copy"><strong>{task.name}</strong><small>{formatHours(task.estimatedHours)} → push to {task.deadline === "Sat" ? "Sunday" : "Saturday"}</small></span><span className="triage-gain">+{formatShortHours(task.estimatedHours)}</span></button>) : <div className="empty-state">No flexible commitments are available to release.</div>}</div><div className="triage-total"><div><span>Selected recovery</span><strong>+{formatHours(selectedRecovery)}</strong></div><div><span>{hasDeficit ? "Remaining deficit" : "Margin after changes"}</span><strong className={hasDeficit ? (remainingDeficit === 0 ? "text-green" : "") : "text-green"}>{hasDeficit ? formatHours(remainingDeficit) : formatHours(displayMargin + selectedRecovery)}</strong></div></div><button className="primary-button primary-button-wide" disabled={!selectedTriage.length} onClick={onApply}>Apply Selected Rebalancing <ArrowRight size={17} /></button></>}</section></div>;
}

function FailureState({ onProtect, onDashboard }: { onProtect: () => void; onDashboard: () => void }) { return <div className="failure-panel"><div className="failure-mark"><TriangleAlert size={25} /></div><h1>Some recovery loss this week may be unavoidable.</h1><p>Based on your current commitments, there is no flexible combination that restores the full deficit.</p><div className="what-margin"><strong>What Margin can still do:</strong><span>→ Protect your highest-value sleep nights</span><span>→ Flag which days carry most risk</span><span>→ Plan recovery for next week</span></div><div className="outcome-actions"><button className="secondary-button" onClick={onProtect}>Plan Next Week</button><button className="primary-button" onClick={onDashboard}>Protect What's Left</button></div></div>; }

function RecoveryPlanner({ loadPattern, recoveryBlocks, plannerMessage, onProtect, onLockAll, onSkip }: { loadPattern: { label: string; recommendation: string; category: TaskCategory }; recoveryBlocks: RecoveryBlock[]; plannerMessage: string; onProtect: (id: number) => void; onLockAll: () => void; onSkip: () => void }) {
  const blocks = recoveryBlocks.length ? recoveryBlocks : [
    { id: 101, day: "Tuesday", startTime: "18:00", endTime: "19:00", type: loadPattern.category === "mental" ? "Physical break" : "Low-stimulus reset", locked: false },
    { id: 102, day: "Thursday", startTime: "18:30", endTime: "19:30", type: loadPattern.category === "social" ? "Solo time" : "Screen-free wind-down", locked: false },
    { id: 103, day: "Sunday", startTime: "10:00", endTime: "11:00", type: "Sleep extension", locked: false },
  ];
  return <div className="planner-page">
    <div className="screen-title-block"><h1>Schedule Recovery</h1><p>Before tasks fill the week</p></div>
    <section className="card planner-warning-card">
      <span className="card-label">Based on this week's load</span>
      <div className="planner-warning-banner"><TriangleAlert size={16} /> {loadPattern.recommendation}</div>
    </section>
    <section className="card planner-blocks-card">
      <span className="card-label">Scheduled before your remaining tasks, obligations fill what's left</span>
      <div className="planner-block-list">
        {blocks.map((block) => <div className={`planner-block-row ${block.locked ? "planner-block-locked" : ""}`} key={block.id}>
          <div className="planner-block-top"><span className="planner-day-pill">{block.day}</span><span className="planner-time">{block.startTime} – {block.endTime}</span></div>
          <strong>{block.type}</strong>
          <small>After 2 consecutive high-load days</small>
          <div className="planner-block-actions">{block.locked ? <span className="locked-copy"><ShieldCheck size={15} /> Protected</span> : <><button className="secondary-button planner-action-btn" onClick={() => onProtect(block.id)}>Protect</button><button className="text-button planner-action-btn">Edit</button></>}</div>
        </div>)}
      </div>
    </section>
    {plannerMessage && <div className="planner-message"><Check size={16} /> {plannerMessage}</div>}
    <div className="button-stack">
      <button className="primary-button" onClick={onLockAll}><LockKeyhole size={17} /> Lock All Suggested Blocks</button>
      <button className="secondary-button" onClick={onSkip}>Skip for Now</button>
    </div>
  </div>;
}

function Reflection({ calculation, overrideCount, taskOutcomes, moodCheckIns, energyCheckIns, onNextWeek, onAdjust }: { calculation: CalculationShape; overrideCount: number; taskOutcomes: TaskOutcomeRecord[]; moodCheckIns: MoodCheckIn[]; energyCheckIns: EnergyCheckIn[]; onNextWeek: () => void; onAdjust: () => void }) {
  const hardestIndex = calculation.dailyMargins.reduce((lowest, margin, index, margins) => margin < margins[lowest] ? index : lowest, 0);
  const maintained = Math.round(calculation.tier2Total);
  const floorProtectedDays = calculation.dailyMargins.filter((margin) => margin >= 0).length;
  const outcomeCounts = { Easy: 0, Fine: 0, Hard: 0, Disaster: 0 };
  taskOutcomes.forEach((record) => { outcomeCounts[record.outcome] += 1; });
  const moodByDay = new Map(moodCheckIns.map((entry) => [new Date(entry.date).toLocaleDateString("en-US", { weekday: "short" }), entry.value]));
  const energyByDay = new Map(energyCheckIns.map((entry) => [new Date(entry.date).toLocaleDateString("en-US", { weekday: "short" }), entry.response]));
  const last7Days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
    return { dayLabel, moodValue: moodByDay.get(dayLabel) ?? null, energyValue: energyByDay.get(dayLabel) ?? null };
  });
  const weeklyCheckInScores = last7Days.flatMap((day) => [day.moodValue ? CHECKIN_QUALITY_SCORE[day.moodValue] : null, day.energyValue ? CHECKIN_QUALITY_SCORE[day.energyValue] : null]).filter((score): score is number => score !== null);
  const avgCheckInScore = weeklyCheckInScores.length ? weeklyCheckInScores.reduce((sum, score) => sum + score, 0) / weeklyCheckInScores.length : null;
  const recoveryQualityLabel = avgCheckInScore === null ? null : avgCheckInScore < 1 ? "Needs attention" : avgCheckInScore < 2 ? "Moderate" : "Well restored";
  return <div className="reflection-page">
    <div className="screen-title-block"><h1>Week 36 Reflection</h1></div>
    <section className="card reflection-message-card">
      <p>You protected your recovery this week, that's what sustainable performance looks like.</p>
    </section>
    <section className="card reflection-metrics-card">
      <div className="reflection-metrics">
        <MetricCard icon={<Moon size={18} />} label="Recovery Maintained" value={`${maintained} hrs`} mark="✓" tone="blue" />
        <MetricCard icon={<ShieldCheck size={18} />} label="Recovery Floor Breached" value="0 times" mark="✓" tone="green" />
        <MetricCard icon={<ShieldCheck size={18} />} label="Recovery Quality" value={recoveryQualityLabel ?? "Pending"} subLabel={recoveryQualityLabel ? undefined : "Complete a daily check-in on the Today screen."} mark={recoveryQualityLabel ? "✓" : "—"} tone={recoveryQualityLabel === "Needs attention" ? "amber" : recoveryQualityLabel ? "green" : "muted"} />
        <MetricCard icon={<ShieldCheck size={18} />} label="Recovery Consistency" value={`Floor protected ${floorProtectedDays} of 7 days`} mark={floorProtectedDays >= 5 ? "✓" : "!"} tone={floorProtectedDays >= 5 ? "green" : floorProtectedDays < 3 ? "amber" : "muted"} />
        <MetricCard icon={<RotateCcw size={18} />} label="Commitments Rebalanced" value="3" mark="✓" tone="green" />
        <MetricCard icon={<TriangleAlert size={18} />} label={'Add Anyway Overrides'} value={String(overrideCount)} mark={overrideCount > 2 ? "!" : "—"} tone={overrideCount > 2 ? "amber" : "muted"} />
      </div>
    </section>
    {taskOutcomes.length > 0 && <p className="outcome-summary-line">Task outcomes this week: {outcomeCounts.Easy} Easy · {outcomeCounts.Fine} Fine · {outcomeCounts.Hard} Hard · {outcomeCounts.Disaster} Disaster</p>}
    <section className="card stress-pattern">
      <span className="card-label">Stress Pattern</span>
      <div className="stress-pattern-list">{last7Days.map((day) => { const moodEntry = day.moodValue ? { ...moodMeta(day.moodValue), label: day.moodValue as string } : null; const energyEntry = day.energyValue ? { ...energyMeta(day.energyValue), label: day.energyValue as string } : null; const entry = moodEntry ?? energyEntry; return <div className="stress-pattern-row" key={day.dayLabel}><span className="stress-pattern-day">{day.dayLabel}</span><span className="stress-pattern-value" style={entry ? { color: entry.color } : undefined}>{entry ? `${entry.emoji} ${entry.label}` : "No check-in"}</span></div>; })}</div>
    </section>
    <section className="card reflection-insight-card">
      <div className="insight-row"><Moon size={16} /><span><strong>This week's goal</strong><small>Your hardest day: {DAYS[hardestIndex]}. Consider protecting {DAYS[hardestIndex]} evening.</small></span></div>
      <button className="insight-row insight-row-action" onClick={onNextWeek}><BarChart3 size={16} /><span><strong>Week in insight</strong><small>Your hardest day was {DAYS[hardestIndex]}.</small></span><span className="insight-link">See full insight <ArrowRight size={13} /></span></button>
    </section>
    <div className="reflection-actions"><button className="secondary-button" onClick={onAdjust}><SlidersHorizontal size={17} /> Adjust Recovery Floor</button></div>
  </div>;
}

function MetricCard({ icon, label, value, subLabel, mark, tone }: { icon: ReactNode; label: string; value: string; subLabel?: string; mark: string; tone: "blue" | "green" | "amber" | "muted" }) { return <div className={`metric-card metric-${tone}`}><div className="metric-label">{icon}<span>{label}</span></div><div className="metric-value">{value}<span>{mark}</span></div>{subLabel && <p className="metric-sub-label">{subLabel}</p>}</div>; }

function QuickCheck({ name, hours, suggestion, calculation, sleepHours, decompHours, energyCheckIn, tasks, moodCheckIns, energyCheckIns, taskOutcomes, setName, setHours, onClose, onAdd }: { name: string; hours: number; suggestion: Suggestion; calculation: CalculationShape; sleepHours: number; decompHours: number; energyCheckIn: EnergyCheckIn | null; tasks: FlexibleTask[]; moodCheckIns: MoodCheckIn[]; energyCheckIns: EnergyCheckIn[]; taskOutcomes: TaskOutcomeRecord[]; setName: (value: string) => void; setHours: (value: number) => void; onClose: () => void; onAdd: () => void }) {
  const projected = calculation.margin - hours;
  const status = statusFor(projected);
  const showSleep = projected < 0;

  const risk = useMemo(() => predictBurnoutRisk({ calculation, moodCheckIns, energyCheckIns }), [calculation, moodCheckIns, energyCheckIns]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const askedRef = useRef<string>("");

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const sendChatMessage = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || chatLoading) return;
    const nextMessages: ChatMessage[] = [...chatMessages, { role: "user", content: trimmed }];
    setChatMessages(nextMessages);
    setChatInput("");

    const context = buildUserContext({ calculation, tasks, moodCheckIns, energyCheckIns, taskOutcomes, sleepHours, decompHours, risk });
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    if (!apiKey) {
      setChatMessages([...nextMessages, { role: "assistant", content: localFallbackReply(risk, calculation) }]);
      return;
    }

    setChatLoading(true);
    const systemPreamble = `You are Margin, a calm recovery-first AI assistant embedded in a student planning app. Answer using ONLY the student's real data below — never invent facts. Be specific about which day or task is the concern, keep replies to 2-4 sentences, and ground every judgment in the computed burnout risk score and schedule data provided.\n\n${context}`;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPreamble }] },
            { role: "model", parts: [{ text: "Understood. I'll answer using only this student's real schedule and check-in data." }] },
            ...nextMessages.map((message) => ({ role: message.role === "user" ? "user" : "model", parts: [{ text: message.content }] })),
          ],
          generationConfig: { maxOutputTokens: 160, temperature: 0.6 },
        }),
      });
      if (!response.ok) throw new Error("bad response");
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      setChatMessages([...nextMessages, { role: "assistant", content: text ? String(text).trim() : localFallbackReply(risk, calculation) }]);
    } catch {
      setChatMessages([...nextMessages, { role: "assistant", content: localFallbackReply(risk, calculation) }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (!name.trim() || hours <= 0) return;
    const askKey = `${name.trim().toLowerCase()}|${hours}`;
    if (askedRef.current === askKey) return;
    const timer = setTimeout(() => {
      askedRef.current = askKey;
      sendChatMessage(`Can I fit "${name.trim()}" (${hours}h) into my week without burning out?`);
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, hours]);

  return (
    <div className="sheet-backdrop" role="dialog" aria-modal="true">
      <div className="quick-sheet">
        <div className="sheet-handle" />
        <div className="sheet-head">
          <div>
            <p className="eyebrow">Quick Check <span>AI · reads your real schedule</span></p>
            <h2>Can I afford this?</h2>
            <p>Ask anything about your week — I only reason from your own data.</p>
          </div>
          <button className="icon-button" aria-label="Close quick check" onClick={onClose}><X size={19} /></button>
        </div>
        <div className="quick-form">
          <label className="field-label">What are you being asked to do?<input className="text-input" placeholder="e.g. Finish a lab report" value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label className="field-label">How long will it take?<div className="input-with-unit"><input className="text-input" type="number" min="0.5" step="0.5" value={hours} onChange={(event) => setHours(Number(event.target.value))} /><span>hrs</span></div></label>
        </div>
        <div className="quick-result">
          <span className="card-label">Recovery Margin after this commitment</span>
          <strong style={{ color: status.color }}>{formatHours(calculation.margin)} <ArrowRight size={16} /> {formatHours(projected)}</strong>
          <span className="quick-status" style={{ color: status.color }}><span className="status-dot" style={{ background: status.color }} /> {status.label} · {suggestion.cognitiveLoad} load</span>
          <span className="risk-badge" style={{ color: statusFor(100 - risk.score).color }}><Sparkles size={12} /> Burnout risk {risk.score}/100 · {risk.label} · trend {risk.trend}</span>
          {showSleep && <small><Moon size={14} /> Sleep impact may land on the tightest day.</small>}
        </div>
        <div className="chat-thread" ref={threadRef}>
          {!chatMessages.length && !chatLoading && (
            <div className="chat-bubble chat-bubble-assistant"><Sparkles size={14} /> Ask me anything about your week — whether a task fits, what's driving your risk, or how you're trending.</div>
          )}
          {chatMessages.map((message, index) => (
            <div key={index} className={`chat-bubble ${message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}`}>{message.role === "assistant" && <Sparkles size={14} />} {message.content}</div>
          ))}
          {chatLoading && <div className="chat-bubble chat-bubble-assistant chat-bubble-loading"><Sparkles size={14} /> Reading your schedule...</div>}
        </div>
        <form className="chat-input-row" onSubmit={(event) => { event.preventDefault(); sendChatMessage(chatInput); }}>
          <input className="text-input" placeholder="Ask about your week..." value={chatInput} onChange={(event) => setChatInput(event.target.value)} />
          <button type="submit" className="icon-button" aria-label="Send message" disabled={!chatInput.trim() || chatLoading}><Send size={17} /></button>
        </form>
        <div className="sheet-actions"><button className="secondary-button" onClick={onClose}>Close</button><button className="primary-button" onClick={onAdd}>Add to Schedule <ArrowRight size={16} /></button></div>
        <p className="sheet-note"><Info size={14} /> Quick Check does not change your schedule.</p>
      </div>
    </div>
  );
}

export default App;
