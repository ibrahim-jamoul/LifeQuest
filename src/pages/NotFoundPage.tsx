import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#dff0e8] p-4">
      <section className="panel max-w-lg p-8 text-center">
        <p className="eyebrow">Lost pathway</p>
        <h1 className="mt-2 text-4xl font-black text-[#3f3528]">This path does not exist</h1>
        <p className="mt-3 text-sm leading-6 text-[#716452]">Return to the village and choose another place to explore.</p>
        <Link className="button-primary mt-6" to="/"><Home className="size-4" />Return home</Link>
      </section>
    </main>
  );
}
