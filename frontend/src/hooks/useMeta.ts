import { useFrappeGetCall } from 'frappe-react-sdk';

export function useMeta(doctype: string) {
    const { data, isLoading, error, mutate } = useFrappeGetCall<{ docs: any[] }>(
        'frappe.desk.form.load.getdoctype',
        { doctype }
    );

    return {
        data: data?.docs?.[0],
        isLoading,
        error,
        mutate
    };
}
