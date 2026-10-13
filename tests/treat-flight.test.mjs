import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPO_MOUTH, TREAT_SIZE, treatFlight } from '../src/treat-flight.mjs';

test('all treat centers land inside Chapo’s mouth across phone widths and letterboxed frames', () => {
  for (const [width, height] of [[280, 280 / 1.5], [330, 220], [574, 574 / 1.5], [600, 400], [400, 400], [600, 250]]) {
    for (let index = 0; index < 8; index++) {
      const flight = treatFlight(width, height, index);
      assert.ok(Math.abs(flight.startLeft + flight.translateX + TREAT_SIZE / 2 - flight.mouthX) < 1e-9);
      assert.ok(Math.abs(flight.translateY + TREAT_SIZE / 2 - flight.mouthY) < 1e-9);
      const imageScale = Math.min(width / 1536, height / 1024);
      const sourceX = (flight.mouthX - (width - 1536 * imageScale) / 2) / imageScale;
      const sourceY = (flight.mouthY - (height - 1024 * imageScale) / 2) / imageScale;
      assert.ok(sourceX > 715 && sourceX < 770 && sourceY > 415 && sourceY < 465, 'landing point stays in the open mouth, away from the cheeks and teeth');
      assert.equal(CHAPO_MOUTH.width / CHAPO_MOUTH.height, 1.5);
    }
  }
});
