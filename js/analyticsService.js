// Analytics Service for SuperTripLand
class AnalyticsService {
  constructor() {
    this.sessionId = this.generateUUID();
    this.sessionStartTime = Date.now();
    this.endpoint = '/api/vitals/events';
    
    // Device context (collected once)
    this.deviceContext = this.collectDeviceContext();
    
    // Setup unload handlers
    this.setupUnloadHandlers();
    
    // Track initial page load
    this.trackEvent('page_load_start', {
      referrer: document.referrer,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  collectDeviceContext() {
    const context = {
      // Browser info
      userAgent: navigator.userAgent,
      browser: this.detectBrowser(),
      browserVersion: this.detectBrowserVersion(),
      
      // OS info
      os: this.detectOS(),
      platform: navigator.platform,
      
      // Hardware info
      cores: navigator.hardwareConcurrency || null,
      memory: navigator.deviceMemory || null, // GB
      maxTouchPoints: navigator.maxTouchPoints || 0,
      
      // Display info
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: window.devicePixelRatio,
        colorDepth: screen.colorDepth,
        orientation: screen.orientation?.type
      },
      
      // WebGL/GPU info
      gpu: this.detectGPU(),
      webglVersion: this.detectWebGLVersion(),
      
      // Network info
      connection: this.detectConnection(),
      
      // Capabilities
      capabilities: {
        webgl: this.hasWebGL(),
        webgl2: this.hasWebGL2(),
        wasm: typeof WebAssembly !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        localStorage: this.hasLocalStorage(),
        sessionStorage: this.hasSessionStorage(),
        indexedDB: 'indexedDB' in window
      }
    };

    return context;
  }

  detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
    if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Opera/') || ua.includes('OPR/')) return 'Opera';
    return 'Unknown';
  }

  detectBrowserVersion() {
    const ua = navigator.userAgent;
    const browser = this.detectBrowser();
    const match = ua.match(new RegExp(`${browser}/([0-9.]+)`));
    return match ? match[1] : 'Unknown';
  }

  detectOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows NT 10.0')) return 'Windows 10';
    if (ua.includes('Windows NT 11.0')) return 'Windows 11';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  detectGPU() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'No WebGL';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
      return 'WebGL supported';
    } catch (e) {
      return 'Unknown';
    }
  }

  detectWebGLVersion() {
    const canvas = document.createElement('canvas');
    if (canvas.getContext('webgl2')) return 'WebGL2';
    if (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) return 'WebGL1';
    return 'None';
  }

  detectConnection() {
    if (!navigator.connection) return 'Unknown';
    const conn = navigator.connection;
    return {
      type: conn.effectiveType || 'Unknown',
      downlink: conn.downlink || null,
      rtt: conn.rtt || null,
      saveData: conn.saveData || false
    };
  }

  hasWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  hasWebGL2() {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch (e) {
      return false;
    }
  }

  hasLocalStorage() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }

  hasSessionStorage() {
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }

  // Send events immediately - no buffering
  async trackEvent(eventName, properties = {}) {
    const event = {
      session_id: this.sessionId,
      event_type: eventName,
      timestamp: Date.now(),
      properties: {
        ...properties,
        time_since_session_start_ms: Date.now() - this.sessionStartTime
      },
      // Only send device context with first event or critical events
      context: ['page_load_start', 'unity_initialized'].includes(eventName) 
        ? this.deviceContext 
        : undefined
    };

    try {
      // Send immediately
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify([event]) // Still array for consistency
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  setupUnloadHandlers() {
    const endSession = () => {
      const event = {
        session_id: this.sessionId,
        event_type: 'session_end',
        timestamp: Date.now(),
        properties: {
          session_duration_ms: Date.now() - this.sessionStartTime,
          end_reason: 'page_unload'
        }
      };
      
      // Use sendBeacon for reliability
      navigator.sendBeacon(
        this.endpoint,
        JSON.stringify([event])
      );
    };
    
    // Multiple handlers for reliability
    window.addEventListener('beforeunload', endSession);
    window.addEventListener('pagehide', endSession);
    
    // Track when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('session_pause', {
          reason: 'tab_hidden'
        });
      } else {
        this.trackEvent('session_resume', {
          reason: 'tab_visible'
        });
      }
    });
  }
}

// Initialize analytics service globally
window.analyticsService = new AnalyticsService();

// Unity bridge functions
window.UnityAnalytics = {
  trackEvent: (eventName, propertiesJson) => {
    try {
      const props = typeof propertiesJson === 'string' ? JSON.parse(propertiesJson) : propertiesJson;
      window.analyticsService.trackEvent(eventName, props);
    } catch (error) {
      console.error('Unity analytics error:', error);
    }
  }
};