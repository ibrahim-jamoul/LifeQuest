import { Volume2, VolumeX } from "lucide-react";
import type { FocusAtmosphere } from "../types";
import { hexToRgba } from "../focusUtils";

export function SavePill({ text }: { text: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/78 sm:px-3">{text}</span>;
}

function createNoiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function startAmbientAudioForTheme(context: AudioContext, theme: FocusAtmosphere["theme"]) {
  const nodes: AudioNode[] = [];
  const stoppables: Array<{ stop?: (when?: number) => void; disconnect: () => void }> = [];

  const master = context.createGain();
  master.gain.value = 0.04;
  master.connect(context.destination);
  nodes.push(master);

  const addNoise = (filterType: BiquadFilterType, frequency: number, gainValue: number) => {
    const source = context.createBufferSource();
    source.buffer = createNoiseBuffer(context);
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    const gain = context.createGain();
    gain.gain.value = gainValue;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start();
    stoppables.push(source);
    nodes.push(filter, gain);
  };

  const addTone = (type: OscillatorType, frequency: number, gainValue: number, lfoRate?: number, lfoDepth = 0.003) => {
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    const gain = context.createGain();
    gain.gain.value = gainValue;
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start();
    stoppables.push(oscillator);
    nodes.push(gain);

    if (lfoRate) {
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.frequency.value = lfoRate;
      lfoGain.gain.value = lfoDepth;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      stoppables.push(lfo);
      nodes.push(lfoGain);
    }
  };

  if (theme === "calm_ocean") {
    master.gain.value = 0.05;
    addNoise("lowpass", 420, 0.09);
    addTone("sine", 196, 0.018, 0.05, 0.01);
    addTone("triangle", 294, 0.01, 0.08, 0.005);
  } else if (theme === "forest_desk") {
    master.gain.value = 0.038;
    addNoise("bandpass", 900, 0.025);
    addTone("triangle", 220, 0.015, 0.11, 0.004);
    addTone("sine", 330, 0.008, 0.07, 0.003);
  } else {
    master.gain.value = 0.034;
    addNoise("lowpass", 260, 0.02);
    addTone("sine", 174, 0.012, 0.04, 0.003);
    addTone("sine", 261.6, 0.009, 0.06, 0.0025);
  }

  return () => {
    stoppables.forEach((node) => {
      try {
        node.stop?.();
      } catch {
        // ignore stop failures for nodes already stopped
      }
      node.disconnect();
    });
    nodes.forEach((node) => {
      try {
        node.disconnect();
      } catch {
        // ignore disconnect failures for nodes already disconnected
      }
    });
  };
}

function FocusThemeVisual({ atmosphere, paused }: { atmosphere: FocusAtmosphere; paused: boolean }) {
  const className = `focus-theme-visual theme-${atmosphere.theme} ${paused ? "is-paused" : ""}`;

  if (atmosphere.theme === "calm_ocean") {
    return (
      <div className={className}>
        <div className="focus-theme-disc" />
        <div className="focus-theme-wave focus-theme-wave-a" />
        <div className="focus-theme-wave focus-theme-wave-b" />
        <div className="focus-theme-wave focus-theme-wave-c" />
        <span className="focus-theme-dot focus-theme-dot-1" />
        <span className="focus-theme-dot focus-theme-dot-2" />
        <span className="focus-theme-dot focus-theme-dot-3" />
      </div>
    );
  }

  if (atmosphere.theme === "forest_desk") {
    return (
      <div className={className}>
        <div className="focus-theme-canopy" />
        <div className="focus-theme-canopy focus-theme-canopy-b" />
        <div className="focus-theme-ground" />
        <span className="focus-theme-leaf focus-theme-leaf-1" />
        <span className="focus-theme-leaf focus-theme-leaf-2" />
        <span className="focus-theme-leaf focus-theme-leaf-3" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="focus-theme-window" />
      <div className="focus-theme-lamp-glow" />
      <div className="focus-theme-book" />
      <div className="focus-theme-book-line focus-theme-book-line-a" />
      <div className="focus-theme-book-line focus-theme-book-line-b" />
      <span className="focus-theme-dot focus-theme-dot-1" />
      <span className="focus-theme-dot focus-theme-dot-2" />
    </div>
  );
}

export function FocusAmbientStage({
  atmosphere,
  progress,
  paused,
}: {
  atmosphere: FocusAtmosphere;
  progress: number;
  paused: boolean;
}) {
  const accent = hexToRgba(atmosphere.accent, 0.85);
  const accentSoft = hexToRgba(atmosphere.accent, 0.32);
  const accentGlow = hexToRgba(atmosphere.accent, 0.16);
  const progressWidth = `${Math.max(8, Math.round(progress * 100))}%`;

  return (
    <div className={`focus-ambient-stage theme-${atmosphere.theme} ${paused ? "is-paused" : ""}`}>
      <div className="focus-ambient-backdrop" style={{ background: `radial-gradient(circle at 50% 42%, ${accentGlow} 0%, transparent 58%)` }} />
      <div className="focus-ambient-orb focus-ambient-orb-a" style={{ background: `radial-gradient(circle at 30% 30%, ${hexToRgba(atmosphere.accent, 0.66)} 0%, ${accentSoft} 36%, transparent 74%)` }} />
      <div className="focus-ambient-orb focus-ambient-orb-b" style={{ background: `radial-gradient(circle at 38% 38%, rgba(255,255,255,.9) 0%, ${hexToRgba(atmosphere.accent, 0.2)} 44%, transparent 78%)` }} />
      <div className="focus-ambient-orb focus-ambient-orb-c" style={{ background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,.72) 0%, ${hexToRgba(atmosphere.accent, 0.16)} 42%, transparent 76%)` }} />
      <FocusThemeVisual atmosphere={atmosphere} paused={paused} />
      <div className="focus-ambient-ring focus-ambient-ring-outer" style={{ borderColor: hexToRgba(atmosphere.accent, 0.28) }} />
      <div className="focus-ambient-ring focus-ambient-ring-inner" style={{ borderColor: hexToRgba(atmosphere.accent, 0.18) }} />
      <div className="focus-ambient-line" style={{ background: `linear-gradient(90deg, transparent 0%, ${accent} 18%, rgba(255,255,255,.92) 50%, ${accent} 82%, transparent 100%)` }} />
      <div className="focus-ambient-progress-track">
        <div className="focus-ambient-progress-fill" style={{ width: progressWidth, background: `linear-gradient(90deg, ${accentSoft} 0%, ${accent} 100%)` }} />
      </div>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <span
          key={index}
          className={`focus-ambient-particle focus-ambient-particle-${index + 1}`}
          style={{
            background: index % 2 === 0 ? "rgba(255,255,255,.86)" : accent,
            boxShadow: `0 0 18px ${index % 2 === 0 ? "rgba(255,255,255,.35)" : accentSoft}`,
          }}
        />
      ))}
    </div>
  );
}

export function FocusAtmosphereLayers({ atmosphere }: { atmosphere: FocusAtmosphere }) {
  if (atmosphere.theme === "calm_ocean") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="lighthouse-ocean-wash" />
        <div className="lighthouse-ocean-wave lighthouse-ocean-wave-a" />
        <div className="lighthouse-ocean-wave lighthouse-ocean-wave-b" />
      </div>
    );
  }

  if (atmosphere.theme === "forest_desk") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="lighthouse-forest-glow" />
        <div className="lighthouse-forest-leaf lighthouse-forest-leaf-a" />
        <div className="lighthouse-forest-leaf lighthouse-forest-leaf-b" />
        <div className="lighthouse-desk-band" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="lighthouse-cozy-glow" />
      <div className="lighthouse-cozy-orbit lighthouse-cozy-orbit-a" />
      <div className="lighthouse-cozy-orbit lighthouse-cozy-orbit-b" />
    </div>
  );
}

export function FocusSoundToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="focus-sound-toggle"
      aria-pressed={enabled}
      aria-label={enabled ? "Mute ambient sound" : "Enable ambient sound"}
      onClick={onToggle}
    >
      {enabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
      <span>{enabled ? "Sound on" : "Sound off"}</span>
    </button>
  );
}
