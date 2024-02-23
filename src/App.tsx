import {
  ClientRect,
  DndContext,
  DragOverlay,
  Over,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { Coordinates, DragEndEvent, Translate } from "@dnd-kit/core/dist/types";
import { ZoomTransform, zoomIdentity } from "d3-zoom";
import { useState } from "react";
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
  const [cards, setCards] = useState<Card[]>([
    { id: "Hello", coordinates: { x: 0, y: 0 }, text: "Hello" },
  ]);

  const [draggedTrayCardId, setDraggedTrayCardId] =
    useState<UniqueIdentifier | null>(null);

  // store the current transform from d3
  const [transform, setTransform] = useState(zoomIdentity);

  const addDraggedTrayCardToCanvas = ({
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
          transform
        ),
        text: active.id.toString(),
      },
    ]);
  };

  return (
    <DndContext
      onDragStart={({ active }) => setDraggedTrayCardId(active.id)}
      onDragEnd={addDraggedTrayCardToCanvas}
    >
      <div className="tray">
        {trayCards.map((trayCard) => {
          // this line removes the card from the tray if it's already on the canvas
          if (cards.find((card) => card.id === trayCard.id)) return null;

          return <Addable card={trayCard} key={trayCard.id} />;
        })}
      </div>
      <Canvas
        cards={cards}
        setCards={setCards}
        transform={transform}
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
