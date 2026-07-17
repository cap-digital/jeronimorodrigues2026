"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { InsightsResponse, Period, ALL_PERIOD, MetaRow, PlacementRow } from "./types";
import { filterMeta, filterPlacement, uniqueDates } from "./transform";

interface Ctx {
  loading: boolean;
  error: string | null;
  timestamp: string | null;
  refresh: () => void;

  period: Period;
  setPeriod: (p: Period) => void;
  dates: string[]; // dias disponíveis (yyyy-mm-dd, ordenados)

  meta: MetaRow[]; // filtrado por período
  placement: PlacementRow[]; // filtrado por período
  allMeta: MetaRow[]; // sem filtro
  hasData: boolean;
}

const DashboardCtx = createContext<Ctx | null>(null);

export function DashboardProvider({
  initialData,
  children,
}: {
  initialData: InsightsResponse | null;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<InsightsResponse | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>(ALL_PERIOD);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights", { cache: "no-store" });
      const json = (await res.json()) as InsightsResponse;
      if (!json.success) throw new Error("Resposta inválida da base de dados");
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) refresh();
  }, [initialData, refresh]);

  useEffect(() => {
    // os dados do Meta são consolidados diariamente; uma verificação a cada
    // 30 min mantém o painel em dia sem sobrecarregar a base.
    const id = setInterval(refresh, 1_800_000);
    return () => clearInterval(id);
  }, [refresh]);

  const allMeta = useMemo(() => data?.meta ?? [], [data]);
  const allPlacement = useMemo(() => data?.meta_placement ?? [], [data]);
  const dates = useMemo(() => uniqueDates(allMeta), [allMeta]);

  const meta = useMemo(() => filterMeta(allMeta, period), [allMeta, period]);
  const placement = useMemo(
    () => filterPlacement(allPlacement, period),
    [allPlacement, period]
  );

  const value: Ctx = {
    loading,
    error,
    timestamp: data?.timestamp ?? null,
    refresh,
    period,
    setPeriod,
    dates,
    meta,
    placement,
    allMeta,
    hasData: allMeta.length > 0,
  };

  return <DashboardCtx.Provider value={value}>{children}</DashboardCtx.Provider>;
}

export function useDashboard(): Ctx {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error("useDashboard fora do DashboardProvider");
  return ctx;
}
