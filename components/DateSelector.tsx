'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface DateSelectorProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label: string;
}

export default function DateSelectorComponent({
  date,
  setDate,
  label,
}: DateSelectorProps) {
  return (
    <div className='flex flex-col space-y-2'>
      <Label htmlFor={label}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={`w-[240px] justify-start text-left font-normal ${
              !date && 'text-muted-foreground'
            }`}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date ? (
              format(date, 'PPP')
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-auto p-0'
          align='start'
        >
          <Calendar
            mode='single'
            selected={date}
            onSelect={setDate}
            initialFocus
            captionLayout='dropdown'
            fromYear={1900}
            toYear={2023}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
