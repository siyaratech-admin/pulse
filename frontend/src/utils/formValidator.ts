/**
 * Form Validation and Testing Suite
 * Tests all form components for consistency and functionality
 */

import { ConditionEvaluator } from './conditionEvaluator';
import { toBool, isFieldRequired, isFieldReadOnly } from './fieldHelpers';
import type { FieldMetadata, FormData } from '../types/form';

export interface FormTestResult {
    passed: number;
    failed: number;
    errors: string[];
    warnings: string[];
}

export class FormValidator {
    /**
     * Validate field metadata structure
     */
    static validateFieldMetadata(field: FieldMetadata): string[] {
        const errors: string[] = [];

        // Required properties
        if (!field.fieldname) errors.push('Field missing required property: fieldname');
        if (!field.label) errors.push('Field missing required property: label');
        if (!field.fieldtype) errors.push('Field missing required property: fieldtype');

        // Type validation
        if (typeof field.fieldname !== 'string') errors.push('fieldname must be string');
        if (typeof field.label !== 'string') errors.push('label must be string');
        if (typeof field.fieldtype !== 'string') errors.push('fieldtype must be string');

        // Boolean property validation (can be 0/1 or boolean)
        const booleanFields = ['reqd', 'hidden', 'read_only', 'bold', 'unique', 'translatable'];
        booleanFields.forEach(prop => {
            const value = (field as any)[prop];
            if (value !== undefined && typeof value !== 'boolean' && typeof value !== 'number') {
                errors.push(`${prop} must be boolean or number (0/1), got ${typeof value}`);
            }
        });

        // Numeric property validation
        if (field.precision !== undefined && (typeof field.precision !== 'number' || field.precision < 0)) {
            errors.push('precision must be non-negative number');
        }
        if (field.length !== undefined && (typeof field.length !== 'number' || field.length < 0)) {
            errors.push('length must be non-negative number');
        }
        if (field.columns !== undefined && (typeof field.columns !== 'number' || field.columns < 1 || field.columns > 12)) {
            errors.push('columns must be number between 1 and 12');
        }

        // Options validation
        if (field.options !== undefined) {
            const isValidOptions = typeof field.options === 'string' || 
                                 Array.isArray(field.options) || 
                                 (typeof field.options === 'object' && field.options !== null);
            if (!isValidOptions) {
                errors.push('options must be string, array, or object');
            }
        }

        // Table fields validation
        if (['Table', 'Table MultiSelect'].includes(field.fieldtype)) {
            if (!field.table_fields || !Array.isArray(field.table_fields)) {
                errors.push('Table fields must have table_fields array');
            } else {
                field.table_fields.forEach((childField, index) => {
                    const childErrors = this.validateFieldMetadata(childField);
                    childErrors.forEach(err => errors.push(`table_fields[${index}]: ${err}`));
                });
            }
        }

        return errors;
    }

