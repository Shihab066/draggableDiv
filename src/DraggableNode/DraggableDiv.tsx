import React, { useRef, useState, useEffect } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const [resizing, setResizing] = useState<ResizeDirection | null>(null);
  const offset = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = divRef.current?.getBoundingClientRect();
    if (rect) {
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleResizeStart = (dir: ResizeDirection) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(dir);
    const rect = divRef.current?.getBoundingClientRect();
    if (rect) {
      resizeStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        width: size.width,
        height: size.height,
        x: position.x,
        y: position.y,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && divRef.current) {
      const newX = Math.max(
        0,
        Math.min(
          e.clientX - offset.current.x,
          window.innerWidth - size.width * 0.5
        )
      );
      const newY = Math.max(0, e.clientY - offset.current.y);
      setPosition({ x: newX, y: newY });
    }

    if (resizing && divRef.current) {
      const rect = divRef.current.getBoundingClientRect();
      let newWidth = size.width;
      let newHeight = size.height;
      let newX = position.x;
      let newY = position.y;

      const dx = e.clientX - rect.left;
      const dy = e.clientY - rect.top;

      switch (resizing) {
        case "right":
          newWidth = Math.min(
            MAX_WIDTH,
            Math.max(MIN_WIDTH, e.clientX - rect.left)
          );
          break;

        case "left":
          const proposedWidth = rect.right - e.clientX;
          newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, proposedWidth));
          newX = rect.right - newWidth;
          break;

        case "bottom":
          const proposedHeight = e.clientY - rect.top;
          const clampedHeight = Math.max(MIN_HEIGHT, proposedHeight);
          if (rect.top + clampedHeight <= window.innerHeight) {
            newHeight = clampedHeight;
          }
          break;

        case "top":
          const diffY = e.clientY - rect.top;
          const proposedHeightTop = size.height - diffY;
          const clampedTopHeight = Math.max(MIN_HEIGHT, proposedHeightTop);
          const newTop = rect.bottom - clampedTopHeight;
          if (newTop >= 0) {
            newHeight = clampedTopHeight;
            newY = newTop;
          }
          break;

        case "top-left": {
          const diffY = e.clientY - rect.top;
          const proposedHeightTop = size.height - diffY;
          const clampedTopHeight = Math.max(MIN_HEIGHT, proposedHeightTop);
          const newTop = rect.bottom - clampedTopHeight;
          if (newTop >= 0) {
            newHeight = clampedTopHeight;
            newY = newTop;
          }

          const proposedWidth = rect.right - e.clientX;
          newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, proposedWidth));
          newX = rect.right - newWidth;
          break;
        }

        case "top-right": {
           const diffY = e.clientY - rect.top;
          const proposedHeightTop = size.height - diffY;
          const clampedTopHeight = Math.max(MIN_HEIGHT, proposedHeightTop);
          const newTop = rect.bottom - clampedTopHeight;
          if (newTop >= 0) {
            newHeight = clampedTopHeight;
            newY = newTop;
          }

          newWidth = Math.min(
            MAX_WIDTH,
            Math.max(MIN_WIDTH, e.clientX - rect.left)
          );
          break
        }

        case "bottom-left": {
          const proposedHeight = e.clientY - rect.top;
          const clampedHeight = Math.max(MIN_HEIGHT, proposedHeight);
          if (rect.top + clampedHeight <= window.innerHeight) {
            newHeight = clampedHeight;
          }

          const proposedWidth = rect.right - e.clientX;
          newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, proposedWidth));
          newX = rect.right - newWidth;
          break;
        }

        case "bottom-right": {
          const proposedHeight = e.clientY - rect.top;
          const clampedHeight = Math.max(MIN_HEIGHT, proposedHeight);
          if (rect.top + clampedHeight <= window.innerHeight) {
            newHeight = clampedHeight;
          }

          newWidth = Math.min(
            MAX_WIDTH,
            Math.max(MIN_WIDTH, e.clientX - rect.left)
          );
          break;
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
  };

  const stopActions = () => {
    setIsDragging(false);
    setResizing(null);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopActions);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopActions);
    };
  }, [isDragging, resizing, size, position]);

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
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
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
          onMouseDown={handleResizeStart(dir as ResizeDirection)}
          style={{ cursor }}
        />
      ))}
    </div>
  );
};

export default DraggableDiv;
