import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import GenericForm from '@/components/common/GenericForm';
import { Loader2 } from 'lucide-react';

/**
 * Helper component to wrap GenericForm and inject state.defaults for P&M Specialized Forms.
 * It forces a navigation to the generic path but with state, ensuring the GenericForm component picks it up.
 * OR it renders the GenericForm directly if GenericForm supports non-route props (it does).
 */

const SpecializedFormWrapper: React.FC<{
    doctype: string;
    defaults: Record<string, any>;
    title?: string;
}> = ({ doctype, defaults, title }) => {
    // We need to render the GenericForm but manipulate the 'location.state' it reads.
    // However, GenericForm reads location.state directly. 
    // We can't easily mock useLocation inside GenericForm without a context provider.
    // BUT we can use <Navigate> to redirect to the actual generic route with state, 
    // OR we can just pass the state if we were navigating.
    // Better Approach: Update GenericForm to accept `initialData` prop that overrides location.state.defaults?
    // Looking at GenericForm (line 121): `} else if (isNew && location.state?.defaults) {`

    // So if we just render <GenericForm />, it will look at current location state.
    // If we are at `/p-and-m/new-asset-purchase-request`, that IS the location.
    // But that route doesn't have state unless we navigated to it with state.
    // But the user will likely navigate to it via a Link or URL directly.

    // So we must ensure that when this component mounts, it "pretends" the state has these defaults.
    // Since we can't easily patch useLocation, we might need a small HOC or modify GenericForm to accept `initialDefaults` prop.
    // I will modify GenericForm to accept `initialDefaults` prop for robust solution.
    // But first, let's create this file with the expectation that I will add that prop.

    return <GenericForm doctype={doctype} title={title} initialDefaults={defaults} />;
};

// 1. Asset Purchase Request
export const NewAssetPurchaseRequest = () => (
    <SpecializedFormWrapper
        doctype="Material Request"
        title="Asset Purchase Request"
        defaults={{
            material_request_type: "Purchase",
            purpose: "Purchase",
            request_for: "Asset"
        }}
    />
);

// 2. Item Material Request (Standard)
export const NewItemMaterialRequest = () => (
    <SpecializedFormWrapper
        doctype="Material Request"
        title="Material Request (Purchase)"
        defaults={{
            material_request_type: "Purchase",
            purpose: "Purchase",
            request_for: "Material"
        }}
    />
);

// 3. Asset Transfer (Stock Entry or Asset Movement)
// Refactored to use Material Request as per user request
export const NewAssetTransfer = () => (
    <SpecializedFormWrapper
        doctype="Material Request"
        title="Asset Transfer Request"
        defaults={{
            material_request_type: "Material Transfer",
            purpose: "Material Transfer",
            request_for: "Asset"
        }}
    />
);

// 4. Asset Issue
// Refactored to use Material Request as per user request
export const NewAssetIssue = () => (
    <SpecializedFormWrapper
        doctype="Material Request"
        title="Asset Issue Request"
        defaults={{
            material_request_type: "Material Issue",
            purpose: "Material Issue",
            request_for: "Asset"
        }}
    />
);

// 5. Item Material Transfer
export const NewItemMaterialTransfer = () => (
    <SpecializedFormWrapper
        doctype="Material Request"
        title="Material Transfer Request"
        defaults={{
            material_request_type: "Material Transfer",
            purpose: "Material Transfer",
            request_for: "Material"
        }}
    />
);

// 6. Item Material Issue
export const NewItemMaterialIssue = () => {
    const [searchParams] = useSearchParams();
    const requestFor = searchParams.get('request_for') || 'Item';
    const purpose = searchParams.get('purpose') || 'Material Issue';

    return (
        <SpecializedFormWrapper
            doctype="Material Request"
            title="Material Issue Request"
            defaults={{
                material_request_type: purpose,
                purpose: purpose,
                request_for: requestFor
            }}
        />
    );
};
