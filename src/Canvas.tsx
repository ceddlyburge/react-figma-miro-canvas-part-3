import { DndContext, useDroppable } from "@dnd-kit/core";
import { DragEndEvent } from "@dnd-kit/core/dist/types";
import { select } from "d3-selection";
import { ZoomTransform, zoom } from "d3-zoom";
import { memo, RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Card } from "./App";
import { Cover, Draggable, NonDraggable } from "./Draggable";

// Always display all the cards, even when one becomes draggable, which makes it performant with memo
// When the mouse is over a card, a Draggable is placed over the top of the NonDraggable one and hides it.
const AllCards = memo(({
  cards,
  setHoverCard,
  transformRef,
}: {
  cards: Card[];
  setHoverCard(card: Card): void;
  transformRef: RefObject<ZoomTransform>;

}) => {
  return (<>
    {cards.map((card) => {
      const onMouseEnter = () => {
        setHoverCard(card);
        console.log('onMouseEnter', card.id);
        performance.clearMarks();
        performance.clearMeasures();
        performance.mark('onMouseEnterStart');
      }

      return (<NonDraggable card={card} key={card.id} onMouseEnter={onMouseEnter} transformRef={transformRef} />)
    })}
  </>)
})
AllCards.displayName = 'AllCards';

export const Canvas = ({
  cards,
  setCards,
  hoverCard,
  setHoverCard,
  transformRef,
  setTransform,
}: {
  cards: Card[];
  setCards: (cards: Card[]) => void;
  hoverCard: Card | null | undefined;
  setHoverCard: (card: Card) => void;
  transformRef: RefObject<ZoomTransform>;
  setTransform(transform: ZoomTransform): void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const setDragging = () => {
    setIsDragging(true);
    console.log('startDragging');
    performance.clearMarks();
    performance.clearMeasures();
    performance.mark('startDraggingStart');
  }

  // remove transform from the dependencies and use a ref, this is an event so can use a ref
  // without a problem. This gives the DndContext less reasons to rerender, and means the cache 
  // check is a bit quicker.
  // todo: see how much of a difference this makes and whether it is worth it
  const updateDraggedCardPosition = useCallback(({ delta, active }: DragEndEvent) => {
    setIsDragging(false);

    if (!delta.x && !delta.y) return;

    console.log('endDragging');
    performance.clearMarks();
    performance.clearMeasures();
    performance.mark('endDraggingStart');

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

  }, [cards, setCards, transformRef]);

  const { setNodeRef } = useDroppable({
    id: "canvas",
  });

  useEffect(() => {
    try {
      performance.mark('onMouseEnterEnd');
      performance.measure('onMouseEnter', 'onMouseEnterStart', 'onMouseEnterEnd');
      const onMouseEnterMeasure = performance.getEntriesByName('onMouseEnter')?.[0];
      console.log('onMouseEnter', onMouseEnterMeasure?.duration);
    } catch { }

    try {
      performance.mark('startDraggingEnd');
      performance.measure('startDragging', 'startDraggingStart', 'startDraggingEnd');
      const startDraggingMeasure = performance.getEntriesByName('startDragging')?.[0];
      console.log('startDragging', startDraggingMeasure?.duration);
    } catch { }

    try {
      performance.mark('endDraggingEnd');
      performance.measure('endDragging', 'endDraggingStart', 'endDraggingEnd');
      const endDraggingMeasure = performance.getEntriesByName('endDragging')?.[0];
      console.log('endDragging', endDraggingMeasure?.duration);
    } catch { }

    try {
      performance.mark('panningEnd');
      performance.measure('panning', 'panningStart', 'panningEnd');
      const panningMeasure = performance.getEntriesByName('panning')?.[0];
      console.log('panning', panningMeasure?.duration);
    } catch { }

    try {
      performance.mark('zoomingEnd');
      performance.measure('zooming', 'zoomingStart', 'zoomingEnd');
      const zoomingMeasure = performance.getEntriesByName('zooming')?.[0];
      console.log('zooming', zoomingMeasure?.duration);
    } catch { }

    performance.clearMarks();
    performance.clearMeasures();
  })

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
        id="canvas"
        className="canvas"
        style={{
          // apply the transform from d3
          transformOrigin: "top left",
          transform: `translate(${transformRef.current?.x ?? 0}px, ${transformRef.current?.y ?? 0}px)`,
          scale: `${transformRef.current?.k ?? 1}`,
          position: "relative",
          height: "600px",
        }}
      >
        <DndContext onDragEnd={updateDraggedCardPosition} onDragStart={setDragging}>
          <div
            // otherise onMouseEnter gets triggered when dragging a card if you move the mouse fast 
            // and it outpaces the card, which ends up in setHoverCard being called for a different
            // card.
            style={{ pointerEvents: isDragging ? "none" : "auto" }}
          >
            <AllCards cards={cards} setHoverCard={setHoverCard} transformRef={transformRef} />
          </div>
          {hoverCard ? <><Cover card={hoverCard} transformRef={transformRef} /><Draggable card={hoverCard} transformRef={transformRef} /></> : null}
        </DndContext>
      </div>
    </div>
  );
};
