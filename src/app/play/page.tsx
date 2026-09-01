"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FlipHorizontal, Volume2, VolumeX, Sparkles, Timer, Zap, Play } from "lucide-react";
import { GameBoard } from "@/components/game/game-board";
import {
  initialState, makePuzzle, isSnapped, scoreSnap, ROUND_TIME,
  type GameState,
} from "@/lib/game/engine";
import {
  unlockAudio, setMuted, isMuted, playNote, playSuccessChord, playFanfare, playTick,
} from "@/lib/game/audio";

export default function PlayPage() {
  const { t } = useTranslation();
  const [state, setState] = useState<GameState>(() => initialState());
  const [angle, setAngle] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [snapped, setSnapped] = useState(false);
  const [muted, setMutedUI] = useState(false);
  const [flap, setFlap] = useState(0);
  const raf = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // flap animation only while a snap is celebrating
  useEffect(() => {
    if (!snapped) return;
    const loop = (ts: number) => {
      setFlap((Math.sin((ts / 200) * Math.PI) + 1) / 2);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [snapped]);

  const nextPuzzle = useCallback((round: number) => {
    const p = makePuzzle(round);
    setState((s) => ({ ...s, puzzle: p }));
    setAngle(p.startAngle);
    setFlipped(false);
    setSnapped(false);
    playNote(p.noteIndex);
  }, []);

  const startGame = useCallback(() => {
    unlockAudio();
    setState({ ...initialState(), status: "playing", timeLeft: ROUND_TIME });
    nextPuzzle(0);
  }, [nextPuzzle]);

  // countdown timer
  useEffect(() => {
    if (state.status !== "playing") return;
    timerRef.current = setInterval(() => {
      setState((s) => {
        if (s.timeLeft <= 1) {
          playFanfare();
          return { ...s, timeLeft: 0, status: "over" };
        }
        if (s.timeLeft <= 4) playTick();
        return { ...s, timeLeft: s.timeLeft - 1 };
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.status]);

  // check snap whenever angle/flip changes
  const tryLock = useCallback(
    (a: number, f: boolean) => {
      if (state.status !== "playing" || !state.puzzle || snapped) return;
      if (isSnapped(state.puzzle, a, f)) {
        const gained = scoreSnap(state.puzzle, a, state.combo);
        setSnapped(true);
        playSuccessChord(state.puzzle.noteIndex);
        setState((s) => {
          const combo = s.combo + 1;
          return {
            ...s,
            score: s.score + gained,
            combo,
            bestCombo: Math.max(s.bestCombo, combo),
            round: s.round + 1,
          };
        });
        setTimeout(() => nextPuzzle(state.round + 1), 700);
      }
    },
    [state, snapped, nextPuzzle],
  );

  const handleRotate = useCallback((deg: number) => {
    setAngle(deg);
    tryLock(deg, flipped);
  }, [flipped, tryLock]);

  const handleFlip = useCallback(() => {
    unlockAudio();
    setFlipped((f) => {
      const nf = !f;
      tryLock(angle, nf);
      return nf;
    });
  }, [angle, tryLock]);

  const toggleMute = useCallback(() => {
    const nm = !isMuted();
    setMuted(nm);
    setMutedUI(nm);
  }, []);

  return (
    <div className="pop-checker mx-auto flex min-h-screen w-full max-w-[640px] flex-col" data-el="play-root">
      {/* Header / HUD */}
      <header
        className="flex items-center justify-between gap-2 border-b-[4px] border-[#69170D] bg-[#F7DE07] px-4"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top, 0px))", paddingBottom: "12px" }}
        data-el="play-header"
      >
        <div className="min-w-0">
          <h1 className="pop-heading truncate text-xl leading-none text-[#69170D]">{t("game.title")}</h1>
          <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wide text-[#8A2418]">{t("game.tagline")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button onClick={toggleMute} className="flex h-9 w-9 items-center justify-center rounded-[6px] border-[3px] border-[#69170D] bg-[#A3DBEE] text-[#69170D]" data-el="mute-toggle" aria-label={t("game.mute")}>
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <Link href="/" className="flex h-9 items-center rounded-[6px] border-[3px] border-[#69170D] bg-[#FFF7D8] px-2 text-xs font-black text-[#69170D]" data-el="to-studio">
            {t("game.studio")}
          </Link>
        </div>
      </header>

      {/* Score strip */}
      <div className="grid grid-cols-3 gap-2 border-b-[4px] border-[#69170D] bg-[#F7DE07] px-4 py-2" data-el="score-strip">
        <Stat icon={<Sparkles className="h-3.5 w-3.5" />} label={t("game.score")} value={state.score} />
        <Stat icon={<Zap className="h-3.5 w-3.5" />} label={t("game.combo")} value={`×${state.combo}`} accent />
        <Stat icon={<Timer className="h-3.5 w-3.5" />} label={t("game.time")} value={`${state.timeLeft}s`} danger={state.timeLeft <= 5 && state.status === "playing"} />
      </div>

      {/* Board */}
      <div className="relative flex flex-1 items-center justify-center p-3" data-el="game-stage">
        <div className="relative aspect-square w-full max-w-[520px] rounded-[18px] border-[5px] border-[#69170D] bg-[#FFF7D8] shadow-[0_10px_0_rgba(105,23,13,0.25)]">
          {state.puzzle && (
            <div className="checker-pulse absolute inset-0 overflow-hidden rounded-[12px]">
              <GameBoard puzzle={state.puzzle} angle={angle} flipped={flipped} snapped={snapped} flap={flap} onRotate={handleRotate} />
            </div>
          )}

          {/* Start / Over overlay */}
          {state.status !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[12px] bg-[#69170D]/85 p-6 text-center" data-el="game-overlay">
              {state.status === "over" ? (
                <>
                  <div className="pop-heading text-3xl text-[#F7DE07]">{t("game.over")}</div>
                  <div className="text-[#FFF7D8]">
                    <div className="text-5xl font-black text-[#F7DE07]">{state.score}</div>
                    <div className="mt-1 text-sm font-bold">{t("game.solved", { n: state.round })} · {t("game.bestCombo", { n: state.bestCombo })}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="pop-heading text-2xl text-[#F7DE07]">{t("game.title")}</div>
                  <p className="max-w-[240px] text-sm font-bold leading-relaxed text-[#FFF7D8]">{t("game.howto")}</p>
                </>
              )}
              <button
                onClick={startGame}
                className="flex items-center gap-2 rounded-[8px] border-[3px] border-[#F7DE07] bg-[#E82020] px-6 py-2.5 text-base font-black text-[#FFF7D8] shadow-[0_4px_0_#7F1D1D] active:translate-y-0.5"
                data-el="start-button"
              >
                <Play className="h-5 w-5" />
                {state.status === "over" ? t("game.retry") : t("game.start")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div
        className="flex items-center justify-center gap-3 border-t-[4px] border-[#69170D] bg-[#F7DE07] px-4 pt-3"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))" }}
        data-el="play-controls"
      >
        <button
          onClick={handleFlip}
          disabled={state.status !== "playing"}
          className="flex items-center gap-2 rounded-[8px] border-[3px] border-[#69170D] bg-[#A3DBEE] px-5 py-2.5 text-sm font-black text-[#69170D] shadow-[0_3px_0_rgba(105,23,13,0.4)] active:translate-y-0.5 disabled:opacity-40"
          data-el="flip-button"
        >
          <FlipHorizontal className="h-5 w-5" />
          {t("game.flip")}
        </button>
        <div className="rounded-[8px] border-[3px] border-[#69170D] bg-[#FFF7D8] px-4 py-2.5 text-center text-xs font-bold text-[#8A2418]">
          {t("game.hint")}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, accent, danger }: { icon: React.ReactNode; label: string; value: string | number; accent?: boolean; danger?: boolean }) {
  return (
    <div className={`flex flex-col items-center rounded-[6px] border-[3px] border-[#69170D] px-1 py-1 ${danger ? "bg-[#E82020]" : accent ? "bg-[#A3DBEE]" : "bg-[#FFF7D8]"}`}>
      <span className={`flex items-center gap-1 text-[9px] font-black uppercase ${danger ? "text-[#FFF7D8]" : "text-[#8A2418]"}`}>{icon}{label}</span>
      <span className={`font-mono text-lg font-black leading-none ${danger ? "text-[#FFF7D8]" : "text-[#69170D]"}`}>{value}</span>
    </div>
  );
}
