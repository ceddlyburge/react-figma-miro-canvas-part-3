import {
  ClientRect,
  DndContext,
  DragOverlay,
  Over,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { Coordinates, DragEndEvent, Translate } from "@dnd-kit/core/dist/types";
import { ZoomTransform, zoomIdentity } from "d3-zoom";
import { useCallback, useMemo, useRef, useState } from "react";
import { Addable } from "./Addable";
import "./App.css";
import { Canvas } from "./Canvas";

export type Card = {
  id: UniqueIdentifier;
  coordinates: Coordinates;
  text: string;
};

const trayCards = [
  // the coordinates aren't used for the tray cards, we could create a new type without them
  { id: "World", coordinates: { x: 0, y: 0 }, text: "World" },
  { id: "Fizz", coordinates: { x: 0, y: 0 }, text: "Fizz" },
  { id: "Buzz", coordinates: { x: 0, y: 0 }, text: "Buzz" },
];

const calculateCanvasPosition = (
  initialRect: ClientRect,
  over: Over,
  delta: Translate,
  transform: ZoomTransform
): Coordinates => ({
  x:
    (initialRect.left + delta.x - (over?.rect?.left ?? 0) - transform.x) /
    transform.k,
  y:
    (initialRect.top + delta.y - (over?.rect?.top ?? 0) - transform.y) /
    transform.k,
});

export const App = () => {
  const [cards, setCards] = useState<Card[]>(
    [...Array(100).keys()].flatMap((x) =>
      [...Array(2000).keys()].map((y) => (
        {
          id: `${x}-${y}`,
          coordinates: { x: x * 80, y: y * 50 },
          text: `${x}-${y}`
        }
      )
      ))
  );

  const [draggedTrayCardId, setDraggedTrayCardId] =
    useState<UniqueIdentifier | null>(null);

  const [hoverCard, setHoverCard] = useState<Card | null>()

  // store the current transform from d3
  const [transform, _setTransform] = useState(zoomIdentity);
  const transformRef = useRef(transform);
  const setTransform = useCallback((theTransform: ZoomTransform) => {
    console.log('setTransform');

    const canvasElement = document.getElementById('canvas');
    if (canvasElement) {
      canvasElement.style.transform = `translate3d(${theTransform.x}px, ${theTransform.y}px, ${theTransform.k}px)`
    }

    if (hoverCard) {
      const coverElement = document.getElementById('cover');
      if (coverElement) {
        coverElement.style.top = `${hoverCard.coordinates.y * theTransform.k}px`;
        coverElement.style.left = `${hoverCard.coordinates.x * theTransform.k}px`;
        coverElement.style.transform = `scale(${theTransform.k})`;
      }

      const draggableElement = document.getElementById('draggable');
      if (draggableElement) {
        draggableElement.style.top = `${hoverCard.coordinates.y * theTransform.k}px`;
        draggableElement.style.left = `${hoverCard.coordinates.x * theTransform.k}px`;
        draggableElement.style.transform = `scale(${theTransform.k})`;
      }
    }

    cards.forEach(card => {
      const element = document.getElementById(card.id.toString());
      if (element) {
        element.style.top = `${card.coordinates.y * theTransform.k}px`;
        element.style.left = `${card.coordinates.x * theTransform.k}px`;
        element.style.transform = `scale(${theTransform.k})`;
      }
    });

    transformRef.current = theTransform;
    _setTransform(theTransform);
  }, [_setTransform, hoverCard]);

  const addDraggedTrayCardToCanvas = useCallback(({
    over,
    active,
    delta,
  }: DragEndEvent) => {
    setDraggedTrayCardId(null);

    if (over?.id !== "canvas") return;
    if (!active.rect.current.initial) return;

    setCards([
      ...cards,
      {
        id: active.id,
        coordinates: calculateCanvasPosition(
          active.rect.current.initial,
          over,
          delta,
          transformRef.current
        ),
        text: active.id.toString(),
      },
    ]);
  }, [setDraggedTrayCardId, setCards]);
  const startDrag = useCallback(({ active }) => setDraggedTrayCardId(active.id), []);

  const trayCardsComponents = useMemo(() => trayCards.map((trayCard) => {
    // this line removes the card from the tray if it's already on the canvas
    if (cards.find((card) => card.id === trayCard.id)) return null;

    return <Addable card={trayCard} key={trayCard.id} />;
  }), [trayCards, cards]);

  return (
    <DndContext
      onDragStart={startDrag}
      onDragEnd={addDraggedTrayCardToCanvas}
    >
      <div className="tray">
        {trayCardsComponents}
      </div>
      <Canvas
        cards={cards}
        setCards={setCards}
        hoverCard={hoverCard}
        setHoverCard={setHoverCard}
        transformRef={transformRef}
        setTransform={setTransform}
      />
      <DragOverlay>
        <div
          style={{
            transformOrigin: "top left",
            transform: `scale(${transform.k})`,
          }}
          className="trayOverlayCard"
        >
          {/* this works because the id of the card is the same as the text in this example so we can just render the id inside a div. In more complex cases you would have a component to render the card, and use that here. */}
          {draggedTrayCardId}
        </div>
      </DragOverlay>
    </DndContext>
  );
};
