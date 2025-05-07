import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: number | string;
  suffix?: string;
  total?: number;
  percentage?: number;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  badge?: string;
  badgeType?: "success" | "warning" | "error" | "info";
  extraContent?: ReactNode;
};

export default function StatCard({
  title,
  value,
  suffix,
  total,
  percentage,
  trend,
  trendType = "neutral",
  badge,
  badgeType = "info",
  extraContent
}: StatCardProps) {
  // Badge styling based on type
  const getBadgeClass = () => {
    switch (badgeType) {
      case "success":
        return "bg-green-50 text-green-500";
      case "warning":
        return "bg-yellow-50 text-yellow-600";
      case "error":
        return "bg-red-50 text-red-500";
      case "info":
      default:
        return "bg-primary-50 text-primary-500";
    }
  };

  // Trend styling based on type
  const getTrendClass = () => {
    switch (trendType) {
      case "positive":
        return "text-primary-500 bg-primary-50";
      case "negative":
        return "text-red-500 bg-red-50";
      case "neutral":
      default:
        return "text-slate-500 bg-slate-50";
    }
  };

  return (
    <Card className="border border-slate-200">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
          {trend && (
            <span className={`text-xs px-2 py-1 rounded-full ${getTrendClass()}`}>{trend}</span>
          )}
          {badge && (
            <span className={`text-xs px-2 py-1 rounded-full ${getBadgeClass()}`}>{badge}</span>
          )}
        </div>
        <div className="flex items-end">
          <span className="text-3xl font-bold text-slate-800">{value}</span>
          {suffix && <span className="text-slate-500 ml-2 text-sm">{suffix}</span>}
          {total && <span className="text-slate-500 ml-2 text-sm">/ {total}</span>}
        </div>
        {percentage !== undefined && (
          <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
            ></div>
          </div>
        )}
        {extraContent && <div className="mt-3">{extraContent}</div>}
      </CardContent>
    </Card>
  );
}
