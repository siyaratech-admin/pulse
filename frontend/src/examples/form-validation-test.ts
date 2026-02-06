/**
 * Complete Form Test Examples
 * Run this file to validate all form functionality
 */

import { FormValidator } from '../utils/formValidator';
import { FieldMetadata, FormData } from '../types/form';

console.log('🚀 Starting Complete Form Validation Test Suite\n');

// Sample field definitions for testing
const sampleFields: FieldMetadata[] = [
    {
        fieldname: 'name',
        label: 'Name',
        fieldtype: 'Data',
        reqd: 1,
        length: 100
    },
    {
        fieldname: 'email',
        label: 'Email',
        fieldtype: 'Data',
        reqd: true,
        unique: 1
    },
    {
        fieldname: 'age',
        label: 'Age',
        fieldtype: 'Int',
        reqd: 0
    },
    {
        fieldname: 'salary',
        label: 'Salary',
        fieldtype: 'Currency',
        precision: 2
    },
    {
        fieldname: 'is_active',
        label: 'Is Active',
        fieldtype: 'Check',
        reqd: false
    },
    {
        fieldname: 'status',
        label: 'Status',
        fieldtype: 'Select',
        options: 'Active\nInactive\nPending',
        reqd: 1
    },
    {
        fieldname: 'join_date',
        label: 'Join Date',
        fieldtype: 'Date',
        reqd: 1
    },
    {
        fieldname: 'skills',
        label: 'Skills',
        fieldtype: 'Table',
        table_fields: [
            {
                fieldname: 'skill_name',
                label: 'Skill Name',
                fieldtype: 'Data',
                reqd: 1
            },
            {
                fieldname: 'proficiency',
                label: 'Proficiency',
                fieldtype: 'Select',
                options: 'Beginner\nIntermediate\nAdvanced\nExpert'
            }
        ]
    }
];

// Valid sample data
const validFormData: FormData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30,
    salary: 50000.50,
    is_active: true,
    status: 'Active',
    join_date: '2023-01-15',
    skills: [
        { skill_name: 'JavaScript', proficiency: 'Advanced' },
        { skill_name: 'Python', proficiency: 'Intermediate' }
    ]
};

// Invalid sample data (for testing validation)
const invalidFormData: FormData = {
    // Missing required name field
    email: 'invalid-email', // Not a proper email format in real validation
    age: 'not-a-number', // Should be number
    salary: 'invalid-salary',
    is_active: 'maybe', // Should be boolean or 0/1
    status: 'InvalidStatus', // Not in options
    join_date: 'invalid-date',
    skills: 'not-an-array' // Should be array
};

// Run tests
console.log('=== Testing with Valid Data ===');
const validResult = FormValidator.runFullValidation(sampleFields, validFormData);
console.log('\n');

console.log('=== Testing with Invalid Data ===');
const invalidResult = FormValidator.runFullValidation(sampleFields, invalidFormData);
console.log('\n');

console.log('=== Testing Individual Components ===');

// Test only condition evaluation
console.log('Testing condition evaluation only:');
const conditionResult = FormValidator.testConditionEvaluation();
console.log(`Result: ${conditionResult.passed} passed, ${conditionResult.failed} failed`);
if (conditionResult.errors.length > 0) {
    console.log('Errors:', conditionResult.errors);
}

// Test only helper functions
console.log('\nTesting helper functions only:');
const helperResult = FormValidator.testHelperFunctions();
console.log(`Result: ${helperResult.passed} passed, ${helperResult.failed} failed`);
if (helperResult.errors.length > 0) {
    console.log('Errors:', helperResult.errors);
}

// Summary
console.log('\n=== Final Summary ===');
console.log(`✅ Valid data test: ${validResult.failed === 0 ? 'PASSED' : 'FAILED'}`);
console.log(`❌ Invalid data test: ${invalidResult.failed > 0 ? 'CORRECTLY FAILED' : 'SHOULD HAVE FAILED'}`);
console.log(`🔧 Condition evaluation: ${conditionResult.failed === 0 ? 'WORKING' : 'NEEDS FIX'}`);
console.log(`⚙️ Helper functions: ${helperResult.failed === 0 ? 'WORKING' : 'NEEDS FIX'}`);

// Overall status
const overallPass = validResult.failed === 0 && 
                   invalidResult.failed > 0 && 
                   conditionResult.failed === 0 && 
                   helperResult.failed === 0;

console.log(`\n🎯 Overall Status: ${overallPass ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILED'}`);

export { sampleFields, validFormData, invalidFormData };