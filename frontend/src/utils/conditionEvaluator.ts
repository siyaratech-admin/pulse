/**
 * Frappe Condition Evaluator
 * Safely evaluates Frappe depends_on expressions
 */

import React from 'react';
import type { FormData } from '../types/form';

export interface EvaluationContext {
    doc: FormData;
    [key: string]: any;
}

/**
 * Safely evaluate Frappe condition expressions
 * Handles common Frappe patterns like:
 * - eval:doc.field_name
 * - eval:doc.field_name == "value"
 * - eval:doc.field_name && doc.other_field
 * - Simple field references
 */
export class ConditionEvaluator {
    private static readonly SAFE_OPERATORS = [
        '==', '!=', '>', '<', '>=', '<=',
        '&&', '||', '!',
        'in', 'not in',
        'is', 'is not'
    ];

    private static readonly ALLOWED_FUNCTIONS = [
        'parseInt', 'parseFloat', 'Number', 'String', 'Boolean',
        'Math.floor', 'Math.ceil', 'Math.round', 'Math.abs'
    ];

    /**
     * Main evaluation function
     */
    static evaluate(condition: string, formData: FormData): boolean {
        if (!condition || typeof condition !== 'string') {
            return true;
        }

        try {
            // Clean and prepare the condition
            const cleanCondition = this.prepareCondition(condition.trim());

            // Create safe evaluation context
            const context: EvaluationContext = {
                doc: { ...formData }
            };

            // Evaluate the condition
            return this.safeEvaluate(cleanCondition, context);
        } catch (error) {
            console.warn('Condition evaluation error:', {
                condition,
                error: error instanceof Error ? error.message : error
            });
            return true; // Default to true on error to avoid hiding fields
        }
    }

    /**
     * Prepare condition string for evaluation
     */
    private static prepareCondition(condition: string): string {
        // Remove eval: prefix if present
        let cleanCondition = condition.replace(/^eval:\s*/, '');

        // Handle common Frappe patterns
        cleanCondition = this.handleFrappePatterns(cleanCondition);

        // Validate the condition for safety
        this.validateConditionSafety(cleanCondition);

        return cleanCondition;
    }

    /**
     * Handle common Frappe condition patterns
     */
    private static handleFrappePatterns(condition: string): string {
        let processed = condition;

        // Replace doc.fieldname with context access
        processed = processed.replace(/\bdoc\.(\w+)/g, 'doc.$1');

        // Handle Python-style comparisons
        processed = processed.replace(/\bis\s+not\b/g, '!==');
        processed = processed.replace(/\bis\b/g, '===');
        processed = processed.replace(/\bnot\s+in\b/g, '!includes');
        processed = processed.replace(/\bin\b/g, 'includes');

        // Handle Python-style and/or
        processed = processed.replace(/\band\b/g, '&&');
        processed = processed.replace(/\bor\b/g, '||');
        processed = processed.replace(/\bnot\b/g, '!');

        return processed;
    }

