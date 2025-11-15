import React, { useEffect, useRef, useState } from "react";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
//const ONE_WEEK = 10 * 1000; // 10 segundos para pruebas

export type Episode = 1 | 2 | 3 | 4 | 5;

interface Props {
  initialRelease: Date;
  onEpisodeChange: (episode: Episode) => void;
  onTimeLeftChange: (time: number) => void;
}

export default function EpisodeController({
  initialRelease,
  onEpisodeChange,
  onTimeLeftChange,
}: Props) {
  const [episode, setEpisode] = useState<Episode>(1);
  const [releaseDate, setReleaseDate] = useState<number>(
    initialRelease.getTime()
  );
  const [timeLeft, setTimeLeft] = useState<number>(releaseDate - Date.now());

  // refs
  const prevTimeLeft = useRef(timeLeft);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = releaseDate - now;

      setTimeLeft(diff);

      if (prevTimeLeft.current !== diff) {
        prevTimeLeft.current = diff;
        onTimeLeftChange(diff);
      }

      if (diff <= 0) {
        // Avisar que ya estamos en esta parte
        onEpisodeChange(episode);

        // Pasar al siguiente episodio solo una vez por tick
        if (episode < 5) {
          const nextEpisode = (episode + 1) as Episode;
          const nextRelease = releaseDate + ONE_WEEK;

          setEpisode(nextEpisode);
          setReleaseDate(nextRelease);
          setTimeLeft(nextRelease - now);

          // refrescar ref de tiempo
          prevTimeLeft.current = nextRelease - now;
          onTimeLeftChange(nextRelease - now);
        } else {
          setTimeLeft(0);
        }
      }
    };

    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [episode, releaseDate, onEpisodeChange, onTimeLeftChange]);

  return (
    <div style={{ color: "white", fontSize: "20px"}}>
      {episode <= 5 ? (
        <>
          <p>Parte {episode}: {formatTime(timeLeft)}</p>
        </>
      ) : (
        <p>Serie completada</p>
      )}
    </div>
  );
}

function formatTime(ms: number) {
  if (ms <= 0) return "0d 0h 0m 0s";

  const totalSeconds = Math.floor(ms / 1000);

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

