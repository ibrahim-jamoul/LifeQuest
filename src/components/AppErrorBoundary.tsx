import { Component, type ErrorInfo, type ReactNode } from "react";

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("LifeQuest interface error", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="grid min-h-screen place-items-center bg-cream-secondary p-5">
        <section className="panel max-w-lg p-7 text-center">
          <p className="eyebrow">Something went wrong</p>
          <h1 className="mt-2 text-2xl font-black text-text-primary">The village needs a quick refresh</h1>
          <p className="mt-3 text-sm text-text-secondary">Your saved progress is safe. Reload the page to reconnect the interface.</p>
          <button className="button-primary mt-5" onClick={() => window.location.reload()}>Reload LifeQuest</button>
        </section>
      </main>
    );
  }
}
