import { ArrowRight, CheckCircle2, Clock3, Play, RefreshCcw, Sparkles, Star, TimerReset, Trophy, WandSparkles, Square, Circle, Triangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../lib/api/client";
import { useAppStore } from "../store";

type PassportEntry = {
  id: string;
  label: string;
  category: string;
  completedAt: number;
};

type PlaySuggestion = {
  id: string;
  title: string;
  description: string;
  category: string;
  minutes: number;
  route?: string;
};

type QuizQuestion = {
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
};

type LogicPuzzle = {
  title: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
};

const PASSPORT_KEY = "lifequest.home-passport";

const playPrompts = [
  { title: "Curious window break", description: "Look outside for 2 minutes and name 3 things you notice.", minutes: 5 },
  { title: "Tiny body reset", description: "Do 20 jumps, 10 stretches, then come back calmer.", minutes: 5 },
  { title: "Draw a moment", description: "Sketch one thing that happened today before you forget it.", minutes: 10 },
  { title: "Ask and learn", description: "Ask somebody one question about their day or what they know.", minutes: 5 },
] as const;

const QUIZ_THEME_ORDER = ["space", "animals", "body", "nature", "science", "history", "oceans"] as const;

const QUIZ_THEME_LABELS: Record<(typeof QUIZ_THEME_ORDER)[number], string> = {
  space: "L'espace et les planètes",
  animals: "Les animaux extraordinaires",
  body: "Le corps humain",
  nature: "La nature et les plantes",
  science: "Les inventions et la science",
  history: "L'histoire du monde",
  oceans: "Les océans et la mer",
};

const QUIZ_BANK: Record<(typeof QUIZ_THEME_ORDER)[number], QuizQuestion[]> = {
  space: [
    { question: "Which planet is the biggest in the solar system?", choices: ["Mars", "Jupiter", "Neptune", "Venus"], answerIndex: 1, explanation: "Jupiter is the largest planet." },
    { question: "What do we call a group of stars that forms a pattern?", choices: ["Galaxy", "Constellation", "Comet", "Orbit"], answerIndex: 1, explanation: "A constellation is a star pattern in the sky." },
    { question: "What do astronauts need to breathe in space?", choices: ["Fresh air", "Helium", "Water", "Snow"], answerIndex: 0, explanation: "They need air to breathe." },
    { question: "Which planet is known for its rings?", choices: ["Saturn", "Mercury", "Mars", "Earth"], answerIndex: 0, explanation: "Saturn is famous for its rings." },
    { question: "The Sun is a...", choices: ["planet", "moon", "star", "comet"], answerIndex: 2, explanation: "The Sun is a star." },
  ],
  animals: [
    { question: "How many hearts does an octopus have?", choices: ["1", "2", "3", "4"], answerIndex: 2, explanation: "An octopus has 3 hearts." },
    { question: "Which animal is a mammal?", choices: ["Shark", "Dolphin", "Frog", "Eagle"], answerIndex: 1, explanation: "A dolphin is a mammal." },
    { question: "What do bees make?", choices: ["Milk", "Honey", "Oil", "Salt"], answerIndex: 1, explanation: "Bees make honey." },
    { question: "Which animal can change color?", choices: ["Chameleon", "Penguin", "Rabbit", "Cat"], answerIndex: 0, explanation: "Chameleons can change color." },
    { question: "What do birds use to fly?", choices: ["Fins", "Wings", "Paws", "Leaves"], answerIndex: 1, explanation: "Birds fly with wings." },
  ],
  body: [
    { question: "What is the longest bone in the body?", choices: ["Femur", "Tibia", "Arm bone", "Rib"], answerIndex: 0, explanation: "The femur is the longest bone." },
    { question: "How many lungs do most people have?", choices: ["1", "2", "3", "4"], answerIndex: 1, explanation: "Most people have 2 lungs." },
    { question: "What pumps blood around the body?", choices: ["Brain", "Heart", "Liver", "Stomach"], answerIndex: 1, explanation: "The heart pumps blood." },
    { question: "What do we use to smell?", choices: ["Eyes", "Ears", "Nose", "Hands"], answerIndex: 2, explanation: "We smell with our nose." },
    { question: "What protects the brain?", choices: ["Skull", "Skin", "Muscle", "Teeth"], answerIndex: 0, explanation: "The skull protects the brain." },
  ],
  nature: [
    { question: "Which plant eats insects?", choices: ["Dionaea", "Cactus", "Rose", "Fern"], answerIndex: 0, explanation: "The dionaea is a carnivorous plant." },
    { question: "What do plants need to grow?", choices: ["Light", "Sand only", "Noise", "Glue"], answerIndex: 0, explanation: "Plants need light to grow well." },
    { question: "What part of the plant drinks water?", choices: ["Flower", "Root", "Leaf", "Seed"], answerIndex: 1, explanation: "Roots drink water from the soil." },
    { question: "Which season has many new leaves?", choices: ["Spring", "Winter", "Autumn", "Night"], answerIndex: 0, explanation: "Spring brings new growth." },
    { question: "What do trees make for us?", choices: ["Air", "Rain", "Thunder", "Rocks"], answerIndex: 0, explanation: "Trees help make the air cleaner." },
  ],
  science: [
    { question: "What tool helps us see tiny things?", choices: ["Microscope", "Compass", "Ruler", "Whistle"], answerIndex: 0, explanation: "A microscope shows tiny details." },
    { question: "Which one is a source of energy?", choices: ["Sun", "Paper", "Glass", "Stone"], answerIndex: 0, explanation: "The Sun gives us energy." },
    { question: "Water turns into vapor when it...", choices: ["Freezes", "Evaporates", "Breaks", "Tastes"], answerIndex: 1, explanation: "Evaporation turns water into vapor." },
    { question: "A magnet can attract...", choices: ["Wood", "Metal", "Sand", "Bread"], answerIndex: 1, explanation: "Magnets attract some metals." },
    { question: "What do we call a fair test in science?", choices: ["Experiment", "Guess", "Story", "Shortcut"], answerIndex: 0, explanation: "A fair test is an experiment." },
  ],
  history: [
    { question: "What is a map used for?", choices: ["To cook", "To find places", "To sleep", "To paint"], answerIndex: 1, explanation: "Maps help us find places." },
    { question: "Who lived in castles long ago?", choices: ["Knights", "Robots", "Astronauts", "Farmers only"], answerIndex: 0, explanation: "Knights lived and worked in castles." },
    { question: "Old stories are often passed by...", choices: ["Pictures", "Word of mouth", "Rain", "Smoke"], answerIndex: 1, explanation: "Stories were passed by speaking." },
    { question: "Which came first in a school year?", choices: ["Beginning", "End", "Holiday", "Exam"], answerIndex: 0, explanation: "The beginning comes first." },
    { question: "A museum keeps...", choices: ["Games", "Treasures and objects", "Clouds", "Homework"], answerIndex: 1, explanation: "Museums keep important objects and memories." },
  ],
  oceans: [
    { question: "What covers most of Earth?", choices: ["Desert", "Ocean", "Mountains", "Cities"], answerIndex: 1, explanation: "Oceans cover most of the planet." },
    { question: "Which animal lives in the sea?", choices: ["Whale", "Tiger", "Horse", "Goat"], answerIndex: 0, explanation: "A whale lives in the sea." },
    { question: "What is salt water?", choices: ["Water with sugar", "Water with salt", "Frozen water", "Rain"], answerIndex: 1, explanation: "Sea water is salty." },
    { question: "A boat floats on...", choices: ["Water", "Sand", "Glass", "Smoke"], answerIndex: 0, explanation: "Boats float on water." },
    { question: "What do we call the beach edge?", choices: ["Shore", "Roof", "Trail", "Hill"], answerIndex: 0, explanation: "The shore is the edge of the sea." },
  ],
};

const LOGIC_PUZZLES: LogicPuzzle[] = [
  {
    title: "Easy",
    prompt: "2, 4, 6, 8, ?",
    choices: ["9", "10", "11", "12"],
    answerIndex: 1,
    explanation: "The pattern counts by 2.",
  },
  {
    title: "Medium",
    prompt: "Circle, triangle, circle, triangle, ?",
    choices: ["Circle", "Square", "Triangle", "Star"],
    answerIndex: 0,
    explanation: "The shapes alternate.",
  },
  {
    title: "Hard",
    prompt: "1, 3, 6, 10, ?",
    choices: ["12", "13", "15", "16"],
    answerIndex: 2,
    explanation: "Add 2, then 3, then 4, then 5.",
  },
];

const CALM_PALETTE = [
  "#f4a261",
  "#75a876",
  "#6998c7",
  "#e87967",
  "#dca84f",
  "#a77ac8",
];

const COLORING_SHAPES = [
  { id: "sun", label: "Sun", icon: Star },
  { id: "leaf", label: "Leaf", icon: Circle },
  { id: "peak", label: "Peak", icon: Triangle },
  { id: "tile", label: "Tile", icon: Square },
] as const;

function getDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getLocalDateStamp(date = new Date()) {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function safeReadPassport(): PassportEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PASSPORT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PassportEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWritePassport(entries: PassportEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PASSPORT_KEY, JSON.stringify(entries.slice(-120)));
}

function countBetween(entries: PassportEntry[], fromMs: number, toMs: number) {
  return entries.filter((entry) => entry.completedAt >= fromMs && entry.completedAt < toMs).length;
}

export function HomeAreaPage() {
  const { bootstrap, todaySnapshot, loading, createQuest, refreshToday, refreshVillage } = useAppStore();
  const [passport, setPassport] = useState<PassportEntry[]>(() => safeReadPassport());
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizDoneRecorded, setQuizDoneRecorded] = useState(false);
  const [logicDifficulty, setLogicDifficulty] = useState<0 | 1 | 2>(0);
  const [logicChoice, setLogicChoice] = useState<number | null>(null);
  const [logicSolved, setLogicSolved] = useState(false);
  const [logicRecorded, setLogicRecorded] = useState(false);
  const [memoryPreview, setMemoryPreview] = useState(true);
  const [memorySequenceIndex, setMemorySequenceIndex] = useState(0);
  const [memorySequence, setMemorySequence] = useState<string[]>([]);
  const [memoryGuess, setMemoryGuess] = useState<string[]>([]);
  const [memorySolved, setMemorySolved] = useState(false);
  const [memoryRecorded, setMemoryRecorded] = useState(false);
  const [breathingMode, setBreathingMode] = useState<"slow" | "focus" | "sleep">("slow");
  const [breathingRunning, setBreathingRunning] = useState(false);
  const [breathingRecorded, setBreathingRecorded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(CALM_PALETTE[0]);
  const [painting, setPainting] = useState<Record<string, string>>({});
  const [paintingRecorded, setPaintingRecorded] = useState(false);
  const [questBusyId, setQuestBusyId] = useState<string | null>(null);

  useEffect(() => { void bootstrap(); }, [bootstrap]);
  useEffect(() => { safeWritePassport(passport); }, [passport]);
  useEffect(() => {
    if (!memoryPreview) return undefined;
    const timeout = window.setTimeout(() => setMemoryPreview(false), 2600);
    return () => window.clearTimeout(timeout);
  }, [memoryPreview, memorySequenceIndex]);

  const dayKey = getDayKey();
  const themeKey = QUIZ_THEME_ORDER[new Date().getDay()] ?? "space";
  const quizQuestions = QUIZ_BANK[themeKey];
  const activeQuestion = quizQuestions[quizIndex];

  const todayQuest = todaySnapshot?.todayQuests[0] ?? todaySnapshot?.quests.find((quest) => !quest.is_completed) ?? null;
  const todayHabit = todaySnapshot?.habits.find((habit) => habit.due_today !== false) ?? todaySnapshot?.habits[0] ?? null;
  const todayPlaySuggestions = useMemo<PlaySuggestion[]>(() => {
    const prompt = playPrompts[new Date().getDay() % playPrompts.length];
    return [
      {
        id: "quest",
        title: todayQuest?.title ?? "Choose one tiny win",
        description: todayQuest ? "A real action is already waiting for you." : "Open your quests and pick one short action.",
        category: "Quest",
        minutes: Math.max(5, Math.min(15, Math.round((todayQuest?.xp_reward ?? 10) / 2))),
        route: "/quests",
      },
      {
        id: "habit",
        title: todayHabit?.name ?? "Check one habit",
        description: todayHabit ? `${todayHabit.current_streak} day streak. Keep the rhythm going.` : "Open habits and keep the baseline alive.",
        category: "Habit",
        minutes: 5,
        route: "/habits",
      },
      {
        id: "curiosity",
        title: prompt.title,
        description: prompt.description,
        category: "Play break",
        minutes: prompt.minutes,
      },
    ];
  }, [todayHabit, todayQuest]);

  const completedTodayPlay = useMemo(() => todayPlaySuggestions.filter((item) => passport.some((entry) => entry.id === `${dayKey}:${item.id}`)).length, [dayKey, passport, todayPlaySuggestions]);
  const currentWeekStart = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 6);
    return date.getTime();
  }, []);
  const previousWeekStart = useMemo(() => currentWeekStart - 7 * 24 * 60 * 60 * 1000, [currentWeekStart]);
  const weeklyCount = countBetween(passport, currentWeekStart, Date.now() + 1);
  const previousWeekCount = countBetween(passport, previousWeekStart, currentWeekStart);
  const recentPassport = passport.slice(-5).reverse();

  const recordPassportActivity = (id: string, label: string, category: string) => {
    setPassport((current) => {
      const entryId = `${dayKey}:${id}`;
      if (current.some((entry) => entry.id === entryId)) return current;
      return [...current, { id: entryId, label, category, completedAt: Date.now() }];
    });
  };

  const completeTodayPlay = (item: PlaySuggestion) => {
    recordPassportActivity(item.id, item.title, item.category);
  };

  const createRealWorldQuest = async (title: string, description: string, options: { parentProof?: boolean; xpReward?: number } = {}) => {
    setQuestBusyId(title);
    try {
      if (options.parentProof) {
        if (!todaySnapshot?.user.id) throw new Error("No child session found.");
        await api.missions.create({ childId: todaySnapshot.user.id, title, description, xpReward: options.xpReward ?? 20 });
        await Promise.all([refreshToday(), refreshVillage()]);
      } else {
        await createQuest({ title, description, dueDate: new Date().toISOString().slice(0, 10), priority: "low", estimatedMinutes: 10 });
      }
      recordPassportActivity(`quest-${title}`, title, options.parentProof ? "Parent proof quest" : "Real world quest");
    } finally {
      setQuestBusyId(null);
    }
  };

  const logicPuzzle = LOGIC_PUZZLES[logicDifficulty];
  const memoryEmojiSet = ["🌟", "🍃", "🔷", "🌙"];
  const nextMemorySequence = useMemo(() => {
    const seed = new Date().getDay() + memorySequenceIndex;
    return [memoryEmojiSet[seed % memoryEmojiSet.length], memoryEmojiSet[(seed + 1) % memoryEmojiSet.length], memoryEmojiSet[(seed + 3) % memoryEmojiSet.length], memoryEmojiSet[(seed + 2) % memoryEmojiSet.length]];
  }, [memorySequenceIndex]);

  useEffect(() => {
    setMemorySequence(nextMemorySequence);
  }, [nextMemorySequence]);

  useEffect(() => {
    if (memoryPreview) {
      setMemoryGuess([]);
      return;
    }
    if (memoryGuess.length !== memorySequence.length || memorySolved) return;
    const solved = memoryGuess.every((value, index) => value === memorySequence[index]);
    if (solved) {
      setMemorySolved(true);
      if (!memoryRecorded) {
        recordPassportActivity("memory-challenge", "Memory challenge", "Brain game");
        setMemoryRecorded(true);
      }
    }
  }, [memoryGuess, memorySequence, memoryPreview, memoryRecorded, memorySolved]);

  useEffect(() => {
    if (quizFinished && !quizDoneRecorded) {
      recordPassportActivity("quiz-of-the-day", "Quiz of the day", "Brain game");
      setQuizDoneRecorded(true);
    }
  }, [quizDoneRecorded, quizFinished]);

  useEffect(() => {
    if (logicSolved && !logicRecorded) {
      recordPassportActivity(`logic-${logicDifficulty}`, "Logic puzzle", "Brain game");
      setLogicRecorded(true);
    }
  }, [logicDifficulty, logicRecorded, logicSolved]);

  useEffect(() => {
    if (!breathingRunning || breathingRecorded) return;
    const timeout = window.setTimeout(() => {
      recordPassportActivity("calm-breathing", "Breathing session", "Calm corner");
      setBreathingRecorded(true);
    }, 3200);
    return () => window.clearTimeout(timeout);
  }, [breathingRecorded, breathingRunning]);

  useEffect(() => {
    if (Object.keys(painting).length !== COLORING_SHAPES.length || paintingRecorded) return;
    recordPassportActivity("coloring-page", "Coloring page", "Calm corner");
    setPaintingRecorded(true);
  }, [painting, paintingRecorded]);

  if (!todaySnapshot && loading) return <LoadingState label="Preparing Home Area" />;

  return (
    <div className="cozy-page">
      <PageHeader
        eyebrow="Anti-scroll zone"
        title="Home Area"
        description="Three short suggestions, tiny games, real-world quests, a calm corner, and a passport that counts without turning into a score chase."
        meta={
          <>
            <span className="pill"><Clock3 className="size-4" />3 max today</span>
            <span className="pill"><Sparkles className="size-4" />No autoplay</span>
            <span className="pill"><Trophy className="size-4" />Weekly passport</span>
          </>
        }
        actions={
          <>
            <Link className="button-secondary" to="/quests">Open quests <ArrowRight className="size-4" /></Link>
            <Link className="button-secondary" to="/habits">Open habits <ArrowRight className="size-4" /></Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_.95fr]">
        <div className="space-y-6">
          <Card variant="highlighted">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Today's Play</p>
                <h2 className="mt-1 text-2xl font-black text-text-primary">Three choices, then stop</h2>
              </div>
              <span className="pill">{completedTodayPlay}/3 done today</span>
            </div>
            {completedTodayPlay === 3 ? <div className="mt-4 rounded-2xl border-2 border-primary/20 bg-success-bg p-4 text-sm font-bold text-primary">That is everything for today. Come back tomorrow for a fresh set.</div> : null}
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {todayPlaySuggestions.map((item) => {
                const done = passport.some((entry) => entry.id === `${dayKey}:${item.id}`);
                return (
                  <article key={item.id} className="rounded-cozy-lg border-2 border-border bg-cream p-4 shadow-cozy-sm">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge variant="habit">{item.category}</StatusBadge>
                      <span className="text-xs font-black uppercase tracking-wider text-text-secondary">{item.minutes} min</span>
                    </div>
                    <h3 className="mt-3 text-lg font-black text-text-primary">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{item.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" icon={<CheckCircle2 className="size-4" />} disabled={done} onClick={() => completeTodayPlay(item)}>{done ? "Done today" : "I did it"}</Button>
                      {item.route ? <Link className="button-secondary" to={item.route}>Open <ArrowRight className="size-4" /></Link> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Real World Quests</p>
                <h2 className="mt-1 text-2xl font-black text-text-primary">Missions that pull the child away from the screen</h2>
              </div>
              <span className="pill"><Sparkles className="size-4" />Short and clear</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                { title: "Find 3 things that float", description: "Look around the house and come back with three objects you think would float.", proof: false, xpReward: 10 },
                { title: "Do 20 jumps and reset", description: "Leave the screen, move your body, then come back with a calmer head.", proof: false, xpReward: 10 },
                { title: "Ask what someone learned today", description: "A good parent-proof mission when the answer matters more than the screen.", proof: true, xpReward: 20 },
                { title: "Draw one thing you noticed", description: "Draw something from today and bring it back as proof of attention.", proof: false, xpReward: 15 },
              ].map((quest) => (
                <article key={quest.title} className="rounded-cozy-lg border-2 border-border bg-cream-light p-4">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge variant={quest.proof ? "parent" : "review"}>{quest.proof ? "Parent proof" : "Self quest"}</StatusBadge>
                    <span className="text-xs font-black uppercase tracking-wider text-text-secondary">XP {quest.xpReward}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-text-primary">{quest.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{quest.description}</p>
                  <Button
                    className="mt-4"
                    size="sm"
                    icon={<Play className="size-4" />}
                    loading={questBusyId === quest.title}
                    onClick={() => createRealWorldQuest(quest.title, quest.description, { parentProof: quest.proof, xpReward: quest.xpReward })}
                  >
                    {quest.proof ? "Create parent mission" : "Add to quests"}
                  </Button>
                </article>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Play Passport</p>
                <h2 className="mt-1 text-2xl font-black text-text-primary">Activity without a score chase</h2>
              </div>
              <span className="pill"><Trophy className="size-4" />{weeklyCount} this week</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-cozy-lg border-2 border-border bg-cream-secondary p-4">
                <strong className="block text-3xl text-text-primary">{weeklyCount}</strong>
                <span className="island-eyebrow">This week</span>
              </div>
              <div className="rounded-cozy-lg border-2 border-border bg-cream-secondary p-4">
                <strong className="block text-3xl text-text-primary">{previousWeekCount}</strong>
                <span className="island-eyebrow">Last week</span>
              </div>
              <div className="rounded-cozy-lg border-2 border-border bg-cream-secondary p-4">
                <strong className="block text-3xl text-text-primary">{Math.max(0, weeklyCount - previousWeekCount)}</strong>
                <span className="island-eyebrow">Change</span>
              </div>
            </div>
            <div className="mt-4 rounded-3xl border-2 border-border bg-cream-light p-4">
              <p className="island-eyebrow">Recent entries</p>
              <div className="mt-3 space-y-2">
                {recentPassport.length ? recentPassport.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 rounded-2xl bg-cream-secondary px-3 py-2 text-sm">
                    <div>
                      <strong className="block text-text-primary">{entry.label}</strong>
                      <span className="text-xs font-bold text-text-secondary">{entry.category}</span>
                    </div>
                    <span className="text-xs font-bold text-text-secondary">{getLocalDateStamp(new Date(entry.completedAt))}</span>
                  </div>
                )) : <p className="text-sm text-text-secondary">No passport entries yet. Do one small thing above and it will start counting.</p>}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="highlighted">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Brain Games</p>
                <h2 className="mt-1 text-2xl font-black text-text-primary">Quiz of the day</h2>
              </div>
              <StatusBadge variant="important">{QUIZ_THEME_LABELS[themeKey]}</StatusBadge>
            </div>
            {!quizFinished ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-3xl border-2 border-border bg-cream-light p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-text-secondary">Question {quizIndex + 1} / {quizQuestions.length}</p>
                  <h3 className="mt-2 text-lg font-black text-text-primary">{activeQuestion.question}</h3>
                </div>
                <div className="grid gap-2">
                  {activeQuestion.choices.map((choice, index) => (
                    <button
                      key={choice}
                      className={`rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition ${quizChoice === index ? "border-primary bg-success-bg text-primary" : "border-border bg-cream-secondary text-text-primary hover:-translate-y-0.5"}`}
                      onClick={() => setQuizChoice(index)}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
                {quizChoice !== null ? (
                  <div className="rounded-2xl bg-cream-secondary p-4 text-sm text-text-secondary">
                    <strong className="block text-text-primary">{quizChoice === activeQuestion.answerIndex ? "Good eye." : "Nice try."}</strong>
                    <p className="mt-2">{activeQuestion.explanation}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        icon={<ArrowRight className="size-4" />}
                        onClick={() => {
                          const nextScore = quizScore + (quizChoice === activeQuestion.answerIndex ? 1 : 0);
                          if (quizIndex + 1 >= quizQuestions.length) {
                            setQuizScore(nextScore);
                            setQuizFinished(true);
                            setQuizDoneRecorded(true);
                            recordPassportActivity("quiz-of-the-day", "Quiz of the day", "Brain game");
                            return;
                          }
                          setQuizScore(nextScore);
                          setQuizIndex((current) => current + 1);
                          setQuizChoice(null);
                        }}
                      >
                        {quizIndex + 1 >= quizQuestions.length ? "Finish quiz" : "Next question"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-3xl bg-success-bg p-5 text-sm text-primary">
                <strong className="block text-lg">Quiz done. Score: {quizScore}/{quizQuestions.length}</strong>
                <p className="mt-2">That was enough for today. Come back tomorrow for a new theme.</p>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Brain Games</p>
                <h2 className="mt-1 text-2xl font-black text-text-primary">Logic puzzle</h2>
              </div>
              <div className="flex gap-2">
                {LOGIC_PUZZLES.map((puzzle, index) => (
                  <button key={puzzle.title} className={`rounded-full border-2 px-3 py-1 text-xs font-black ${logicDifficulty === index ? "border-primary bg-primary text-white" : "border-border bg-cream-secondary text-text-secondary"}`} onClick={() => { setLogicDifficulty(index as 0 | 1 | 2); setLogicChoice(null); setLogicSolved(false); setLogicRecorded(false); }}>
                    {puzzle.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-3xl border-2 border-border bg-cream-light p-4">
              <p className="text-xs font-black uppercase tracking-wider text-text-secondary">Find the pattern</p>
              <h3 className="mt-2 text-lg font-black text-text-primary">{logicPuzzle.prompt}</h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {logicPuzzle.choices.map((choice, index) => (
                  <button
                    key={choice}
                    className={`rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition ${logicChoice === index ? "border-primary bg-success-bg text-primary" : "border-border bg-cream-secondary text-text-primary hover:-translate-y-0.5"}`}
                    onClick={() => setLogicChoice(index)}
                    disabled={logicSolved}
                  >
                    {choice}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  icon={<CheckCircle2 className="size-4" />}
                  disabled={logicChoice === null || logicSolved}
                  onClick={() => {
                    const solved = logicChoice === logicPuzzle.answerIndex;
                    setLogicSolved(true);
                    if (solved && !logicRecorded) {
                      recordPassportActivity(`logic-${logicDifficulty}`, `Logic puzzle (${logicPuzzle.title})`, "Brain game");
                      setLogicRecorded(true);
                    }
                  }}
                >
                  Check answer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<RefreshCcw className="size-4" />}
                  onClick={() => { setLogicChoice(null); setLogicSolved(false); setLogicRecorded(false); }}
                >
                  Reset
                </Button>
                {logicSolved ? <span className={`text-sm font-bold ${logicChoice === logicPuzzle.answerIndex ? "text-primary" : "text-danger"}`}>{logicChoice === logicPuzzle.answerIndex ? "Correct" : "Try again next time"}. {logicPuzzle.explanation}</span> : null}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Brain Games</p>
                <h2 className="mt-1 text-2xl font-black text-text-primary">Memory challenge</h2>
              </div>
              <Button size="sm" variant="ghost" icon={<TimerReset className="size-4" />} onClick={() => { setMemoryPreview(true); setMemorySequenceIndex((current) => current + 1); setMemoryGuess([]); setMemorySolved(false); setMemoryRecorded(false); }}>
                New round
              </Button>
            </div>
            <div className="mt-4 rounded-3xl border-2 border-border bg-cream-light p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-wider text-text-secondary">{memoryPreview ? "Look carefully" : "Repeat the order"}</p>
                <StatusBadge variant="review">{memoryPreview ? "Preview" : "Guess time"}</StatusBadge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(memoryPreview ? memorySequence : memoryGuess.length ? memoryGuess : memoryEmojiSet).map((emoji, index) => (
                  <div key={`${emoji}-${index}`} className="grid h-16 place-items-center rounded-2xl border-2 border-border bg-cream text-2xl font-black">
                    {emoji}
                  </div>
                ))}
              </div>
              {memoryPreview ? <p className="mt-4 text-sm text-text-secondary">The sequence will hide in a moment. Then click the symbols in the same order.</p> : null}
              {!memoryPreview && !memorySolved ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {memoryEmojiSet.map((emoji) => (
                    <button
                      key={emoji}
                      className="rounded-2xl border-2 border-border bg-cream-secondary px-4 py-3 text-2xl transition hover:-translate-y-0.5"
                      onClick={() => setMemoryGuess((current) => (current.length < memorySequence.length ? [...current, emoji] : current))}
                    >
                      {emoji}
                    </button>
                  ))}
                  <Button
                    className="col-span-2"
                    variant="ghost"
                    icon={<RefreshCcw className="size-4" />}
                    onClick={() => { setMemoryPreview(true); setMemoryGuess([]); setMemorySolved(false); setMemoryRecorded(false); setMemorySequenceIndex((current) => current + 1); }}
                  >
                    Restart
                  </Button>
                </div>
              ) : null}
              {memorySolved ? <div className="mt-4 rounded-2xl bg-success-bg p-4 text-sm font-bold text-primary">Nice memory. The sequence matched.</div> : null}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Calm Corner</p>
                <h2 className="mt-1 text-2xl font-black text-text-primary">Breathing and coloring</h2>
              </div>
              <StatusBadge variant="habit">Low pressure</StatusBadge>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border-2 border-border bg-cream-light p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-wider text-text-secondary">Breathing guide</p>
                  <Button size="sm" variant="ghost" icon={<WandSparkles className="size-4" />} onClick={() => { setBreathingRunning((current) => !current); if (!breathingRunning) { setBreathingRecorded(false); } }}>
                    {breathingRunning ? "Pause" : "Start"}
                  </Button>
                </div>
                <div className="mt-4 flex items-center justify-center">
                  <div className={`home-breath-ring ${breathingRunning ? "is-running" : ""}`} data-mode={breathingMode}>
                    <Sparkles className="size-8 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { id: "slow" as const, label: "Slow" },
                    { id: "focus" as const, label: "Focus" },
                    { id: "sleep" as const, label: "Sleep" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      className={`rounded-full border-2 px-3 py-1 text-xs font-black ${breathingMode === mode.id ? "border-primary bg-primary text-white" : "border-border bg-cream-secondary text-text-secondary"}`}
                      onClick={() => setBreathingMode(mode.id)}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-text-secondary">Choose a rhythm, breathe for a bit, then stop. No score.</p>
                {breathingRecorded ? <div className="mt-3 rounded-2xl bg-success-bg p-3 text-sm font-bold text-primary">Calm corner recorded in the passport.</div> : null}
              </div>

              <div className="rounded-3xl border-2 border-border bg-cream-light p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-wider text-text-secondary">Coloring page</p>
                  <Button size="sm" variant="ghost" icon={<RefreshCcw className="size-4" />} onClick={() => { setPainting({}); setPaintingRecorded(false); }}>
                    Reset
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CALM_PALETTE.map((color) => (
                    <button
                      key={color}
                      aria-label={`Select ${color}`}
                      className={`size-8 rounded-full border-2 ${selectedColor === color ? "border-text-primary" : "border-transparent"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {COLORING_SHAPES.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      className="grid min-h-24 place-items-center rounded-3xl border-2 border-border bg-cream-secondary p-4 transition hover:-translate-y-0.5"
                      style={{ backgroundColor: painting[id] ?? "#fff4dc" }}
                      onClick={() => setPainting((current) => ({ ...current, [id]: selectedColor }))}
                    >
                      <Icon className="size-8 text-text-primary" />
                      <span className="mt-2 text-xs font-black uppercase tracking-wider text-text-secondary">{label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-text-secondary">Pick a color, tap a shape, and keep going until the page feels calm.</p>
                {paintingRecorded ? <div className="mt-3 rounded-2xl bg-success-bg p-3 text-sm font-bold text-primary">Coloring page recorded in the passport.</div> : null}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
