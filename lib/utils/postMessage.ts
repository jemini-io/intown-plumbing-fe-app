export function sendToParent(message: unknown) {
  if (typeof window !== 'undefined' && window.parent !== window) {
    window.parent.postMessage(message, '*');
  }
}

export function listenToParent(callback: (message: unknown) => void) {
  if (typeof window === 'undefined') return;
  const handleMessage = (event: MessageEvent) => {
    if (event.data && typeof event.data === 'object') {
      callback(event.data);
    }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
} 