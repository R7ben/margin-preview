/*
 * MARGIN / Quiet Instrument style contract:
 * Calm technology with a Swiss-influenced information hierarchy. Recovery is the first visual anchor;
 * deep ocean frames the interface, blue marks protected recovery infrastructure, and the four state colors
 * communicate actual Recovery Margin changes. Keep whitespace generous, language observational, and agency intact.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  Clock3,
  Dumbbell,
  FileText,
  Grid2X2,
  Info,
  Leaf,
  LockKeyhole,
  MessageCircleQuestion,
  Moon,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  TriangleAlert,
  Users,
  X,
  Brain,
} from "lucide-react";

type Screen = "onboarding" | "dashboard" | "mirror" | "triage" | "planner" | "reflection" | "import";
type CognitiveLoad = "Low" | "Medium" | "High";
type TaskCategory = "mental" | "social" | "physical";
type TriageOutcome = "full" | "partial" | "failure" | null;
type TaskOutcomeValue = "Easy" | "Fine" | "Hard" | "Disaster";
type TaskOutcomeRecord = { taskId: number; taskName: string; outcome: TaskOutcomeValue; timestamp: number };
type EnergyResponse = "Rough" | "Okay" | "Ready";
type EnergyCheckIn = { date: string; response: EnergyResponse };

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
const MARK_URL = "/manus-storage/margin-mark_0f2827e1.png";
const PAPER_URL = "/manus-storage/margin-paper-grain_ce180b60.png";
const WEEK_LINES_URL = "/manus-storage/margin-week-lines_ab52177b.png";
const RECOVERY_FIELD_URL = "/manus-storage/margin-recovery-field_e8c101f2.png";

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
  if (/(meeting|discussion|sync)/.test(name)) return { range: "0.5–2 hrs", midpoint: 1.25, cognitiveLoad: "Medium", category: "social" };
  if (/(email|admin|errand)/.test(name)) return { range: "0.5–1 hr", midpoint: 0.75, cognitiveLoad: "Low", category: "physical" };
  if (/(exam|presentation|viva)/.test(name)) return { range: "2–4 hrs", midpoint: 3, cognitiveLoad: "High", category: "mental" };
  if (/(exercise|gym|sport)/.test(name)) return { range: "1–2 hrs", midpoint: 1.5, cognitiveLoad: "Medium", category: "physical" };
  return { range: "1 hr", midpoint: 1, cognitiveLoad: "Medium", category: "mental" };
};

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

const categoryLabel = (category: TaskCategory) => {
  if (category === "social") return "Social";
  if (category === "physical") return "Physical";
  return "Mental";
};

const categoryIcon = (category: TaskCategory) => {
  if (category === "social") return Users;
  if (category === "physical") return Dumbbell;
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

// Client only handles copy generation here; the margin math above remains the source of truth.
const fetchAiSentence = async (prompt: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) throw new Error("Missing Gemini API key");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!response.ok) throw new Error("Gemini request failed");
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return String(text).trim();
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
  const [energyCheckIn, setEnergyCheckIn] = useState<EnergyCheckIn | null>(null);

  const todayKey = new Date().toDateString();

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
    return { fixedTotal, recoveryBlockTotal, tier2Total, availableCapacity, flexTotal, margin, dailyMargins, dailyFixed, dailyRecoveryBlocks, dailyTask, longestRun, distributionWarning, status };
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
  const showEnergyCheckIn = Math.min(...calculation.dailyMargins) < 5 && (!energyCheckIn || energyCheckIn.date !== todayKey);

  const loadPattern = useMemo(() => {
    const active = tasks.filter((task) => !task.deferred);
    if (!active.length) return { label: "Light mental", recommendation: "Sleep extension first.", category: "mental" as TaskCategory };
    const totals = active.reduce((acc, task) => ({ ...acc, [task.category]: (acc[task.category] ?? 0) + task.estimatedHours }), { mental: 0, social: 0, physical: 0 } as Record<TaskCategory, number>);
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
    setEnergyCheckIn({ date: todayKey, response });
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2D2D2D]" style={{ backgroundImage: `url(${PAPER_URL})` }}>
      <div className="mx-auto min-h-screen max-w-[1440px] border-x border-[#E0E0E0]/60 bg-[#F8F9FA]/95 shadow-[0_0_80px_rgba(27,73,101,0.04)]">
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
            <Header screen={screen} onBack={() => navTo("dashboard")} />
            <main className="page-wrap">
              {screen === "dashboard" && (
                <Dashboard
                  calculation={calculation}
                  tasks={tasks}
                  recoveryBlocks={recoveryBlocks.length ? recoveryBlocks : DEFAULT_RECOVERY_BLOCKS}
                  showEnergyCheckIn={showEnergyCheckIn}
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
                  draftSuggestion={draftSuggestion}
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
                  recoveryQuality={recoveryQuality}
                  taskOutcomes={taskOutcomes}
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
            <BottomNav screen={screen} onNavigate={navTo} />
          </>
        )}
        {showQuickCheck && (
          <QuickCheck
            name={quickName}
            hours={quickHours}
            suggestion={quickSuggestion}
            calculation={calculation}
            sleepHours={sleepHours}
            energyCheckIn={energyCheckIn}
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
      </div>
    </div>
  );
}

function Header({ screen, onBack }: { screen: Screen; onBack: () => void }) {
  const titles: Record<Exclude<Screen, "onboarding">, string> = {
    dashboard: "Today",
    mirror: "Commitment Mirror",
    triage: "Triage",
    planner: "Recovery Planner",
    reflection: "Week 36 Reflection",
    import: "Import Schedule",
  };
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="flex items-center gap-3">
          {screen !== "dashboard" && <button className="icon-button icon-button-dark" aria-label="Back to dashboard" onClick={onBack}><ArrowLeft size={18} /></button>}
          <div className="brand-lockup">
            <img src={MARK_URL} alt="" className="brand-mark" />
            <span className="brand-wordmark">MARGIN</span>
          </div>
        </div>
        <div className="topbar-meta"><span>{titles[screen as Exclude<Screen, "onboarding">]}</span><span className="topbar-rule" /><span className="hidden sm:inline">Recovery-first planning</span></div>
      </div>
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
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-lockup"><img src={MARK_URL} alt="" className="brand-mark" /><span className="brand-wordmark">MARGIN</span></div>
          <div className="topbar-meta"><span className="hidden sm:inline">Recovery-first planning</span><span className="topbar-rule" /><span>Setup</span></div>
        </div>
      </header>
      <main className="page-wrap onboarding-wrap">
        <div className="onboarding-hero">
          <div>
            <p className="eyebrow">Recovery Floor Setup <span>01 / 06</span></p>
            <h1 className="display-heading">Before your tasks.<br /><em>Set your limits.</em></h1>
            <p className="lede">Margin protects your recovery first. Everything else fits around it.</p>
          </div>
          <div className="onboarding-visual" aria-hidden="true">
            <img src={RECOVERY_FIELD_URL} alt="" />
            <div className="visual-note"><span className="status-dot status-dot-blue" /> Recovery is infrastructure</div>
          </div>
        </div>
        <div className="onboarding-layout">
          <div className="space-y-6">
            <section className="panel-section">
              <div className="section-kicker"><span className="section-number">01</span><span>Recovery floor</span><span className="section-line" /></div>
              <RangeCard icon={<Moon size={18} />} label="Minimum sleep per night" value={`${sleepHours} hrs`} note="Protected every night. Non-negotiable." min={4} max={12} step={0.5} inputValue={sleepHours} onChange={props.setSleepHours} />
              <RangeCard icon={<Leaf size={18} />} label="Minimum daily decompression" value={`${decompHours} hr${decompHours === 1 ? "" : "s"}`} note="Screen-free wind-down, walks, anything that isn't work." min={0.5} max={4} step={0.5} inputValue={decompHours} onChange={props.setDecompHours} />
            </section>
            <section className="panel-section">
              <div className="section-kicker"><span className="section-number">02</span><span>Fixed commitments</span><span className="section-line" /></div>
              <div className="section-intro"><h2>Your fixed commitments</h2><p>Classes, work shifts, labs — things you cannot move.</p></div>
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
              ) : <div className="setup-actions"><button className="text-action" onClick={() => props.setShowCommitmentForm(true)}><Plus size={16} /> Add Commitment</button><button className="text-action" onClick={props.onImport}><CalendarDays size={16} /> Import Schedule</button></div>}
            </section>
          </div>
          <aside className="capacity-panel">
            <div className="capacity-panel-top"><span className="eyebrow">Live calculation</span><span className="capacity-state" style={{ color: capacityStatus.color }}><span className="status-dot" style={{ background: capacityStatus.color }} />{capacityStatus.label}</span></div>
            <h2>Available Capacity <span>this week</span></h2>
            <div className="capacity-number" style={{ color: capacityStatus.color }}>{formatHours(availableCapacity)}</div>
            <div className="math-list"><div><span>168 hrs total</span><span>168 hrs</span></div><div><span>− Recovery Floor</span><span>− {formatHours(tier2Total)}</span></div><div><span>− Fixed commitments</span><span>− {formatHours(fixedTotal)}</span></div><div className="math-result"><span>= Available</span><span>{formatHours(availableCapacity)}</span></div></div>
            <p className="small-note">Tasks come next. This is the room they will compete for.</p>
            <button className="primary-button primary-button-wide" onClick={props.onStart}>Start Planning <ArrowRight size={17} /></button>
          </aside>
        </div>
      </main>
    </>
  );
}

function RangeCard({ icon, label, value, note, min, max, step, inputValue, onChange }: { icon: ReactNode; label: string; value: string; note: string; min: number; max: number; step: number; inputValue: number; onChange: (value: number) => void }) {
  return <div className="range-card"><div className="range-card-head"><div className="range-icon">{icon}</div><div><span className="range-label">{label}</span><p>{note}</p></div><strong>{value}</strong></div><input aria-label={label} type="range" min={min} max={max} step={step} value={inputValue} onChange={(event) => onChange(Number(event.target.value))} /></div>;
}

function Dashboard({ calculation, tasks, recoveryBlocks, showEnergyCheckIn, onAddTask, onQuickCheck, recoveryQualityBlock, recoveryQualityDismissed, onRecoveryQuality, onPlanner, onReflection, onTriage, onRecordOutcome, onDeleteTaskSilently, onEnergyRespond }: { calculation: ReturnType<typeof useCalculationShape>; tasks: FlexibleTask[]; recoveryBlocks: RecoveryBlock[]; showEnergyCheckIn: boolean; onAddTask: () => void; onQuickCheck: () => void; recoveryQualityBlock: RecoveryBlock | null; recoveryQuality: "Fully" | "Partially" | "Not really" | null; recoveryQualityDismissed: boolean; onRecoveryQuality: (quality: "Fully" | "Partially" | "Not really") => void; onPlanner: () => void; onReflection: () => void; onTriage: () => void; onRecordOutcome: (task: FlexibleTask, outcome: TaskOutcomeValue) => void; onDeleteTaskSilently: (id: number) => void; onEnergyRespond: (response: EnergyResponse) => void }) {
  const [showFullWeek, setShowFullWeek] = useState(false);
  const [pendingOutcomeId, setPendingOutcomeId] = useState<number | null>(null);
  const pendingOutcomeIdRef = useRef<number | null>(null);
  useEffect(() => { pendingOutcomeIdRef.current = pendingOutcomeId; }, [pendingOutcomeId]);
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
  return <div className="dashboard-page">
    {recoveryQualityBlock && !recoveryQualityDismissed && <RecoveryQualityCard block={recoveryQualityBlock} onSelect={onRecoveryQuality} />}
    {showEnergyCheckIn && <section className="energy-checkin-card"><span className="card-label">Heading into today...</span><div className="energy-checkin-actions"><button className="secondary-button" onClick={() => onEnergyRespond("Rough")}>😮‍💨 Rough</button><button className="secondary-button" onClick={() => onEnergyRespond("Okay")}>😐 Okay</button><button className="secondary-button" onClick={() => onEnergyRespond("Ready")}>💪 Ready</button></div></section>}
    <div className="dashboard-intro"><div><p className="eyebrow">Today <span>Week 36</span></p><h1 className="page-heading">Your week, with recovery in view.</h1></div><button className="quiet-button" onClick={onReflection}><BarChart3 size={16} /> Weekly Reflection</button></div>
    <div className="dashboard-grid">
      <section className="hero-margin-card">
        <div className="hero-card-head"><span className="card-label">Recovery Margin</span><div className="status-pill" style={{ color: status.color, borderColor: `${status.color}44`, background: `${status.color}10` }}><span className="status-dot" style={{ background: status.color }} />{status.label}</div></div>
        <div className="progress-ring-wrap">
          <svg className="progress-ring-svg" viewBox="0 0 200 200">
            <circle className="progress-ring-track" cx="100" cy="100" r="86" />
            <circle className="progress-ring-fill" cx="100" cy="100" r="86" style={{ stroke: status.color, strokeDasharray: RING_CIRCUMFERENCE, strokeDashoffset: RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, calculation.margin / scale))) }} />
          </svg>
          <div className="progress-ring-center">
            <div className="margin-number" style={{ color: status.color }}>{formatHours(calculation.margin)}</div>
            <span className="trend-copy"><span className="trend-arrow">{calculation.flexTotal > 0 ? "↓" : "→"}</span> {calculation.flexTotal > 0 ? "Shrinking" : "Holding"}</span>
          </div>
        </div>
        <p className="hero-substat">{headline}{showRiskLine ? ` Your week has room. ${lowestDay} doesn't.` : ""}</p>
        <div className="margin-footer"><span>{status.copy}</span><span className="trend-copy"><small>{calculation.flexTotal > 0 ? `was ${formatHours(calculation.margin + calculation.flexTotal)} before flexible commitments` : "no flexible commitments are using the margin"}</small></span></div>
        {calculation.distributionWarning && <div className="distribution-warning"><TriangleAlert size={16} /> Recovery concentrated later in the week</div>}
        {calculation.margin <= 0 && <button className="triage-callout" onClick={onTriage}><TriangleAlert size={17} /> Recovery deficit detected <ArrowRight size={16} /></button>}
      </section>
      <aside className="week-side-rail">
        <div className="side-rail-label">The week at a glance</div>
        <div className="day-dots">{DAYS.map((day, index) => { const dayStatus = dailyStatusFor(calculation.dailyMargins[index]); return <div key={day} className="day-dot-item"><span className="day-name">{day}</span><span className="day-dot" style={{ background: dayStatus.color }} title={`${day}: ${dayStatus.label}`} /><span className="day-margin">{formatShortHours(calculation.dailyMargins[index])}</span></div>; })}</div>
        <img src={WEEK_LINES_URL} alt="" className="week-lines" />
        <p className="side-note">Daily dots include your Recovery Floor, fixed load, and deadline-weighted tasks.</p>
      </aside>
    </div>
    {!showFullWeek ? (
      <section className="tasks-panel lock-in-panel">
        <div className="tasks-head"><div><span className="card-label">Today's Lock In</span><p className="card-subtitle">The three things that matter most today.</p></div><button className="text-action" onClick={() => setShowFullWeek(true)}>Show full week →</button></div>
        <div className="task-list">
          {mustDo ? renderTaskRow(mustDo, "Must-do") : <div className="empty-state"><FileText size={19} /><span>No must-do task right now.</span></div>}
          {maintenance ? renderTaskRow(maintenance, "Maintenance") : <div className="empty-state"><FileText size={19} /><span>No maintenance task right now.</span></div>}
          {nextBlock ? <div className="task-row"><div className="task-leading"><span className="lock-in-tag lock-in-tag-recovery">Recovery</span><div className="task-icon task-icon-recovery"><LockKeyhole size={15} /></div><div><strong>{nextBlock.type}</strong><span>{nextBlock.day} · {nextBlock.startTime}–{nextBlock.endTime}</span></div></div></div> : <div className="task-row"><div className="task-leading"><span className="lock-in-tag lock-in-tag-recovery">Recovery</span><div className="task-icon task-icon-recovery"><LockKeyhole size={15} /></div><div><strong>No recovery block locked yet</strong><span>Protect one before the week fills up.</span></div></div><button className="text-action" onClick={onPlanner}>Open planner</button></div>}
        </div>
      </section>
    ) : (
      <>
        <section className="load-panel"><div className="load-panel-head"><div><span className="card-label">How the week is allocated</span><p className="card-subtitle">Recovery stays first. Obligations use what remains.</p></div><button className="text-action" onClick={onPlanner}><Leaf size={16} /> Open planner</button></div><div className="telemetry-grid">{[
          { label: "Recovery Floor", value: calculation.tier2Total, good: true },
          { label: "Fixed Load", value: calculation.fixedTotal, good: calculation.fixedTotal <= calculation.availableCapacity },
          { label: "Flex Tasks", value: calculation.flexTotal, good: calculation.flexTotal <= calculation.margin + calculation.flexTotal },
          { label: "Recovery Margin", value: Math.max(calculation.margin, 0), good: calculation.margin >= 5 },
        ].map((item) => <div className="telemetry-card" key={item.label}><span className="telemetry-label">{item.label} {item.good && <CircleCheck size={12} />}</span><strong className="telemetry-value">{formatHours(item.value)}</strong></div>)}</div></section>
        <section className="tasks-panel"><div className="tasks-head"><div><span className="card-label">Flexible commitments</span><p className="card-subtitle">These compete for the margin. They can be deferred in Triage.</p></div><span className="task-count">{activeTasks.length} active</span></div>{activeTasks.length ? <div className="task-list">{activeTasks.map((task) => renderTaskRow(task))}</div> : <div className="empty-state"><FileText size={19} /><span>No flexible tasks yet. Add one to see its cost.</span></div>}<button className="text-action" onClick={() => setShowFullWeek(false)}>← Back to Lock In</button></section>
      </>
    )}
    <div className="dashboard-actions"><button className="primary-button" onClick={onAddTask}><Plus size={18} /> Add Task</button><button className="secondary-button" onClick={onPlanner}><Leaf size={17} /> Recovery Planner</button></div>
    <button className="quick-check-fab" onClick={onQuickCheck}><MessageCircleQuestion size={18} /> <span>Can I afford this?</span></button>
  </div>;
}

type CalculationShape = { fixedTotal: number; recoveryBlockTotal: number; tier2Total: number; availableCapacity: number; flexTotal: number; margin: number; dailyMargins: number[]; dailyFixed: number[]; dailyRecoveryBlocks: number[]; dailyTask: number[]; longestRun: number; distributionWarning: boolean; status: ReturnType<typeof statusFor> };
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
const useCalculationShape = null as unknown as () => CalculationShape;

function CommitmentMirror({ draftName, draftHours, draftDeadline, draftSuggestion, projectedMargin, projectedStatus, consequenceDay, dailyBreachAmount, sleepImpact, predictedHighLoadDays, showActions, confirmBreach, setDraftName, setDraftHours, setDraftDeadline, setShowActions, onAddAnyway, onTriage, onSplit, onFindSlot, onDefer }: { draftName: string; draftHours: number; draftDeadline: string; draftSuggestion: Suggestion; projectedMargin: number; projectedStatus: ReturnType<typeof statusFor>; consequenceDay: string; dailyBreachAmount: number; sleepImpact: number; predictedHighLoadDays: number; showActions: boolean; confirmBreach: boolean; setDraftName: (value: string) => void; setDraftHours: (value: number) => void; setDraftDeadline: (value: string) => void; setShowActions: (value: boolean) => void; onAddAnyway: () => void; onTriage: () => void; onSplit: () => void; onFindSlot: () => void; onDefer: () => void }) {
  const stageTwo = projectedMargin < 0;
  return <div className="mirror-page">
    <div className="screen-header"><div><p className="eyebrow">Commitment Mirror <span>See the cost before you say yes</span></p><h1 className="page-heading">What do you need to do?</h1></div><div className="screen-index">03 / 06</div></div>
    <div className="mirror-layout">
      <section className="mirror-input-panel panel-section"><div className="section-kicker"><span className="section-number">01</span><span>Input</span><span className="section-line" /></div><label className="field-label large-label">Task or commitment<input autoFocus className="task-input" placeholder="What do you need to do?" value={draftName} onChange={(event) => setDraftName(event.target.value)} /></label><div className="suggestion-line"><SparkleDot /><span>Suggested: {draftSuggestion.range} | {draftSuggestion.cognitiveLoad} load</span></div><label className="field-label estimate-label">Your estimate<input className="number-input" type="number" min="0.5" step="0.5" value={draftHours} onChange={(event) => setDraftHours(Number(event.target.value))} /><span className="input-suffix">hrs</span></label><label className="field-label">Deadline<select className="text-input" value={draftDeadline} onChange={(event) => setDraftDeadline(event.target.value)}>{DAYS.map((day) => <option key={day} value={day}>{day}</option>)}</select></label><p className="input-note"><Info size={15} /> The estimate is yours. The engine uses it as entered.</p></section>
      <section className={`cost-panel ${stageTwo ? "cost-panel-breached" : ""}`}><div className="cost-panel-label"><span>02</span><span>What accepting this costs you:</span><span className="cost-line" /></div><div className="cost-hero-label">Recovery Margin</div><div className="cost-hero-number"><span>{formatHours(projectedMargin + draftHours)}</span><ArrowRight size={23} /><span style={{ color: projectedStatus.color }}>{formatHours(projectedMargin)}</span></div><div className="cost-hero-caption"><span>current</span><span>after accepting</span></div><div className="consequence-list">{sleepImpact > 0 && <div className="consequence consequence-major"><Moon size={20} /><span><strong>{consequenceDay} sleep</strong><small>{formatShortHours(7)} → {formatShortHours(Math.max(0, 7 - sleepImpact))}</small></span></div>}{predictedHighLoadDays >= 3 && <div className="consequence"><TriangleAlert size={19} /><span><strong>{predictedHighLoadDays} consecutive high-load days ahead</strong><small>Task load concentrates around your existing commitments.</small></span></div>}{stageTwo && <div className="consequence"><ShieldCheck size={19} /><span><strong>Recovery floor breached by {formatHours(dailyBreachAmount || Math.abs(projectedMargin))} on {consequenceDay}</strong><small>The protected floor is the first thing this schedule would cut.</small></span></div>}{sleepImpact > 0 ? <p className="why-line">Why? This task overlaps your protected recovery window on {consequenceDay}.</p> : <p className="why-line">Why? This task uses {formatHours(draftHours)} of the margin currently available.</p>}</div><div className="risk-row"><span className="risk-label">Risk</span><span className="risk-state" style={{ color: projectedStatus.color, borderColor: `${projectedStatus.color}55`, background: `${projectedStatus.color}10` }}>{stageTwo ? "HIGH" : projectedMargin <= 5 ? "MEDIUM" : "LOW"}</span></div>{stageTwo && <button className="triage-callout triage-callout-light" onClick={onTriage}><TriangleAlert size={17} /> Triage becomes the clearest next option <ArrowRight size={16} /></button>}</section>
    </div>
    <section className="mirror-actions"><button className="collapse-action" onClick={() => setShowActions(!showActions)}>{showActions ? "Hide options" : "See options"}<ChevronDown size={17} className={showActions ? "rotate-180" : ""} /></button>{showActions && <div className="action-grid"><button className={`action-button ${stageTwo ? "action-button-danger" : ""}`} onClick={onAddAnyway}>{stageTwo && confirmBreach ? "I understand this breaches my recovery floor" : "Add Anyway"}<ArrowRight size={16} /></button><button className="action-button" onClick={onSplit}>Split Into 2 × {formatShortHours(Math.max(0.5, draftHours / 2))}<SlidersHorizontal size={16} /></button><button className="action-button" onClick={onFindSlot}>Find a Slot<CalendarDays size={16} /></button><button className="action-button" onClick={onDefer}>Defer Something First<RotateCcw size={16} /></button></div>}</section>
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
  return <div className="import-page"><div className="screen-header"><div><p className="eyebrow">Fixed commitments <span>02 / 06</span></p><h1 className="page-heading">Import Schedule</h1><p className="lede compact">Bring in the things that cannot move. Margin will keep them ahead of tasks.</p></div><CalendarDays size={28} className="screen-mark" /></div>{reviewed ? <section className="import-review panel-section"><div className="section-kicker"><span className="section-number">02</span><span>Confirm fixed load</span><span className="section-line" /></div><div className="import-file-chip"><Check size={16} /> {fileName || "Sample university timetable"}</div><p className="import-note">These classes will be added as Fixed Load before you approve them.</p><div className="import-class-list">{IMPORTED_TIMETABLE.map((item) => <div className="commitment-row" key={item.id}><div><strong>{item.name}</strong><span>{item.days.join(" · ")} · {item.startTime}–{item.endTime}</span></div><span className="hours-chip">{formatShortHours(item.hours)}</span></div>)}</div><div className="form-actions"><button className="secondary-button" onClick={() => onFile("")}>Choose another file</button><button className="primary-button" onClick={onApprove}>Approve Fixed Load <ArrowRight size={17} /></button></div></section> : <section className="import-options panel-section"><div className="section-kicker"><span className="section-number">01</span><span>Choose a source</span><span className="section-line" /></div><label className="import-option"><input type="radio" checked={!fileName} readOnly /><span><strong>Upload university timetable</strong><small>PDF, CSV, or image · parsed locally for this prototype</small></span><input className="file-input" type="file" accept=".pdf,.csv,image/*" onChange={(event) => onFile(event.target.files?.[0]?.name ?? "")} /></label><div className="import-option import-option-disabled"><input type="radio" checked={false} readOnly /><span><strong>Import calendar</strong><small>Future build · OAuth and parsing are not enabled here.</small></span><span className="future-label">Future build</span></div><div className="import-sample"><button className="text-action" onClick={() => onFile("Sample university timetable.pdf")}><BookOpen size={16} /> Use sample timetable for preview</button><span>{fileName || "No timetable selected yet"}</span></div><div className="form-actions"><button className="secondary-button" onClick={onManual}>Enter manually instead</button><button className="primary-button" onClick={onContinue}>Continue <ArrowRight size={17} /></button></div><p className="feasibility-note">Parsing and OAuth are finalist-phase builds. Manual entry remains the MVP fallback.</p></section>}</div>;
}

function SparkleDot() { return <span className="suggestion-dot"><span /></span>; }

function Triage({ calculation, displayMargin, items, selectedTriage, selectedRecovery, remainingDeficit, overrideCount, outcome, onToggle, onApply, onContinue, onProceed, onPlanner, onDashboard }: { calculation: CalculationShape; displayMargin: number; items: FlexibleTask[]; selectedTriage: number[]; selectedRecovery: number; remainingDeficit: number; overrideCount: number; outcome: TriageOutcome; onToggle: (id: number) => void; onApply: () => void; onContinue: () => void; onProceed: () => void; onPlanner: () => void; onDashboard: () => void }) {
  const displayStatus = statusFor(displayMargin);
  if (outcome === "failure") return <FailureState onProtect={onPlanner} onDashboard={onDashboard} />;
  return <div className="triage-page"><div className="screen-header"><div><p className="eyebrow">Triage <span>Rebalancing, not task management</span></p><h1 className="page-heading">Recovery deficit detected.</h1><p className="lede compact">Release flexible commitments to restore your Recovery Margin.</p>{overrideCount >= 3 && <p className="override-alert">You've overridden {overrideCount} warnings. Please rebalance before continuing.</p>}</div><div className="triage-margin"><span>Recovery Margin</span><strong style={{ color: displayStatus.color }}>{formatHours(displayMargin)}</strong></div></div><div className="triage-note"><LockKeyhole size={15} /> Recovery blocks are never suggested here.</div>{outcome === "full" ? <div className="outcome-panel outcome-full"><CircleCheck size={23} /><div><strong>Recovery Margin restored.</strong><p>The selected flexible commitments moved out of this week.</p></div><button className="secondary-button" onClick={onDashboard}>Return to Dashboard</button></div> : outcome === "partial" ? <div className="outcome-panel outcome-partial"><TriangleAlert size={23} /><div><strong>Partial rebalancing applied. {formatHours(remainingDeficit)} deficit remains.</strong><p>Would you like to continue adjusting or proceed with the remaining deficit?</p></div><div className="outcome-actions"><button className="secondary-button" onClick={onContinue}>Continue Adjusting</button><button className="primary-button" onClick={onProceed}>Proceed Anyway</button></div></div> : <><div className="triage-list">{items.length ? items.map((task) => <button key={task.id} className={`triage-item ${selectedTriage.includes(task.id) ? "triage-item-selected" : ""}`} onClick={() => onToggle(task.id)}><span className="triage-check">{selectedTriage.includes(task.id) ? <Check size={17} /> : <Circle size={19} />}</span><span className="triage-item-copy"><strong>{task.name}</strong><small>{formatHours(task.estimatedHours)} → push to {task.deadline === "Sat" ? "Sunday" : "Saturday"}</small></span><span className="triage-gain">+{formatShortHours(task.estimatedHours)}</span></button>) : <div className="empty-state">No flexible commitments are available to release.</div>}</div><div className="triage-total"><div><span>Selected recovery</span><strong>+{formatHours(selectedRecovery)}</strong></div><div><span>Remaining deficit</span><strong className={remainingDeficit === 0 ? "text-green" : ""}>{formatHours(remainingDeficit)}</strong></div></div><button className="primary-button primary-button-wide" disabled={!selectedTriage.length} onClick={onApply}>Apply Selected Rebalancing <ArrowRight size={17} /></button></>}</div>;
}

function FailureState({ onProtect, onDashboard }: { onProtect: () => void; onDashboard: () => void }) { return <div className="failure-panel"><div className="failure-mark"><TriangleAlert size={25} /></div><h1>Some recovery loss this week may be unavoidable.</h1><p>Based on your current commitments, there is no flexible combination that restores the full deficit.</p><div className="what-margin"><strong>What Margin can still do:</strong><span>→ Protect your highest-value sleep nights</span><span>→ Flag which days carry most risk</span><span>→ Plan recovery for next week</span></div><div className="outcome-actions"><button className="secondary-button" onClick={onProtect}>Plan Next Week</button><button className="primary-button" onClick={onDashboard}>Protect What's Left</button></div></div>; }

function RecoveryPlanner({ loadPattern, recoveryBlocks, plannerMessage, onProtect, onLockAll, onSkip }: { loadPattern: { label: string; recommendation: string; category: TaskCategory }; recoveryBlocks: RecoveryBlock[]; plannerMessage: string; onProtect: (id: number) => void; onLockAll: () => void; onSkip: () => void }) {
  const blocks = recoveryBlocks.length ? recoveryBlocks : [
    { id: 101, day: "Tuesday", startTime: "18:00", endTime: "19:00", type: loadPattern.category === "mental" ? "Physical break" : "Low-stimulus reset", locked: false },
    { id: 102, day: "Thursday", startTime: "18:30", endTime: "19:30", type: loadPattern.category === "social" ? "Solo time" : "Screen-free wind-down", locked: false },
    { id: 103, day: "Sunday", startTime: "10:00", endTime: "11:00", type: "Sleep extension", locked: false },
  ];
  return <div className="planner-page"><div className="screen-header"><div><p className="eyebrow">Recovery Planner <span>05 / 06</span></p><h1 className="page-heading">Schedule recovery before tasks fill the week.</h1></div><div className="load-pattern-pill"><span className="status-dot status-dot-blue" /> Load pattern: {loadPattern.label}</div></div><div className="recommendation-panel"><div className="recommendation-icon"><Leaf size={22} /></div><div><span className="card-label">Based on this week's load</span><strong>{loadPattern.recommendation}</strong><p>Every suggestion references a specific opening in your current schedule.</p></div></div><p className="planner-intro">Scheduled before your remaining tasks. Obligations fill what's left.</p><div className="suggested-blocks">{blocks.map((block) => <div className={`planner-block ${block.locked ? "planner-block-locked" : ""}`} key={block.id}><div className="planner-block-top"><span className="planner-day">{block.day}</span><span className="planner-time">{block.startTime} – {block.endTime}</span>{block.locked && <span className="locked-label"><LockKeyhole size={13} /> Protected</span>}</div><strong>{block.type}</strong><small>After 2 consecutive high-load days</small><div className="planner-block-actions">{block.locked ? <span className="locked-copy"><ShieldCheck size={15} /> Tier 2 immediately</span> : <><button className="secondary-button" onClick={() => onProtect(block.id)}>Protect</button><button className="text-button">Edit</button></>}</div></div>)}</div>{plannerMessage && <div className="planner-message"><Check size={16} /> {plannerMessage}</div>}<div className="planner-actions"><button className="primary-button" onClick={onLockAll}><LockKeyhole size={17} /> Lock All Suggested Blocks</button><button className="secondary-button" onClick={onSkip}>Skip for Now</button></div></div>;
}

function Reflection({ calculation, overrideCount, recoveryQuality, taskOutcomes, onNextWeek, onAdjust }: { calculation: CalculationShape; overrideCount: number; recoveryQuality: "Fully" | "Partially" | "Not really" | null; taskOutcomes: TaskOutcomeRecord[]; onNextWeek: () => void; onAdjust: () => void }) {
  const hardestIndex = calculation.dailyMargins.reduce((lowest, margin, index, margins) => margin < margins[lowest] ? index : lowest, 0);
  const maintained = Math.round(calculation.tier2Total);
  const floorProtectedDays = calculation.dailyMargins.filter((margin) => margin >= 0).length;
  const outcomeCounts = { Easy: 0, Fine: 0, Hard: 0, Disaster: 0 };
  taskOutcomes.forEach((record) => { outcomeCounts[record.outcome] += 1; });
  return <div className="reflection-page"><div className="screen-header"><div><p className="eyebrow">Weekly reflection <span>06 / 06</span></p><h1 className="page-heading">Week 36 Reflection</h1><p className="date-range">Sept 1 – Sept 7 · A view of what recovery looked like this week.</p></div><div className="reflection-mark"><ShieldCheck size={23} /></div></div><div className="reflection-message"><span className="message-rule" /><p>You protected your recovery this week.<br />That's what sustainable performance looks like.</p></div><div className="reflection-metrics"><MetricCard icon={<Moon size={18} />} label="Recovery Maintained" value={`${maintained} hrs`} mark="✓" tone="blue" /><MetricCard icon={<ShieldCheck size={18} />} label="Recovery Floor Breached" value="0 times" mark="✓" tone="green" /><MetricCard icon={<RotateCcw size={18} />} label="Commitments Rebalanced" value="3" mark="✓" tone="green" /><MetricCard icon={<TriangleAlert size={18} />} label={'Add Anyway Overrides'} value={String(overrideCount)} mark={overrideCount > 2 ? "!" : "—"} tone={overrideCount > 2 ? "amber" : "muted"} /><MetricCard icon={<ShieldCheck size={18} />} label="Recovery Quality" value={recoveryQuality ?? "Pending"} mark={recoveryQuality ? "✓" : "—"} tone={recoveryQuality ? "green" : "muted"} /><MetricCard icon={<ShieldCheck size={18} />} label="Recovery Consistency" value={`Floor protected ${floorProtectedDays} of 7 days`} mark={floorProtectedDays >= 5 ? "✓" : "!"} tone={floorProtectedDays >= 5 ? "green" : floorProtectedDays < 3 ? "amber" : "muted"} /></div>{taskOutcomes.length > 0 && <p className="outcome-summary-line">Task outcomes this week: {outcomeCounts.Easy} Easy · {outcomeCounts.Fine} Fine · {outcomeCounts.Hard} Hard · {outcomeCounts.Disaster} Disaster</p>}<div className="hardest-day"><div><span className="card-label">The hardest day</span><strong>Your hardest day: {DAYS[hardestIndex]}</strong><p>Next week: Consider protecting {DAYS[hardestIndex]} evening.</p></div><img src={WEEK_LINES_URL} alt="" /></div><div className="ignition-hook"><div><span className="card-label">Week 37 ignition</span><strong>Your hardest day was {DAYS[hardestIndex]}.</strong><p>Consider protecting {DAYS[hardestIndex]} evening before Week 37 begins.</p></div><button className="primary-button" onClick={onNextWeek}>Set Up Week 37 <ArrowRight size={17} /></button></div><div className="reflection-actions"><button className="secondary-button" onClick={onAdjust}><SlidersHorizontal size={17} /> Adjust Recovery Floor</button></div></div>;
}

function MetricCard({ icon, label, value, mark, tone }: { icon: ReactNode; label: string; value: string; mark: string; tone: "blue" | "green" | "amber" | "muted" }) { return <div className={`metric-card metric-${tone}`}><div className="metric-label">{icon}<span>{label}</span></div><div className="metric-value">{value}<span>{mark}</span></div></div>; }

function QuickCheck({ name, hours, suggestion, calculation, sleepHours, energyCheckIn, setName, setHours, onClose, onAdd }: { name: string; hours: number; suggestion: Suggestion; calculation: CalculationShape; sleepHours: number; energyCheckIn: EnergyCheckIn | null; setName: (value: string) => void; setHours: (value: number) => void; onClose: () => void; onAdd: () => void }) {
  const projected = calculation.margin - hours;
  const status = statusFor(projected);
  const showSleep = projected < 0;
  const lowestDayIndex = calculation.dailyMargins.reduce((lowest, margin, index, margins) => (margin < margins[lowest] ? index : lowest), 0);
  const consequenceDay = DAYS[lowestDayIndex];
  const [aiSentence, setAiSentence] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setAiLoading(true);
    const timer = setTimeout(() => {
      const energyContext = energyCheckIn ? ` The student checked in feeling "${energyCheckIn.response}" today.` : "";
      const prompt = `In one short, warm sentence (max 20 words), tell a student whether adding "${name || "this commitment"}" (${hours} hrs) to their week is safe. Their recovery margin would go from ${formatHours(calculation.margin)} to ${formatHours(projected)}, which is ${status.label.toLowerCase()}, with the tightest day being ${consequenceDay}.${energyContext} Do not use exclamation marks. No preamble, just the sentence.`;
      fetchAiSentence(prompt)
        .then((text) => { if (!cancelled) setAiSentence(text); })
        .catch(() => { if (!cancelled) setAiSentence(null); })
        .finally(() => { if (!cancelled) setAiLoading(false); });
    }, 700);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [name, hours, calculation.margin, projected, status.label, consequenceDay, energyCheckIn]);
  return <div className="sheet-backdrop" role="dialog" aria-modal="true"><div className="quick-sheet"><div className="sheet-handle" /><div className="sheet-head"><div><p className="eyebrow">Quick Check <span>Read-only simulation</span></p><h2>Can I afford this?</h2><p>Simulate any commitment before you say yes.</p></div><button className="icon-button" aria-label="Close quick check" onClick={onClose}><X size={19} /></button></div><div className="quick-form"><label className="field-label">What are you being asked to do?<input className="text-input" placeholder="e.g. Finish a lab report" value={name} onChange={(event) => setName(event.target.value)} /></label><label className="field-label">How long will it take?<div className="input-with-unit"><input className="text-input" type="number" min="0.5" step="0.5" value={hours} onChange={(event) => setHours(Number(event.target.value))} /><span>hrs</span></div></label></div><div className="quick-result"><span className="card-label">Recovery Margin after this commitment</span><strong style={{ color: status.color }}>{formatHours(calculation.margin)} <ArrowRight size={16} /> {formatHours(projected)}</strong><span className="quick-status" style={{ color: status.color }}><span className="status-dot" style={{ background: status.color }} /> {status.label} · {suggestion.cognitiveLoad} load</span>{aiLoading ? <p className="ai-sentence" style={{ opacity: 0.6 }}>Checking your week...</p> : <p className="ai-sentence">{aiSentence ?? status.copy}</p>}{showSleep && <small><Moon size={14} /> Sleep impact may land on the tightest day.</small>}</div><div className="sheet-actions"><button className="secondary-button" onClick={onClose}>Close</button><button className="primary-button" onClick={onAdd}>Add to Schedule <ArrowRight size={16} /></button></div><p className="sheet-note"><Info size={14} /> Quick Check does not change your schedule.</p></div></div>;
}

function BottomNav({ screen, onNavigate }: { screen: Screen; onNavigate: (screen: Screen) => void }) { const items: { screen: Screen; label: string; icon: ReactNode }[] = [{ screen: "dashboard", label: "Today", icon: <Grid2X2 size={18} /> }, { screen: "mirror", label: "Add Task", icon: <Plus size={19} /> }, { screen: "planner", label: "Planner", icon: <Leaf size={18} /> }, { screen: "reflection", label: "Reflection", icon: <BarChart3 size={18} /> }]; return <nav className="bottom-nav" aria-label="Primary"><div className="bottom-nav-inner">{items.map((item) => <button key={item.screen} className={`nav-item ${screen === item.screen ? "nav-item-active" : ""}`} onClick={() => onNavigate(item.screen)}>{item.icon}<span>{item.label}</span></button>)}</div></nav>; }

export default App;
