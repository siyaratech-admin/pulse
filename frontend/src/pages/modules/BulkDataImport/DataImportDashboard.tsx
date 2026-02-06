import GenericList from "@/components/common/GenericList" 

const DataImportDashboard = () => {
    return (
        <GenericList
            doctype="Data Import"
            title="Bulk Data Import"
            listFields={['title', 'reference_doctype', 'import_type', 'status', 'owner']}
            columnLabels={{
                title: "Title",
                reference_doctype: "Document Type",
                import_type: "Import Mode",
                status: "Status",
                owner: "Created By"
            }}
        />
    )
}

export default DataImportDashboard
