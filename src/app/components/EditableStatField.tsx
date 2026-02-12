import { useState } from 'react';
import { Input } from './ui/input';

interface EditableStatFieldProps {
  value: number;
  onUpdate: (value: number) => void;
  className?: string;
  min?: number;
  max?: number;
}

export function EditableStatField({ 
  value, 
  onUpdate, 
  className = "text-3xl font-black",
  min = 0,
  max
}: EditableStatFieldProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => onUpdate(parseInt(e.target.value) || 0)}
        onBlur={() => setIsEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setIsEditing(false);
          }
        }}
        className={`w-16 border-2 border-black p-1 ${className}`}
        autoFocus
        min={min}
        max={max}
      />
    );
  }

  return (
    <div 
      className={`cursor-pointer hover:text-gray-600 ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {value}
    </div>
  );
}
