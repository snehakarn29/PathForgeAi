let cachedWebGLSupport: boolean | null = null;

export function isWebGLAvailable(): boolean {
  if (cachedWebGLSupport !== null) {
    return cachedWebGLSupport;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    cachedWebGLSupport = false;
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    const available = Boolean(window.WebGLRenderingContext && gl);

    if (gl) {
      const loseContext = (gl as any).getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
    }

    cachedWebGLSupport = available;
    return available;
  } catch {
    cachedWebGLSupport = false;
    return false;
  }
}
