import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { cn } from '../../../lib/utils';

export interface CurrentPageNumberProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

export const CurrentPageNumber: React.FC<CurrentPageNumberProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentPage.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when currentPage changes externally
  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditStart = () => {
    if (!disabled) {
      setIsEditing(true);
      setInputValue(currentPage.toString());
    }
  };

  const handleEditEnd = () => {
    setIsEditing(false);
    
    const pageNumber = parseInt(inputValue, 10);
    
    // Validate and normalize the page number
    if (!isNaN(pageNumber)) {
      const validPage = Math.max(1, Math.min(pageNumber, totalPages));
      if (validPage !== currentPage) {
        onPageChange(validPage);
      }
    }
    
    // Reset input to current page
    setInputValue(currentPage.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditEnd();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(currentPage.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center", className)}>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleEditEnd}
          onKeyDown={handleKeyDown}
          className="h-8 w-16 text-center text-sm"
          placeholder={currentPage.toString()}
          disabled={disabled}
        />
        <span className="ml-2 text-sm text-muted-foreground">
          of {totalPages}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEditStart}
        disabled={disabled}
        className="h-8 min-w-[3rem] px-2 text-sm font-medium hover:bg-muted"
        aria-label={`Page ${currentPage} of ${totalPages}. Click to edit`}
      >
        {currentPage}
      </Button>
      <span className="text-sm text-muted-foreground">
        of {totalPages}
      </span>
    </div>
  );
};

export default CurrentPageNumber;