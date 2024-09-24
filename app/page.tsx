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

const WEEKS_IN_YEAR = 52;
const DEFAULT_LIFE_EXPECTANCY = 80;
const SQUARE_SIZE = 10;
const SQUARE_MARGIN = 2;
const LABEL_MARGIN = 40;

export default function LifeInWeeks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [age, setAge] = useState(30);
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

  const drawWeeks = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalWeeks = lifeExpectancy * WEEKS_IN_YEAR;
    const weeksLived = age * WEEKS_IN_YEAR;

    ctx.save();
    ctx.translate(
      LABEL_MARGIN + offset.x,
      LABEL_MARGIN + offset.y
    );
    ctx.scale(zoom, zoom);

    // Draw grid
    for (let week = 0; week < totalWeeks; week++) {
      const col = week % WEEKS_IN_YEAR;
      const row = Math.floor(week / WEEKS_IN_YEAR);
      const x = col * (SQUARE_SIZE + SQUARE_MARGIN);
      const y = row * (SQUARE_SIZE + SQUARE_MARGIN);

      ctx.fillStyle =
        week < weeksLived ? '#3b82f6' : '#e5e7eb';
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
  }, [age, lifeExpectancy, zoom, offset]);

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

  return (
    <div className='flex flex-col items-center space-y-4 p-4'>
      <h1 className='text-2xl font-bold'>Life in Weeks</h1>
      <div className='flex space-x-4'>
        <div>
          <Label htmlFor='age'>Your Age</Label>
          <Input
            id='age'
            type='number'
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            min={0}
            max={lifeExpectancy}
          />
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
            min={age}
            max={120}
          />
        </div>
      </div>
      <Button
        onClick={() => {
          setZoom(1);
          setOffset({ x: 0, y: 0 });
        }}
      >
        Reset View
      </Button>
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
