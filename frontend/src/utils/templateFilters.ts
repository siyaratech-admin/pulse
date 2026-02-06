/**
 * Template Task Filter Utilities
 * Provides filter configurations for LinkFields and template selection
 */

/**
 * Get filters for selecting parent template tasks
 * Only returns templates that are both is_template = 1 AND is_group = 1
 */
export const getTemplateParentFilters = () => {
  return [
    ["is_template", "=", 1],
    ["is_group", "=", 1],
  ]
}

/**
 * Get filters for selecting all template tasks in a project
 * @param project - Project name
 */
export const getProjectTemplates = (project: string) => {
  return [
    ["is_template", "=", 1],
    ["project", "=", project],
  ]
}

/**
 * Get filters for selecting template group tasks only
 * @param project - Optional project filter
 */
export const getTemplateGroupFilters = (project?: string) => {
  const filters: any[][] = [
    ["is_template", "=", 1],
    ["is_group", "=", 1],
  ]

  if (project) {
    filters.push(["project", "=", project])
  }

  return filters
}

/**
 * Get filters for selecting non-group template tasks
 * @param project - Optional project filter
 */
export const getTemplateLeafFilters = (project?: string) => {
  const filters: any[][] = [
    ["is_template", "=", 1],
    ["is_group", "=", 0],
  ]

  if (project) {
    filters.push(["project", "=", project])
  }

  return filters
}

/**
 * Get filters for selecting all templates (no project filter)
 */
export const getAllTemplatesFilter = () => {
  return [["is_template", "=", 1]]
}

/**
 * Check if a task qualifies as a valid template parent
 * @param task - Task object to check
 */
export const isValidTemplateParent = (task: { is_template?: number; is_group?: number }): boolean => {
  return task.is_template === 1 && task.is_group === 1
}

/**
 * Check if a task is a template
 * @param task - Task object to check
 */
export const isTemplate = (task: { is_template?: number }): boolean => {
  return task.is_template === 1
}

/**
 * Check if a task is a group task
 * @param task - Task object to check
 */
export const isGroupTask = (task: { is_group?: number }): boolean => {
  return task.is_group === 1
}

/**
 * Format filters as JSON string for Frappe LinkField
 * @param filters - Array of filter conditions
 */
export const formatFiltersForLinkField = (filters: any[][]): string => {
  return JSON.stringify(filters)
}

/**
 * Get filters for selecting tasks that can be converted to templates
 * (i.e., tasks that are not already templates)
 * @param project - Optional project filter
 */
export const getNonTemplateFilters = (project?: string) => {
  const filters: any[][] = [["is_template", "=", 0]]

  if (project) {
    filters.push(["project", "=", project])
  }

  return filters
}
