import { DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core/dist/types";
import { select } from "d3-selection";
import { ZoomTransform, zoom } from "d3-zoom";
import { memo, RefObject, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Card } from "./App";
import { Cover, Draggable, NonDraggable } from "./Draggable";

// Always display all the cards, even when one becomes draggable, which makes it performant with memo
// When the mouse is over a card, a Draggable is placed over the top of the NonDraggable one and hides it.
const AllCards = memo(({
  cards,
  setHoverCard

}: {
  cards: Card[];
  setHoverCard(card: Card): void;
}) => {
  return (<>
    {cards.map((card) => (
      <NonDraggable card={card} key={card.id} onMouseEnter={() => setHoverCard(card)} />
    ))}
  </>)
})
AllCards.displayName = 'AllCards';

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
  const [isDragging, setIsDragging] = useState(false);

  const setDragging = () => setIsDragging(true);

  // remove transform from the dependencies and use a ref, this is an event so can use a ref
  // without a problem. This gives the DndContext less reasons to rerender, and means the cache 
  // check is a bit quicker.
  // todo: see how much of a difference this makes and whether it is worth it
  const updateDraggedCardPosition = useCallback(({ delta, active }: DragEndEvent) => {
    console.log('updateDraggedCardPosition')
    if (!delta.x && !delta.y) return;


    setCards(
      cards.map((card) => {
        if (card.id === active.id) {

          const newCard = {
            ...card,
            coordinates: {
              x: card.coordinates.x + delta.x / (transformRef.current?.k ?? 1),
              y: card.coordinates.y + delta.y / (transformRef.current?.k ?? 1),
            },
          };

          setHoverCard(newCard);
          return newCard;
        }
        return card;
      })
    );

    setIsDragging(false);
  }, [cards, setCards, transformRef]);

  const [hoverCard, setHoverCard] = useState<Card | null>()

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
        <DndContext onDragEnd={updateDraggedCardPosition} onDragStart={setDragging}>
          {/* onmouseenter gets triggered here if you move the mouse fast and it outpaces the card */}
          <div
            style={{ pointerEvents: isDragging ? "none" : "auto" }}
          >
            <AllCards cards={cards} setHoverCard={setHoverCard} />
          </div>
          {hoverCard ? <><Cover card={hoverCard} /><Draggable card={hoverCard} /></> : null}
        </DndContext>
      </div>
    </div>
  );
};
