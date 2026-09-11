/*
 * MARGIN / Quiet Instrument style contract:
 * Calm technology with a Swiss-influenced information hierarchy. Recovery is the first visual anchor;
 * deep ocean frames the interface, blue marks protected recovery infrastructure, and the four state colors
 * communicate actual Recovery Margin changes. Keep whitespace generous, language observational, and agency intact.
 */
import { useEffect, useMemo, useRef, useState, type Dispatch, type MutableRefObject, type ReactNode, type SetStateAction } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
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
  Sun,
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeContext";
import { StressPatternChart } from "../components/StressPatternChart";

type Screen = "onboarding" | "dashboard" | "mirror" | "triage" | "planner" | "reflection" | "import" | "settings" | "guide" | "outcomes-summary";
type CognitiveLoad = "Low" | "Medium" | "High";
type TaskCategory = "mental" | "social" | "physical" | "errands";
type TriageOutcome = "full" | "partial" | "failure" | null;
type TaskOutcomeValue = "Easy" | "Fine" | "Hard" | "Disaster";
type TaskOutcomeRecord = { taskId: number; taskName: string; outcome: TaskOutcomeValue; timestamp: number };
type EnergyResponse = "Rough" | "Okay" | "Ready";
type EnergyType = "deepFocus" | "lowEnergy" | "social" | "physical" | "maintenance";
type EnergyCheckIn = { date: string; response: EnergyResponse };
type MoodValue = "Drained" | "Okay" | "Good" | "Energized";
type MoodCheckIn = { date: string; value: MoodValue };
type ChatMessage = { role: "user" | "assistant"; content: string; isError?: boolean; isTruncated?: boolean };
type RiskAssessment = { score: number; label: "Low" | "Moderate" | "High" | "Critical"; trend: "improving" | "stable" | "worsening"; trendSlope: number };

type FixedCommitment = {
  id: number;
  name: string;
  days: string[];
  startTime: string;
  endTime: string;
  hours: number;
};

type VisionCommitment = {
  id: number;
  name: string;
  days: string[];
  timeRange: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  category: TaskCategory;
};

type FlexibleTask = {
  id: number;
  name: string;
  estimatedHours: number;
  cognitiveLoad: CognitiveLoad;
  deadline: string;
  deferred: boolean;
  category: TaskCategory;
  energy?: EnergyType;
};

type RecoveryBlock = {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  type: string;
  locked: boolean;
};
type WeeklyPlan = { hardestDay: string; loadDescription: string; taskToMove: FlexibleTask | null; blockToLock: RecoveryBlock | undefined };

type Suggestion = {
  range: string;
  midpoint: number;
  cognitiveLoad: CognitiveLoad;
  category: TaskCategory;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CALENDAR_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
const currentWeekKey = () => {
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return monday.toDateString();
};
const RECOVERY_MENU = {
  10: [{ name: "Step outside", detail: "Just air and light, no phone" }, { name: "Stretch", detail: "Neck, shoulders, back — desk-side" }, { name: "Breathing reset", detail: "4 counts in, 6 counts out, x5" }],
  30: [{ name: "Short walk", detail: "Around the block, no destination" }, { name: "Nap", detail: "Set a 25-min alarm, no more" }, { name: "Call someone", detail: "A real conversation, not a text" }],
  120: [{ name: "Full workout", detail: "Gym, run, or sport" }, { name: "Social time", detail: "See a friend, no agenda" }, { name: "Deep sleep block", detail: "A real nap or early night" }],
} as const;

const IMPORTED_TIMETABLE: FixedCommitment[] = [
  { id: 901, name: "Design studio", days: ["Mon", "Wed"], startTime: "09:00", endTime: "11:00", hours: 4 },
  { id: 902, name: "Statistics lab", days: ["Thu"], startTime: "14:00", endTime: "16:00", hours: 2 },
];

const VISION_TIMETABLE_PROMPT = `Extract all scheduled commitments from this timetable image. For each commitment, return:
- Name (e.g. "Seminar", "Gym", "Lecture")
- Day(s) of week (Monday, Tuesday, etc.)
- Time range (e.g. "10:00-12:00" or "9am-12pm")
- Duration in hours (calculate from time range)
- Category guess based on name: Mental, Physical, Social, or Errands

Return ONLY a JSON array with no preamble:
[
  {
    "name": "Seminar",
    "days": ["Monday", "Wednesday"],
    "timeRange": "10:00-12:00",
    "durationHours": 2,
    "category": "Mental"
  }
]

If you can't read the timetable or extract commitments, return an empty array [].`;

const normalizeVisionDay = (value: unknown) => {
  const text = String(value ?? "").trim().toLowerCase();
  return DAYS.find((day) => day.toLowerCase().startsWith(text.slice(0, 3))) ?? null;
};

const normalizeVisionCategory = (value: unknown): TaskCategory => {
  const text = String(value ?? "").trim().toLowerCase();
  if (text.includes("physical")) return "physical";
  if (text.includes("social")) return "social";
  if (text.includes("errand")) return "errands";
  return "mental";
};

const parseVisionTime = (value: unknown) => {
  const raw = String(value ?? "").trim().toLowerCase().replace(/\./g, "");
  const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;
  let hour = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  if (minutes > 59) return null;
  if (match[3] === "pm" && hour < 12) hour += 12;
  if (match[3] === "am" && hour === 12) hour = 0;
  if (hour > 23) return null;
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const parseVisionTimeRange = (value: unknown) => {
  const parts = String(value ?? "").replace(/[–—]/g, "-").split(/\s*-\s*/);
  if (parts.length !== 2) return null;
  const startTime = parseVisionTime(parts[0]);
  const endTime = parseVisionTime(parts[1]);
  if (!startTime || !endTime) return null;
  return { startTime, endTime };
};

const parseVisionCommitments = (rawText: string): VisionCommitment[] => {
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start < 0 || end < start) return [];
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const name = String(record.name ?? "").trim();
    const days = Array.isArray(record.days) ? Array.from(new Set(record.days.map(normalizeVisionDay).filter((day): day is string => Boolean(day)))) : [];
    const range = parseVisionTimeRange(record.timeRange);
    if (!name || !days.length || !range) return [];
    const parsedDuration = Number(record.durationHours);
    const durationHours = Number((Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : durationBetween(range.startTime, range.endTime)).toFixed(1));
    return [{ id: Date.now() + index, name, days, timeRange: `${range.startTime}–${range.endTime}`, startTime: range.startTime, endTime: range.endTime, durationHours, category: normalizeVisionCategory(record.category) }];
  });
};

const visionFromFixedCommitment = (item: FixedCommitment): VisionCommitment => ({
  id: item.id,
  name: item.name,
  days: item.days,
  timeRange: `${item.startTime}–${item.endTime}`,
  startTime: item.startTime,
  endTime: item.endTime,
  durationHours: Number((item.hours / Math.max(1, item.days.length)).toFixed(1)),
  category: normalizeVisionCategory(item.name),
});

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
type ToastTaskDraft = { name: string; hours: number; deadline: string; suggestion: Suggestion };
type ToastTaskConsequence = { projectedMargin: number; projectedDailyMargin: number; isAtRisk: boolean; day: string; riskHours: number; restBefore: number; restAfter: number; frame: "week" | "day" };

const extractDuration = (text: string): { hours: number | null; cleanText: string } => {
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b)/i);
  const minMatch = text.match(/(\d+)\s*(?:minutes?|mins?)/i);
  if (hourMatch) return { hours: parseFloat(hourMatch[1]), cleanText: text.replace(hourMatch[0], "").trim() };
  if (minMatch) return { hours: Math.round((parseInt(minMatch[1], 10) / 60) * 4) / 4, cleanText: text.replace(minMatch[0], "").trim() };
  return { hours: null, cleanText: text };
};

const extractTimeOfDay = (text: string): { time: string | null; cleanText: string } => {
  const timeMatch = text.match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i);
  if (!timeMatch) return { time: null, cleanText: text };
  return { time: timeMatch[1].toLowerCase().replace(/\s+/g, ""), cleanText: text.replace(timeMatch[0], "").trim() };
};

const extractDay = (text: string): { day: string | null; cleanText: string } => {
  const todayIndex = (new Date().getDay() + 6) % 7;
  const dayWords: Record<string, string> = {
    monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
    today: DAYS[todayIndex], tomorrow: DAYS[(todayIndex + 1) % DAYS.length],
  };
  for (const [word, day] of Object.entries(dayWords)) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(text)) return { day, cleanText: text.replace(regex, "").trim() };
  }
  return { day: null, cleanText: text };
};

const parseTaskText = (rawText: string, fallbackDay: string) => {
  const { hours, cleanText: afterDuration } = extractDuration(rawText);
  const { time, cleanText: afterTime } = extractTimeOfDay(afterDuration);
  const { day, cleanText: afterDay } = extractDay(afterTime);
  const baseName = afterDay.replace(/\s*(?:for|on|,)\s*$/i, "").trim() || "Untitled task";
  const suggestion = suggestionFor(baseName);
  return { name: time ? `${baseName} (${time})` : baseName, hours, day: day ?? fallbackDay, explicitDay: day, suggestion };
};

type SpeechRecognitionOptions = {
  recognitionRef: MutableRefObject<any>;
  onTranscript: (text: string) => void;
  onListeningChange: (listening: boolean) => void;
  onUnsupported: () => void;
};

const runSpeechRecognition = ({ recognitionRef, onTranscript, onListeningChange, onUnsupported }: SpeechRecognitionOptions) => {
  if (typeof window === "undefined") return;
  const browserWindow = window as Window & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
  const SpeechRecognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
  if (!SpeechRecognition) { onUnsupported(); return; }
  recognitionRef.current?.abort?.();
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.onstart = () => onListeningChange(true);
  recognition.onresult = (event: any) => {
    let transcript = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) transcript += `${event.results[index][0].transcript} `;
    onTranscript(transcript.trim());
  };
  recognition.onerror = (event: { error?: string }) => {
    if (event.error === "not-allowed" || event.error === "service-not-allowed") toast.error("Please enable microphone in your browser settings");
    else if (event.error === "no-speech") toast.error("Couldn't hear you — try again");
    else toast.error("Couldn't hear you — try again");
    onListeningChange(false);
  };
  recognition.onend = () => { onListeningChange(false); recognitionRef.current = null; };
  recognitionRef.current = recognition;
  try { recognition.start(); } catch { onListeningChange(false); toast.error("Couldn't start speech recognition — try again"); }
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

const TOTAL_WEEK_HOURS = 168;

