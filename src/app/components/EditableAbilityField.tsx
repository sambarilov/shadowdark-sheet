import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface EditableAbilityFieldProps {
  value: string;
  onUpdate: (value: string) => void;
  className?: string;
}

export function EditableAbilityField({ 
  value, 
  onUpdate, 
  className = "text-xs font-black"
}: EditableAbilityFieldProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <Select
        value={value}
        onValueChange={(newValue) => {
          onUpdate(newValue);
          setIsEditing(false);
        }}
        open={isEditing}
        onOpenChange={setIsEditing}
      >
        <SelectTrigger className={`h-8 w-20 text-xs border-2 border-black ${className}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="STR">STR</SelectItem>
          <SelectItem value="DEX">DEX</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <span 
      className={`cursor-pointer hover:text-gray-600 ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {value}
    </span>
  );
}
