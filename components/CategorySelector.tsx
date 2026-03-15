"use client";

import { useTranslation } from "@/lib/i18n";
import { getAssetPath } from "@/lib/paths";
import { RecipeCategory } from "@/lib/miniGame";

interface CategorySelectorProps {
  onSelect: (category: RecipeCategory) => void;
}

const CATEGORIES: { key: RecipeCategory; icon: string }[] = [
  { key: "cookpot", icon: "/icons/misc/icon_cookpot.png" },
  { key: "warly", icon: "/icons/misc/icon_cookpot_warly.png" },
  { key: "keg", icon: "/icons/misc/icon_cookpot_keg.png" },
  { key: "jar", icon: "/icons/misc/icon_cookpot_jar.png" },
  { key: "seasonal", icon: "/icons/misc/icon_cookpot_seasonal.png" },
];

export default function CategorySelector({ onSelect }: CategorySelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        {t("miniGame.selectCategory")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full max-w-2xl">
        {CATEGORIES.map(({ key, icon }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition font-bold cursor-pointer shadow-sm"
          >
            <img
              src={getAssetPath(icon)}
              alt={t(`miniGame.categories.${key}`)}
              className="w-10 h-10 object-contain"
            />
            <span className="text-sm text-center text-zinc-800 dark:text-zinc-200">
              {t(`miniGame.categories.${key}`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
