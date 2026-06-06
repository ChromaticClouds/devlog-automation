import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AnalysisResultListProps = {
  title: string;
  items: string[];
  emptyMessage: string;
  icon: LucideIcon;
};

export function AnalysisResultList({
  title,
  items,
  emptyMessage,
  icon: Icon,
}: AnalysisResultListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <h2 className="flex items-center gap-2">
            <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
            {title}
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                className="flex min-w-0 gap-3 leading-relaxed text-foreground"
                key={`${index}-${item}`}
              >
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                />
                <span className="min-w-0 [overflow-wrap:anywhere]">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
