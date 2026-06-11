import { BriefcaseBusiness, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { api } from "../lib/api/client";
import { useAppStore } from "../store";

export function ProjectsPage() {
  const bootstrap = useAppStore((state) => state.bootstrap);
  const [projects, setProjects] = useState<Array<{ id: number; title: string; status: string; risk_level: string }>>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("idea");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void bootstrap();
    void api.projects.list().then(setProjects).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load projects."));
  }, [bootstrap]);

  const activeProjects = useMemo(() => projects.filter((project) => project.status !== "completed").length, [projects]);

  return (
    <div className="space-y-6">
      <section className="page-hero space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="pill"><BriefcaseBusiness className="size-4 text-[#f4a261]" />Projects</span>
          <span className="pill">{projects.length} total</span>
          <span className="pill">{activeProjects} active</span>
        </div>
        <div>
          <p className="eyebrow">Delivery system</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#5a4632]">Projects</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7a6652]">Track roadmaps, risks and next actions in a calm workbench instead of a cold admin list.</p>
        </div>
      </section>
      {error ? <div className="rounded-2xl bg-[#ffe0da] p-4 text-sm font-bold text-[#7a2626]">{error}</div> : null}

      <form className="panel flex flex-col gap-3 p-5 sm:flex-row sm:flex-wrap" onSubmit={async (event) => {
        event.preventDefault();
        try {
          await api.projects.create({ title, description, status, priority: "medium", riskLevel: "low" });
          setTitle("");
          setDescription("");
          setProjects(await api.projects.list());
        } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to create project."); }
      }}>
        <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="New project title" required />
        <input className="input" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description" />
        <select className="input sm:max-w-40" value={status} onChange={(event) => setStatus(event.target.value)}><option value="idea">Idea</option><option value="active">Active</option><option value="paused">Paused</option></select>
        <button className="button-primary sm:w-fit" type="submit">Create project</button>
      </form>

      {projects.length === 0 ? (
        <EmptyState icon={BriefcaseBusiness} title="No projects yet" description="Start one real initiative." action="Create project" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Risk {project.risk_level}</p>
                  <h2 className="mt-1 text-xl font-black text-[#5a4632]">{project.title}</h2>
                </div>
                <span className="pill capitalize">{project.status}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#7a6652]">Roadmap and next actions are managed inside the project workspace.</p>
              <div className="mt-4 flex items-center justify-end">
                <Link to={`/projects/${project.id}`} className="button-secondary text-xs"><ChevronRight className="size-4" />Open</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
