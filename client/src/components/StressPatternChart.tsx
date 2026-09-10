import { Area, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type StressPoint = { day: string; stress: number; isAboveFloor: boolean; hasRecovery: boolean };

function insightLines(data: StressPoint[], target: number) {
  const above = data.filter((point) => point.isAboveFloor).map((point) => point.day);
  const below = data.filter((point) => !point.isAboveFloor).map((point) => point.day);
  const recovery = data.filter((point) => point.hasRecovery).map((point) => point.day);
  const lines: string[] = [];
  if (below.length >= 3) lines.push(`✓ ${below.join(", ")}: Below target — great recovery`);
  if (above.length >= 2) lines.push(`⚠️ ${above.join(", ")}: Above target — consider recovery blocks`);
  if (recovery.length >= 2) lines.push(`✓ Protected ${recovery.length} days with recovery — that helped`);
  const first = data[0]?.stress ?? target;
  const last = data[data.length - 1]?.stress ?? target;
  lines.push(last < first ? "↗ Trend: Recovering toward week-end" : "↘ Trend: Stress building through week");
  return lines;
}

export function StressPatternChart({ stressData, recoveryTarget, onClose }: { stressData: (StressPoint & { above: number; below: number })[]; recoveryTarget: number; onClose: () => void }) {
  return <div className="stress-chart-modal"><div className="chart-header"><h3>Stress Pattern</h3><button aria-label="Close stress chart" onClick={onClose}>✕</button></div><ResponsiveContainer width="100%" height={300}><LineChart data={stressData} margin={{ top: 10, right: 24, left: 0, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" /><XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} /><YAxis domain={[1, 10]} ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} tick={{ fontSize: 10, fill: "var(--text-secondary)" }} label={{ value: "Stress", angle: -90, position: "insideLeft", fill: "var(--text-secondary)", fontSize: 10 }} /><Area type="monotone" dataKey="above" baseValue={recoveryTarget} stroke="none" fill="#FCA5A5" fillOpacity={.28} isAnimationActive={false} /><Area type="monotone" dataKey="below" baseValue={recoveryTarget} stroke="none" fill="#A7F3D0" fillOpacity={.24} isAnimationActive={false} /><ReferenceLine y={recoveryTarget} stroke="#8AD8C9" strokeDasharray="5 5" label={{ value: "Recovery target", position: "right", fill: "#1D9E75", fontSize: 10 }} /><Line type="monotone" dataKey="stress" stroke="#1D9E75" strokeWidth={3} dot={{ fill: "#1D9E75", r: 4 }} activeDot={{ r: 6 }} isAnimationActive /><Tooltip formatter={(value: number | string) => [Number(value).toFixed(1), "Stress"]} contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 8, color: "var(--text-primary)" }} /></LineChart></ResponsiveContainer><div className="chart-legend"><span><i className="chart-legend-line chart-legend-actual" /> Actual stress</span><span><i className="chart-legend-line chart-legend-target" /> Recovery floor</span></div><div className="chart-insights">{insightLines(stressData, recoveryTarget).map((line) => <p key={line}>{line}</p>)}</div></div>;
}
