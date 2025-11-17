import React, { useMemo, useState } from "react";
import "../../assets/styles/Cuadratico.css";

type Clue = { x: number; y: number; char: string };

// Helper para resolver sistema 3x3 (devuelve [a,b,c])
function solveFromClues(clues: Clue[]): [number, number, number] {
  const [[x1, y1, ch1], [x2, y2, ch2], [x3, y3, ch3]] = clues.map(c => [c.x, c.y, c.char.charCodeAt(0)]);
  // Ecuaciones: a*x^2 + b*x + c = y - charCode
  const Y1 = y1 - ch1;
  const Y2 = y2 - ch2;
  const Y3 = y3 - ch3;

  // Sistema matricial:
  // [x1^2 x1 1][a] = [Y1]
  // [x2^2 x2 1][b]   [Y2]
  // [x3^2 x3 1][c]   [Y3]
  const A = [
    [x1 * x1, x1, 1],
    [x2 * x2, x2, 1],
    [x3 * x3, x3, 1],
  ];
  const B = [Y1, Y2, Y3];

  // Solve by Cramer's rule (safe for 3x3)
  const det = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

  const D = det(A);
  if (Math.abs(D) < 1e-9) throw new Error("Sistema singular (det=0). Intenta otros clues.");

  const A1 = [
    [B[0], A[0][1], A[0][2]],
    [B[1], A[1][1], A[1][2]],
    [B[2], A[2][1], A[2][2]],
  ];
  const A2 = [
    [A[0][0], B[0], A[0][2]],
    [A[1][0], B[1], A[1][2]],
    [A[2][0], B[2], A[2][2]],
  ];
  const A3 = [
    [A[0][0], A[0][1], B[0]],
    [A[1][0], A[1][1], B[1]],
    [A[2][0], A[2][1], B[2]],
  ];

  const Da = det(A1);
  const Db = det(A2);
  const Dc = det(A3);

  return [Da / D, Db / D, Dc / D];
}

function nearlyEqual(a: number, b: number, eps = 1e-6) {
  return Math.abs(a - b) <= eps;
}

export default function QuadraticCipherPuzzle({
  hiddenText = "supernobaconb.web.app/0618am/030806",
  lengthLimit = 120,
}: {
  hiddenText?: string;
  lengthLimit?: number;
}) {
  // Convertir mensaje a códigos (UTF-16)
  const text = hiddenText.slice(0, lengthLimit);
  const charCodes = useMemo(() => Array.from(text).map(ch => ch.charCodeAt(0)), [text]);

const secret = useMemo(() => {
  // Rango sugerido (puedes ajustarlo)
  const min = -20;
  const max = 100;

  // Función para número entero aleatorio
  const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    a: randInt(min, max),
    b: randInt(min, max),
    c: randInt(min, max)
  };
}, []);

  // Generar la secuencia codificada: y(x) = charCode + p(x)
  const encoded = useMemo(() => {
    return charCodes.map((code, i) => {
      const x = i + 1;
      const poly = secret.a * x * x + secret.b * x + secret.c;
      return poly + code;
    });
  }, [charCodes, secret]);

  // Elegir 3 pistas (clues): posiciones conocidas con su letra
  // Elegimos índices bien separados para evitar matrices singulares
  const clues: Clue[] = useMemo(() => {
    const xs = [1, Math.max(2, Math.floor(charCodes.length / 2)), Math.max(3, charCodes.length)]; // x positions
    return xs.map(x => ({ x, y: encoded[x - 1], char: text[x - 1] || " " }));
  }, [encoded, charCodes.length, text]);

  // Estados de usuario
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [inputC, setInputC] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const tryUnlock = () => {
    setFeedback(null);
    let a = parseFloat(inputA);
    let b = parseFloat(inputB);
    let c = parseFloat(inputC);
    if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) {
      setFeedback("Introduce números válidos para a, b y c.");
      return;
    }

    // Comprobamos usando las 3 clues: should satisfy a*x^2 + b*x + c ≈ encoded - charCode
    const ok = clues.every(clue => {
      const expected = clue.y - clue.char.charCodeAt(0);
      const got = a * clue.x * clue.x + b * clue.x + c;
      return nearlyEqual(expected, got, 1e-3);
    });

    if (!ok) {
      setFeedback("No coincide. Sigue intentando (pista: usa las 3 parejas dadas).");
      return;
    }

    // Si está bien, decodificamos todo
    const decodedChars = encoded.map((y, idx) => {
      const x = idx + 1;
      const poly = a * x * x + b * x + c;
      const charCode = Math.round(y - poly); // redondeamos por seguridad
      return String.fromCharCode(charCode);
    });

    const decodedStr = decodedChars.join("");
    setMessage(decodedStr);
    setUnlocked(true);
    setFeedback("¡Correcto! Preview desbloqueado.");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const autofillSolve = () => {
    // Método para calcular a,b,c a partir de las clues (solo para desarrollo / ayuda opcional)
    try {
      const [solA, solB, solC] = solveFromClues(clues);
      setInputA(String(Number(solA.toFixed(6))));
      setInputB(String(Number(solB.toFixed(6))));
      setInputC(String(Number(solC.toFixed(6))));
      setFeedback("Coeficientes calculados (auto). Intenta desbloquear.");
    } catch (err) {
      setFeedback(String((err as Error).message));
    }
  };

  return (
    <div className="quad-puzzle">
      <h2>supernoba.org</h2>

      <div className="panel">
        <div className="left">
          <p className="instruction">
            Se ha codificado un mensaje aplicando a cada carácter un polinomio cuadrático.
            Tienes la secuencia de valores codificados (y). Además se revelan <b>3 caracteres pistas</b> con
            su posición en el preview(x), el valor codificado (y) y el carácter real en esa posición.
            Encuentra los valores a, b y c del polinomio. Consejo: Recuerda la tabla ASCII.
          </p>

          <div className="clues">
            <h3>Pistas</h3>
            {clues.map((c, i) => (
              <div key={i} className="clue">
                <span className="label">x = {c.x}</span>
                <span className="label">y = {c.y}</span>
                <span className="label">char = "{c.char}"</span>
              </div>
            ))}
          </div>

          <div className="encoded">
            <h3>Secuencia codificada (y)</h3>
            <div className="encoded-list">
              {encoded.map((y, i) => (
                <div key={i} className="encoded-item">
                  <small>x={i + 1}</small>
                  <div className="num">{y}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right">
          <h3>Introduce coeficientes</h3>
          <div className="inputs">
            <label>
              a
              <input value={inputA} onChange={e => setInputA(e.target.value)} placeholder="ej. 3" />
            </label>
            <label>
              b
              <input value={inputB} onChange={e => setInputB(e.target.value)} placeholder="ej. -5" />
            </label>
            <label>
              c
              <input value={inputC} onChange={e => setInputC(e.target.value)} placeholder="ej. 12" />
            </label>
          </div>

          <div className="buttons">
            <button onClick={tryUnlock} className="btn primary">Probar</button>
            {/*<button onClick={autofillSolve} className="btn alt">Auto-resolver (pista)</button>*/}
          </div>

          {feedback && <div className="feedback">{feedback}</div>}

          <div className="preview-box">
            <h3>Preview</h3>
            {!unlocked ? (
              <div className="cover">Contenido bloqueado. Resuelve para ver el mensaje.</div>
            ) : (
              <div className="content">{message}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
