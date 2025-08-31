// src/lib/elo.js
export const DEFAULT_RATING = 1200;

export function expectedScore(rA, rB) {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400));
}

export function updateElo(rA, rB, scoreA, k = 24) {
  const eA = expectedScore(rA, rB);
  const eB = 1 - eA;
  const rAprime = rA + k * (scoreA - eA);
  const rBprime = rB + k * ((1 - scoreA) - eB);
  return [Math.round(rAprime), Math.round(rBprime)];
}
