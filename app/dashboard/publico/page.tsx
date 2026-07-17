"use client";
import { useDashboard } from "@/lib/dashboardContext";
import { AgeGenderPyramid } from "@/components/dashboard/charts/AgeGenderPyramid";
import { GenderDonut } from "@/components/dashboard/charts/GenderDonut";
import { AudienceSummary } from "@/components/dashboard/AudienceSummary";

export default function PublicoPage() {
  const { meta } = useDashboard();
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <AudienceSummary meta={meta} className="lg:col-span-12" />
      <AgeGenderPyramid rows={meta} className="lg:col-span-7" />
      <GenderDonut rows={meta} className="lg:col-span-5" />
    </div>
  );
}
