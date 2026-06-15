import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "./Card";

export function HubGrid({ items }: { items: Array<{ title: string; description: string; path: string; icon: LucideIcon }> }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(({ title, description, path, icon: Icon }) => <Card key={path} className="flex flex-col">
    <Icon className="size-6 text-primary" /><h2 className="mt-3 text-xl font-black">{title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-text-secondary">{description}</p><Link className="button-secondary mt-5 self-start" to={path}>Open <ArrowRight className="size-4" /></Link>
  </Card>)}</div>;
}
