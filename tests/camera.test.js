import { describe, expect, it } from 'vitest';
import { Camera } from '../src/render/camera.js';

describe('Camera', () => {
  it('prevod view ↔ world rešpektuje posun a zoom', () => {
    const cam = new Camera();
    cam.x = 10;
    cam.y = 20;
    cam.zoom = 2;
    expect(cam.viewToWorld(40, 60)).toEqual({ x: 30, y: 50 });
    expect(cam.worldToView(30, 50)).toEqual({ x: 40, y: 60 });
  });

  it('zoom ponechá bod pod kurzorom na mieste', () => {
    const cam = new Camera();
    cam.setViewport(480, 270);
    const before = cam.viewToWorld(100, 50);
    cam.stepZoom(+1, 100, 50);
    expect(cam.zoom).toBe(1.5);
    const after = cam.viewToWorld(100, 50);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it('zoom ostáva v povolených krokoch', () => {
    const cam = new Camera();
    cam.stepZoom(-1, 0, 0);
    expect(cam.zoom).toBe(1);
    cam.stepZoom(+1, 0, 0);
    cam.stepZoom(+1, 0, 0);
    cam.stepZoom(+1, 0, 0);
    expect(cam.zoom).toBe(2);
  });

  it('ťahanie posúva kameru opačne ako prst', () => {
    const cam = new Camera();
    cam.zoom = 2;
    cam.panByView(20, -10);
    expect(cam).toMatchObject({ x: -10, y: 5 });
  });

  it('clamp nedovolí stratiť svet z obrazovky', () => {
    const cam = new Camera();
    cam.setViewport(480, 270);
    cam.x = 5000;
    cam.y = -5000;
    cam.clamp(192, 160);
    expect(cam.x).toBe(192 - 32);
    expect(cam.y).toBe(32 - 270);
  });
});
