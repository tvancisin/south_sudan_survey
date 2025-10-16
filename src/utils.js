import * as d3 from "d3";

async function getIndividualCSV(path) {
    let loadedData = await d3.csv(path);
    return loadedData;
}

export async function getCSV(paths) {
    const promises = paths.map(path => getIndividualCSV(path));
    const results = await Promise.all(promises);
    return results;
}

async function getIndividualJSON(path) {
    let loadedData = await d3.json(path);
    return loadedData;
}

export async function getGeo(paths) {
    const promises = paths.map(path => getIndividualJSON(path));
    const results = await Promise.all(promises);
    return results;
}

export const monthMap = {
  Jan: 0, January: 0,
  Feb: 1, February: 1,
  Mar: 2, March: 2,
  Apr: 3, April: 3,
  May: 4,
  Jun: 5, June: 5,
  Jul: 6, July: 6,
  Aug: 7, August: 7,
  Sep: 8, Sept: 8, September: 8,
  Oct: 9, October: 9,
  Nov: 10, November: 10,
  Dec: 11, December: 11
};

  // Base width is fixed (in pixels)
  const baseWidth = 10;

  // Triangle path generator with constant base
  export function spike(h) {
    const w = baseWidth;
    // draw from bottom-left to top to bottom-right, always upward
    return `M${-w / 2},0 L0,${-h} L${w / 2},0 Z`;
  }

  // spike shadows
  export function angledSpike(h, angleDeg = 45) {
    const w = baseWidth;
    const angle = (angleDeg * Math.PI) / 180; // convert to radians

    // Calculate the diagonal cut height (45 degrees means equal rise and run)
    const cutHeight = w / 2; // For 45 degree angle, rise equals run

    // Define points for a spike with angled bottom-right corner
    const x0 = -w / 2; // bottom-left
    const y0 = 0;
    const x1 = 0; // tip
    const y1 = -h;
    const x2 = w / 2; // bottom-right (raised by cutHeight)
    const y2 = -cutHeight;

    // helper to rotate a point (x, y) around origin (0,0)
    function rotate(x, y) {
      const xr = x * Math.cos(angle) - y * Math.sin(angle);
      const yr = x * Math.sin(angle) + y * Math.cos(angle);
      return [xr, yr];
    }

    // Then rotate each point
    const [rx0, ry0] = rotate(x0, y0);
    const [rx1, ry1] = rotate(x1, y1);
    const [rx2, ry2] = rotate(x2, y2);

    return `M${rx0},${ry0} L${rx1},${ry1} L${rx2},${ry2} Z`;
  }