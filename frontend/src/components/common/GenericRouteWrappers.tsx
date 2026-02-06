import React from 'react';
import { useParams } from 'react-router-dom';
import GenericForm from './GenericForm';
import GenericList from './GenericList';

export const GenericRouteFormWrapper: React.FC = () => {
    const { doctype } = useParams<{ doctype: string; id: string }>();

    if (!doctype) {
        return <div>Error: No DocType specified in route</div>;
    }

    // Decode URL encoded doctype just in case, though React Router usually handles params well
    const decodedDoctype = decodeURIComponent(doctype);

    return <GenericForm doctype={decodedDoctype} />;
};

export const GenericRouteListWrapper: React.FC = () => {
    const { doctype } = useParams<{ doctype: string }>();

    if (!doctype) {
        return <div>Error: No DocType specified in route</div>;
    }

    const decodedDoctype = decodeURIComponent(doctype);

    return <GenericList doctype={decodedDoctype} />;
};
