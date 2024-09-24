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
const SQUARE_SIZE = 4;
const SQUARE_MARGIN = 1;

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

    const cols = Math.floor(Math.sqrt(totalWeeks));
    const rows = Math.ceil(totalWeeks / cols);

    const gridWidth =
      cols * (SQUARE_SIZE + SQUARE_MARGIN) - SQUARE_MARGIN;
    const gridHeight =
      rows * (SQUARE_SIZE + SQUARE_MARGIN) - SQUARE_MARGIN;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.translate(
      centerX + offset.x - (gridWidth * zoom) / 2,
      centerY + offset.y - (gridHeight * zoom) / 2
    );
    ctx.scale(zoom, zoom);

    for (let week = 0; week < totalWeeks; week++) {
      const col = week % cols;
      const row = Math.floor(week / cols);
      const x = col * (SQUARE_SIZE + SQUARE_MARGIN);
      const y = row * (SQUARE_SIZE + SQUARE_MARGIN);

      ctx.fillStyle =
        week < weeksLived ? '#3b82f6' : '#e5e7eb';
      ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
    }

    ctx.restore();
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

    const canvasCenterX = canvas.width / 2;
    const canvasCenterY = canvas.height / 2;

    const mouseOffsetX =
      (mouseX - canvasCenterX - offset.x) / zoom;
    const mouseOffsetY =
      (mouseY - canvasCenterY - offset.y) / zoom;

    const newOffsetX = -(
      mouseOffsetX * newZoom -
      (mouseX - canvasCenterX)
    );
    const newOffsetY = -(
      mouseOffsetY * newZoom -
      (mouseY - canvasCenterY)
    );

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
