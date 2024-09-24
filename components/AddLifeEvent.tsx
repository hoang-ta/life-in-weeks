'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DateSelector from './DateSelector';

interface LifeEvent {
  name: string;
  color: string;
  startDate: Date;
  endDate: Date;
}

interface AddLifeEventProps {
  onAddEvent: (event: LifeEvent) => void;
}

export default function AddLifeEventComponent({
  onAddEvent,
}: AddLifeEventProps) {
  const [newEvent, setNewEvent] = useState<
    Partial<LifeEvent>
  >({});

  const handleAddEvent = () => {
    if (
      newEvent.name &&
      newEvent.color &&
      newEvent.startDate &&
      newEvent.endDate
    ) {
      onAddEvent(newEvent as LifeEvent);
      setNewEvent({});
    }
  };

  return (
    <div className='flex flex-col space-y-4'>
      <Input
        placeholder='Event Name'
        value={newEvent.name || ''}
        onChange={(e) =>
          setNewEvent({ ...newEvent, name: e.target.value })
        }
      />
      <Input
        type='color'
        value={newEvent.color || '#000000'}
        onChange={(e) =>
          setNewEvent({
            ...newEvent,
            color: e.target.value,
          })
        }
      />
      <DateSelector
        date={newEvent.startDate}
        setDate={(date) =>
          setNewEvent({ ...newEvent, startDate: date })
        }
        label='Start Date'
      />
      <DateSelector
        date={newEvent.endDate}
        setDate={(date) =>
          setNewEvent({ ...newEvent, endDate: date })
        }
        label='End Date'
      />
      <Button onClick={handleAddEvent}>Add Event</Button>
    </div>
  );
}
