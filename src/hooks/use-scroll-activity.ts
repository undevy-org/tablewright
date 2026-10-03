import { useCallback, useEffect, useRef, useState } from "react";

export function useScrollActivity<T extends HTMLElement>(idleMs = 700) {
  const nodeRef = useRef<T | null>(null);
  const [nodeVersion, setNodeVersion] = useState(0);

  const ref = useCallback((nextNode: T | null) => {
    if (nodeRef.current === nextNode) return;
    nodeRef.current = nextNode;
    setNodeVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    let idleTimeout = 0;

    const markActive = () => {
      node.dataset.scrolling = "true";
      window.clearTimeout(idleTimeout);
      idleTimeout = window.setTimeout(() => {
        node.dataset.scrolling = "false";
      }, idleMs);
    };

    node.dataset.scrolling = "false";
    node.addEventListener("scroll", markActive, { passive: true });

    return () => {
      window.clearTimeout(idleTimeout);
      node.removeEventListener("scroll", markActive);
      delete node.dataset.scrolling;
    };
  }, [idleMs, nodeVersion]);

  return ref;
}
