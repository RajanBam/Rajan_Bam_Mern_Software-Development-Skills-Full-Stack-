import { useCallback, useRef, useState } from 'react';

// Deep-ish clone of the scene (elements are plain JSON-safe objects).
const clone = (els) => els.map((el) => ({ ...el, points: el.points ? el.points.map((p) => [...p]) : undefined }));

/*
 * Scene state with undo/redo.
 *  - setElements(updater) mutates the LIVE scene without touching history
 *    (so dragging a shape does not create 200 undo steps).
 *  - commit() snapshots the current scene as a checkpoint you can undo back to.
 */
export function useHistory(initial = []) {
  const [elements, setElementsState] = useState(initial);
  const elementsRef = useRef(initial);
  const checkpoints = useRef([clone(initial)]);
  const pointer = useRef(0);
  const [, force] = useState(0);

  const setElements = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(elementsRef.current) : updater;
    elementsRef.current = next;
    setElementsState(next);
  }, []);

  const commit = useCallback((snapshot) => {
    const snap = clone(snapshot || elementsRef.current);
    checkpoints.current = checkpoints.current.slice(0, pointer.current + 1);
    checkpoints.current.push(snap);
    pointer.current = checkpoints.current.length - 1;
    force((n) => n + 1);
  }, []);

  const undo = useCallback(() => {
    if (pointer.current <= 0) return;
    pointer.current -= 1;
    setElements(clone(checkpoints.current[pointer.current]));
    force((n) => n + 1);
  }, [setElements]);

  const redo = useCallback(() => {
    if (pointer.current >= checkpoints.current.length - 1) return;
    pointer.current += 1;
    setElements(clone(checkpoints.current[pointer.current]));
    force((n) => n + 1);
  }, [setElements]);

  // Replace the whole scene (e.g. after loading from the server or a remote sync).
  const reset = useCallback((els) => {
    elementsRef.current = els;
    setElementsState(els);
    checkpoints.current = [clone(els)];
    pointer.current = 0;
  }, []);

  return {
    elements,
    elementsRef,
    setElements,
    commit,
    undo,
    redo,
    reset,
    canUndo: pointer.current > 0,
    canRedo: pointer.current < checkpoints.current.length - 1,
  };
}
