import { DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core/dist/types";
import { select } from "d3-selection";
import { ZoomTransform, zoom } from "d3-zoom";
import { RefObject, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Card } from "./App";
import { Draggable, NonDraggable } from "./Draggable";

export const Canvas = ({
  cards,
  setCards,
  transformRef,
  setTransform,
}: {
  cards: Card[];
  setCards: (cards: Card[]) => void;
  transformRef: RefObject<ZoomTransform>;
  setTransform(transform: ZoomTransform): void;
}) => {

  const refCards = useRef<Card[]>(cards);
  // remove transform from the dependencies and use a ref, this is an event so can use a ref without a problem
  // then hopefully the DndContext won't re render when we zoom 
  // want to think about panning as well, make that fast.
  const updateDraggedCardPosition = useCallback(({ delta, active }: DragEndEvent) => {
    if (!delta.x && !delta.y) return;

    setCards(
      refCards.current?.map((card) => {
        if (card.id === active.id) {
          return {
            ...card,
            coordinates: {
              x: card.coordinates.x + delta.x / (transformRef.current?.k ?? 1),
              y: card.coordinates.y + delta.y / (transformRef.current?.k ?? 1),
            },
          };
        }
        return card;
      })
    );
  }, [setCards, transformRef]);

  const [hoverCardId, setHoverCardId] = useState<UniqueIdentifier | null>()

  const { setNodeRef } = useDroppable({
    id: "canvas",
  });

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const updateAndForwardRef = (div: HTMLDivElement) => {
    canvasRef.current = div;
    setNodeRef(div);
  };

  // create the d3 zoom object, and useMemo to retain it for rerenders
  const zoomBehavior = useMemo(() => zoom<HTMLDivElement, unknown>(), []);

  // update the transform when d3 zoom notifies of a change
  const updateTransform = useCallback(
    ({ transform }: { transform: ZoomTransform }) => {
      setTransform(transform);
    },
    [setTransform]
  );

  useLayoutEffect(() => {
    if (!canvasRef.current) return;

    // get transform change notifications from d3 zoom
    zoomBehavior.on("zoom", updateTransform);

    // attach d3 zoom to the canvas div element, which will handle
    // mousewheel, gesture and drag events automatically for pan / zoom
    select<HTMLDivElement, unknown>(canvasRef.current).call(zoomBehavior);
  }, [zoomBehavior, canvasRef, updateTransform]);

  const children =
    cards.map((card) => (
      (card.id === hoverCardId) ?
        <Draggable card={card} key={card.id} />
        : <NonDraggable card={card} key={card.id} onMouseEnter={() => setHoverCardId(card.id)} />
    ))


  return (
    <div ref={updateAndForwardRef} className="canvasWindow">
      <div
        className="canvas"
        style={{
          // apply the transform from d3
          transformOrigin: "top left",
          transform: `translate3d(calc(1px * var(--canvas-transform-x)), calc(1px * var(--canvas-transform-y)), calc(1px * var(--canvas-transform-k)))`,
          position: "relative",
          height: "600px",
        }}
      >
        <DndContext onDragEnd={updateDraggedCardPosition}>
          <>
            {children}
            <DragOverlay>
              <div
                style={{
                  transformOrigin: "top left",
                  transform: `scale(calc(1 * var(--canvas-transform-k)))`,
                }}
                className="trayOverlayCard"
              >
                1 - 1
              </div>
            </DragOverlay>
          </>
        </DndContext>
      </div>
    </div>
  );
};
