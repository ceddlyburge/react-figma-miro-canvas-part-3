import { useDraggable } from "@dnd-kit/core";
import { Card } from "./App";


export const Draggable = ({
  card,
}: {
  card: Card;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform
  } = useDraggable({
    id: card.id,
  });

  return (
    <div
      className="card"
      style={{
        position: "absolute",
        top: `calc(${card.coordinates.y}px * var(--canvas-transform-k))`,
        left: `calc(${card.coordinates.x}px * var(--canvas-transform-k))`,
        transformOrigin: "top left",
        ...(transform
          ? {
            // temporary change to this position when dragging
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0px) scale(calc(1 * var(--canvas-transform-k)))`,
          }
          : {
            // zoom to canvas zoom
            transform: `scale(calc(1 * var(--canvas-transform-k)))`,
          }),
      }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      // this stops the event bubbling up and triggering the canvas drag
      onPointerDown={(e) => {
        listeners?.onPointerDown?.(e);
        e.preventDefault();
      }}
    >
      {card.text}
    </div>
  );
};

export const NonDraggable = ({
  card,
  onMouseEnter
}: {
  card: Card;
  onMouseEnter: (e: any) => void;
}) => {
  return (
    <div
      className="card"
      style={{
        position: "absolute",
        top: `calc(${card.coordinates.y}px * var(--canvas-transform-k))`,
        left: `calc(${card.coordinates.x}px * var(--canvas-transform-k))`,
        transformOrigin: "top left",
        transform: `scale(calc(1 * var(--canvas-transform-k)))`,
      }}

      onMouseEnter={(e) => { console.log('onMouseEnter'); onMouseEnter(e); }}
    >
      {card.text}
    </div>)
}

export const Cover = ({
  card
}: {
  card: Card;
}) => {
  return (
    <div
      className="card cardCover"
      style={{
        position: "absolute",
        top: `calc(${card.coordinates.y}px * var(--canvas-transform-k))`,
        left: `calc(${card.coordinates.x}px * var(--canvas-transform-k))`,
        transformOrigin: "top left",
        transform: `scale(calc(1 * var(--canvas-transform-k)))`,
      }}
    >
      {card.text}
    </div>)
}
