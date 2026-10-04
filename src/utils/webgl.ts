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

    cachedWebGLSupport = Boolean(window.WebGLRenderingContext && gl);
    return cachedWebGLSupport;
  } catch {
    cachedWebGLSupport = false;
    return false;
  }
}
