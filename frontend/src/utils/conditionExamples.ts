/**
 * Examples and tests for the Frappe Condition Evaluator
 * This file demonstrates how the evaluator handles different Frappe condition patterns
 */

import { ConditionEvaluator } from './conditionEvaluator';

// Example form data for testing
const sampleFormData = {
    customer_type: 'Company',
    is_company: 1,
    country: 'India',
    amount: 1000,
    status: 'Draft',
    has_gst: true,
    gst_number: 'GST123456789',
    payment_method: 'Cash'
};

// Test cases for common Frappe condition patterns
export const conditionExamples = {
    // Simple field existence checks
    fieldExists: {
        condition: 'eval:doc.customer_type',
        expected: true,
        description: 'Field exists and has value'
    },
    
    fieldEmpty: {
        condition: 'eval:doc.empty_field',
        expected: false,
        description: 'Field does not exist or is empty'
    },

    // Equality comparisons
    stringEquality: {
        condition: 'eval:doc.customer_type == "Company"',
        expected: true,
        description: 'String equality comparison'
    },

    stringInequality: {
        condition: 'eval:doc.status != "Submitted"',
        expected: true,
        description: 'String inequality comparison'
    },

    // Numeric comparisons
    numericGreater: {
        condition: 'eval:doc.amount > 500',
        expected: true,
        description: 'Numeric greater than comparison'
    },

    numericLessEqual: {
        condition: 'eval:doc.amount <= 1000',
        expected: true,
        description: 'Numeric less than or equal comparison'
    },

    // Logical operations
    andCondition: {
        condition: 'eval:doc.customer_type == "Company" && doc.country == "India"',
        expected: true,
        description: 'AND logical operation'
    },

    orCondition: {
        condition: 'eval:doc.status == "Submitted" || doc.status == "Draft"',
        expected: true,
        description: 'OR logical operation'
    },

    // Negation
    notCondition: {
        condition: 'eval:!doc.is_cancelled',
        expected: true,
        description: 'NOT logical operation'
    },

    // Complex conditions
    complexCondition: {
        condition: 'eval:doc.customer_type == "Company" && doc.amount > 100 && doc.country == "India"',
        expected: true,
        description: 'Complex condition with multiple AND operations'
    },

    // Real Frappe examples
    gstCondition: {
        condition: 'eval:doc.country == "India" && doc.customer_type == "Company"',
        expected: true,
        description: 'Show GST fields for Indian companies'
    },

    paymentTermsCondition: {
        condition: 'eval:doc.payment_method != "Cash"',
        expected: false,
        description: 'Show payment terms when not cash payment'
    }
};

// Function to run all test cases
export const runConditionTests = () => {
    console.log('🧪 Testing Frappe Condition Evaluator...\n');
    
    let passed = 0;
    let failed = 0;
    
    Object.entries(conditionExamples).forEach(([testName, testCase]) => {
        const result = ConditionEvaluator.evaluate(testCase.condition, sampleFormData);
        const success = result === testCase.expected;
        
        console.log(`${success ? '✅' : '❌'} ${testName}:`);
        console.log(`   Condition: ${testCase.condition}`);
        console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
        console.log(`   Description: ${testCase.description}\n`);
        
        if (success) {
            passed++;
        } else {
            failed++;
        }
    });
    
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
    return { passed, failed };
};

// Common Frappe field conditions you might encounter
export const commonFrappeConditions = {
    // Customer/Supplier conditions
    showCompanyFields: 'eval:doc.customer_type == "Company"',
    showIndividualFields: 'eval:doc.customer_type == "Individual"',
    
    // Address conditions
    showStateForIndia: 'eval:doc.country == "India"',
    showGSTForIndia: 'eval:doc.country == "India" && doc.customer_type == "Company"',
    
    // Item conditions
    showSerialNoFields: 'eval:doc.has_serial_no == 1',
    showBatchNoFields: 'eval:doc.has_batch_no == 1',
    
    // Sales/Purchase conditions
    showDiscountFields: 'eval:doc.apply_discount == 1',
    showTaxFields: 'eval:doc.taxes_and_charges',
    
    // Workflow conditions
    showSubmittedFields: 'eval:doc.docstatus == 1',
    showCancelledFields: 'eval:doc.docstatus == 2',
    
    // Amount-based conditions
    showHighValueFields: 'eval:doc.grand_total > 100000',
    showApprovalFields: 'eval:doc.total_amount > 50000',
    
    // Date conditions
    showExpiryFields: 'eval:doc.has_expiry_date == 1',
    
    // User permission conditions
    showManagerFields: 'eval:doc.requires_manager_approval == 1'
};

// Usage example for React components
export const useConditionExample = () => {
    // This would be used in a React component like:
    /*
    const [formData, setFormData] = useState({});
    
    const isFieldVisible = (field) => {
        if (!field.depends_on) return true;
        return ConditionEvaluator.evaluate(field.depends_on, formData);
    };
    
    const isFieldRequired = (field) => {
        if (field.reqd) return true;
        if (!field.mandatory_depends_on) return false;
        return ConditionEvaluator.evaluate(field.mandatory_depends_on, formData);
    };
    
    const isFieldReadOnly = (field) => {
        if (field.read_only) return true;
        if (!field.read_only_depends_on) return false;
        return ConditionEvaluator.evaluate(field.read_only_depends_on, formData);
    };
    */
};