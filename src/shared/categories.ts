// Word categories. Shared by the lobby picker (client) and the word list (server).

export const CATEGORIES = [
  { id: "animals", label: "Animals" },
  { id: "food", label: "Food & Drink" },
  { id: "home", label: "Around the House" },
  { id: "places", label: "Places" },
  { id: "actions", label: "Actions" },
  { id: "people", label: "Jobs & People" },
  { id: "sports", label: "Sports & Hobbies" },
  { id: "movies", label: "Movies & TV" },
  { id: "brands", label: "Brands" },
  { id: "nature", label: "Nature & Weather" },
  { id: "transport", label: "Vehicles & Travel" },
  { id: "fantasy", label: "Fantasy & Fairy Tales" },
  { id: "tech", label: "Technology" },
  { id: "clothes", label: "Clothes & Accessories" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS: string[] = CATEGORIES.map((c) => c.id);

export function categoryLabel(id: string | null | undefined): string | null {
  return CATEGORIES.find((c) => c.id === id)?.label ?? null;
}
