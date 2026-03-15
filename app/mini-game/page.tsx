"use client";

import { usePageTitle } from "@/components/PageTitle";
import { useTranslation } from "@/lib/i18n";
import IngredientGuessGame from "@/components/IngredientGuessGame";

export default function MiniGamePage() {
  const { t } = useTranslation();
  usePageTitle(t("miniGame.title"));

  return <IngredientGuessGame />;
}
