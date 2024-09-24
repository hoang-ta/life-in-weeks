import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Button } from '@/components/ui/button';

const WEEKS_IN_YEAR = 52;
const SQUARE_SIZE = 10;
const SQUARE_MARGIN = 2;
const LABEL_MARGIN = 40;
const EVENT_MARGIN = 150; // Space for event labels on each side

interface LifeEvent {
  name: string;
  color: string;
  startDate: Date;
  endDate: Date;
}

interface LifeGridProps {
  dateOfBirth: Date | undefined;
  lifeExpectancy: number;
  lifeEvents: LifeEvent[];
}

export default function LifeGrid({
  dateOfBirth,
  lifeExpectancy,
  lifeEvents,
}: LifeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
  });

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
      LABEL_MARGIN + EVENT_MARGIN + offset.x,
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

    // Draw event indicators and labels
    lifeEvents.forEach((event) => {
      const startWeek = Math.floor(
        (event.startDate.getTime() -
          dateOfBirth.getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );
      const endWeek = Math.floor(
        (event.endDate.getTime() - dateOfBirth.getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );
      const isSingleDay = startWeek === endWeek;

      const startCol = startWeek % WEEKS_IN_YEAR;
      const startRow = Math.floor(
        startWeek / WEEKS_IN_YEAR
      );
      const endCol = endWeek % WEEKS_IN_YEAR;
      const endRow = Math.floor(endWeek / WEEKS_IN_YEAR);

      const startX =
        startCol * (SQUARE_SIZE + SQUARE_MARGIN);
      const startY =
        startRow * (SQUARE_SIZE + SQUARE_MARGIN);
      const endX = endCol * (SQUARE_SIZE + SQUARE_MARGIN);
      const endY = endRow * (SQUARE_SIZE + SQUARE_MARGIN);

      if (isSingleDay) {
        // Draw circle for single-day events
        ctx.beginPath();
        ctx.arc(
          startX + SQUARE_SIZE / 2,
          startY + SQUARE_SIZE / 2,
          SQUARE_SIZE / 2 + 1,
          0,
          2 * Math.PI
        );
        ctx.strokeStyle = event.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw label on the left side
        ctx.save();
        ctx.translate(-EVENT_MARGIN, 0);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = '12px Arial';
        ctx.fillStyle = event.color;
        ctx.fillText(
          event.name,
          -5,
          startY + SQUARE_SIZE / 2
        );

        // Draw line to the event
        ctx.beginPath();
        ctx.moveTo(-5, startY + SQUARE_SIZE / 2);
        ctx.lineTo(startX, startY + SQUARE_SIZE / 2);
        ctx.strokeStyle = event.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      } else {
        // Draw label on the right side for multi-day events
        ctx.save();
        ctx.translate(gridWidth + 5, 0);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = '12px Arial';
        ctx.fillStyle = event.color;
        const midY = (startY + endY) / 2 + SQUARE_SIZE / 2;
        ctx.fillText(event.name, 5, midY);

        // Draw line to the event
        ctx.beginPath();
        ctx.moveTo(5, midY);
        ctx.lineTo(0, midY);
        ctx.lineTo(
          endX + SQUARE_SIZE,
          endY + SQUARE_SIZE / 2
        );
        ctx.strokeStyle = event.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    });

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
      ctx.fillText(
        year.toString(),
        LABEL_MARGIN + EVENT_MARGIN - 5,
        y
      );
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let week = 0; week <= WEEKS_IN_YEAR; week += 5) {
      const x =
        LABEL_MARGIN +
        EVENT_MARGIN +
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

  return (
    <>
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
        width={1100}
        height={600}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        className='border border-gray-300 rounded cursor-move'
      />
    </>
  );
}
