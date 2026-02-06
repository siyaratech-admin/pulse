import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface DataTableProps {
  title: string;
  description?: string;
  data?: any[];
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  description,
  data,
  className
}) => {
  // Sample data for demonstration
  const sampleData = data || [
    {
      id: '1',
      name: 'Website Redesign',
      status: 'In Progress',
      priority: 'High',
      assignee: 'John Doe',
      dueDate: '2024-03-15'
    },
    {
      id: '2',
      name: 'Mobile App Development',
      status: 'Planning',
      priority: 'Medium',
      assignee: 'Jane Smith',
      dueDate: '2024-04-01'
    },
    {
      id: '3',
      name: 'Database Migration',
      status: 'Completed',
      priority: 'High',
      assignee: 'Mike Johnson',
      dueDate: '2024-02-28'
    },
    {
      id: '4',
      name: 'User Testing',
      status: 'On Hold',
      priority: 'Low',
      assignee: 'Sarah Wilson',
      dueDate: '2024-03-30'
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Planning': 'bg-yellow-100 text-yellow-800',
      'On Hold': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-orange-100 text-orange-800',
      'Low': 'bg-green-100 text-green-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="font-medium">Project Name</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Priority</TableHead>
              <TableHead className="font-medium">Assignee</TableHead>
              <TableHead className="font-medium">Due Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleData.map((item) => (
              <TableRow key={item.id} className="border-b hover:bg-gray-50">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(item.status)} border-0`}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${getPriorityColor(item.priority)} border-0`}>
                    {item.priority}
                  </Badge>
                </TableCell>
                <TableCell>{item.assignee}</TableCell>
                <TableCell>{item.dueDate}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DataTable;