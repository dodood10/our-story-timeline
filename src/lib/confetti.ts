import confetti from "canvas-confetti";

export function celebrate(opts?: confetti.Options) {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#f9a8d4", "#f472b6", "#fbcfe8", "#fde68a", "#fcd34d"],
    ...opts,
  });
}

export function hearts() {
  const scalar = 2;
  const heart = confetti.shapeFromText({ text: "💗", scalar });
  confetti({
    shapes: [heart],
    scalar,
    particleCount: 30,
    spread: 80,
    origin: { y: 0.6 },
    ticks: 200,
  });
}
