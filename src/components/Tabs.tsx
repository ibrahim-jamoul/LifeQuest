import { useState, type KeyboardEvent, type ReactNode } from "react";

export function Tabs({ tabs, defaultTab }: { tabs: Array<{ id: string; label: string; content: ReactNode }>; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
    setActive(tabs[next].id);
    document.getElementById(`tab-${tabs[next].id}`)?.focus();
  };
  return <div><div role="tablist" className="flex flex-wrap gap-2">{tabs.map((tab, index) => <button id={`tab-${tab.id}`} key={tab.id} role="tab" aria-selected={active === tab.id} aria-controls={`panel-${tab.id}`} className={active === tab.id ? "button-primary" : "button-secondary"} onClick={() => setActive(tab.id)} onKeyDown={(event) => move(event, index)}>{tab.label}</button>)}</div>{tabs.map((tab) => active === tab.id ? <div key={tab.id} id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} className="mt-4">{tab.content}</div> : null)}</div>;
}
