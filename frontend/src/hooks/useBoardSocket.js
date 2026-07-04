import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getToken } from '../api/client';

/*
 * Connects to the realtime server for one board and exposes:
 *   - peers: who else is here (for the presence bar)
 *   - cursors: their live pointer positions (world coords)
 *   - lasers: transient laser trails from others
 *   - send: emit helpers (elements/cursor/laser)
 * Incoming element changes are handed to onRemoteElements so the editor can merge.
 */
export function useBoardSocket(boardId, onRemoteElements) {
  const socketRef = useRef(null);
  const [peers, setPeers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [lasers, setLasers] = useState({});
  const onRemote = useRef(onRemoteElements);
  onRemote.current = onRemoteElements;

  useEffect(() => {
    if (!boardId) return undefined;
    const socket = io('/', { auth: { token: getToken() } });
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('join-board', boardId));
    socket.on('presence', (list) => setPeers(list));

    socket.on('elements-change', (elements) => {
      if (onRemote.current) onRemote.current(elements);
    });

    socket.on('cursor-move', ({ socketId, x, y, name, color }) => {
      setCursors((c) => ({ ...c, [socketId]: { x, y, name, color, t: Date.now() } }));
    });
    socket.on('cursor-leave', (socketId) => {
      setCursors((c) => {
        const next = { ...c };
        delete next[socketId];
        return next;
      });
    });

    socket.on('laser', ({ socketId, points, color }) => {
      setLasers((l) => ({ ...l, [socketId]: { points, color, t: Date.now() } }));
    });

    return () => {
      socket.emit('leave-board');
      socket.disconnect();
    };
  }, [boardId]);

  // Fade out stale laser trails.
  useEffect(() => {
    const id = setInterval(() => {
      setLasers((l) => {
        const now = Date.now();
        const next = {};
        Object.entries(l).forEach(([k, v]) => {
          if (now - v.t < 900) next[k] = v;
        });
        return next;
      });
    }, 400);
    return () => clearInterval(id);
  }, []);

  const send = {
    elements: (els) => socketRef.current?.emit('elements-change', els),
    cursor: (point) => socketRef.current?.emit('cursor-move', point),
    laser: (points) => socketRef.current?.emit('laser', points),
  };

  return { peers, cursors, lasers, send };
}