    /**
     * Test condition evaluation
     */
    static testConditionEvaluation(): FormTestResult {
        const result: FormTestResult = { passed: 0, failed: 0, errors: [], warnings: [] };
        
        const testCases = [
            {
                name: 'Simple field existence',
                condition: 'eval:doc.test_field',
                formData: { test_field: 'value' },
                expected: true
            },
            {
                name: 'Field non-existence',
                condition: 'eval:doc.missing_field',
                formData: { other_field: 'value' },
                expected: false
            },
            {
                name: 'Equality comparison',
                condition: 'eval:doc.status == "Active"',
                formData: { status: 'Active' },
                expected: true
            },
            {
                name: 'Inequality comparison',
                condition: 'eval:doc.status != "Inactive"',
                formData: { status: 'Active' },
                expected: true
            },
            {
                name: 'Numeric comparison',
                condition: 'eval:doc.amount > 100',
                formData: { amount: 150 },
                expected: true
            },
            {
                name: 'Logical AND',
                condition: 'eval:doc.type == "Company" && doc.country == "India"',
                formData: { type: 'Company', country: 'India' },
                expected: true
            },
            {
                name: 'Logical OR',
                condition: 'eval:doc.status == "Active" || doc.status == "Pending"',
                formData: { status: 'Pending' },
                expected: true
            }
        ];

        testCases.forEach(testCase => {
            try {
                const actualResult = ConditionEvaluator.evaluate(testCase.condition, testCase.formData);
                if (actualResult === testCase.expected) {
                    result.passed++;
                } else {
                    result.failed++;
                    result.errors.push(`${testCase.name}: Expected ${testCase.expected}, got ${actualResult}`);
                }
            } catch (error) {
                result.failed++;
                result.errors.push(`${testCase.name}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });

        return result;
    }

    /**
     * Test helper functions
     */
    static testHelperFunctions(): FormTestResult {
        const result: FormTestResult = { passed: 0, failed: 0, errors: [], warnings: [] };

        // Test toBool function
        const boolTests = [
            { input: true, expected: true },
            { input: false, expected: false },
            { input: 1, expected: true },
            { input: 0, expected: false },
            { input: undefined, expected: false },
            { input: null, expected: false }
        ];

        boolTests.forEach((test, index) => {
            try {
                const actual = toBool(test.input as any);
                if (actual === test.expected) {
                    result.passed++;
                } else {
                    result.failed++;
                    result.errors.push(`toBool test ${index}: Expected ${test.expected}, got ${actual}`);
                }
            } catch (error) {
                result.failed++;
                result.errors.push(`toBool test ${index}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });

        // Test isFieldRequired function
        const requiredTests = [
            { field: { reqd: true } as FieldMetadata, expected: true },
            { field: { reqd: 1 } as FieldMetadata, expected: true },
            { field: { reqd: false } as FieldMetadata, expected: false },
            { field: { reqd: 0 } as FieldMetadata, expected: false },
            { field: {} as FieldMetadata, expected: false }
        ];

        requiredTests.forEach((test, index) => {
            try {
                const actual = isFieldRequired(test.field);
                if (actual === test.expected) {
                    result.passed++;
                } else {
                    result.failed++;
                    result.errors.push(`isFieldRequired test ${index}: Expected ${test.expected}, got ${actual}`);
                }
            } catch (error) {
                result.failed++;
                result.errors.push(`isFieldRequired test ${index}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });

        return result;
    }

    /**
     * Validate form data structure
     */
    static validateFormData(fields: FieldMetadata[], formData: FormData): FormTestResult {
        const result: FormTestResult = { passed: 0, failed: 0, errors: [], warnings: [] };

        fields.forEach(field => {
            const value = formData[field.fieldname];
            
            // Check required fields
            if (isFieldRequired(field) && (value === undefined || value === null || value === '')) {
                result.failed++;
                result.errors.push(`Required field ${field.fieldname} is missing or empty`);
            } else {
                result.passed++;
            }

            // Type-specific validation
            switch (field.fieldtype) {
                case 'Int':
                    if (value !== undefined && value !== null && value !== '' && !Number.isInteger(Number(value))) {
                        result.failed++;
                        result.errors.push(`Field ${field.fieldname} must be integer`);
                    }
                    break;

                case 'Float':
                case 'Currency':
                    if (value !== undefined && value !== null && value !== '' && isNaN(Number(value))) {
                        result.failed++;
                        result.errors.push(`Field ${field.fieldname} must be number`);
                    }
                    break;

                case 'Check':
                    if (value !== undefined && value !== 0 && value !== 1 && value !== true && value !== false) {
                        result.failed++;
                        result.errors.push(`Field ${field.fieldname} must be boolean or 0/1`);
                    }
                    break;

                case 'Date':
                    if (value && typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                        result.failed++;
                        result.errors.push(`Field ${field.fieldname} must be valid date format (YYYY-MM-DD)`);
                    }
                    break;

                case 'Table':
                    if (value !== undefined && !Array.isArray(value)) {
                        result.failed++;
                        result.errors.push(`Field ${field.fieldname} must be array`);
                    }
                    break;
            }

            // Length validation
            if (field.length && typeof value === 'string' && value.length > field.length) {
                result.warnings.push(`Field ${field.fieldname} exceeds maximum length of ${field.length}`);
            }
        });

        return result;
    }

    /**
     * Run comprehensive form validation suite
     */
    static runFullValidation(fields?: FieldMetadata[], formData?: FormData): FormTestResult {
        const results: FormTestResult[] = [];
        
        console.log('🔍 Running Form Validation Suite...\n');

        // Test condition evaluation
        console.log('Testing condition evaluation...');
        const conditionResult = this.testConditionEvaluation();
        results.push(conditionResult);
        console.log(`✓ Condition tests: ${conditionResult.passed} passed, ${conditionResult.failed} failed\n`);

        // Test helper functions
        console.log('Testing helper functions...');
        const helperResult = this.testHelperFunctions();
        results.push(helperResult);
        console.log(`✓ Helper tests: ${helperResult.passed} passed, ${helperResult.failed} failed\n`);

        // Test field metadata if provided
        if (fields) {
            console.log('Validating field metadata...');
            let fieldErrors = 0;
            fields.forEach((field, index) => {
                const errors = this.validateFieldMetadata(field);
                if (errors.length > 0) {
                    fieldErrors++;
                    console.log(`❌ Field ${index} (${field.fieldname}): ${errors.join(', ')}`);
                }
            });
            console.log(`✓ Field metadata: ${fields.length - fieldErrors} valid, ${fieldErrors} invalid\n`);
        }

        // Test form data if provided
        if (fields && formData) {
            console.log('Validating form data...');
            const dataResult = this.validateFormData(fields, formData);
            results.push(dataResult);
            console.log(`✓ Form data: ${dataResult.passed} valid, ${dataResult.failed} invalid\n`);
        }

        // Combine results
        const totalResult: FormTestResult = results.reduce((acc, result) => ({
            passed: acc.passed + result.passed,
            failed: acc.failed + result.failed,
            errors: [...acc.errors, ...result.errors],
            warnings: [...acc.warnings, ...result.warnings]
        }), { passed: 0, failed: 0, errors: [], warnings: [] });

        console.log(`📊 Total Results: ${totalResult.passed} passed, ${totalResult.failed} failed`);
        
        if (totalResult.errors.length > 0) {
            console.log('\n❌ Errors:');
            totalResult.errors.forEach(error => console.log(`  - ${error}`));
        }

        if (totalResult.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            totalResult.warnings.forEach(warning => console.log(`  - ${warning}`));
        }

        return totalResult;
    }
}

// Quick validation function for development
export const quickValidate = (fields?: FieldMetadata[], formData?: FormData) => {
    return FormValidator.runFullValidation(fields, formData);
};