import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from "@/components/ui/separator";

interface RelatedDocument {
    doctype: string;
    name: string;
    link: string;
    status?: string;
}

interface RelatedDocumentsProps {
    title?: string;
    documents: RelatedDocument[];
    className?: string;
}

export const RelatedDocuments: React.FC<RelatedDocumentsProps> = ({
    title = "Related Documents",
    documents,
    className,
}) => {
    const navigate = useNavigate();

    if (documents.length === 0) {
        return null;
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {documents.map((doc, index) => (
                    <div key={index}>
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">{doc.doctype}</p>
                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                {doc.status && (
                                    <Badge variant="secondary" className="text-xs mt-1">
                                        {doc.status}
                                    </Badge>
                                )}
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(doc.link)}
                                className="flex-shrink-0"
                            >
                                <ExternalLink className="h-3 w-3" />
                            </Button>
                        </div>
                        {index < documents.length - 1 && <Separator className="my-2" />}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