const capacityPercent = (availableHours: number, totalHours: number = TOTAL_WEEK_HOURS) => {
  return Math.round(Math.max(0, Math.min(1, availableHours / totalHours)) * 100);
};
const calculationForSimulation = (projectedMargin: number, draftHours: number, scenarioHours: number) => projectedMargin + draftHours - scenarioHours;
const fullDayName = (day: string) => CALENDAR_DAYS.find((name) => name.toLowerCase().startsWith(day.slice(0, 3).toLowerCase())) ?? day;
type DayRisk = { day: string; totalHours: number; load: { mental: number; physical: number; social: number; fixed: number }; hasRecoveryBlock: boolean; riskLevel: "high" | "medium" | "low"; riskNarrative: string };
const analyzeDayRisk = (day: string, tasks: FlexibleTask[], fixedCommitments: FixedCommitment[], recoveryBlocks: RecoveryBlock[]): DayRisk => {
  const dayTasks = tasks.filter((task) => !task.deferred && task.deadline.toLowerCase().startsWith(day.slice(0, 3).toLowerCase()));
  const dayFixed = fixedCommitments.filter((commitment) => commitment.days.some((commitmentDay) => commitmentDay.toLowerCase().startsWith(day.slice(0, 3).toLowerCase())));
  const load = { mental: dayTasks.filter((task) => task.category === "mental").length, physical: dayTasks.filter((task) => task.category === "physical" || task.category === "errands").length, social: dayTasks.filter((task) => task.category === "social").length, fixed: dayFixed.length };
  const totalHours = dayTasks.reduce((sum, task) => sum + task.estimatedHours, 0) + dayFixed.reduce((sum, commitment) => sum + commitment.hours / Math.max(1, commitment.days.length), 0);
  const hasRecoveryBlock = recoveryBlocks.some((block) => block.locked && block.day.toLowerCase().startsWith(day.slice(0, 3).toLowerCase()));
  let score = totalHours > 10 ? 30 : totalHours > 8 ? 15 : 0;
  score += load.mental >= 3 ? 25 : load.mental === 2 ? 10 : 0;
  if (Object.values(load).filter((value) => value > 0).length >= 3) score += 20;
  if (!hasRecoveryBlock) score += 15;
  const stressors: string[] = [];
  if (load.mental >= 3) stressors.push(`${load.mental} mental-load tasks`);
  if (load.physical >= 2) stressors.push(`${load.physical} physical tasks`);
  if (load.social >= 2) stressors.push(`${load.social} social commitments`);
  if (load.fixed >= 1) stressors.push(load.fixed === 1 ? "a shift or fixed commitment" : `${load.fixed} fixed commitments`);
  if (!hasRecoveryBlock) stressors.push("no protected recovery time");
  const readableDay = fullDayName(day);
  return { day, totalHours, load, hasRecoveryBlock, riskLevel: score > 60 ? "high" : score > 30 ? "medium" : "low", riskNarrative: stressors.length ? `${readableDay} has ${stressors.join(", ")}. Consider protecting recovery.` : `${readableDay} is manageable.` };
};
const analyzeWeekRisk = (tasks: FlexibleTask[], fixedCommitments: FixedCommitment[], recoveryBlocks: RecoveryBlock[]) => DAYS.map((day) => analyzeDayRisk(day, tasks, fixedCommitments, recoveryBlocks));
type WeeklyRiskSummary = { isAtRisk: boolean; hoursAtRisk: number; hardestDay: string; reason: string };
const getWeeklyRiskSummary = (tasks: FlexibleTask[], fixedCommitments: FixedCommitment[], recoveryBlocks: RecoveryBlock[], calculation: CalculationShape): WeeklyRiskSummary => {
  const riskDays = analyzeWeekRisk(tasks, fixedCommitments, recoveryBlocks).filter((day) => day.riskLevel !== "low");
  const hardestDay = riskDays.sort((a, b) => b.totalHours - a.totalHours)[0] ?? analyzeWeekRisk(tasks, fixedCommitments, recoveryBlocks).sort((a, b) => a.totalHours - b.totalHours).at(-1);
  const isAtRisk = calculation.margin <= 5 || riskDays.length > 0;
  const dailyRecoveryFloorHours = Math.max(0, (calculation.tier2Total - calculation.recoveryBlockTotal) / 7);
  const hoursAtRisk = Math.max(0, Math.round((dailyRecoveryFloorHours + (hardestDay?.totalHours ?? 0) - 24) * 10) / 10);
  return {
    isAtRisk,
    hoursAtRisk,
    hardestDay: hardestDay ? fullDayName(hardestDay.day) : "Your week",
    reason: hardestDay?.riskNarrative.replace(`${fullDayName(hardestDay.day)} has `, "").replace(/\. Consider protecting recovery\.$/, "") ?? "your recovery margin is getting narrow",
  };
};
const ENERGY_LABELS: Record<EnergyType, string> = { deepFocus: "Deep focus (coding, writing, analysis)", lowEnergy: "Low energy (admin, organization, simple tasks)", social: "Social (meetings, collaboration)", physical: "Physical (exercise, errands)", maintenance: "Maintenance (sleep, meals, breaks)" };
type EnergyRecommendation = { day: string; reason: string; capacity: number } | null;
const analyzeWeeklyEnergyCapacity = (tasks: FlexibleTask[], fixedCommitments: FixedCommitment[], recoveryBlocks: RecoveryBlock[]) => Object.fromEntries(DAYS.map((day) => {
  const dayTasks = tasks.filter((task) => !task.deferred && task.deadline.toLowerCase().startsWith(day.toLowerCase().slice(0, 3)));
  const fixed = fixedCommitments.filter((commitment) => commitment.days.some((commitmentDay) => commitmentDay.toLowerCase().startsWith(day.toLowerCase().slice(0, 3))));
  const mentalLoad = dayTasks.filter((task) => (task.energy ?? (task.category === "mental" ? "deepFocus" : "lowEnergy")) === "deepFocus").length;
  const socialLoad = dayTasks.filter((task) => (task.energy ?? task.category) === "social").length + fixed.length;
  const hasRecovery = recoveryBlocks.some((block) => block.locked && block.day.toLowerCase().startsWith(day.toLowerCase().slice(0, 3)));
  return [day, { deepFocus: Math.max(0, (mentalLoad < 2 && fixed.length === 0) ? 3 : 1), lowEnergy: hasRecovery ? 2 : 1, social: Math.max(0, 3 - socialLoad), physical: mentalLoad < 2 ? 2 : 1, maintenance: hasRecovery ? 3 : 1 }];
})) as Record<string, Record<EnergyType, number>>;
const recommendBestEnergySlot = (energy: EnergyType, tasks: FlexibleTask[], fixedCommitments: FixedCommitment[], recoveryBlocks: RecoveryBlock[]): EnergyRecommendation => {
  const capacity = analyzeWeeklyEnergyCapacity(tasks, fixedCommitments, recoveryBlocks);
  const best = DAYS.map((day) => ({ day, score: capacity[day][energy] })).sort((a, b) => b.score - a.score)[0];
  if (!best || best.score <= 0) return null;
  const time = energy === "deepFocus" ? "morning" : energy === "physical" ? "afternoon" : energy === "lowEnergy" || energy === "maintenance" ? "after your recovery block" : "available collaboration time";
  const reasons: Record<EnergyType, string> = { deepFocus: `This needs uninterrupted focus. ${best.day} ${time} is clear with high mental capacity.`, lowEnergy: `This is routine work. ${best.day} has a calm slot after recovery.`, social: `This needs collaboration energy. ${best.day} has available social capacity.`, physical: `This is movement-based. ${best.day} ${time} fits before evening wind-down.`, maintenance: `Protect maintenance time on ${best.day}; recovery capacity is available.` };
  return { day: best.day, reason: reasons[energy], capacity: best.score };
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

const LAST_MOOD_CHECK_KEY = "lastMoodCheck";
const MOOD_LOG_KEY = "moodLog";
const MOOD_CHECK_INTERVAL = 4 * 60 * 60 * 1000;
const MOOD_CHECKS_PREFIX = "mood-checks-";
const ENERGY_CHECKS_PREFIX = "energy-checks-";
const MOOD_SCALE: Record<MoodValue, number> = { Drained: 1, Okay: 2, Good: 3, Energized: 4 };

const localDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const entryDateKey = (value: string) => localDateKey(new Date(value));
const readStoredChecks = <T,>(prefix: string, date: Date) => {
  if (typeof window === "undefined") return [] as T[];
  try {
    const stored = JSON.parse(window.localStorage.getItem(`${prefix}${localDateKey(date)}`) ?? "[]");
    return Array.isArray(stored) ? stored as T[] : [];
  } catch { return [] as T[]; }
};
const calculateDailyMoodAverage = (date: Date, checks: MoodCheckIn[] = readStoredChecks<MoodCheckIn>(MOOD_CHECKS_PREFIX, date)) => {
  const matching = checks.filter((check) => entryDateKey(check.date) === localDateKey(date));
  if (!matching.length) return null;
  return matching.reduce((sum, check) => sum + MOOD_SCALE[check.value], 0) / matching.length;
};
const loadStoredMoodChecks = () => {
  if (typeof window === "undefined") return [] as MoodCheckIn[];
  const checks: MoodCheckIn[] = [];
  for (let offset = 0; offset < 14; offset += 1) { const date = new Date(); date.setDate(date.getDate() - offset); checks.push(...readStoredChecks<MoodCheckIn>(MOOD_CHECKS_PREFIX, date)); }
  return checks;
};
const loadStoredEnergyChecks = () => {
  if (typeof window === "undefined") return [] as EnergyCheckIn[];
  const checks: EnergyCheckIn[] = [];
  for (let offset = 0; offset < 14; offset += 1) { const date = new Date(); date.setDate(date.getDate() - offset); checks.push(...readStoredChecks<EnergyCheckIn>(ENERGY_CHECKS_PREFIX, date)); }
  return checks;
};

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

type TaskUrgency = "critical" | "urgent" | "normal" | "flexible";
const dueDateForTask = (deadline: string | undefined, today = new Date()) => {
  if (!deadline) return null;
  const targetIndex = CALENDAR_DAYS.findIndex((day) => day.toLowerCase().startsWith(deadline.trim().toLowerCase().slice(0, 3)));
  if (targetIndex < 0) return null;
  const current = new Date(today);
  current.setHours(0, 0, 0, 0);
  current.setDate(current.getDate() + (targetIndex - current.getDay() + 7) % 7);
  return current;
};
const taskUrgency = (deadline: string | undefined, today = new Date()): { tier: TaskUrgency; daysUntil: number | null } => {
  const dueDate = dueDateForTask(deadline, today);
  if (!dueDate) return { tier: "flexible", daysUntil: null };
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  const daysUntil = Math.round((dueDate.getTime() - startOfToday.getTime()) / 86400000);
  if (daysUntil <= 0) return { tier: "critical", daysUntil };
  if (daysUntil === 1) return { tier: "urgent", daysUntil };
  if (daysUntil <= 4) return { tier: "normal", daysUntil };
  return { tier: "flexible", daysUntil };
};
const dueLabelForTask = (deadline: string | undefined, today = new Date()) => {
  const dueDate = dueDateForTask(deadline, today);
  if (!dueDate) return { label: "no deadline", urgency: "flexible" as TaskUrgency };
  const { tier, daysUntil: calculatedDaysUntil } = taskUrgency(deadline, today);
  const daysUntil = calculatedDaysUntil ?? 0;
  if (daysUntil <= 0) return { label: "today", urgency: tier };
  if (daysUntil === 1) return { label: "tomorrow", urgency: tier };
  return { label: dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }), urgency: tier };
};
const calculateDeadlinePressure = (task: FlexibleTask, dailyMargins: number[]) => {
  const todayDayIndex = (new Date().getDay() + 6) % 7;
  const deadlineIndex = DAYS.findIndex((day) => day.toLowerCase() === task.deadline.trim().toLowerCase().slice(0, 3));
  if (deadlineIndex < 0) return { daysRemaining: 0, requiredMinutesPerDay: Math.ceil(task.estimatedHours * 60), unsafeDays: [] as string[] };
  const daysRemaining = deadlineIndex >= todayDayIndex ? deadlineIndex - todayDayIndex : 7 - todayDayIndex + deadlineIndex;
  const requiredMinutesPerDay = daysRemaining > 0 ? Math.ceil((task.estimatedHours * 60) / daysRemaining) : Math.ceil(task.estimatedHours * 60);
  const unsafeDays: string[] = [];
  for (let offset = 0; offset <= daysRemaining; offset += 1) {
    const dayIndex = (todayDayIndex + offset) % 7;
    if (dailyMargins[dayIndex] < 5) unsafeDays.push(DAYS[dayIndex]);
  }
  return { daysRemaining, requiredMinutesPerDay, unsafeDays };
};
const formatDeadlineSentence = (task: FlexibleTask, pressure: ReturnType<typeof calculateDeadlinePressure>) => {
  const { daysRemaining, requiredMinutesPerDay, unsafeDays } = pressure;
  if (daysRemaining === 0) return `${task.name} due today.`;
  const paceText = requiredMinutesPerDay >= 60 ? `${(requiredMinutesPerDay / 60).toFixed(1)}h/day` : `${requiredMinutesPerDay} min/day`;
  const dayWord = daysRemaining === 1 ? "day" : "days";
  if (unsafeDays.length) return `${task.name} due in ${daysRemaining} ${dayWord} — you need ${paceText}, but ${unsafeDays.join(", ")} ${unsafeDays.length > 1 ? "are" : "is"} unsafe.`;
  return `${task.name} due in ${daysRemaining} ${dayWord} — ${paceText} keeps you on track.`;
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
type ProtectedOutcomes = { protectedMargin: number; conflictsRemoved: number; protectedSleep: number };
const calculateProtectedOutcomes = (beforeMargin: number, afterMargin: number, beforeRecoveryBlocks: number, afterRecoveryBlocks: number, beforeSleepHours: number, afterSleepHours: number): ProtectedOutcomes => ({
  protectedMargin: Math.round((afterMargin - beforeMargin) * 10) / 10,
  conflictsRemoved: Math.max(0, beforeRecoveryBlocks - afterRecoveryBlocks),
  protectedSleep: Math.round((afterSleepHours - beforeSleepHours) * 10) / 10,
});
const calculateRiskMessage = (outcomes: ProtectedOutcomes) => outcomes.protectedMargin > 10 ? "You've restored a healthy margin. You can handle new work." : outcomes.protectedMargin > 5 ? "Your week is now balanced. Be careful with additional tasks." : outcomes.protectedMargin > 0 ? "Better, but still tight. Consider protecting more recovery time." : "You're still in deficit. More rebalancing needed.";

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

function ToastNotification({ screen, lastMoodCheck, onMoodSelect, onShowRecoveryMenu, demoTrigger, blocked, onVisibilityChange }: { screen: Screen; lastMoodCheck: number | null; onMoodSelect: (value: MoodValue) => void; onShowRecoveryMenu: () => void; demoTrigger: number; blocked: boolean; onVisibilityChange: (visible: boolean) => void }) {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const readLastMoodCheck = () => {
    if (typeof window === "undefined") return lastMoodCheck ?? 0;
    const stored = Number(window.localStorage.getItem(LAST_MOOD_CHECK_KEY));
    return Math.max(Number.isFinite(stored) ? stored : 0, lastMoodCheck ?? 0);
  };

  const markDismissed = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (typeof window !== "undefined") window.localStorage.setItem(LAST_MOOD_CHECK_KEY, String(Date.now()));
    setDismissing(true);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setDismissing(false);
      onVisibilityChange(false);
    }, 200);
  };

  useEffect(() => {
    if (!demoTrigger) return;
    if (blocked) return;
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setDismissing(false);
    setVisible(true);
    onVisibilityChange(true);
    dismissTimerRef.current = setTimeout(markDismissed, 8000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked, demoTrigger, onVisibilityChange]);

  useEffect(() => {
    if (blocked || visible || dismissing) return;
    if (typeof window !== "undefined" && JSON.parse(window.localStorage.getItem("notifications-enabled") ?? "true") === false) return;
    const lastCheck = readLastMoodCheck();
    const interval = typeof window !== "undefined" ? window.localStorage.getItem("notification-interval") ?? "4" : "4";
    if (interval === "manual") return;
    const now = new Date();
    const lastDate = lastCheck ? new Date(lastCheck) : null;
    const todayAt = (hour: number) => { const date = new Date(now); date.setHours(hour, 0, 0, 0); return date.getTime(); };
    const scheduledEligible = interval === "once" ? now.getTime() >= todayAt(9) && (!lastDate || lastDate.getTime() < todayAt(9)) : interval === "twice" ? (now.getTime() >= todayAt(17) && (!lastDate || lastDate.getTime() < todayAt(17))) || (now.getTime() >= todayAt(9) && (!lastDate || lastDate.getTime() < todayAt(9))) : false;
    const eligible = interval === "once" || interval === "twice" ? scheduledEligible : !lastCheck || Date.now() - lastCheck >= Number(interval) * 60 * 60 * 1000;
    if (!eligible) return;
    setVisible(true);
    onVisibilityChange(true);
    dismissTimerRef.current = setTimeout(markDismissed, 8000);
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
    // Navigation re-evaluates eligibility without allowing stacked notifications.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked, screen, lastMoodCheck, visible, dismissing, onVisibilityChange]);

  useEffect(() => () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  if (!visible || blocked) return null;
  return (
    <div className={`toast-notification${dismissing ? " toast-notification-dismissing" : ""}`} role="status" aria-live="polite">
      <div className="toast-notification-title">🎯 How are you feeling right now?</div>
      <div className="toast-notification-actions">
        {MOOD_OPTIONS.map((option) => (
          <button key={option.value} type="button" className={`toast-mood-button toast-mood-${option.value.toLowerCase()}`} onClick={() => { onMoodSelect(option.value); markDismissed(); }}>
            {option.value}
          </button>
        ))}
      </div>
      <button className="toast-recovery-action" type="button" onClick={() => { onShowRecoveryMenu(); markDismissed(); }}>Show me recovery options</button>
    </div>
  );
}

function TaskQuickAddToast({ presets, onPreviewTask, consequence, draft, onConfirmTask, onChooseLighterDay, onViewDashboard, onClose }: { presets: typeof QUICK_ADD_PRESETS; onPreviewTask: (name: string, hours: number, deadline?: string) => void; consequence: ToastTaskConsequence | null; draft: ToastTaskDraft | null; onConfirmTask: () => void; onChooseLighterDay: () => void; onViewDashboard: () => void; onClose: () => void }) {
  const [notifStep, setNotifStep] = useState<"gate" | "input" | "consequence" | "done">("gate");
  const [noCatchphrase, setNoCatchphrase] = useState("");
  const [otherText, setOtherText] = useState("");
  const [otherHours, setOtherHours] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const submitOther = () => {
    const name = otherText.trim();
    if (!name) return;
    const parsed = parseTaskText(name, DAYS[(new Date().getDay() + 6) % 7]);
    const hours = otherHours ? Number.parseFloat(otherHours) : parsed.hours ?? parsed.suggestion.midpoint;
    if (Number.isFinite(hours) && hours > 0) { onPreviewTask(parsed.name, hours, parsed.day); setNotifStep("consequence"); }
  };
  const handleNo = () => {
    const phrases = ["Nice — one less thing to think about.", "Clear plate today. Enjoy it.", "Good. Go protect that margin instead.", "Noted — go do something that isn't a task."];
    setNoCatchphrase(phrases[Math.floor(Math.random() * phrases.length)]);
    setNotifStep("done");
    window.setTimeout(onClose, 2500);
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    const browserWindow = window as Window & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    setSpeechSupported(Boolean(browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition));
    return () => recognitionRef.current?.abort?.();
  }, []);
  return <div className="task-toast" role={notifStep === "consequence" ? "dialog" : "status"} aria-live="polite"><div className="task-toast-head"><span>{notifStep === "gate" ? "📝 Got any tasks to add today?" : notifStep === "input" ? "What's the task?" : notifStep === "done" ? noCatchphrase : `Adding "${draft?.name ?? ""}" (${draft ? formatShortHours(draft.hours) : ""})`}</span>{notifStep !== "done" && <button className="task-toast-close" type="button" aria-label="Close task prompt" onClick={onClose}><X size={16} /></button>}</div>{notifStep === "gate" && <div className="task-toast-actions"><button type="button" className="primary-button" onClick={() => setNotifStep("input")}>Yes</button><button type="button" className="secondary-button" onClick={handleNo}>No</button></div>}{notifStep === "input" && <><div className="task-toast-presets">{presets.map((preset) => <button key={preset.name} type="button" className="task-toast-chip" onClick={() => { setOtherText(preset.name); setOtherHours(String(preset.hours)); }}>{preset.name}</button>)}</div><div className="task-toast-other-row"><button type="button" className={`mic-button${isListening ? " listening" : ""}`} aria-label="Speak a task" disabled={!speechSupported} onClick={() => runSpeechRecognition({ recognitionRef, onTranscript: (text) => { const parsed = extractDuration(text); setOtherText(parsed.cleanText); if (parsed.hours !== null) setOtherHours(String(parsed.hours)); }, onListeningChange: setIsListening, onUnsupported: () => { setSpeechSupported(false); toast.error("Speech not supported on this device"); } })}>🎤</button><input className="text-input" placeholder="Type here..." value={otherText} onChange={(event) => setOtherText(event.target.value)} /><input className="hours-input" type="number" min="0.5" step="0.5" placeholder="h" aria-label="Estimated hours" value={otherHours} onChange={(event) => setOtherHours(event.target.value)} /></div><button type="button" className="primary-button" disabled={!otherText.trim()} onClick={submitOther}>Continue <ArrowRight size={16} /></button></>}{notifStep === "consequence" && consequence && draft && <><p className="consequence-summary">{consequence.frame === "day" ? `You'll have ${formatHours(consequence.restAfter)} hrs to rest ${consequence.day === DAYS[(new Date().getDay() + 6) % 7] ? "today" : `on ${consequence.day}`} (was ${formatHours(consequence.restBefore)} hrs).` : `You'll have ${formatHours(consequence.restAfter)} hrs left for rest and recovery this week (was ${formatHours(consequence.restBefore)} hrs).`}</p>{consequence.isAtRisk ? <p className="task-consequence-warning">⚠️ {consequence.day} would risk {formatShortHours(consequence.riskHours)} of recovery.</p> : <p className="task-consequence-safe">✓ Still comfortable</p>}<div className="task-toast-actions"><button type="button" className="primary-button" onClick={() => { onConfirmTask(); setNotifStep("done"); }}>Yes, add it</button><button type="button" className="secondary-button" onClick={onClose}>No, skip</button></div></>}{notifStep === "done" && noCatchphrase === "" && <><p className="task-consequence-safe">Added ✓</p><div className="task-toast-actions"><button type="button" className="primary-button" onClick={onViewDashboard}>View on Dashboard</button><button type="button" className="secondary-button" onClick={onClose}>Done</button></div></>}</div>;
}

function RiskNotificationToast({ risk, availableHours, onCheckWeek, onAddTask, onClose }: { risk: WeeklyRiskSummary; availableHours: number; onCheckWeek: () => void; onAddTask: () => void; onClose: () => void }) {
  return <div className="risk-toast" role="status" aria-live="polite"><div className="risk-toast-head"><strong>{risk.isAtRisk ? `⚠️ You're risking ${formatShortHours(risk.hoursAtRisk)} of recovery this week` : `✓ Recovery margin steady — ${formatShortHours(availableHours)} available this week`}</strong><button className="icon-button" aria-label="Close recovery check-in" onClick={onClose}><X size={16} /></button></div>{risk.isAtRisk && <p className="risk-toast-detail">{risk.hardestDay} is tightest — {risk.reason}.</p>}<div className="risk-toast-actions"><button className="secondary-button" onClick={onCheckWeek}>Check my week</button><button className="text-button" onClick={onAddTask}>Add a task</button></div></div>;
}

// Retrieval step of the RAG loop: pulls the student's own locally-stored data (schedule, check-ins,
// outcomes) into a structured context block so the model answers from real facts, not invented ones.
const buildUserContext = ({ calculation, tasks, sleepHours, decompHours, risk }: { calculation: CalculationShape; tasks: FlexibleTask[]; sleepHours: number; decompHours: number; risk: RiskAssessment }) => {
  const activeTasks = tasks.filter((task) => !task.deferred);
  const taskLines = activeTasks.length ? activeTasks.map((task) => `- ${task.name} (${task.estimatedHours}h, ${task.cognitiveLoad} load, ${categoryLabel(task.category)}, due ${task.deadline})`).join("\n") : "- none scheduled";
  const dayLines = DAYS.map((day, index) => `${day} ${formatShortHours(calculation.dailyMargins[index])}`).join(", ");

  return `USER'S CURRENT WEEK (retrieved from their local schedule and check-ins):
Recovery Margin: ${formatHours(calculation.margin)} (${calculation.status.label})
Recovery Floor: ${sleepHours}h sleep + ${decompHours}h decompression, protected nightly
Daily margin by day: ${dayLines}
Longest consecutive high-load run: ${calculation.longestRun} day(s)
Active tasks this week:
${taskLines}
Computed burnout risk (regression over check-in trend + schedule pressure): ${risk.score}/100, ${risk.label}, trend ${risk.trend}`;
};

function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const renderDiagnosticsRef = useRef({ screen, count: 0, startedAt: Date.now(), warned: false });
  const [sleepHours, setSleepHours] = useState(7);
  const [decompHours, setDecompHours] = useState(1);
  const [fixedCommitments, setFixedCommitments] = useState<FixedCommitment[]>(initialFixedCommitments);
  const [tasks, setTasks] = useState<FlexibleTask[]>(initialTasks);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const [recoveryBlocks, setRecoveryBlocks] = useState<RecoveryBlock[]>([]);
  const [overrideCount, setOverrideCount] = useState(0);
  const [triageMarginOverride, setTriageMarginOverride] = useState<number | null>(null);
  const [triageOutcomeDeficit, setTriageOutcomeDeficit] = useState<number | null>(null);
  const [showQuickCheck, setShowQuickCheck] = useState(false);
  const [showRecoveryMenu, setShowRecoveryMenu] = useState(false);
  const [showConsequencePreview, setShowConsequencePreview] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const [importExtracted, setImportExtracted] = useState<VisionCommitment[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [editingImportId, setEditingImportId] = useState<number | null>(null);
  const [quickName, setQuickName] = useState("");
  const [quickHours, setQuickHours] = useState(1);
  const [draftName, setDraftName] = useState("");
  const [draftHours, setDraftHours] = useState(1);
  const [draftDeadline, setDraftDeadline] = useState("Thu");
  const [draftEnergy, setDraftEnergy] = useState<EnergyType>("deepFocus");
  const [draftEstimateTouched, setDraftEstimateTouched] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [confirmBreach, setConfirmBreach] = useState(false);
  const [selectedTriage, setSelectedTriage] = useState<number[]>([]);
  const [triageOutcome, setTriageOutcome] = useState<TriageOutcome>(null);
  const [protectedOutcomes, setProtectedOutcomes] = useState<ProtectedOutcomes | null>(null);
  const [riskRepairMessage, setRiskRepairMessage] = useState<string | null>(null);
  const [showCommitmentForm, setShowCommitmentForm] = useState(false);
  const [commitmentName, setCommitmentName] = useState("");
  const [commitmentDays, setCommitmentDays] = useState<string[]>([]);
  const [commitmentStart, setCommitmentStart] = useState("09:00");
  const [commitmentEnd, setCommitmentEnd] = useState("11:00");
  const [plannerMessage, setPlannerMessage] = useState("");
  const [unlockTarget, setUnlockTarget] = useState<number | "all" | null>(null);
  const [recoveryQuality, setRecoveryQuality] = useState<"Fully" | "Partially" | "Not really" | null>(null);
  const [recoveryQualityDismissed, setRecoveryQualityDismissed] = useState(false);
  const [taskOutcomes, setTaskOutcomes] = useState<TaskOutcomeRecord[]>([]);
  const [energyCheckIns, setEnergyCheckIns] = useState<EnergyCheckIn[]>(loadStoredEnergyChecks);
  const [moodCheckIns, setMoodCheckIns] = useState<MoodCheckIn[]>(loadStoredMoodChecks);
  const [lastMoodCheck, setLastMoodCheck] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = Number(window.localStorage.getItem(LAST_MOOD_CHECK_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  });
  const [demoNotificationToken, setDemoNotificationToken] = useState(0);
  const [showMoodToast, setShowMoodToast] = useState(false);
  const [showRiskToast, setShowRiskToast] = useState(false);
  const [showTaskToast, setShowTaskToast] = useState(false);
  const [toastTaskDraft, setToastTaskDraft] = useState<ToastTaskDraft | null>(null);
  const [toastTaskConsequence, setToastTaskConsequence] = useState<ToastTaskConsequence | null>(null);
  const [lastToastTaskId, setLastToastTaskId] = useState<number | null>(null);
  const lastToastTaskIdRef = useRef<number | null>(null);
  const [showDeprioritizedBanner, setShowDeprioritizedBanner] = useState(false);
  const [taskToastPresets, setTaskToastPresets] = useState(QUICK_ADD_PRESETS.slice(0, 3));
  const taskToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [checkInNotice, setCheckInNotice] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [survivalPlanDismissedWeek, setSurvivalPlanDismissedWeek] = useState<string | null>(() => typeof window === "undefined" ? null : window.localStorage.getItem("survivalPlanDismissedWeek"));
  const [showWeeklyPlanPreview, setShowWeeklyPlanPreview] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [guideReturnScreen, setGuideReturnScreen] = useState<Screen>("dashboard");

  const renderDiagnostics = renderDiagnosticsRef.current;
  if (renderDiagnostics.screen !== screen) {
    renderDiagnostics.screen = screen;
    renderDiagnostics.count = 0;
    renderDiagnostics.startedAt = Date.now();
    renderDiagnostics.warned = false;
  }
  renderDiagnostics.count += 1;
  if (import.meta.env.DEV && !renderDiagnostics.warned && renderDiagnostics.count >= 100 && Date.now() - renderDiagnostics.startedAt < 1000) {
    renderDiagnostics.warned = true;
    console.warn(`[render-diagnostics] ${renderDiagnostics.count} renders for ${screen} in under one second`);
  }

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  const changeScreen = (next: Screen) => {
    setScreen((current) => current === next ? current : next);
  };

  const showTaskPrompt = () => {
    if (showMoodToast) return;
    setShowRiskToast(false);
    setToastTaskDraft(null);
    setToastTaskConsequence(null);
    const shuffled = [...QUICK_ADD_PRESETS].sort(() => Math.random() - 0.5);
    setTaskToastPresets(shuffled.slice(0, 3));
    setShowTaskToast(true);
    if (taskToastTimerRef.current) clearTimeout(taskToastTimerRef.current);
    if (typeof window !== "undefined") window.localStorage.setItem("last-task-toast-time", String(Date.now()));
  };

  const showRiskPrompt = () => {
    if (showMoodToast) return;
    showTaskPrompt();
  };

  const dismissTaskPrompt = () => {
    if (taskToastTimerRef.current) clearTimeout(taskToastTimerRef.current);
    setShowTaskToast(false);
    setToastTaskDraft(null);
    setToastTaskConsequence(null);
  };

  const dismissRiskPrompt = () => setShowRiskToast(false);

  useEffect(() => () => {
    if (taskToastTimerRef.current) clearTimeout(taskToastTimerRef.current);
  }, []);

  useEffect(() => {
    if (showTaskToast || showRiskToast) return;
    if (typeof window !== "undefined" && JSON.parse(window.localStorage.getItem("task-toast-enabled") ?? "true") === false) return;
    const interval = typeof window !== "undefined" ? window.localStorage.getItem("task-toast-interval") ?? "4" : "4";
    if (interval === "manual") return;
    const lastShown = typeof window !== "undefined" ? Number(window.localStorage.getItem("last-task-toast-time") ?? "0") : 0;
    const moodEnabled = typeof window === "undefined" || JSON.parse(window.localStorage.getItem("notifications-enabled") ?? "true") !== false;
    const lastMoodShown = typeof window !== "undefined" ? Number(window.localStorage.getItem(LAST_MOOD_CHECK_KEY) ?? "0") : 0;
    if (!lastShown && moodEnabled && !lastMoodShown) return;
    const now = new Date();
    const lastDate = lastShown ? new Date(lastShown) : null;
    const todayAt = (hour: number) => { const date = new Date(now); date.setHours(hour, 0, 0, 0); return date.getTime(); };
    const scheduledEligible = interval === "once" ? now.getTime() >= todayAt(9) && (!lastDate || lastDate.getTime() < todayAt(9)) : interval === "twice" ? (now.getTime() >= todayAt(17) && (!lastDate || lastDate.getTime() < todayAt(17))) || (now.getTime() >= todayAt(9) && (!lastDate || lastDate.getTime() < todayAt(9))) : false;
    const eligible = interval === "once" || interval === "twice" ? scheduledEligible : !lastShown || Date.now() - lastShown >= Number(interval) * 60 * 60 * 1000;
    if (!eligible) return;
    showRiskPrompt();
    // Navigation re-evaluates eligibility without stacking with the mood toast.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, showMoodToast, showRiskToast, showTaskToast]);

  const todayKey = new Date().toDateString();
  const showMorningCheckIn = true;
  const todayEnergyCheckIn = energyCheckIns.filter((entry) => entryDateKey(entry.date) === localDateKey(new Date())).at(-1) ?? null;

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
  const notificationRisk = useMemo(() => getWeeklyRiskSummary(tasks, fixedCommitments, recoveryBlocks, calculation), [calculation, fixedCommitments, recoveryBlocks, tasks]);

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
  const weeklyPlan = useMemo<WeeklyPlan>(() => {
    const hardestIndex = calculation.dailyMargins.reduce((lowest, margin, index, margins) => margin < margins[lowest] ? index : lowest, 0);
    const hardestDay = DAYS[hardestIndex];
    const dayLoad = tasks.filter((task) => !task.deferred && task.deadline.toLowerCase().startsWith(hardestDay.toLowerCase()));
    const loadDescription = dayLoad.length ? `${dayLoad.length} ${dayLoad[0].category}-load task${dayLoad.length > 1 ? "s" : ""}, tight margin` : "tight margin";
    const availableBlocks = recoveryBlocks.length ? recoveryBlocks : DEFAULT_RECOVERY_BLOCKS;
    return { hardestDay, loadDescription, taskToMove: deferCandidate, blockToLock: availableBlocks.find((block) => !block.locked) };
  }, [calculation.dailyMargins, tasks, recoveryBlocks, deferCandidate]);
  const showSurvivalPlan = showWeeklyPlanPreview || survivalPlanDismissedWeek !== currentWeekKey();
  const dismissSurvivalPlan = () => { const week = currentWeekKey(); setSurvivalPlanDismissedWeek(week); setShowWeeklyPlanPreview(false); if (typeof window !== "undefined") window.localStorage.setItem("survivalPlanDismissedWeek", week); };
  const showEnergyCheckIn = Math.min(...calculation.dailyMargins) < 5;

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
    changeScreen("mirror");
  };

  const previewToastTask = (name: string, hours: number, explicitDeadline?: string) => {
    const deadline = explicitDeadline ?? DAYS[(new Date().getDay() + 6) % 7];
    const suggestion = suggestionFor(name);
    const dayIndex = DAYS.indexOf(deadline);
    const projectedDailyMargin = calculation.dailyMargins[dayIndex] - hours;
    setToastTaskDraft({ name, hours, deadline, suggestion });
    const frame = typeof window !== "undefined" && window.localStorage.getItem("recovery-frame-preference") === "week" ? "week" : "day";
    const restBefore = frame === "week" ? calculation.margin : calculation.dailyMargins[dayIndex];
    setToastTaskConsequence({ projectedMargin: calculation.margin - hours, projectedDailyMargin, isAtRisk: projectedDailyMargin < 0, day: deadline, riskHours: Math.max(0, Math.round(-projectedDailyMargin * 10) / 10), restBefore, restAfter: restBefore - hours, frame });
  };

  const addTaskFromToast = (name: string, hours: number, deadline: string, parsedSuggestion = suggestionFor(name), force = false, closeAfterAdd = true) => {
    const suggestion = parsedSuggestion;
    if (!force && calculation.margin - hours < 0) {
      setDraftDeadline(deadline);
      startMirror(name, hours);
      dismissTaskPrompt();
      window.setTimeout(() => setShowConsequencePreview(true), 0);
      return;
    }
    const newTask = { id: Date.now(), name, estimatedHours: hours, cognitiveLoad: suggestion.cognitiveLoad, deadline, deferred: false, category: suggestion.category } satisfies FlexibleTask;
    setTasks((current) => [...current, newTask]);
    lastToastTaskIdRef.current = newTask.id;
    setLastToastTaskId(newTask.id);
    if (closeAfterAdd) dismissTaskPrompt();
    toast.success(`Added "${name}" — ${formatShortHours(hours)} on ${deadline}`, { action: { label: "View on Dashboard", onClick: handleViewOnDashboard } });
  };

  const confirmToastTask = () => {
    if (!toastTaskDraft) return;
    if (taskToastTimerRef.current) clearTimeout(taskToastTimerRef.current);
    addTaskFromToast(toastTaskDraft.name, toastTaskDraft.hours, toastTaskDraft.deadline, toastTaskDraft.suggestion, true, false);
    setToastTaskDraft(null);
    setToastTaskConsequence(null);
  };
  const chooseLighterToastDay = () => {
    if (!toastTaskDraft) return;
    setDraftDeadline(toastTaskDraft.deadline);
    setToastTaskDraft(null);
    setToastTaskConsequence(null);
    dismissTaskPrompt();
    startMirror(toastTaskDraft.name, toastTaskDraft.hours);
  };

  const addTask = (isOverride = false, hoursOverride?: number, deferred = false) => {
    const parsed = parseTaskText(draftName, draftDeadline);
    const name = parsed.name;
    const suggestion = parsed.suggestion;
    const task: FlexibleTask = {
      id: Date.now(),
      name,
      estimatedHours: Math.max(0.5, Number(hoursOverride ?? parsed.hours ?? draftHours) || suggestion.midpoint),
      cognitiveLoad: suggestion.cognitiveLoad,
      deadline: parsed.day,
      deferred,
      category: suggestion.category,
      energy: draftEnergy,
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
    changeScreen(isOverride && nextOverrideCount >= 3 ? "triage" : "dashboard");
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
    const timestamp = new Date().toISOString();
    const entry = { date: timestamp, response };
    setEnergyCheckIns((current) => [...current, entry]);
    setCheckInNotice(`Logged: ${response} at ${new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    window.setTimeout(() => setCheckInNotice(null), 2600);
    if (typeof window !== "undefined") {
      const key = `${ENERGY_CHECKS_PREFIX}${localDateKey(new Date(timestamp))}`;
      const checks = readStoredChecks<EnergyCheckIn>(ENERGY_CHECKS_PREFIX, new Date(timestamp));
      window.localStorage.setItem(key, JSON.stringify([...checks, entry]));
    }
  };

  const respondMorningCheckIn = (value: MoodValue) => {
    const timestamp = Date.now();
    const entry = { date: new Date(timestamp).toISOString(), value };
    setMoodCheckIns((current) => [...current, entry]);
    setLastMoodCheck(timestamp);
    setCheckInNotice(`Logged: ${value} at ${new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    window.setTimeout(() => setCheckInNotice(null), 2600);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LAST_MOOD_CHECK_KEY, String(timestamp));
      const date = new Date(timestamp);
      const key = `${MOOD_CHECKS_PREFIX}${localDateKey(date)}`;
      const checks = readStoredChecks<MoodCheckIn>(MOOD_CHECKS_PREFIX, date);
      window.localStorage.setItem(key, JSON.stringify([...checks, entry]));
      let storedLog: unknown = [];
      try { storedLog = JSON.parse(window.localStorage.getItem(MOOD_LOG_KEY) ?? "[]"); } catch { storedLog = []; }
      const moodLog = Array.isArray(storedLog) ? storedLog : [];
      window.localStorage.setItem(MOOD_LOG_KEY, JSON.stringify([...moodLog, entry]));
    }
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
    const parsed = parseTaskText(draftName, draftDeadline);
    const parsedHours = parsed.hours ?? draftHours;
    const hasExplicitDetails = parsed.hours !== null || parsed.explicitDay !== null || parsed.name !== (draftName.trim() || "Untitled task");
    if (hasExplicitDetails) {
      setDraftName(parsed.name);
      setDraftHours(parsedHours);
      setDraftDeadline(parsed.day);
      setDraftEstimateTouched(true);
      setConfirmBreach(false);
      setShowActions(false);
      return;
    }
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
    setImportExtracted([]);
    setImportLoading(false);
    setImportError("");
    setEditingImportId(null);
    changeScreen("import");
  };

  const handleVisionFile = async (file: File | undefined) => {
    if (!file) return;
    setImportFileName(file.name);
    setImportExtracted([]);
    setImportError("");
    setImportLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (!apiKey) throw new Error("missing API key");
      const base64ImageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result ?? "");
          const commaIndex = result.indexOf(",");
          if (commaIndex < 0) reject(new Error("read failed"));
          else resolve(result.slice(commaIndex + 1));
        };
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: VISION_TIMETABLE_PROMPT }, { inlineData: { mimeType: file.type || "image/jpeg", data: base64ImageData } }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 1200 },
        }),
      });
      if (!response.ok) throw new Error("vision failed");
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("empty response");
      const extracted = parseVisionCommitments(String(text));
      if (!extracted.length) {
        setImportError("No commitments found — try a different image or enter manually");
      } else {
        setImportExtracted(extracted);
      }
    } catch (error) {
      setImportError(error instanceof Error && error.message === "read failed" ? "Couldn't read image — try a clearer photo" : "Vision scan failed — enter manually");
    } finally {
      setImportLoading(false);
    }
  };

  const approveImportedSchedule = (commitments: VisionCommitment[]) => {
    const fixed = commitments.map((item, index) => ({
      id: Date.now() + index,
      name: item.name,
      days: item.days,
      startTime: item.startTime,
      endTime: item.endTime,
      hours: Number((item.durationHours * item.days.length).toFixed(1)),
    }));
    setFixedCommitments((current) => [...current, ...fixed]);
    setImportExtracted([]);
    setImportError("");
    setImportFileName("");
    changeScreen("onboarding");
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

  const unlockBlock = (id: number) => {
    setRecoveryBlocks((current) => (current.length ? current : DEFAULT_RECOVERY_BLOCKS).map((block) => block.id === id ? { ...block, locked: false } : block));
    setPlannerMessage("Recovery block released.");
    setUnlockTarget(null);
  };

  const unlockAllBlocks = () => {
    setRecoveryBlocks((current) => (current.length ? current : DEFAULT_RECOVERY_BLOCKS).map((block) => ({ ...block, locked: false })));
    setPlannerMessage("Protected recovery time released.");
    setUnlockTarget(null);
  };

  const applyTriage = () => {
    if (!selectedTriage.length) return;
    const released = selectedRecovery;
    const beforeMargin = calculation.margin;
    const beforeRecoveryBlocks = recoveryBlocks.filter((block) => block.locked).length;
    const afterMargin = beforeMargin + released;
    const updatedTasks = tasks.map((task) => selectedTriage.includes(task.id) ? { ...task, deferred: true } : task);
    const beforeRisks = analyzeWeekRisk(tasks, fixedCommitments, recoveryBlocks);
    const afterRisks = analyzeWeekRisk(updatedTasks, fixedCommitments, recoveryBlocks);
    const repairedDay = beforeRisks.find((day) => day.riskLevel !== "low" && afterRisks.find((nextDay) => nextDay.day === day.day)?.riskLevel === "low");
    setRiskRepairMessage(repairedDay ? `You fixed ${fullDayName(repairedDay.day)}'s risk. It now has protected recovery and manageable load.` : null);
    setProtectedOutcomes(calculateProtectedOutcomes(beforeMargin, afterMargin, beforeRecoveryBlocks, beforeRecoveryBlocks, sleepHours * 7, sleepHours * 7));
    const deficitBeforeSelection = Math.max(0, -triageBaseMargin);
    const deficitAfterSelection = Math.max(0, deficitBeforeSelection - released);
    setTasks(() => updatedTasks);
    setTriageOutcomeDeficit(deficitAfterSelection);
    if (deficitAfterSelection === 0) setTriageOutcome("full");
    else if (released > 0) setTriageOutcome("partial");
    else setTriageOutcome("failure");
    setSelectedTriage([]);
    changeScreen("outcomes-summary");
  };

  const openQuickCheck = () => {
    setQuickName("");
    setQuickHours(1);
    setShowQuickCheck(true);
  };

  const navTo = (next: Screen) => {
    if (next === screen) return;
    setShowDeprioritizedBanner(false);
    if (next === "guide") { setGuideReturnScreen(screen); setGuideStep(0); }
    setTriageOutcome(null);
    setTriageOutcomeDeficit(null);
    setPlannerMessage("");
    if (next !== "triage") setTriageMarginOverride(null);
    changeScreen(next);
  };

  const handleViewOnDashboard = () => {
    setShowDeprioritizedBanner(false);
    navTo("dashboard");
    const taskId = lastToastTaskIdRef.current;
    if (taskId === null) return;
    const mustDoTask = pickMustDo(tasksRef.current);
    const maintenanceTask = pickMaintenance(tasksRef.current, mustDoTask?.id);
    if (mustDoTask?.id !== taskId && maintenanceTask?.id !== taskId) {
      setShowDeprioritizedBanner(true);
    }
    window.setTimeout(() => { lastToastTaskIdRef.current = null; setLastToastTaskId(null); }, 5000);
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
        <ToastNotification screen={screen} lastMoodCheck={lastMoodCheck} onMoodSelect={respondMorningCheckIn} onShowRecoveryMenu={() => setShowRecoveryMenu(true)} demoTrigger={demoNotificationToken} blocked={showRiskToast || showTaskToast} onVisibilityChange={setShowMoodToast} />
        {showTaskToast && !showMoodToast && <TaskQuickAddToast presets={taskToastPresets} onPreviewTask={previewToastTask} consequence={toastTaskConsequence} draft={toastTaskDraft} onConfirmTask={confirmToastTask} onChooseLighterDay={chooseLighterToastDay} onViewDashboard={() => { dismissTaskPrompt(); handleViewOnDashboard(); }} onClose={dismissTaskPrompt} />}
        {checkInNotice && <div className="checkin-log-toast" role="status" aria-live="polite">{checkInNotice}</div>}
        <Header screen={screen} isDark={isDarkScreen} onBack={() => navTo("dashboard")} onMenu={() => setDrawerOpen(true)} onHelp={() => navTo("guide")} onTestNotification={() => setDemoNotificationToken((token) => token + 1)} onTestTaskPrompt={showRiskPrompt} />
        {/* Keep this host mounted across navigation; remounting it by screen key can duplicate transition content. */}
        <div className="screen-container">
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
                  fixedCommitments={fixedCommitments}
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
                  weeklyPlan={weeklyPlan}
                  showSurvivalPlan={showSurvivalPlan}
                  onMoveWeeklyTask={() => { if (weeklyPlan.taskToMove) setTasks((current) => current.map((task) => task.id === weeklyPlan.taskToMove?.id ? { ...task, deferred: true } : task)); }}
                  onLockWeeklyBlock={() => { if (weeklyPlan.blockToLock) protectBlock(weeklyPlan.blockToLock.id); }}
                  onDismissSurvivalPlan={dismissSurvivalPlan}
                  onShowWeeklyPlan={() => setShowWeeklyPlanPreview(true)}
                  onTriage={() => openTriage()}
                  onRebalance={(day) => { setDraftDeadline(day); startMirror(); }}
                  onRecordOutcome={recordTaskOutcome}
                  onDeleteTaskSilently={deleteTaskSilently}
                  onEnergyRespond={respondEnergyCheckIn}
                  lastToastTaskId={lastToastTaskId}
                  showDeprioritizedBanner={showDeprioritizedBanner}
                  onDismissDeprioritizedBanner={() => setShowDeprioritizedBanner(false)}
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
                  sleepHours={sleepHours}
                  energyType={draftEnergy}
                  setEnergyType={setDraftEnergy}
                  energyRecommendation={recommendBestEnergySlot(draftEnergy, tasks, fixedCommitments, recoveryBlocks)}
                  onAcceptEnergyRecommendation={(day) => { setDraftDeadline(day); addTask(false); }}
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
                  onChooseOption={(option) => {
                    if (option === "decline") { changeScreen("dashboard"); return; }
                    if (option === "defer") { addTask(false, undefined, true); return; }
                    if (option === "split") { addTask(false, Math.max(0.5, Math.round(draftHours / 2 * 10) / 10)); return; }
                    addTask(false);
                  }}
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
                  onUnlock={(id) => setUnlockTarget(id)}
                  onUnlockAll={() => setUnlockTarget("all")}
                  unlockTarget={unlockTarget}
                  onConfirmUnlock={() => unlockTarget === "all" ? unlockAllBlocks() : unlockTarget !== null ? unlockBlock(unlockTarget) : undefined}
                  onCancelUnlock={() => setUnlockTarget(null)}
                  onSkip={() => navTo("dashboard")}
                  onShowRecoveryMenu={() => setShowRecoveryMenu(true)}
                />
              )}
              {screen === "reflection" && (
                <Reflection
                  calculation={calculation}
                  overrideCount={overrideCount}
                  taskOutcomes={taskOutcomes}
                  moodCheckIns={moodCheckIns}
                  energyCheckIns={energyCheckIns}
                  recoveryBlocks={recoveryBlocks}
                  onNextWeek={() => navTo("onboarding")}
                  onAdjust={() => navTo("onboarding")}
                />
              )}
              {screen === "import" && (
                <ImportCommitments
                  fileName={importFileName}
                  items={importExtracted}
                  loading={importLoading}
                  error={importError}
                  onFile={handleVisionFile}
                  onCalendar={() => { setImportFileName("Sample university timetable.pdf"); setImportExtracted(IMPORTED_TIMETABLE.map(visionFromFixedCommitment)); setImportError(""); }}
                  onUpdate={(id: number, updates: Partial<Pick<VisionCommitment, "name" | "days" | "startTime" | "endTime" | "durationHours">>) => setImportExtracted((current) => current.map((item) => item.id === id ? { ...item, ...updates, timeRange: `${updates.startTime ?? item.startTime}–${updates.endTime ?? item.endTime}` } : item))}
                  onApprove={() => approveImportedSchedule(importExtracted)}
                  onManual={() => navTo("onboarding")}
                />
              )}
              {screen === "settings" && <Settings onBack={() => navTo("dashboard")} />}
              {screen === "guide" && <Guide step={guideStep} setStep={setGuideStep} onClose={() => changeScreen(guideReturnScreen)} onDone={() => navTo("dashboard")} />}
              {screen === "outcomes-summary" && protectedOutcomes && <OutcomesSummary outcomes={protectedOutcomes} riskRepairMessage={riskRepairMessage} onDashboard={() => navTo("dashboard")} />}
            </main>
          </>
        )}
        </div>
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
        {showRecoveryMenu && <RecoveryMenu onClose={() => setShowRecoveryMenu(false)} />}
        {screen === "mirror" && (
          <div className="quick-check-fab-wrap">
            <button className="quick-check-fab" aria-label="Can I afford this? Quick check" onClick={openQuickCheck}>
              <MessageCircleQuestion size={22} />
            </button>
          </div>
        )}
        {screen !== "onboarding" && screen !== "import" && screen !== "triage" && screen !== "settings" && screen !== "guide" && screen !== "outcomes-summary" && <BottomTabBar active={screen} onNavigate={navTo} />}
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
  { id: "settings", label: "Settings", icon: <SlidersHorizontal size={18} /> },
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
        <footer className="sidebar-footer"><a href="/terms" className="footer-link">Terms and Conditions</a><span className="footer-divider">•</span><a href="/privacy" className="footer-link">Privacy Policy</a></footer>
      </aside>
    </div>
  );
}

