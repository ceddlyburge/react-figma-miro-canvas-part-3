import { useDraggable } from "@dnd-kit/core";
import { Card } from "./App";
import { RefObject } from "react";
import { ZoomTransform } from "d3-zoom";


export const Draggable = ({
  card,
  transformRef
}: {
  card: Card;
  transformRef: RefObject<ZoomTransform>;
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
      id="draggable"
      className="card"
      style={{
        position: "absolute",
        transformOrigin: "top left",
        top: `${card.coordinates.y * (transformRef.current?.k ?? 1)}px`,
        left: `${card.coordinates.x * (transformRef.current?.k ?? 1)}px`,
        ...(transform
          ? {
            // temporary change to this position when dragging
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0px) scale(${transformRef.current?.k ?? 1})`,
          }
          : {
            // zoom to canvas zoom
            transform: `scale(${transformRef.current?.k ?? 1})`,
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
  transformRef,
  onMouseEnter
}: {
  card: Card;
  transformRef: RefObject<ZoomTransform>;
  onMouseEnter: (e: any) => void;
}) => {
  return (
    <div className="cardOuter"
      style={{
        position: "relative",
        transformOrigin: "top left",
        top: `${card.coordinates.y}px`,
        left: `${card.coordinates.x}px`
      }}
      id={card.id.toString()}
    >
      <div
        className="card"
        onMouseEnter={onMouseEnter}
      >
        {card.text}
      </div>
    </div>)
}

export const Cover = ({
  card,
  transformRef
}: {
  card: Card;
  transformRef: RefObject<ZoomTransform>;
}) => {
  return (
    <div
      id="cover"
      className="card cardCover"
      style={{
        position: "absolute",
        top: `${card.coordinates.y * (transformRef.current?.k ?? 1)}px`,
        left: `${card.coordinates.x * (transformRef.current?.k ?? 1)}px`,
        transform: `scale(${transformRef.current?.k ?? 1})`,
        transformOrigin: "top left",
      }}
    >
      {card.text}
    </div>)
}
