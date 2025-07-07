import { DraggableAttributes, useDraggable } from "@dnd-kit/core";
import { Card } from "./App";
import { memo, useCallback, useRef } from "react";

const DraggableInner = ({
  card,
  onPointerDown,
  setNodeRef,
  // attributes,
  // transform,
  // listeners
}: {
  card: Card;
  onPointerDown: (e: any) => void;
  setNodeRef: (element: HTMLElement | null) => void;
  // attributes: DraggableAttributes;
  // transform: any;
  // listeners: any;
}) => {
  return (
    <div
      className="card"
      style={{
        position: "absolute",
        top: `calc(${card.coordinates.y}px * var(--canvas-transform-k))`,
        left: `calc(${card.coordinates.x}px * var(--canvas-transform-k))`,
        transformOrigin: "top left",
        // ...(transform
        //   ? {
        //     // temporary change to this position when dragging
        //     transform: `translate3d(${transform.x}px, ${transform.y}px, 0px) scale(calc(1 * var(--canvas-transform-k)))`,
        //   }
        //   : {
        //     // zoom to canvas zoom
        transform: `scale(calc(1 * var(--canvas-transform-k)))`,
        // }),
      }}
      ref={setNodeRef}
      // {...listeners}
      // {...attributes}
      // this stops the event bubbling up and triggering the canvas drag
      onPointerDown={onPointerDown}
    >
      {card.text}
    </div>)

}
// DraggableInner.displayName = 'DraggableInner'

export const Draggable = ({
  card,
}: {
  card: Card;
}) => {
  const {
    // attributes,
    listeners,
    setNodeRef,
    // transform
  } = useDraggable({
    id: card.id,
  });

  const dndOnPointerDown = useRef(listeners?.onPointerDown)

  const onPointerDown = (e) => {
    // listeners?.onPointerDown?.(e);
    dndOnPointerDown.current?.(e);
    e.preventDefault();
  }

  return (
    <DraggableInner
      card={card}
      // listeners={listeners}
      // transform={transform}
      onPointerDown={onPointerDown}
      setNodeRef={setNodeRef}
    // attributes={attributes} 
    />
  );
};

export const NonDraggable = ({
  card,
  onMouseEnter
}: {
  card: Card;
  onMouseEnter: (e: any) => void;
  // onPointerDown: (e: any) => void;
  // setNodeRef: (element: HTMLElement | null) => void;
  // attributes: DraggableAttributes;
  // transform: any;
  // listeners: any;
}) => {
  return (
    <div
      className="card"
      style={{
        position: "absolute",
        top: `calc(${card.coordinates.y}px * var(--canvas-transform-k))`,
        left: `calc(${card.coordinates.x}px * var(--canvas-transform-k))`,
        transformOrigin: "top left",
        // ...(transform
        //   ? {
        //     // temporary change to this position when dragging
        //     transform: `translate3d(${transform.x}px, ${transform.y}px, 0px) scale(calc(1 * var(--canvas-transform-k)))`,
        //   }
        //   : {
        //     // zoom to canvas zoom
        transform: `scale(calc(1 * var(--canvas-transform-k)))`,
        // }),
      }}
      // ref={setNodeRef}
      // {...listeners}
      // {...attributes}
      // this stops the event bubbling up and triggering the canvas drag
      // onPointerDown={onPointerDown}
      onMouseEnter={onMouseEnter}
    >
      {card.text}
    </div>)

}
