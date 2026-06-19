import {
  DOCUMENT_CATEGORIES,
  OTHER_GROUP_LABEL,
  UNCATEGORIZED_CATEGORY,
  UNCATEGORIZED_CATEGORY_ID,
  getCategoryIdForDocumentName,
} from "./documentCategories";

const createEmptyCategoryMap = () =>
  DOCUMENT_CATEGORIES.reduce((map, category) => {
    map[category.id] = [];
    return map;
  }, {});

export const groupDocumentsByCategory = (documents = []) => {
  const grouped = createEmptyCategoryMap();
  grouped[UNCATEGORIZED_CATEGORY_ID] = [];

  documents.forEach((doc) => {
    const categoryId = getCategoryIdForDocumentName(doc.name);
    if (!grouped[categoryId]) {
      grouped[categoryId] = [];
    }
    grouped[categoryId].push(doc);
  });

  return grouped;
};

export const buildGroupedSelectOptions = (documentTypes = []) => {
  const grouped = DOCUMENT_CATEGORIES.map((category) => ({
    label: category.title,
    options: [],
  }));

  const uncategorized = [];

  documentTypes.forEach((docType) => {
    const categoryId = getCategoryIdForDocumentName(docType.label);
    const groupIndex = DOCUMENT_CATEGORIES.findIndex(
      (category) => category.id === categoryId,
    );

    if (groupIndex === -1) {
      uncategorized.push(docType);
      return;
    }

    grouped[groupIndex].options.push(docType);
  });

  const result = grouped.filter((group) => group.options.length > 0);

  if (uncategorized.length > 0) {
    result.push({
      label: OTHER_GROUP_LABEL,
      options: uncategorized,
    });
  }

  return result;
};

export const flattenGroupedOptions = (groupedOptions = []) =>
  groupedOptions.flatMap((group) => group.options ?? []);

export const getAllDisplayCategories = () => [
  ...DOCUMENT_CATEGORIES,
  UNCATEGORIZED_CATEGORY,
];
