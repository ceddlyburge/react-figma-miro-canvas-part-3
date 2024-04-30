import { useDraggable } from "@dnd-kit/core";
import { ZoomTransform } from "d3-zoom";
import { memo, useCallback, useMemo } from "react";
import { Card } from "./App";

export const Draggable = memo(
  ({
    card,
    canvasTransform,
  }: {
    card: Card;
    canvasTransform: ZoomTransform;
  }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: card.id,
    });

    const preventDefault = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => {
        listeners?.onPointerDown?.(e);
        e.preventDefault();
      },
      [listeners]
    );

    const cssTransform = useMemo(
      () =>
        transform
          ? {
              // temporary change to this position when dragging
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0px) scale(${canvasTransform.k})`,
            }
          : {
              // zoom to canvas zoom
              transform: `scale(${canvasTransform.k})`,
            },
      [canvasTransform.k, transform]
    );

    return (
      <div
        className="card"
        style={{
          position: "absolute",
          top: `${card.coordinates.y * canvasTransform.k}px`,
          left: `${card.coordinates.x * canvasTransform.k}px`,
          transformOrigin: "top left",
          ...cssTransform,
        }}
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        // this stops the event bubbling up and triggering the canvas drag
        onPointerDown={preventDefault}
      >
        {card.text}
      </div>
    );
  }
);
Draggable.displayName = "Draggable";