function Header({ screen, isDark, onBack, onMenu, onHelp, onTestNotification, onTestTaskPrompt }: { screen: Screen; isDark: boolean; onBack: () => void; onMenu: () => void; onHelp: () => void; onTestNotification: () => void; onTestTaskPrompt: () => void }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className={`topbar ${isDark ? "topbar-dark" : "topbar-light"}`}>
      <div className="topbar-inner">
        <button className="hamburger-btn" aria-label="Menu" onClick={onMenu}><Menu size={20} /></button>
        <div className="brand-lockup">
          <BrandMark className="brand-mark" />
          <span className="brand-wordmark">MARGIN</span>
        </div>
        {screen !== "guide" && <button className="help-button" aria-label="How it works" title="How it works" onClick={onHelp}>?</button>}
        <button className="test-notification-btn" aria-label="Test mood notification" title="Test notification (demo only)" onClick={onTestNotification}><Bell size={16} /></button>
        <button className="test-task-notification-btn" aria-label="Test task prompt" title="Test task prompt (demo only)" onClick={onTestTaskPrompt}><ClipboardList size={16} /></button>
        <button className="theme-toggle" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
        <span className="topbar-spacer" aria-hidden="true" />
      </div>
      {screen !== "dashboard" && screen !== "guide" && <button className="topbar-back" aria-label="Back to dashboard" onClick={onBack}><ArrowLeft size={14} /> Back</button>}
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

function BurnoutRiskPanel({ atRiskDays, onRebalance }: { atRiskDays: DayRisk[]; onRebalance: (day: string) => void }) {
  if (!atRiskDays.length) return <section className="burnout-panel burnout-balanced"><h3>✓ Week Looks Balanced</h3><p>No days are at high risk. Keep protecting recovery blocks.</p></section>;
  return <section className="burnout-panel"><h3>⚠️ Days at Risk</h3>{atRiskDays.map((day) => <div key={day.day} className={`risk-card risk-${day.riskLevel}`}><div className="risk-day"><strong>{fullDayName(day.day)}</strong><span>{day.riskLevel} risk · {formatShortHours(day.totalHours)} scheduled</span></div><div className="risk-narrative">{day.riskNarrative}</div><button className="btn-secondary-sm" onClick={() => onRebalance(day.day)}>Rebalance</button></div>)}</section>;
}
function SurvivalPlanCard({ plan, onMoveTask, onLockBlock, onDismiss }: { plan: WeeklyPlan; onMoveTask: () => void; onLockBlock: () => void; onDismiss: () => void }) {
  return <section className="card survival-plan-card"><div className="section-kicker"><ShieldCheck size={14} /><span>Protect This Week</span></div><div className="survival-plan-row"><div><strong>Hardest day: {plan.hardestDay}</strong><small>{plan.loadDescription}</small></div></div>{plan.taskToMove && <div className="survival-plan-row"><span>Move: “{plan.taskToMove.name}” → Sat</span><button className="secondary-button" onClick={onMoveTask}>Move it</button></div>}{plan.blockToLock && <div className="survival-plan-row"><span>Lock: {plan.blockToLock.day} {plan.blockToLock.type}</span><button className="secondary-button" onClick={onLockBlock}>Lock it</button></div>}<div className="survival-plan-actions"><button className="text-button" onClick={onDismiss}>Got it</button><button className="text-button" onClick={onDismiss}>Remind me Sunday</button></div></section>;
}
function Dashboard({ calculation, tasks, fixedCommitments, recoveryBlocks, showEnergyCheckIn, showMorningCheckIn, onMorningCheckInRespond, onAddTask, onQuickCheck, recoveryQualityBlock, recoveryQualityDismissed, onRecoveryQuality, onPlanner, onReflection, weeklyPlan, showSurvivalPlan, onMoveWeeklyTask, onLockWeeklyBlock, onDismissSurvivalPlan, onShowWeeklyPlan, onTriage, onRebalance, onRecordOutcome, onDeleteTaskSilently, onEnergyRespond, lastToastTaskId, showDeprioritizedBanner, onDismissDeprioritizedBanner }: { calculation: ReturnType<typeof useCalculationShape>; tasks: FlexibleTask[]; fixedCommitments: FixedCommitment[]; recoveryBlocks: RecoveryBlock[]; showEnergyCheckIn: boolean; showMorningCheckIn: boolean; onMorningCheckInRespond: (value: MoodValue) => void; onAddTask: () => void; onQuickCheck: () => void; recoveryQualityBlock: RecoveryBlock | null; recoveryQuality: "Fully" | "Partially" | "Not really" | null; recoveryQualityDismissed: boolean; onRecoveryQuality: (quality: "Fully" | "Partially" | "Not really") => void; onPlanner: () => void; onReflection: () => void; weeklyPlan: WeeklyPlan; showSurvivalPlan: boolean; onMoveWeeklyTask: () => void; onLockWeeklyBlock: () => void; onDismissSurvivalPlan: () => void; onShowWeeklyPlan: () => void; onTriage: () => void; onRebalance: (day: string) => void; onRecordOutcome: (task: FlexibleTask, outcome: TaskOutcomeValue) => void; onDeleteTaskSilently: (id: number) => void; onEnergyRespond: (response: EnergyResponse) => void; lastToastTaskId: number | null; showDeprioritizedBanner: boolean; onDismissDeprioritizedBanner: () => void }) {
  const [showFullWeek, setShowFullWeek] = useState(false);
  const [dailyView, setDailyView] = useState<"week" | "day">("week");
  const [dailyDate, setDailyDate] = useState(() => new Date());
  const [pendingOutcomeId, setPendingOutcomeId] = useState<number | null>(null);
  const [expandedDeadlineIds, setExpandedDeadlineIds] = useState<number[]>([]);
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
  const today = new Date();
  const weekMonday = new Date(today);
  weekMonday.setHours(0, 0, 0, 0);
  weekMonday.setDate(weekMonday.getDate() - ((weekMonday.getDay() + 6) % 7));
  const weekSunday = new Date(weekMonday);
  weekSunday.setDate(weekSunday.getDate() + 6);
  const selectedDayName = CALENDAR_DAYS[dailyDate.getDay()];
  const selectedDayIndex = (dailyDate.getDay() + 6) % 7;
  const dailyTasks = activeTasks.filter((task) => task.deadline && selectedDayName.toLowerCase().startsWith(task.deadline.trim().toLowerCase().slice(0, 3)));
  const dailyCommitments = fixedCommitments.filter((commitment) => commitment.days.some((day) => day.toLowerCase().startsWith(selectedDayName.slice(0, 3).toLowerCase())));
  const dailyRecoveryBlocks = recoveryBlocks.filter((block) => block.locked && block.day.toLowerCase().startsWith(selectedDayName.slice(0, 3).toLowerCase()));
  const dailyMargin = calculation.dailyMargins[selectedDayIndex] + calculation.dailyTask[selectedDayIndex];
  const dailySlotTasks = {
    morning: dailyTasks.filter((task) => task.category === "mental"),
    afternoon: dailyTasks.filter((task) => task.category === "physical" || task.category === "errands"),
    evening: dailyTasks.filter((task) => task.category === "social"),
  };
  const moveDailyDate = (offset: number) => {
    const next = new Date(dailyDate);
    next.setDate(next.getDate() + offset);
    if (next < weekMonday || next > weekSunday) return;
    setDailyDate(next);
  };
  const lockInTasks = [mustDo ? { task: mustDo, tag: "Must-do" } : null, maintenance ? { task: maintenance, tag: "Maintenance" } : null].filter((item): item is { task: FlexibleTask; tag: string } => Boolean(item)).sort((a, b) => {
    const urgencyRank: Record<TaskUrgency, number> = { critical: 0, urgent: 1, normal: 2, flexible: 3 };
    const aUrgency = taskUrgency(a.task.deadline, today);
    const bUrgency = taskUrgency(b.task.deadline, today);
    return urgencyRank[aUrgency.tier] - urgencyRank[bUrgency.tier] || a.task.estimatedHours - b.task.estimatedHours;
  });
  useEffect(() => {
    if (!showDeprioritizedBanner || lastToastTaskId === null) return;
    if (lockInTasks.some(({ task }) => task.id === lastToastTaskId)) onDismissDeprioritizedBanner();
  }, [lastToastTaskId, lockInTasks, onDismissDeprioritizedBanner, showDeprioritizedBanner]);
  const nextBlock = nextRecoveryBlock(recoveryBlocks);
  const outcomeEmojis: { value: TaskOutcomeValue; icon: string }[] = [{ value: "Easy", icon: "🔥" }, { value: "Fine", icon: "🙂" }, { value: "Hard", icon: "😵" }, { value: "Disaster", icon: "💀" }];
  const renderTaskRow = (task: FlexibleTask, tag?: string, lockIn = false) => {
    const Icon = categoryIcon(task.category);
    const due = lockIn ? dueLabelForTask(task.deadline, today) : null;
    const pressure = lockIn ? calculateDeadlinePressure(task, calculation.dailyMargins) : null;
    const deadlineSentence = pressure ? formatDeadlineSentence(task, pressure) : "";
    const urgencyClass = lockIn ? ` task-row-urgency-${due?.urgency}${pressure && (pressure.unsafeDays.length > 0 || pressure.daysRemaining <= 1) ? " task-row-urgent" : ""}` : "";
    const expanded = expandedDeadlineIds.includes(task.id);
    if (pendingOutcomeId === task.id) return <div className={`task-row${urgencyClass}${task.id === lastToastTaskId ? " task-row-highlight" : ""}`} key={task.id}><div className="outcome-feedback-row"><span>{task.name} — how did it go?</span><div className="outcome-emoji-group">{outcomeEmojis.map((item) => <button key={item.value} className="outcome-emoji-button" aria-label={item.value} onClick={() => { onRecordOutcome(task, item.value); setPendingOutcomeId(null); }}>{item.icon}</button>)}</div></div></div>;
    return <div className={`task-row${urgencyClass}${task.id === lastToastTaskId ? " task-row-highlight" : ""}`} key={task.id}><div className="task-leading">{tag && <span className={`lock-in-tag lock-in-tag-${tag.toLowerCase().replace(/[^a-z]/g, "")}`}>{tag}</span>}<div className={`task-icon task-icon-${task.category}`}><Icon size={15} /></div><div><strong>{task.name}</strong><span>{formatHours(task.estimatedHours)} · {categoryLabel(task.category)} load · due {lockIn ? <button className={`deadline-summary deadline-summary-${due?.urgency}`} onClick={() => setExpandedDeadlineIds((current) => current.includes(task.id) ? current.filter((id) => id !== task.id) : [...current, task.id])} aria-expanded={expanded}>{due?.label}</button> : task.deadline}</span>{expanded && <p className="deadline-sentence">{deadlineSentence}</p>}</div></div><button className="icon-button" aria-label={`Delete ${task.name}`} onClick={() => requestDelete(task.id)}><Trash2 size={16} /></button></div>;
  };
  const moodPillTone: Record<MoodValue, string> = { Drained: "pill-negative", Okay: "pill-neutral", Good: "pill-neutral", Energized: "pill-positive" };
  const energyPillTone: Record<EnergyResponse, string> = { Rough: "pill-negative", Okay: "pill-neutral", Ready: "pill-positive" };
  const totalCategoryHours = Object.values(calculation.categoryBreakdown).reduce((sum, value) => sum + value, 0);
  const maxDailyMargin = Math.max(...calculation.dailyMargins, 1);
  const riskAnalysis = analyzeWeekRisk(tasks, fixedCommitments, recoveryBlocks);
  const atRiskDays = riskAnalysis.filter((day) => day.riskLevel !== "low");
  return <div className="dashboard-page">
    {showMorningCheckIn && <section className="card checkin-card"><span className="card-label">How do you feel today?</span><div className="pill-row">{MOOD_OPTIONS.map((option) => <button key={option.value} className={`pill pill-button ${moodPillTone[option.value]}`} onClick={() => onMorningCheckInRespond(option.value)}>{option.value}</button>)}</div></section>}
    {recoveryQualityBlock && !recoveryQualityDismissed && <RecoveryQualityCard block={recoveryQualityBlock} onSelect={onRecoveryQuality} />}
    {showEnergyCheckIn && <section className="card checkin-card"><span className="card-label">Heading into today...</span><div className="pill-row"><button className="pill pill-button pill-negative" onClick={() => onEnergyRespond("Rough")}>Rough</button><button className="pill pill-button pill-neutral" onClick={() => onEnergyRespond("Okay")}>Okay</button><button className="pill pill-button pill-positive" onClick={() => onEnergyRespond("Ready")}>Ready</button></div></section>}
    <div className="dashboard-intro"><p className="eyebrow">Your week</p><h1 className="page-heading">Your Week</h1><p className="dashboard-subtitle">With recovery view</p><div className="dashboard-view-toggle"><button className={dailyView === "week" ? "dashboard-view-toggle-active" : ""} onClick={() => setDailyView("week")}>Week</button><button className={dailyView === "day" ? "dashboard-view-toggle-active" : ""} onClick={() => setDailyView("day")}>Day</button></div><div className="dashboard-intro-links"><button className="text-action dashboard-reflection-link" onClick={onReflection}><BarChart3 size={14} /> Weekly Reflection</button><button className="text-action dashboard-reflection-link" onClick={onShowWeeklyPlan}><ShieldCheck size={14} /> Weekly Plan</button></div></div>
    {dailyView === "week" ? <>
    <section className="card hero-margin-card">
      <div className="hero-card-head"><span className="card-label">Rest and recovery time left</span><div className="status-pill" style={{ color: status.color, borderColor: `${status.color}44`, background: `${status.color}10` }}><span className="status-dot" style={{ background: status.color }} />{status.label}</div></div>
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
    {dailyView === "week" && <BurnoutRiskPanel atRiskDays={atRiskDays} onRebalance={onRebalance} />}
    <section className="card week-glance-card">
      <span className="card-label">Week at Glance</span>
      <div className="week-glance-list">{DAYS.map((day, index) => { const dayStatus = dailyStatusFor(calculation.dailyMargins[index]); const width = Math.max(8, Math.min(100, (calculation.dailyMargins[index] / maxDailyMargin) * 100)); return <div key={day} className="week-glance-row"><span className="week-glance-day">{day}</span><span className="week-glance-track"><span className="week-glance-fill" style={{ width: `${width}%`, background: dayStatus.color }} title={`${day}: ${dayStatus.label} · ${formatShortHours(calculation.dailyMargins[index])}`} /></span></div>; })}</div>
      <p className="side-note">Bars include your Recovery Floor, fixed load, and deadline-weighted tasks.</p>
    </section>
    </> : <section className="card daily-view-card">
      <div className="daily-view-head"><button className="daily-view-arrow" aria-label="Previous day" disabled={dailyDate <= weekMonday} onClick={() => moveDailyDate(-1)}><ArrowLeft size={16} /></button><div><span className="card-label">Today — {dailyDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span><strong>{formatShortHours(dailyMargin)} available after fixed blocks</strong></div><button className="daily-view-arrow" aria-label="Next day" disabled={dailyDate >= weekSunday} onClick={() => moveDailyDate(1)}><ArrowRight size={16} /></button></div>
      {[{ key: "morning", label: "Morning", time: "09:00 – 12:00" }, { key: "afternoon", label: "Afternoon", time: "12:00 – 17:00" }, { key: "evening", label: "Evening", time: "17:00 – 21:00" }].map((slot) => {
        const slotTasks = dailySlotTasks[slot.key as keyof typeof dailySlotTasks];
        const slotCommitments = dailyCommitments.filter((commitment) => commitment.startTime < (slot.key === "morning" ? "12:00" : slot.key === "afternoon" ? "17:00" : "21:00") && commitment.endTime > (slot.key === "morning" ? "09:00" : slot.key === "afternoon" ? "12:00" : "17:00"));
        return <div className="daily-slot" key={slot.key}><div className="daily-slot-head"><strong>{slot.label}</strong><span>{slot.time}</span></div>{slotCommitments.map((commitment) => <div className="daily-blocked-bar" key={commitment.id}>Blocked · {commitment.name} · {commitment.startTime}–{commitment.endTime}</div>)}{slotTasks.length ? <div className="daily-task-chips">{slotTasks.map((task) => <button className={`daily-task-chip daily-task-chip-${task.category}`} key={task.id} onClick={() => requestDelete(task.id)}>{task.name} · {formatShortHours(task.estimatedHours)}</button>)}</div> : <span className="daily-empty-slot">No tasks — margin available</span>}{slot.key === "evening" && dailyRecoveryBlocks.map((block) => <div className="daily-recovery-bar" key={block.id}>░░ Recovery block · {block.type} · {block.startTime}–{block.endTime}</div>)}</div>;
      })}
    </section>}
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
    {showSurvivalPlan && <SurvivalPlanCard plan={weeklyPlan} onMoveTask={onMoveWeeklyTask} onLockBlock={onLockWeeklyBlock} onDismiss={onDismissSurvivalPlan} />}
    {!showFullWeek ? (
      <section className="card tasks-panel lock-in-panel">
        {showDeprioritizedBanner && <div className="lockin-note" role="status"><span>Added — didn't make today's top 2.</span><button className="text-button" onClick={() => setShowFullWeek(true)}>See full list</button><button className="icon-button" aria-label="Dismiss added task notice" onClick={onDismissDeprioritizedBanner}><X size={14} /></button></div>}
        <div className="tasks-head"><div><span className="card-label">Today's Lock In</span><p className="card-subtitle">Things that matter most</p><div className="lock-in-legend"><span><i className="lock-in-legend-dot lock-in-legend-today" />Today</span><span><i className="lock-in-legend-dot lock-in-legend-tomorrow" />Tomorrow</span><span><i className="lock-in-legend-dot lock-in-legend-week" />This week</span></div></div></div>
        <div className="task-list">
          {lockInTasks.length ? lockInTasks.map(({ task, tag }) => renderTaskRow(task, tag, true)) : <div className="empty-state"><FileText size={19} /><span>No lock-in task right now.</span></div>}
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

const calculateWeeklyStressPattern = (moodChecks: MoodCheckIn[], dates: Date[], recoveryBlocks: RecoveryBlock[], recoveryTarget = 7) => dates.map((date) => {
  const entries = moodChecks.filter((entry) => entryDateKey(entry.date) === localDateKey(date));
  const moodScale: Record<MoodValue, number> = { Drained: 9, Okay: 6, Good: 3, Energized: 1 };
  const average = entries.length ? entries.reduce((sum, entry) => sum + moodScale[entry.value], 0) / entries.length : 5;
  const day = date.toLocaleDateString("en-US", { weekday: "short" });
  const hasRecovery = recoveryBlocks.some((block) => block.locked && block.day.slice(0, 3) === day);
  const stress = Math.max(1, Math.min(10, average - (hasRecovery ? 1.5 : 0)));
  return { day, stress, isAboveFloor: stress > recoveryTarget, hasRecovery, above: stress > recoveryTarget ? stress : recoveryTarget, below: stress <= recoveryTarget ? stress : recoveryTarget };
});
type CalculationShape = { fixedTotal: number; recoveryBlockTotal: number; tier2Total: number; availableCapacity: number; flexTotal: number; margin: number; dailyMargins: number[]; dailyFixed: number[]; dailyRecoveryBlocks: number[]; dailyTask: number[]; longestRun: number; distributionWarning: boolean; status: ReturnType<typeof statusFor>; categoryBreakdown: { mental: number; physical: number; social: number; errands: number; time: number } };
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
const useCalculationShape = null as unknown as () => CalculationShape;

function CommitmentMirror({ draftName, draftHours, draftDeadline, projectedMargin, projectedStatus, consequenceDay, dailyBreachAmount, sleepImpact, predictedHighLoadDays, sleepHours, energyType, setEnergyType, energyRecommendation, onAcceptEnergyRecommendation, showActions, confirmBreach, setDraftName, setDraftHours, setDraftDeadline, setShowActions, onAddAnyway, onTriage, onSplit, onFindSlot, onDefer, onChooseOption }: { draftName: string; draftHours: number; draftDeadline: string; projectedMargin: number; projectedStatus: ReturnType<typeof statusFor>; consequenceDay: string; dailyBreachAmount: number; sleepImpact: number; predictedHighLoadDays: number; sleepHours: number; energyType: EnergyType; setEnergyType: (value: EnergyType) => void; energyRecommendation: EnergyRecommendation; onAcceptEnergyRecommendation: (day: string) => void; showActions: boolean; confirmBreach: boolean; setDraftName: (value: string) => void; setDraftHours: (value: number) => void; setDraftDeadline: (value: string) => void; setShowActions: (value: boolean) => void; onAddAnyway: () => void; onTriage: () => void; onSplit: () => void; onFindSlot: () => void; onDefer: () => void; onChooseOption: (option: "addAnyway" | "split" | "defer" | "decline") => void }) {
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulationResults, setSimulationResults] = useState<Record<string, { title: string; description: string; margin: number; status: "good" | "okay" | "tight"; sleep: number; recovery: string }>>({});
  useEffect(() => {
    const hasTask = draftName.trim().length > 0;
    setShowSimulator(hasTask);
    const splitHours = Math.max(0.5, Math.round(draftHours / 2 * 10) / 10);
    const resultFor = (hours: number, title: string, description: string, recovery: string) => {
      const margin = calculationForSimulation(projectedMargin, draftHours, hours);
      return { title, description, margin: capacityPercent(margin), status: margin > 20 ? "good" as const : margin > 5 ? "okay" as const : "tight" as const, sleep: sleepHours, recovery };
    };
    setSimulationResults({ addAnyway: resultFor(draftHours, "Add it anyway", draftName, "Protected baseline"), split: resultFor(splitHours, "Split it", `${splitHours}h now`, "Protected baseline"), defer: resultFor(0, "Defer it", "Next week", "More recovery available"), decline: resultFor(0, "Decline it", "No task added", "Maximum recovery available") });
  }, [draftName, draftHours, projectedMargin, sleepHours]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const browserWindow = window as Window & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    setSpeechSupported(Boolean(browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition));
    return () => { recognitionRef.current?.abort?.(); };
  }, []);

  const startSpeechRecognition = () => {
    runSpeechRecognition({ recognitionRef, onTranscript: setDraftName, onListeningChange: setIsListening, onUnsupported: () => { setSpeechSupported(false); toast.error("Speech not supported on this device"); } });
  };

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
    {showSimulator && <section className="simulator-container"><h3>What if I say yes to this?</h3><div className="simulator-options">{(["addAnyway", "split", "defer", "decline"] as const).map((option) => { const result = simulationResults[option]; if (!result) return null; return <div key={option} className="simulator-column"><h4>{result.title}</h4><p className="simulator-subtitle">{result.description}</p><div className="simulator-metrics"><div className="simulator-metric"><span className="simulator-metric-label">Margin</span><strong className={`simulator-metric-value ${result.status}`}>{result.margin}%</strong><span className={`simulator-metric-status ${result.status}`}>{result.status === "good" ? "✓ Good" : result.status === "okay" ? "✓ Okay" : "⚠️ Tight"}</span></div><div className="simulator-metric"><span className="simulator-metric-label">Sleep</span><strong className="simulator-metric-value">{sleepHours}h</strong></div><div className="simulator-metric"><span className="simulator-metric-label">Recovery</span><strong className="simulator-metric-value">{result.recovery}</strong></div></div><button type="button" className="btn-choose" onClick={() => onChooseOption(option)}>Choose</button></div>; })}</div></section>}

    <section className="card mirror-input-card">
      <div className="section-kicker"><span>Input</span></div>
      <div className="quick-add-grid">{QUICK_ADD_PRESETS.map((preset) => { const Icon = categoryIcon(suggestionFor(preset.name).category); return <button key={preset.name} type="button" className="quick-add-tile" onClick={() => { setDraftName(preset.name); setDraftHours(preset.hours); }}><Icon size={15} /><span><strong>{preset.name}</strong><small>{formatShortHours(preset.hours)} · {preset.displayCategory}</small></span></button>; })}</div>
      <label className="field-label">Other task/commitment?<div className="task-input-group"><input autoFocus className="task-input" placeholder="Type here..." value={draftName} onChange={(event) => setDraftName(event.target.value)} /><button type="button" className={`mic-button${isListening ? " listening" : ""}`} onClick={startSpeechRecognition} title={speechSupported ? "Speak your task" : "Speech not supported"} aria-label="Speak your task" disabled={!speechSupported}>🎤</button></div>{isListening && <div className="listening-indicator">🎙️ Listening...</div>}{!speechSupported && <div className="speech-support-note">Speech not supported on this device</div>}</label>
      <div className="energy-selector"><span className="field-label">Task requires:</span>{(Object.keys(ENERGY_LABELS) as EnergyType[]).map((type) => <label key={type}><input type="radio" name="energy" value={type} checked={energyType === type} onChange={() => setEnergyType(type)} />{ENERGY_LABELS[type]}</label>)}</div>
      {draftName.trim() && energyRecommendation && <div className="energy-recommendation"><h4>✨ Smart Suggestion</h4><p>{energyRecommendation.reason}</p><div className="recommendation-buttons"><button type="button" className="btn-primary" onClick={() => onAcceptEnergyRecommendation(energyRecommendation.day)}>Schedule on {energyRecommendation.day}</button><button type="button" className="btn-secondary" onClick={() => setDraftDeadline(draftDeadline)}>Choose different day</button></div></div>}
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

function ImportCommitments({ fileName, items, loading, error, onFile, onCalendar, onUpdate, onApprove, onManual }: { fileName: string; items: VisionCommitment[]; loading: boolean; error: string; onFile: (file: File | undefined) => void; onCalendar: () => void; onUpdate: (id: number, updates: Partial<Pick<VisionCommitment, "name" | "days" | "startTime" | "endTime" | "durationHours">>) => void; onApprove: () => void; onManual: () => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const editingItem = items.find((item) => item.id === editingId) ?? null;
  const [editDraft, setEditDraft] = useState({ name: "", days: [] as string[], startTime: "09:00", endTime: "10:00", durationHours: 1 });

  useEffect(() => {
    if (!editingItem) return;
    setEditDraft({ name: editingItem.name, days: editingItem.days, startTime: editingItem.startTime, endTime: editingItem.endTime, durationHours: editingItem.durationHours });
  }, [editingItem]);

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const saveEdit = () => {
    if (!editingItem || !editDraft.name.trim() || !editDraft.days.length || editDraft.durationHours <= 0) return;
    onUpdate(editingItem.id, { ...editDraft, name: editDraft.name.trim(), durationHours: Number(editDraft.durationHours.toFixed(1)) });
    setEditingId(null);
  };

  return <div className="import-page">
    <div className="screen-title-block"><h1>Import Schedule</h1><p>Scan a timetable photo, review what Margin found, then approve it as Fixed Load.</p></div>
    <input ref={fileInputRef} className="file-input" style={{ display: "none" }} type="file" accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp" onChange={(event) => onFile(event.target.files?.[0])} />
    {loading ? (
      <section className="card import-card import-scan-card" aria-live="polite"><Spinner className="import-scan-spinner" /><strong>Scanning your timetable...</strong><p className="import-note">Reading names, days, times, and likely categories from the image.</p></section>
    ) : items.length ? (
      <section className="card import-card import-review-card">
        <div className="section-kicker"><Check size={14} /><span>Extracted from your timetable</span></div>
        <div className="import-file-chip"><Check size={16} /> {fileName}</div>
        <p className="import-note">Tap Edit on any item before adding these commitments to Fix Commitments.</p>
        <div className="import-review-list">{items.map((item) => <div className="import-review-item" key={item.id}>
          <button className="import-review-main" onClick={() => setEditingId(item.id)}><span className="import-review-check"><Check size={14} /></span><span><strong>{item.name}</strong><small>{item.days.join(" · ")} · {item.timeRange} · {formatShortHours(item.durationHours)} each day</small></span></button>
          <div className="import-review-actions"><span className="import-category-chip">{categoryLabel(item.category)}</span><button className="text-button import-edit-button" onClick={() => setEditingId(item.id)}><PenLine size={14} /> Edit</button></div>
        </div>)}</div>
        <div className="import-review-actions import-review-footer"><button className="secondary-button" onClick={openFilePicker}><RotateCcw size={15} /> Scan again</button><button className="primary-button" onClick={onApprove}>Continue <ArrowRight size={17} /></button></div>
      </section>
    ) : (
      <section className="card import-card">
        <div className="section-kicker"><Upload size={14} /><span>Choose a source</span></div>
        <div className="import-source-group">
          <span className="import-source-label"><Upload size={14} /> Upload timetable</span>
          <button className="import-source-button" onClick={openFilePicker}><Upload size={15} /> Upload Timetable</button>
          <span className="import-source-caption">JPG, PNG, GIF, or WebP image</span>
        </div>
        <div className="import-divider"><span>OR</span></div>
        <div className="import-source-group">
          <span className="import-source-label"><CalendarCheck2 size={14} /> Import calendar</span>
          <button className="import-source-button" onClick={onCalendar}><CalendarCheck2 size={15} /> Import Calendar</button>
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
    {error && items.length === 0 && !loading && <p className="import-error import-error-note" role="alert"><TriangleAlert size={15} /> {error}</p>}
    {editingItem && <div className="sheet-backdrop import-edit-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-import-title"><div className="import-edit-modal">
      <div className="sheet-head"><div><p className="eyebrow">Timetable item</p><h2 id="edit-import-title">Edit commitment</h2></div><button className="icon-button" aria-label="Close edit commitment" onClick={() => setEditingId(null)}><X size={19} /></button></div>
      <label className="field-label">Name<input className="text-input" value={editDraft.name} onChange={(event) => setEditDraft((current) => ({ ...current, name: event.target.value }))} /></label>
      <div className="import-edit-field"><span className="field-label">Days</span><div className="day-picker">{DAYS.map((day) => <button type="button" key={day} className={`day-toggle ${editDraft.days.includes(day) ? "day-toggle-active" : ""}`} onClick={() => setEditDraft((current) => ({ ...current, days: current.days.includes(day) ? current.days.filter((item) => item !== day) : [...current.days, day] }))}>{day}</button>)}</div></div>
      <div className="grid grid-cols-2 gap-3"><label className="field-label">Start time<input type="time" className="text-input" value={editDraft.startTime} onChange={(event) => setEditDraft((current) => ({ ...current, startTime: event.target.value }))} /></label><label className="field-label">End time<input type="time" className="text-input" value={editDraft.endTime} onChange={(event) => setEditDraft((current) => ({ ...current, endTime: event.target.value }))} /></label></div>
      <label className="field-label">Duration per day<input type="number" min="0.5" step="0.5" className="text-input" value={editDraft.durationHours} onChange={(event) => setEditDraft((current) => ({ ...current, durationHours: Number(event.target.value) }))} /></label>
      <div className="modal-actions"><button className="secondary-button" onClick={() => setEditingId(null)}>Cancel</button><button className="primary-button" disabled={!editDraft.name.trim() || !editDraft.days.length || editDraft.durationHours <= 0} onClick={saveEdit}>Save changes</button></div>
    </div></div>}
  </div>;
}

function Triage({ calculation, displayMargin, items, selectedTriage, selectedRecovery, remainingDeficit, overrideCount, outcome, onToggle, onApply, onContinue, onProceed, onPlanner, onDashboard }: { calculation: CalculationShape; displayMargin: number; items: FlexibleTask[]; selectedTriage: number[]; selectedRecovery: number; remainingDeficit: number; overrideCount: number; outcome: TriageOutcome; onToggle: (id: number) => void; onApply: () => void; onContinue: () => void; onProceed: () => void; onPlanner: () => void; onDashboard: () => void }) {
  const displayStatus = statusFor(displayMargin);
  const hasDeficit = displayMargin < 0;
  if (outcome === "failure") return <FailureState onProtect={onPlanner} onDashboard={onDashboard} />;
  return <div className="triage-page"><div className="screen-header"><div><p className="eyebrow">Triage <span>Rebalancing, not task management</span></p><h1 className="page-heading">{hasDeficit ? "Recovery deficit detected." : "Free up time, proactively."}</h1><p className="lede compact">{hasDeficit ? "Release flexible commitments to restore your Recovery Margin." : "Your Recovery Margin is comfortable. Releasing commitments here is optional, not required."}</p>{overrideCount >= 3 && <p className="override-alert">You've overridden {overrideCount} warnings. Please rebalance before continuing.</p>}</div><div className="triage-margin"><span>Recovery Margin</span><strong style={{ color: displayStatus.color }}>{formatHours(displayMargin)}</strong></div></div><section className="card triage-card"><div className="triage-note"><LockKeyhole size={15} /> Recovery blocks are never suggested here.</div>{outcome === "full" ? <div className="outcome-panel outcome-full"><CircleCheck size={23} /><div><strong>Recovery Margin restored.</strong><p>The selected flexible commitments moved out of this week.</p></div><button className="secondary-button" onClick={onDashboard}>Return to Dashboard</button></div> : outcome === "partial" ? <div className="outcome-panel outcome-partial"><TriangleAlert size={23} /><div><strong>Partial rebalancing applied. {formatHours(remainingDeficit)} deficit remains.</strong><p>Would you like to continue adjusting or proceed with the remaining deficit?</p></div><div className="outcome-actions"><button className="secondary-button" onClick={onContinue}>Continue Adjusting</button><button className="primary-button" onClick={onProceed}>Proceed Anyway</button></div></div> : <><div className="triage-list">{items.length ? items.map((task) => <button key={task.id} className={`triage-item ${selectedTriage.includes(task.id) ? "triage-item-selected" : ""}`} onClick={() => onToggle(task.id)}><span className="triage-check">{selectedTriage.includes(task.id) ? <Check size={17} /> : <Circle size={19} />}</span><span className="triage-item-copy"><strong>{task.name}</strong><small>{formatHours(task.estimatedHours)} → push to {task.deadline === "Sat" ? "Sunday" : "Saturday"}</small></span><span className="triage-gain">+{formatShortHours(task.estimatedHours)}</span></button>) : <div className="empty-state">No flexible commitments are available to release.</div>}</div><div className="triage-total"><div><span>Selected recovery</span><strong>+{formatHours(selectedRecovery)}</strong></div><div><span>{hasDeficit ? "Remaining deficit" : "Margin after changes"}</span><strong className={hasDeficit ? (remainingDeficit === 0 ? "text-green" : "") : "text-green"}>{hasDeficit ? formatHours(remainingDeficit) : formatHours(displayMargin + selectedRecovery)}</strong></div></div><button className="primary-button primary-button-wide" disabled={!selectedTriage.length} onClick={onApply}>Apply Selected Rebalancing <ArrowRight size={17} /></button></>}</section></div>;
}

function FailureState({ onProtect, onDashboard }: { onProtect: () => void; onDashboard: () => void }) { return <div className="failure-panel"><div className="failure-mark"><TriangleAlert size={25} /></div><h1>Some recovery loss this week may be unavoidable.</h1><p>Based on your current commitments, there is no flexible combination that restores the full deficit.</p><div className="what-margin"><strong>What Margin can still do:</strong><span>→ Protect your highest-value sleep nights</span><span>→ Flag which days carry most risk</span><span>→ Plan recovery for next week</span></div><div className="outcome-actions"><button className="secondary-button" onClick={onProtect}>Plan Next Week</button><button className="primary-button" onClick={onDashboard}>Protect What's Left</button></div></div>; }

function RecoveryMenu({ onClose }: { onClose: () => void }) {
  const [selectedTime, setSelectedTime] = useState<10 | 30 | 120 | null>(null);
  return <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-labelledby="recovery-menu-title"><div className="quick-sheet recovery-menu-sheet"><div className="sheet-head"><div><p className="eyebrow">Recovery Menu</p><h2 id="recovery-menu-title">How much time do you have?</h2></div><button className="icon-button" aria-label="Close recovery menu" onClick={onClose}><X size={19} /></button></div><div className="time-selector"><button className={`time-chip ${selectedTime === 10 ? "time-chip-active" : ""}`} onClick={() => setSelectedTime(10)}>10 min</button><button className={`time-chip ${selectedTime === 30 ? "time-chip-active" : ""}`} onClick={() => setSelectedTime(30)}>30 min</button><button className={`time-chip ${selectedTime === 120 ? "time-chip-active" : ""}`} onClick={() => setSelectedTime(120)}>2 hours</button></div>{selectedTime && <div className="recovery-options-list">{RECOVERY_MENU[selectedTime].map((option) => <div key={option.name} className="recovery-option-row"><strong>{option.name}</strong><small>{option.detail}</small></div>)}</div>}<button className="secondary-button" onClick={onClose}>Close</button></div></div>;
}

function RecoveryPlanner({ loadPattern, recoveryBlocks, plannerMessage, onProtect, onLockAll, onUnlock, onUnlockAll, unlockTarget, onConfirmUnlock, onCancelUnlock, onSkip, onShowRecoveryMenu }: { loadPattern: { label: string; recommendation: string; category: TaskCategory }; recoveryBlocks: RecoveryBlock[]; plannerMessage: string; onProtect: (id: number) => void; onLockAll: () => void; onUnlock: (id: number) => void; onUnlockAll: () => void; unlockTarget: number | "all" | null; onConfirmUnlock: () => void; onCancelUnlock: () => void; onSkip: () => void; onShowRecoveryMenu: () => void }) {
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
          <div className="planner-block-actions">{block.locked ? <><span className="locked-copy"><ShieldCheck size={15} /> Protected</span><button className="secondary-button planner-action-btn planner-unlock-button" onClick={() => onUnlock(block.id)}>Unlock</button></> : <><button className="secondary-button planner-action-btn" onClick={() => onProtect(block.id)}>Protect</button><button className="text-button planner-action-btn">Edit</button></>}</div>
        </div>)}
      </div>
    </section>
    {plannerMessage && <div className="planner-message"><Check size={16} /> {plannerMessage}</div>}
    <div className="button-stack">
      <button className="primary-button" disabled={blocks.every((block) => block.locked)} onClick={onLockAll}><LockKeyhole size={17} /> Lock All Suggested Blocks</button>
      <button className="secondary-button planner-unlock-all-button" disabled={!blocks.some((block) => block.locked)} onClick={onUnlockAll}>Unlock All</button>
      <button className="text-button recovery-menu-trigger" onClick={onShowRecoveryMenu}>What can I do right now?</button>
      <button className="secondary-button" onClick={onSkip}>Skip for Now</button>
    </div>
    {unlockTarget !== null && <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-labelledby="unlock-confirm-title"><div className="planner-confirm-sheet"><h2 id="unlock-confirm-title">{unlockTarget === "all" ? "Remove all recovery blocks?" : "Remove this recovery block?"}</h2><p>{unlockTarget === "all" ? "All protected recovery time this week will be released." : "This will free up the time but reduce your protected recovery for the week."}</p><div className="planner-confirm-actions"><button className="primary-button primary-button-danger" onClick={onConfirmUnlock}>{unlockTarget === "all" ? "Yes, unlock all" : "Yes, remove it"}</button><button className="secondary-button" onClick={onCancelUnlock}>{unlockTarget === "all" ? "Keep them protected" : "Keep it protected"}</button></div></div></div>}
  </div>;
}

function OutcomesSummary({ outcomes, riskRepairMessage, onDashboard }: { outcomes: ProtectedOutcomes; riskRepairMessage: string | null; onDashboard: () => void }) {
  return <div className="outcomes-card"><div className="outcomes-heading"><CircleCheck size={22} /><span>Rebalancing applied</span></div><p className="outcomes-lede">You just protected:</p><div className="outcomes-list">{outcomes.protectedSleep > 0 && <div className="outcome-item"><span className="outcome-icon">😴</span><span>{outcomes.protectedSleep} hour{outcomes.protectedSleep === 1 ? "" : "s"} of sleep</span></div>}{outcomes.conflictsRemoved > 0 && <div className="outcome-item"><span className="outcome-icon">🔓</span><span>{outcomes.conflictsRemoved} recovery conflict{outcomes.conflictsRemoved === 1 ? "" : "s"}</span></div>}{outcomes.protectedMargin > 0 && <div className="outcome-item"><span className="outcome-icon">📈</span><span>{outcomes.protectedMargin} hour{outcomes.protectedMargin === 1 ? "" : "s"} of recovery margin</span></div>}{outcomes.protectedSleep <= 0 && outcomes.conflictsRemoved <= 0 && outcomes.protectedMargin <= 0 && <div className="outcome-item"><span className="outcome-icon">⚠️</span><span>No additional margin was restored</span></div>}</div><p className="outcome-insight">{riskRepairMessage ?? calculateRiskMessage(outcomes)}</p><div className="outcome-buttons"><button className="secondary-button" onClick={onDashboard}>Back to schedule</button><button className="primary-button" onClick={onDashboard}>View week</button></div></div>;
}

function Guide({ step, setStep, onClose, onDone }: { step: number; setStep: Dispatch<SetStateAction<number>>; onClose: () => void; onDone: () => void }) {
  const steps = [
    { icon: "🛡️", title: "Set Your Recovery Floor", description: "Your non-negotiable baseline for rest. Tell MARGIN the minimum sleep and decompression you need each week. Everything else is planned around protecting that floor.", example: "Sleep + decompression = your protected baseline" },
    { icon: "🗓️", title: "See Your Week at a Glance", description: "The weekly view puts tasks, commitments, and recovery together in one calm overview. Color and load cues help you spot crowded days before they become stressful.", example: "Week view · load mapped across Monday–Sunday" },
    { icon: "☀️", title: "Focus on Today", description: "Switch to Daily View when you need a smaller surface. Tasks are grouped into morning, afternoon, and evening, with deadline urgency made easy to scan.", example: "Today · Morning · Afternoon · Evening" },
    { icon: "➕", title: "Add a Task", description: "When you add a commitment, MARGIN shows the likely consequence before you commit. You can adjust the estimate, find a better slot, or defer a task when the week is tight.", example: "Add task → preview impact → choose a safer option" },
    { icon: "🌙", title: "Protect Recovery", description: "Recovery Planner suggests blocks based on your load. Protect the suggested time so new commitments respect the rest your week needs.", example: "Protected recovery block · Thursday 18:30–19:30" },
    { icon: "📈", title: "Reflect on Patterns", description: "Weekly Reflection turns your check-ins and schedule into a readable pattern. Use it to notice stress, mood trends, and which recovery choices helped.", example: "Mood trend ↗ · recovery consistency · weekly insight" },
    { icon: "💬", title: "Ask Can I Afford This?", description: "Use the quick check when a new task appears. It compares the task with your current margin and gives a direct, grounded answer before you add it.", example: "Quick check · margin impact · next best move" },
    { icon: "⚙️", title: "Customize Settings", description: "Settings lets you choose whether mood reminders appear and how often they prompt you. You can use a schedule, select Manual only, and change it whenever your routine changes.", example: "Notifications · interval · save preferences" },
  ];
  const current = steps[step];
  return <div className="guide-screen"><div className="guide-header"><button className="guide-nav-button" aria-label="Previous guide step" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>←</button><span>Step {step + 1} of {steps.length}</span><button className="guide-close-button" aria-label="Close guide" onClick={onClose}>✕</button></div><div className="guide-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><div className="guide-content"><div className="guide-icon" aria-hidden="true">{current.icon}</div><span className="guide-kicker">How MARGIN works</span><h2>{current.title}</h2><p>{current.description}</p><div className="guide-example">{current.example}</div></div><div className="guide-footer">{step < steps.length - 1 ? <button className="primary-button" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>Next <ArrowRight size={16} /></button> : <button className="primary-button" onClick={onDone}>Done</button>}</div></div>;
}

function Settings({ onBack }: { onBack: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => typeof window === "undefined" ? true : JSON.parse(window.localStorage.getItem("notifications-enabled") ?? "true"));
  const [reminderInterval, setReminderInterval] = useState(() => typeof window === "undefined" ? "4" : window.localStorage.getItem("notification-interval") ?? "4");
  const [taskPromptsEnabled, setTaskPromptsEnabled] = useState(() => typeof window === "undefined" ? true : JSON.parse(window.localStorage.getItem("task-toast-enabled") ?? "true"));
  const [taskPromptInterval, setTaskPromptInterval] = useState(() => typeof window === "undefined" ? "4" : window.localStorage.getItem("task-toast-interval") ?? "4");
  const [recoveryFramePreference, setRecoveryFramePreference] = useState<"week" | "day">(() => typeof window === "undefined" ? "day" : window.localStorage.getItem("recovery-frame-preference") === "week" ? "week" : "day");
  const handleSave = () => {
    window.localStorage.setItem("notifications-enabled", JSON.stringify(notificationsEnabled));
    window.localStorage.setItem("notification-interval", reminderInterval);
    window.localStorage.setItem("task-toast-enabled", JSON.stringify(taskPromptsEnabled));
    window.localStorage.setItem("task-toast-interval", taskPromptInterval);
    window.localStorage.setItem("recovery-frame-preference", recoveryFramePreference);
    toast.success("Settings saved");
  };
  const intervalOptions = [{ value: "2", label: "Every 2 hours" }, { value: "4", label: "Every 4 hours" }, { value: "6", label: "Every 6 hours" }, { value: "twice", label: "Twice a day (9am, 5pm)" }, { value: "once", label: "Once a day (9am)" }, { value: "manual", label: "Manual only (I'll check in)" }];
  return <div className="settings-screen"><div className="settings-heading"><button className="text-button settings-back-button" onClick={onBack}><ArrowLeft size={14} /> Settings</button><h1>Settings</h1></div><section className="card settings-card"><span className="card-label">Appearance</span><div className="settings-group"><span className="settings-option-label">Theme</span><div className="theme-options"><button className={`theme-option ${theme === "light" ? "active" : ""}`} onClick={() => theme !== "light" && toggleTheme()}>☀️ Light</button><button className={`theme-option ${theme === "dark" ? "active" : ""}`} onClick={() => theme !== "dark" && toggleTheme()}>🌙 Dark</button></div><p className="settings-hint">Dark mode reduces eye strain before bed.</p></div><span className="card-label">Notifications</span><label className="settings-toggle-row"><span><strong>Mood Check Reminders</strong><small>Prompt you to log how you feel.</small></span><input type="checkbox" checked={notificationsEnabled} onChange={(event) => setNotificationsEnabled(event.target.checked)} /></label><div className="settings-option-group"><span className="settings-option-label">How often?</span><div className="interval-options">{intervalOptions.map((option) => <label key={`mood-${option.value}`}><input type="radio" name="notification-interval" value={option.value} checked={reminderInterval === option.value} onChange={(event) => setReminderInterval(event.target.value)} />{option.label}</label>)}</div></div><div className="settings-notification-block"><label className="settings-toggle-row"><span><strong>Recovery Check-ins</strong><small>Get notified about your recovery margin and easy ways to add tasks.</small></span><input type="checkbox" checked={taskPromptsEnabled} onChange={(event) => setTaskPromptsEnabled(event.target.checked)} /></label><div className="settings-option-group"><span className="settings-option-label">How often?</span><div className="interval-options">{intervalOptions.map((option) => <label key={`task-${option.value}`}><input type="radio" name="task-toast-interval" value={option.value} checked={taskPromptInterval === option.value} onChange={(event) => setTaskPromptInterval(event.target.value)} />{option.label}</label>)}</div></div></div><div className="settings-option-group"><span className="settings-option-label">Show recovery time as:</span><div className="interval-options"><label><input type="radio" name="recovery-frame-preference" value="week" checked={recoveryFramePreference === "week"} onChange={() => setRecoveryFramePreference("week")} />This week</label><label><input type="radio" name="recovery-frame-preference" value="day" checked={recoveryFramePreference === "day"} onChange={() => setRecoveryFramePreference("day")} />Today</label></div></div><button className="primary-button" onClick={handleSave}>Save preferences</button></section></div>;
}

function Reflection({ calculation, overrideCount, taskOutcomes, moodCheckIns, energyCheckIns, recoveryBlocks, onNextWeek, onAdjust }: { calculation: CalculationShape; overrideCount: number; taskOutcomes: TaskOutcomeRecord[]; moodCheckIns: MoodCheckIn[]; energyCheckIns: EnergyCheckIn[]; recoveryBlocks: RecoveryBlock[]; onNextWeek: () => void; onAdjust: () => void }) {
  const hardestIndex = calculation.dailyMargins.reduce((lowest, margin, index, margins) => margin < margins[lowest] ? index : lowest, 0);
  const maintained = Math.round(calculation.tier2Total);
  const floorProtectedDays = calculation.dailyMargins.filter((margin) => margin >= 0).length;
  const outcomeCounts = { Easy: 0, Fine: 0, Hard: 0, Disaster: 0 };
  taskOutcomes.forEach((record) => { outcomeCounts[record.outcome] += 1; });
  const reflectionWeekMonday = new Date();
  reflectionWeekMonday.setHours(0, 0, 0, 0);
  reflectionWeekMonday.setDate(reflectionWeekMonday.getDate() - ((reflectionWeekMonday.getDay() + 6) % 7));
  const last7Days = Array.from({ length: 7 }, (_, offset) => { const date = new Date(reflectionWeekMonday); date.setDate(date.getDate() + offset); const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" }); const average = calculateDailyMoodAverage(date, moodCheckIns); const energyChecks = energyCheckIns.filter((entry) => entryDateKey(entry.date) === localDateKey(date)); return { date, dayLabel, average, energyValue: energyChecks.at(-1)?.response ?? null }; });
  const [showStressChart, setShowStressChart] = useState(false);
  const stressData = calculateWeeklyStressPattern(moodCheckIns, last7Days.map((day) => day.date), recoveryBlocks);
  const weeklyMoodValues = last7Days.map((day) => day.average).filter((value): value is number => value !== null);
  const avgCheckInScore = weeklyMoodValues.length ? weeklyMoodValues.reduce((sum, score) => sum + score, 0) / weeklyMoodValues.length : null;
  const moodLabelForAverage = (average: number | null) => average === null ? "No check-in" : average >= 3.5 ? "Energized" : average >= 2.5 ? "Good" : average >= 1.5 ? "Okay" : "Drained";
  const moodDotsForAverage = (average: number | null) => average === null ? "○○○○" : `${"●".repeat(Math.round(average))}${"○".repeat(Math.max(0, 4 - Math.round(average)))}`;
  const moodTrend = weeklyMoodValues.length >= 2 ? weeklyMoodValues[weeklyMoodValues.length - 1] - weeklyMoodValues[0] : 0;
  const moodTrendText = weeklyMoodValues.length < 2 ? "not enough check-ins yet" : moodTrend > 0.25 ? "↗ improving throughout" : moodTrend < -0.25 ? "↘ declining throughout" : "→ holding steady";
  const recoveryDays = new Set(recoveryBlocks.filter((block) => block.locked).map((block) => block.day.slice(0, 3)));
  const drainedDays = last7Days.filter((day) => day.average !== null && day.average < 2.5);
  const recoveryMoodValues = last7Days.filter((day) => day.average !== null && recoveryDays.has(day.dayLabel)).map((day) => day.average as number);
  const nonRecoveryMoodValues = last7Days.filter((day) => day.average !== null && !recoveryDays.has(day.dayLabel)).map((day) => day.average as number);
  const recoveryAverage = recoveryMoodValues.length ? recoveryMoodValues.reduce((sum, value) => sum + value, 0) / recoveryMoodValues.length : null;
  const nonRecoveryAverage = nonRecoveryMoodValues.length ? nonRecoveryMoodValues.reduce((sum, value) => sum + value, 0) / nonRecoveryMoodValues.length : null;
  const stressDays = last7Days.filter((day, index) => calculation.dailyMargins[index] < 5 && day.average !== null);
  const moodRecoveryInsight = recoveryAverage !== null && nonRecoveryAverage !== null && recoveryAverage > nonRecoveryAverage + 0.2
    ? "Your mood improves on days with protected recovery blocks. Consider protecting recovery before your tightest days."
    : drainedDays.length && stressDays.length
      ? `You felt drained on ${drainedDays.map((day) => day.dayLabel).join(" and ")}, which overlaps with tight-margin days. Consider protecting more recovery time there.`
      : "Your mood pattern will become clearer as you log more checks alongside your recovery plan.";
  const recoveryQualityLabel = avgCheckInScore === null ? null : avgCheckInScore < 2 ? "Needs attention" : avgCheckInScore < 3 ? "Moderate" : "Well restored";
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
    <section className="card weekly-mood-trend-card">
      <span className="card-label">Your Weekly Mood Trend</span>
      <div className="weekly-mood-list">{last7Days.map((day) => <div className="weekly-mood-row" key={day.dayLabel}><span className="weekly-mood-day">{day.date.toLocaleDateString("en-US", { weekday: "long" })}</span><span className="weekly-mood-dots">{moodDotsForAverage(day.average)}</span><span className="weekly-mood-score">{day.average === null ? "—" : day.average.toFixed(1)}</span><span className="weekly-mood-label">{moodLabelForAverage(day.average)}</span></div>)}</div>
      <div className="weekly-mood-summary"><strong>Weekly avg: {avgCheckInScore === null ? "—" : avgCheckInScore.toFixed(1)}{avgCheckInScore !== null ? ` (${moodLabelForAverage(avgCheckInScore)})` : ""}</strong><span>Trend: {moodTrendText}</span></div>
    </section>
    <section className="card stress-pattern">
      <span className="card-label">Stress Pattern</span>
      <div className="stress-pattern-list">{last7Days.map((day) => <div className="stress-pattern-row" key={day.dayLabel}><span className="stress-pattern-day">{day.dayLabel}</span><span className="stress-pattern-value">{day.average === null ? "No check-in" : `${moodDotsForAverage(day.average)} ${day.average.toFixed(1)} · ${moodLabelForAverage(day.average)}`}</span></div>)}</div>
      <p className="stress-pattern-insight">{moodRecoveryInsight}</p><button className="btn-expand" onClick={() => setShowStressChart(true)}>📈 Expand chart</button>
    </section>{showStressChart && <div className="modal-overlay" onClick={() => setShowStressChart(false)}><div className="modal-content" onClick={(event) => event.stopPropagation()}><StressPatternChart stressData={stressData} recoveryTarget={7} onClose={() => setShowStressChart(false)} /></div></div>}
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

    // Rebuilt fresh on every call from the current props/state closure — never cached or reused across calls.
    const context = buildUserContext({ calculation, tasks, sleepHours, decompHours, risk });
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    setChatLoading(true);
    const systemPreamble = `You are Margin, a recovery-first student planning assistant. Using ONLY the real data below, answer the user's specific question directly in 2-3 concise sentences. Do not begin with a generic weekly status or restate the Recovery Margin unless that information is directly relevant to the question. For an affordability or named-task question, assess that task and its stated duration first, using the schedule data. If the question asks about the broader week, summarize the most relevant pattern and one practical adjustment. Be direct, warm, and brief — no bullet points, no headers, never invent facts not present below.\n\n${context}`;
    if (import.meta.env.DEV) console.log("[Quick Check] prompt characters:", systemPreamble.length);
    try {
      if (!apiKey) throw new Error("missing API key");
      // Gemini 3.5 Flash-Lite replaces deprecated 2.5 Flash-Lite for new users after the prior model returned 404.
      const requestBody = {
        contents: [
          { role: "user", parts: [{ text: systemPreamble }] },
          { role: "model", parts: [{ text: "Understood. I'll answer using only this student's real schedule and check-in data." }] },
          ...nextMessages.map((message) => ({ role: message.role === "user" ? "user" : "model", parts: [{ text: message.content }] })),
        ],
        generationConfig: {
          // thinkingConfig is intentionally omitted for gemini-3.5-flash-lite while diagnosing its INVALID_ARGUMENT response.
          // thinkingConfig: { thinkingBudget: 0 },
          maxOutputTokens: 256,
          temperature: 0,
        },
      };
      console.log("[Quick Check] request body:", requestBody);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (response.status === 429) throw new Error("rate limited");
      const responseBody = await response.text();
      if (!response.ok) {
        console.error("[Quick Check] Gemini error response:", responseBody);
        if (response.status >= 500) throw new Error("server failure");
        throw new Error("bad response");
      }
      const data = JSON.parse(responseBody);
      const finishReason = data?.candidates?.[0]?.finishReason;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (finishReason !== "STOP" && finishReason !== "MAX_TOKENS") throw new Error("invalid finish reason");
      if (!text) throw new Error("empty response");
      setChatMessages([...nextMessages, { role: "assistant", content: String(text).trim(), isTruncated: finishReason === "MAX_TOKENS" }]);
    } catch (error) {
      const message = error instanceof Error && error.message === "missing API key"
        ? "Gemini isn't configured for this preview — add VITE_GEMINI_API_KEY to enable AI replies."
        : error instanceof Error && error.message === "rate limited"
          ? "AI is getting a lot of requests right now — try again in a minute."
          : error instanceof Error && error.message === "server failure"
            ? "Gemini is temporarily unavailable — please try again shortly."
            : error instanceof TypeError
              ? "Couldn't reach Gemini — check your connection and try again."
              : error instanceof Error && error.message === "invalid finish reason"
                ? "Gemini couldn't complete that answer — please try asking again."
                : "Gemini request failed — check the deployment configuration or try again.";
      setChatMessages([...nextMessages, { role: "assistant", content: message, isError: true }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    const trimmedName = name.trim();
    const question = trimmedName && hours > 0
      ? `Can I fit "${trimmedName}" (${hours}h) into my week without burning out?`
      : "Can I afford this?";
    const askKey = `${trimmedName.toLowerCase()}|${hours}`;
    if (askedRef.current === askKey) return;
    const timer = setTimeout(() => {
      askedRef.current = askKey;
      sendChatMessage(question);
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
            <div key={index} className={`chat-bubble ${message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"} ${message.isError ? "chat-bubble-error" : ""}`}>{message.role === "assistant" && <Sparkles size={14} />}<span>{message.content}</span>{message.isTruncated && <small className="chat-truncation-notice">Answer was cut short — try asking a narrower question.</small>}</div>
          ))}
          {chatLoading && <div className="chat-bubble chat-bubble-assistant chat-bubble-loading"><Spinner className="size-3.5" /> Reading your schedule...</div>}
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
