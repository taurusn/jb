/**
 * Skill Categorization System
 * Categorizes hospitality skills into Kitchen, Service, and Management roles
 */

export type SkillCategory = 'kitchen' | 'service' | 'management';

export interface SkillCategoryInfo {
  category: SkillCategory;
  color: {
    bg: string;
    border: string;
    text: string;
    glow: string;
  };
  icon: string;
}

// Skill category mapping
const SKILL_CATEGORIES: Record<string, SkillCategory> = {
  // Kitchen roles
  'Barista / Coffee Maker': 'kitchen',
  'Chef / Cook': 'kitchen',
  'Kitchen Assistant': 'kitchen',
  'Baker / Pastry': 'kitchen',

  // Service roles
  'Waiter / Customer Service': 'service',
  'Cashier': 'service',
  'Cleaner / Steward': 'service',

  // Management roles
  'Restaurant Supervisor / Manager': 'management',
};

// Category color schemes
const CATEGORY_COLORS: Record<SkillCategory, SkillCategoryInfo['color']> = {
  kitchen: {
    bg: 'bg-accent-orange/10',
    border: 'border-accent-orange/30',
    text: 'text-accent-orange',
    glow: 'shadow-accent-orange/20',
  },
  service: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  management: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20',
  },
};

// Category icons (SVG paths)
export const CATEGORY_ICONS: Record<SkillCategory, string> = {
  kitchen: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z', // Chef hat icon path
  service: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z', // Service icon path
  management: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z', // Crown icon path
};

/**
 * Get the category for a given skill
 */
export function getSkillCategory(skill: string): SkillCategory {
  return SKILL_CATEGORIES[skill] || 'service'; // Default to service
}

/**
 * Get color scheme for a skill category
 */
export function getCategoryColors(category: SkillCategory): SkillCategoryInfo['color'] {
  return CATEGORY_COLORS[category];
}

/**
 * Get full category info for a skill
 */
export function getSkillCategoryInfo(skill: string): SkillCategoryInfo {
  const category = getSkillCategory(skill);
  const color = getCategoryColors(category);
  const icon = CATEGORY_ICONS[category];

  return {
    category,
    color,
    icon,
  };
}

/**
 * Group skills by category
 */
export function groupSkillsByCategory(skills: string[]): Record<SkillCategory, string[]> {
  const grouped: Record<SkillCategory, string[]> = {
    kitchen: [],
    service: [],
    management: [],
  };

  skills.forEach((skill) => {
    const category = getSkillCategory(skill);
    grouped[category].push(skill);
  });

  return grouped;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: SkillCategory): string {
  const names: Record<SkillCategory, string> = {
    kitchen: 'Kitchen',
    service: 'Service',
    management: 'Management',
  };
  return names[category];
}
