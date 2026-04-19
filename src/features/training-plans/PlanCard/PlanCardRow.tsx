interface PlanCardRowProps {
  icon: React.ReactNode;
  text: string;
}

export function PlanCardRow({ icon, text }: PlanCardRowProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-foreground-secondary">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}
