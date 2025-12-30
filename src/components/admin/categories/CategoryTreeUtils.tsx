import type { Category } from "@/types";
import { searchVietnamese } from "@/lib/helpers";

export function searchInCategory(category: Category, searchTerm: string): boolean {
  if (searchVietnamese(category.name, searchTerm)) {
    return true;
  }
  if (category._id.toLowerCase().includes(searchTerm.toLowerCase())) {
    return true;
  }
  if (
    category.slug &&
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  ) {
    return true;
  }
  if (category.subCategories && category.subCategories.length > 0) {
    return category.subCategories.some((sub) =>
      searchInCategory(sub, searchTerm)
    );
  }
  return false;
}

// Build category tree từ flat list
export function buildCategoryTree(categories: Category[]): Category[] {
  const categoriesMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  // First pass: create map
  categories.forEach((cat) => {
    categoriesMap.set(cat._id, { ...cat, subCategories: [] });
  });

  // Second pass: build tree
  categories.forEach((cat) => {
    const category = categoriesMap.get(cat._id)!;
    if (cat.parent_id) {
      const parent = categoriesMap.get(cat.parent_id);
      if (parent) {
        parent.subCategories = parent.subCategories || [];
        parent.subCategories.push(category);
      } else {
        rootCategories.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });

  return rootCategories;
}

// Flatten categories theo search term và expand state
export function flattenCategories(
  categoryTree: Category[],
  searchTerm: string,
  expandedIds: Set<string>
): Category[] {
  const trimmedSearch = searchTerm.trim();

  if (trimmedSearch) {
    const flattenWithSearch = (cats: Category[], level = 0): Category[] => {
      const result: Category[] = [];
      cats.forEach((cat) => {
        const matches = searchInCategory(cat, trimmedSearch);
        if (matches) {
          result.push({ ...cat, level });
          if (cat.subCategories && cat.subCategories.length > 0) {
            result.push(...flattenWithSearch(cat.subCategories, level + 1));
          }
        }
      });
      return result;
    };
    return flattenWithSearch(categoryTree);
  }

  const flattenCategoriesRec = (cats: Category[], level = 0): Category[] => {
    const result: Category[] = [];
    cats.forEach((cat) => {
      result.push({ ...cat, level });
      if (
        expandedIds.has(cat._id) &&
        cat.subCategories &&
        cat.subCategories.length > 0
      ) {
        result.push(...flattenCategoriesRec(cat.subCategories, level + 1));
      }
    });
    return result;
  };

  return flattenCategoriesRec(categoryTree);
}

