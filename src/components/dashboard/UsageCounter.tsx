import { Badge } from "@/components/ui/badge";

interface UsageCounterProps {
  used: number;
  limit: number;
  plan: string;
}

export function UsageCounter({ used, limit, plan }: UsageCounterProps) {
  const isUnlimited = limit === Infinity || limit > 999;
  if (isUnlimited) {
    return (
      <Badge variant="secondary">Pro — unlimited tailors</Badge>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{used}</span> of {limit} free tailors used this month
    </p>
  );
}
