/**
 * PrepInMinutes — Cloudflare Workers Global Polyfills
 * 
 * Provides minimal Web / Canvas API stubs required by libraries (e.g. pdfjs-dist)
 * that check for browser Canvas globals during module evaluation in workerd.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

if (typeof (globalThis as any).DOMMatrix === "undefined") {
  class DOMMatrixPolyfill {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;
    isIdentity = true;

    constructor(init?: any) {
      if (Array.isArray(init)) {
        if (init.length === 6) {
          [this.a, this.b, this.c, this.d, this.e, this.f] = init;
          this.m11 = this.a; this.m12 = this.b;
          this.m21 = this.c; this.m22 = this.d;
          this.m41 = this.e; this.m42 = this.f;
        } else if (init.length === 16) {
          [
            this.m11, this.m12, this.m13, this.m14,
            this.m21, this.m22, this.m23, this.m24,
            this.m31, this.m32, this.m33, this.m34,
            this.m41, this.m42, this.m43, this.m44,
          ] = init;
          this.a = this.m11; this.b = this.m12;
          this.c = this.m21; this.d = this.m22;
          this.e = this.m41; this.f = this.m42;
          this.is2D = false;
        }
      }
    }

    multiply(other: any) { return this; }
    translate(tx = 0, ty = 0, tz = 0) { return this; }
    scale(sx = 1, sy = sx, sz = 1) { return this; }
    rotate(angle = 0) { return this; }
    transformPoint(point: any) { return point; }
    inverse() { return this; }
    flipX() { return this; }
    flipY() { return this; }
    toFloat32Array() {
      return new Float32Array([
        this.m11, this.m12, this.m13, this.m14,
        this.m21, this.m22, this.m23, this.m24,
        this.m31, this.m32, this.m33, this.m34,
        this.m41, this.m42, this.m43, this.m44,
      ]);
    }
    toFloat64Array() {
      return new Float64Array([
        this.m11, this.m12, this.m13, this.m14,
        this.m21, this.m22, this.m23, this.m24,
        this.m31, this.m32, this.m33, this.m34,
        this.m41, this.m42, this.m43, this.m44,
      ]);
    }

    static fromMatrix(other: any) {
      return new DOMMatrixPolyfill();
    }
    static fromFloat32Array(arr: Float32Array) {
      return new DOMMatrixPolyfill(Array.from(arr));
    }
    static fromFloat64Array(arr: Float64Array) {
      return new DOMMatrixPolyfill(Array.from(arr));
    }
  }

  (globalThis as any).DOMMatrix = DOMMatrixPolyfill;
  (globalThis as any).DOMMatrixReadOnly = DOMMatrixPolyfill;
}

if (typeof (globalThis as any).ImageData === "undefined") {
  class ImageDataPolyfill {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    colorSpace = "srgb";

    constructor(w = 0, h = 0) {
      this.width = w;
      this.height = h;
      this.data = new Uint8ClampedArray(w * h * 4);
    }
  }
  (globalThis as any).ImageData = ImageDataPolyfill;
}

if (typeof (globalThis as any).Path2D === "undefined") {
  class Path2DPolyfill {
    addPath() {}
    closePath() {}
    moveTo() {}
    lineTo() {}
    bezierCurveTo() {}
    quadraticCurveTo() {}
    arc() {}
    arcTo() {}
    ellipse() {}
    rect() {}
  }
  (globalThis as any).Path2D = Path2DPolyfill;
}

export {};