    /**
     * Validate condition for potentially unsafe operations
     */
    private static validateConditionSafety(condition: string): void {
        // Block dangerous patterns
        const dangerousPatterns = [
            /\bfunction\b/i,
            /\beval\b/i,
            /\bsetTimeout\b/i,
            /\bsetInterval\b/i,
            /\bwindow\b/i,
            /\bdocument\b/i,
            /\bprocess\b/i,
            /\brequire\b/i,
            /\bimport\b/i,
            /\bexport\b/i,
            /\breturn\b/i,
            /\bfor\s*\(/i,
            /\bwhile\s*\(/i,
            /\bdo\s*\{/i,
            /\btry\s*\{/i,
            /\bcatch\s*\(/i,
            /\bthrow\b/i,
            /\bnew\s+/i,
            /\bdelete\b/i,
            /\bvoid\b/i,
            /\btypeof\b/i,
            /\binstanceof\b/i,
            /[\[\]{}]/,  // No array/object literals or access
            /\.\s*constructor/i,
            /\.\s*prototype/i,
            /\.\s*__/i,
            /\bthis\b/i
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(condition)) {
                throw new Error(`Unsafe pattern detected in condition: ${condition}`);
            }
        }
    }

    /**
     * Safe evaluation using a limited scope
     */
    private static safeEvaluate(condition: string, context: EvaluationContext): boolean {
        // Handle simple identifier (field name without doc. prefix)
        if (/^\w+$/.test(condition)) {
            const value = context.doc[condition];
            // Treat "0", 0, false, null, undefined, empty string as false
            if (value === '0' || value === 0 || value === false || value === null || value === undefined || value === '') {
                return false;
            }
            return true;
        }

        // Handle simple field existence checks with doc. prefix
        if (/^doc\.\w+$/.test(condition)) {
            const fieldName = condition.replace('doc.', '');
            const value = context.doc[fieldName];
            // Treat "0", 0, false, null, undefined, empty string as false
            if (value === '0' || value === 0 || value === false || value === null || value === undefined || value === '') {
                return false;
            }
            return true;
        }

        // Handle simple comparisons
        const result = this.evaluateComparison(condition, context);

        // Ensure boolean result
        return Boolean(result);
    }

    /**
     * Evaluate comparison expressions safely
     */
    private static evaluateComparison(condition: string, context: EvaluationContext): any {
        // Handle equality comparisons
        const equalityMatch = condition.match(/^doc\.(\w+)\s*(==|!=|===|!==)\s*["']?([^"']+)["']?$/);
        if (equalityMatch) {
            const [, fieldName, operator, expectedValue] = equalityMatch;
            const actualValue = String(context.doc[fieldName] || '');
            const expected = String(expectedValue);

            switch (operator) {
                case '==':
                case '===':
                    return actualValue === expected;
                case '!=':
                case '!==':
                    return actualValue !== expected;
                default:
                    return false;
            }
        }

        // Handle numeric comparisons
        const numericMatch = condition.match(/^doc\.(\w+)\s*(>|<|>=|<=)\s*([0-9.]+)$/);
        if (numericMatch) {
            const [, fieldName, operator, expectedValue] = numericMatch;
            const actualValue = Number(context.doc[fieldName] || 0);
            const expected = Number(expectedValue);

            switch (operator) {
                case '>':
                    return actualValue > expected;
                case '<':
                    return actualValue < expected;
                case '>=':
                    return actualValue >= expected;
                case '<=':
                    return actualValue <= expected;
                default:
                    return false;
            }
        }

        // Handle logical operations (AND/OR)
        const andMatch = condition.match(/^(.+?)\s*&&\s*(.+)$/);
        if (andMatch) {
            const [, left, right] = andMatch;
            return this.evaluateComparison(left.trim(), context) &&
                this.evaluateComparison(right.trim(), context);
        }

        const orMatch = condition.match(/^(.+?)\s*\|\|\s*(.+)$/);
        if (orMatch) {
            const [, left, right] = orMatch;
            return this.evaluateComparison(left.trim(), context) ||
                this.evaluateComparison(right.trim(), context);
        }

        // Handle negation
        const notMatch = condition.match(/^!\s*(.+)$/);
        if (notMatch) {
            return !this.evaluateComparison(notMatch[1].trim(), context);
        }

        // Handle parentheses (simple case)
        const parenMatch = condition.match(/^\((.+)\)$/);
        if (parenMatch) {
            return this.evaluateComparison(parenMatch[1].trim(), context);
        }

        // Fallback for simple field checks
        if (condition.startsWith('doc.')) {
            const fieldName = condition.replace('doc.', '');
            const value = context.doc[fieldName];
            return Boolean(value) && value !== '' && value !== null && value !== undefined;
        }

        // If we can't safely evaluate, return true (show field)
        console.warn('Unable to safely evaluate condition:', condition);
        return true;
    }

    /**
     * Batch evaluate multiple fields for efficiency
     */
    static evaluateFields(
        fields: Array<{ fieldname: string; depends_on?: string; mandatory_depends_on?: string; read_only_depends_on?: string }>,
        formData: FormData
    ): Record<string, { visible: boolean; required: boolean; readOnly: boolean }> {
        const results: Record<string, { visible: boolean; required: boolean; readOnly: boolean }> = {};

        fields.forEach(field => {
            results[field.fieldname] = {
                visible: field.depends_on ? this.evaluate(field.depends_on, formData) : true,
                required: field.mandatory_depends_on ? this.evaluate(field.mandatory_depends_on, formData) : false,
                readOnly: field.read_only_depends_on ? this.evaluate(field.read_only_depends_on, formData) : false
            };
        });

        return results;
    }
}

/**
 * React hook for condition evaluation
 */
export const useConditionEvaluator = (formData: FormData) => {
    const evaluateCondition = React.useCallback((condition: string): boolean => {
        return ConditionEvaluator.evaluate(condition, formData);
    }, [formData]);

    const evaluateFields = React.useCallback((
        fields: Array<{ fieldname: string; depends_on?: string; mandatory_depends_on?: string; read_only_depends_on?: string }>
    ) => {
        return ConditionEvaluator.evaluateFields(fields, formData);
    }, [formData]);

    return { evaluateCondition, evaluateFields };
};

// ConditionEvaluator is already exported above