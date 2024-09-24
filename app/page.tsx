'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import LifeGrid from '@/components/LifeGrid';
import DateSelector from '@/components/DateSelector';
import AddLifeEvent from '@/components/AddLifeEvent';
// import {
//   AddLifeEvent,
//   DateSelector,
//   LifeGrid,
// } from '@/components/';

const DEFAULT_LIFE_EXPECTANCY = 80;

interface LifeEvent {
  name: string;
  color: string;
  startDate: Date;
  endDate: Date;
}

export default function LifeInWeeksComponent() {
  const [dateOfBirth, setDateOfBirth] = useState<
    Date | undefined
  >(new Date(1990, 0, 1));
  const [lifeExpectancy, setLifeExpectancy] = useState(
    DEFAULT_LIFE_EXPECTANCY
  );
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(
    []
  );
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const handleAddEvent = (newEvent: LifeEvent) => {
    setLifeEvents([...lifeEvents, newEvent]);
    setIsAddingEvent(false);
  };

  return (
    <div className='flex flex-col items-center space-y-4 p-4'>
      <h1 className='text-2xl font-bold'>Life in Weeks</h1>
      <div className='flex space-x-4'>
        <DateSelector
          date={dateOfBirth}
          setDate={setDateOfBirth}
          label='Date of Birth'
        />
        <div>
          <Label htmlFor='lifeExpectancy'>
            Life Expectancy
          </Label>
          <Input
            id='lifeExpectancy'
            type='number'
            value={lifeExpectancy}
            onChange={(e) =>
              setLifeExpectancy(Number(e.target.value))
            }
            min={1}
            max={120}
          />
        </div>
      </div>
      <div className='flex space-x-4'>
        <Dialog
          open={isAddingEvent}
          onOpenChange={setIsAddingEvent}
        >
          <DialogTrigger asChild>
            <Button>Add Life Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Life Event</DialogTitle>
            </DialogHeader>
            <AddLifeEvent onAddEvent={handleAddEvent} />
          </DialogContent>
        </Dialog>
      </div>
      <LifeGrid
        dateOfBirth={dateOfBirth}
        lifeExpectancy={lifeExpectancy}
        lifeEvents={lifeEvents}
      />
    </div>
  );
}
