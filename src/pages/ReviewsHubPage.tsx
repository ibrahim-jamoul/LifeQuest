import { NotebookPen, ScrollText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { api } from "../lib/api/client";
import { useAppStore } from "../store";

export function ReviewsHubPage() {
  const bootstrap = useAppStore((state) => state.bootstrap);
  const [reviews, setReviews] = useState<Array<{ id: number; review_type: string; period_start: string }>>([]);

  useEffect(() => {
    void bootstrap();
    void api.reviews.list().then(setReviews);
  }, [bootstrap]);

  const weeklyCount = useMemo(() => reviews.filter((review) => review.review_type === "weekly").length, [reviews]);

  return (
    <div className="space-y-6">
      <section className="page-hero space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="pill"><ScrollText className="size-4 text-[#cfa7ff]" />Reviews</span>
          <span className="pill">{reviews.length} total</span>
          <span className="pill">{weeklyCount} weekly</span>
        </div>
        <div>
          <p className="eyebrow">Reflection system</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#5a4632]">Reviews</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7a6652]">Capture weekly and monthly reflections in a warm, readable workspace that stays close to the village feel.</p>
        </div>
      </section>

      {reviews.length === 0 ? (
        <EmptyState icon={NotebookPen} title="No reviews yet" description="Save a weekly or monthly review." action="Open review" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="panel p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow capitalize">{review.review_type}</p>
                  <h2 className="mt-1 text-xl font-black text-[#5a4632]">{review.period_start}</h2>
                </div>
                <span className="pill">Saved</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
