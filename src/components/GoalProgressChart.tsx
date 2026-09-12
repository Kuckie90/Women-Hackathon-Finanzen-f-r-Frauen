import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Target,
  ArrowUpRight,
} from "lucide-react";
import { GoalProgressItem } from "../utils/goalsAndPension";
import { formatEuro } from "../constants/rules";

interface GoalProgressChartProps {
  goals: GoalProgressItem[];
  overallPensionCoveragePercent: number;
  projectedPensionCapital: number;
  jahreBisRente: number;
  monatsrate: number;
  monthlyWachstum: number;
  onOpenGlossary?: (term: string) => void;
}

export function GoalProgressChart({
  goals,
  overallPensionCoveragePercent,
  projectedPensionCapital,
  jahreBisRente,
  monatsrate,
  monthlyWachstum,
  onOpenGlossary,
}: GoalProgressChartProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>("rentenluecke");

  // Format data for the Recharts Bar Chart
  const chartData = goals.map((g) => ({
    id: g.id,
    name: g.name.length > 20 ? g.name.substring(0, 18) + "…" : g.name,
    fullName: g.name,
    erreicht: g.prozentErreicht,
    zielBetrag: g.zielBetrag,
    istBetrag: g.istBetrag,
    topf: g.topfLabel,
    color:
      g.id === "notgroschen"
        ? "#2E7D32" // Grün für Sicherheit
        : g.id === "mittelfrist"
        ? "#B8873B" // Gold für Mittelfrist
        : "#3E2340", // Dunkellila/Aubergine für Rente/Wachstum
  }));

  const activeGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];

  return (
    <div
      id="zielerreichungs-grafik-container"
      className="p-4 rounded-2xl bg-white border border-[#E5DFD7] space-y-4 shadow-xs"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#B8873B]/15 text-[#B8873B] flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8873B] block">
              Status Quo & Zukunft
            </span>
            <h3 className="font-bold text-sm text-[#3E2340]">
              Deine Zielerreichung zum aktuellen Stand
            </h3>
          </div>
        </div>

        {onOpenGlossary && (
          <button
            type="button"
            onClick={() => onOpenGlossary("Lebensziele")}
            className="text-[11px] font-semibold text-[#B8873B] hover:underline cursor-pointer"
          >
            Info
          </button>
        )}
      </div>

      <p className="text-xs text-[#3E2340]/80 leading-relaxed">
        So weit sind deine definierten Ziele mit deinem <strong>aktuellen Ist-Bestand</strong> bereits finanziert – und so entwickeln sie sich durch deine monatliche Sparrate weiter:
      </p>

      {/* RECHARTS HORIZONTAL PROGRESS BARS */}
      <div className="h-44 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fill: "#3E2340", opacity: 0.6 }}
              axisLine={{ stroke: "#E5DFD7" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#3E2340", fontWeight: 600 }}
              width={100}
              axisLine={{ stroke: "#E5DFD7" }}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: any, _name: any, item: any) => [
                `${value} % erreicht (${formatEuro(item.payload.istBetrag)} von ${formatEuro(item.payload.zielBetrag)})`,
                "Fortschritt",
              ]}
              contentStyle={{
                backgroundColor: "#3E2340",
                color: "#F7F4F0",
                borderRadius: "12px",
                border: "none",
                fontSize: "12px",
                padding: "8px 12px",
              }}
            />
            <Bar
              dataKey="erreicht"
              radius={[0, 8, 8, 0]}
              barSize={20}
              onClick={(entry) => setSelectedGoalId(entry.id)}
              className="cursor-pointer"
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.id}`}
                  fill={entry.color}
                  opacity={selectedGoalId === entry.id ? 1 : 0.75}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* INTERAKTIVE ZIEL-KARTEN */}
      <div className="grid grid-cols-3 gap-2">
        {goals.map((goal) => {
          const isSelected = goal.id === selectedGoalId;
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => setSelectedGoalId(goal.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#3E2340] text-[#F7F4F0] border-[#3E2340] shadow-xs"
                  : "bg-[#F7F4F0] text-[#3E2340] border-[#E5DFD7] hover:border-[#B8873B]"
              }`}
            >
              <span
                className={`text-[9px] uppercase tracking-wider font-bold block truncate ${
                  isSelected ? "text-[#B8873B]" : "text-[#3E2340]/60"
                }`}
              >
                {goal.kategorie}
              </span>
              <div className="font-bold text-xs truncate mt-0.5">{goal.name}</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-serif text-base font-bold">
                  {goal.prozentErreicht} %
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* DETAIL-BOX DES AUSGEWÄHLTEN ZIELS */}
      {activeGoal && (
        <div className="p-3.5 rounded-xl bg-[#F7F4F0] border border-[#E5DFD7] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E2340]">
              {activeGoal.name} ({activeGoal.topfLabel})
            </span>
            <span className="text-xs font-bold text-[#B8873B]">
              {activeGoal.prozentErreicht} % erreicht
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div>
              <span className="text-[#3E2340]/60 block text-[11px]">Ist-Stand heute:</span>
              <span className="font-semibold text-[#3E2340]">
                {formatEuro(activeGoal.istBetrag)}
              </span>
            </div>
            <div>
              <span className="text-[#3E2340]/60 block text-[11px]">Ziel-Bedarf:</span>
              <span className="font-semibold text-[#3E2340]">
                {formatEuro(activeGoal.zielBetrag)}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#3E2340]/80 leading-relaxed pt-1 border-t border-[#E5DFD7]/60">
            {activeGoal.prognoseText}
          </p>
        </div>
      )}

      {/* SPEZIELLE RENTEN-DECKUNGS-HIGHLIGHT-KARTE */}
      <div className="p-3 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/25 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B5E20]">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Prognose zur Rentenlücke mit 67 Jahren</span>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#1B5E20] text-white">
            {overallPensionCoveragePercent} % gedeckt
          </span>
        </div>
        <p className="text-xs text-[#3E2340]/80 leading-relaxed">
          Mit deinen aktuellen <strong>{formatEuro(monthlyWachstum)} monatlich in Topf 2 (Wachstum)</strong> wächst dein Altersvorsorge-Kapital bei moderaten 6 % Realrendite p. a. in {jahreBisRente} Jahren auf voraussichtlich <strong>{formatEuro(projectedPensionCapital)}</strong> an. Deine Rentenlücke wird damit zu <strong>{overallPensionCoveragePercent} %</strong> geschlossen!
        </p>
      </div>
    </div>
  );
}
