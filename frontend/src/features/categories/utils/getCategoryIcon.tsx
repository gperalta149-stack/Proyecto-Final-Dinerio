// frontend/src/features/categories/utils/getCategoryIcon.tsx
import React from 'react';
import { CATEGORY_ICONS, CATEGORY_ICON_MAP } from '../constants/categoryIcons';

export const getCategoryIcon = (categoryName: string): React.ReactElement => {
  const normalizedName = categoryName.toLowerCase().trim();
  const iconKey = CATEGORY_ICON_MAP[normalizedName] || 'otros';
  return CATEGORY_ICONS[iconKey] || CATEGORY_ICONS.otros;
};

export const detectCategoryIcon = (categoryName: string): string => {
  const normalizedName = categoryName.toLowerCase().trim();
  return CATEGORY_ICON_MAP[normalizedName] || 'otros';
};