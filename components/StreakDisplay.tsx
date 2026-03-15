"use client";

import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faTrophy } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/lib/i18n";

interface StreakDisplayProps {
  streak: number;
  bestStreak: number;
}

export default function StreakDisplay({ streak, bestStreak }: StreakDisplayProps) {
  const { t } = useTranslation();
  const streakRef = useRef<HTMLDivElement>(null);
  const prevStreak = useRef(streak);

  useEffect(() => {
    if (streak > prevStreak.current && streakRef.current) {
      streakRef.current.classList.add("animate-bounce");
      const timer = setTimeout(() => {
        streakRef.current?.classList.remove("animate-bounce");
      }, 600);
      prevStreak.current = streak;
      return () => clearTimeout(timer);
    }
    prevStreak.current = streak;
  }, [streak]);

  return (
    <div className="flex items-center gap-6 justify-center py-2">
      <div ref={streakRef} className="flex items-center gap-2 text-orange-500 font-bold text-lg">
        <FontAwesomeIcon icon={faFire} className="w-5 h-5" />
        <span>{t("miniGame.streak")}: {streak}</span>
      </div>
      <div className="flex items-center gap-2 text-yellow-500 font-bold text-lg">
        <FontAwesomeIcon icon={faTrophy} className="w-5 h-5" />
        <span>{t("miniGame.bestStreak")}: {bestStreak}</span>
      </div>
    </div>
  );
}
