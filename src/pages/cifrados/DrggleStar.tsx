// src/components/DraggableStar.tsx
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

export type StarPosition = {
  id: number;
  x: number;
  y: number;
};

type DraggableStarProps = {
  id: number;
  pos: StarPosition;
  index: number;
  target: StarPosition;
  positions: StarPosition[];
  setPositions: React.Dispatch<React.SetStateAction<StarPosition[]>>;
  setCompleted: React.Dispatch<React.SetStateAction<number>>;
};

export default function DraggableStar({
  id,
  pos,
  index,
  target,
  positions,
  setPositions,
  setCompleted
}: DraggableStarProps) {

  const [{ x, y }, api] = useSpring(() => ({
    x: pos.x,
    y: pos.y,
  }));

  const bind = useDrag(({ offset: [ox, oy], last }) => {
    api.start({ x: ox, y: oy });

    if (last) {
      // distancia entre la pieza y el target
      const dist = Math.hypot(ox - target.x, oy - target.y);

      if (dist < 40) {
        // snap
        api.start({ x: target.x, y: target.y });

        setPositions((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, x: target.x, y: target.y } : p
          )
        );

        setCompleted((c) => c + 1);
      }
    }
  });

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        y,
        width: 20,
        height: 20,
        background: "white",
        borderRadius: "50%",
        position: "absolute",
        cursor: "grab",
        boxShadow: "0 0 10px white"
      }}
    />
  );
}
