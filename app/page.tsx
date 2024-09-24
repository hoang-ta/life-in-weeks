'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const WEEKS_IN_YEAR = 52;
const DEFAULT_LIFE_EXPECTANCY = 80;
const SQUARE_SIZE = 10;
const SQUARE_MARGIN = 2;
const LABEL_MARGIN = 40;

interface LifeEvent {
  name: string;
  color: string;
  startDate: Date;
  endDate: Date;
}

export default function LifeInWeeks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dateOfBirth, setDateOfBirth] = useState<
    Date | undefined
  >(new Date(1990, 0, 1));
  const [lifeExpectancy, setLifeExpectancy] = useState(
    DEFAULT_LIFE_EXPECTANCY
  );
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
  });
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(
    []
  );
  const [newEvent, setNewEvent] = useState<
    Partial<LifeEvent>
  >({});
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const drawWeeks = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dateOfBirth) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = new Date();
    const ageInWeeks = Math.floor(
      (now.getTime() - dateOfBirth.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );
    const totalWeeks = lifeExpectancy * WEEKS_IN_YEAR;

    const gridWidth =
      WEEKS_IN_YEAR * (SQUARE_SIZE + SQUARE_MARGIN) -
      SQUARE_MARGIN;
    const gridHeight =
      lifeExpectancy * (SQUARE_SIZE + SQUARE_MARGIN) -
      SQUARE_MARGIN;

    ctx.save();
    ctx.translate(
      LABEL_MARGIN + offset.x,
      LABEL_MARGIN + offset.y
    );
    ctx.scale(zoom, zoom);

    // Draw grid and life events
    for (let week = 0; week < totalWeeks; week++) {
      const col = week % WEEKS_IN_YEAR;
      const row = Math.floor(week / WEEKS_IN_YEAR);
      const x = col * (SQUARE_SIZE + SQUARE_MARGIN);
      const y = row * (SQUARE_SIZE + SQUARE_MARGIN);

      let fillColor =
        week < ageInWeeks ? '#3b82f6' : '#e5e7eb';

      // Check if this week is part of a life event
      const eventDate = new Date(
        dateOfBirth.getTime() +
          week * 7 * 24 * 60 * 60 * 1000
      );
      const event = lifeEvents.find(
        (e) =>
          eventDate >= e.startDate && eventDate <= e.endDate
      );
      if (event) {
        fillColor = event.color;
      }

      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
    }

    ctx.restore();

    // Draw labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let year = 0; year <= lifeExpectancy; year += 5) {
      const y =
        LABEL_MARGIN +
        year * (SQUARE_SIZE + SQUARE_MARGIN) * zoom +
        offset.y;
      ctx.fillText(year.toString(), LABEL_MARGIN - 5, y);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let week = 0; week <= WEEKS_IN_YEAR; week += 5) {
      const x =
        LABEL_MARGIN +
        week * (SQUARE_SIZE + SQUARE_MARGIN) * zoom +
        offset.x;
      ctx.fillText(week.toString(), x, LABEL_MARGIN - 15);
    }

    // Draw axis labels
    ctx.save();
    ctx.translate(10, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Age', 0, 0);
    ctx.restore();

    ctx.fillText('Week of the Year', canvas.width / 2, 10);
  }, [
    dateOfBirth,
    lifeExpectancy,
    zoom,
    offset,
    lifeEvents,
  ]);

  useEffect(() => {
    drawWeeks();
  }, [drawWeeks]);

  const handleWheel = (
    e: React.WheelEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(
      0.1,
      Math.min(10, zoom * zoomFactor)
    );

    const mouseOffsetX = (mouseX - offset.x) / zoom;
    const mouseOffsetY = (mouseY - offset.y) / zoom;

    const newOffsetX = mouseX - mouseOffsetX * newZoom;
    const newOffsetY = mouseY - mouseOffsetY * newZoom;

    setZoom(newZoom);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (!isDragging) return;
    const newOffset = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
    setOffset(newOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleAddEvent = () => {
    if (
      newEvent.name &&
      newEvent.color &&
      newEvent.startDate &&
      newEvent.endDate
    ) {
      setLifeEvents([...lifeEvents, newEvent as LifeEvent]);
      setNewEvent({});
      setIsAddingEvent(false);
    }
  };

  return (
    <div className='flex flex-col items-center space-y-4 p-4'>
      <h1 className='text-2xl font-bold'>Life in Weeks</h1>
      <div className='flex space-x-4'>
        <div>
          <Label htmlFor='dateOfBirth'>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={`w-[240px] justify-start text-left font-normal ${
                  !dateOfBirth && 'text-muted-foreground'
                }`}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {dateOfBirth ? (
                  format(dateOfBirth, 'PPP')
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
                selected={dateOfBirth}
                onSelect={setDateOfBirth}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
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
        <Button
          onClick={() => {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
        >
          Reset View
        </Button>
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
            <div className='flex flex-col space-y-4'>
              <Input
                placeholder='Event Name'
                value={newEvent.name || ''}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    name: e.target.value,
                  })
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline'>
                    {newEvent.startDate
                      ? format(newEvent.startDate, 'PPP')
                      : 'Select start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={newEvent.startDate}
                    onSelect={(date) =>
                      setNewEvent({
                        ...newEvent,
                        startDate: date,
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline'>
                    {newEvent.endDate
                      ? format(newEvent.endDate, 'PPP')
                      : 'Select end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={newEvent.endDate}
                    onSelect={(date) =>
                      setNewEvent({
                        ...newEvent,
                        endDate: date,
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={handleAddEvent}>
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        className='border border-gray-300 rounded cursor-move'
      />
    </div>
  );
}
