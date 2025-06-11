import React, { useRef, useState } from "react";
import "./DraggableDiv.scss";

type ResizeDirection =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

const MIN_WIDTH = 150;
const MAX_WIDTH = 500;
const MIN_HEIGHT = 240;

const DraggableDiv: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 250, height: 250 });
  const offset = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    bottom: 0,
    right: 0,
  });
  const isDraggingRef = useRef(false);
  const currentResizerRef = useRef<ResizeDirection | null>(null);

  const startDrag = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    const rect = divRef.current?.getBoundingClientRect();
    if (rect) {
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    document.addEventListener("pointermove", drag);
    document.addEventListener("pointerup", stopDrag);
  };

  const drag = (e: PointerEvent) => {
    if (isDraggingRef.current && divRef.current) {
      const newX = Math.max(
        0,
        Math.min(e.clientX - offset.current.x, window.innerWidth - size.width * 0.5)
      );
      const newY = Math.max(0, e.clientY - offset.current.y);
      setPosition({ x: newX, y: newY });
    }
  };

  const stopDrag = () => {
    isDraggingRef.current = false;
    document.removeEventListener("pointermove", drag);
    document.removeEventListener("pointerup", stopDrag);
  };

  const startResize =
    (dir: ResizeDirection) => (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      currentResizerRef.current = dir;
      const rect = divRef.current?.getBoundingClientRect();
      if (rect) {
        resizeStartRef.current = {
          mouseX: e.clientX,
          mouseY: e.clientY,
          width: size.width,
          height: size.height,
          x: position.x,
          y: position.y,
          bottom: rect.bottom,
          right: rect.right,
        };
      }

      document.addEventListener("pointermove", resize);
      document.addEventListener("pointerup", stopResize);
    };

  const resize = (e: PointerEvent) => {
    const dir = currentResizerRef.current;
    if (!dir || !divRef.current) return;

    const start = resizeStartRef.current;
    let newWidth = size.width;
    let newHeight = size.height;
    let newX = position.x;
    let newY = position.y;

    const dx = e.clientX - start.mouseX;
    const dy = e.clientY - start.mouseY;

    switch (dir) {
      case "right":
        newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, start.width + dx));
        break;

      case "left": {
        const proposedWidth = start.width - dx;
        newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, proposedWidth));
        newX = start.x + (start.width - newWidth);
        break;
      }

      case "bottom": {
        const proposedHeight = start.height + dy;
        const clampedHeight = Math.min(
          window.innerHeight - start.y,
          Math.max(MIN_HEIGHT, proposedHeight)
        );
        newHeight = clampedHeight;
        break;
      }

      case "top": {
        const proposedHeight = start.height - dy;
        const clampedHeight = Math.max(MIN_HEIGHT, proposedHeight);
        newY = Math.max(0, start.bottom - clampedHeight);
        newHeight = Math.min(clampedHeight, start.bottom);
        break;
      }

      case "top-left": {
        const proposedHeight = start.height - dy;
        const clampedHeight = Math.max(MIN_HEIGHT, proposedHeight);
        newY = Math.max(0, start.bottom - clampedHeight);
        newHeight = Math.min(clampedHeight, start.bottom);

        newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, start.width - dx));
        newX = start.right - newWidth;
        break;
      }

      case "top-right": {
        const proposedHeight = start.height - dy;
        const clampedHeight = Math.max(MIN_HEIGHT, proposedHeight);
        newY = Math.max(0, start.bottom - clampedHeight);
        newHeight = Math.min(clampedHeight, start.bottom);

        newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, start.width + dx));
        break;
      }

      case "bottom-left": {
        const proposedHeight = start.height + dy;
        const clampedHeight = Math.min(
          window.innerHeight - start.y,
          Math.max(MIN_HEIGHT, proposedHeight)
        );
        newHeight = clampedHeight;

        newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, start.width - dx));
        newX = start.right - newWidth;
        break;
      }

      case "bottom-right": {
        const proposedHeight = start.height + dy;
        const clampedHeight = Math.min(
          window.innerHeight - start.y,
          Math.max(MIN_HEIGHT, proposedHeight)
        );
        newHeight = clampedHeight;

        newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, start.width + dx));
        break;
      }
    }

    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
  };

  const stopResize = () => {
    currentResizerRef.current = null;
    document.removeEventListener("pointermove", resize);
    document.removeEventListener("pointerup", stopResize);
  };

  return (
    <div
      ref={divRef}
      className="box"
      style={{
        width: size.width,
        height: size.height,
        left: position.x,
        top: position.y,
        position: "fixed",
        cursor: isDraggingRef.current ? "grabbing" : "grab",
      }}
      onPointerDown={startDrag}
    >
      Drag & Resize Me
      {[
        ["top", "ns-resize"],
        ["right", "ew-resize"],
        ["bottom", "ns-resize"],
        ["left", "ew-resize"],
        ["top-left", "nwse-resize"],
        ["top-right", "nesw-resize"],
        ["bottom-left", "nesw-resize"],
        ["bottom-right", "nwse-resize"],
      ].map(([dir, cursor]) => (
        <div
          key={dir}
          className={`resizeHandle ${dir}`}
          onPointerDown={startResize(dir as ResizeDirection)}
          style={{ cursor }}
        />
      ))}
    </div>
  );
};

export default DraggableDiv;
