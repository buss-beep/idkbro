/* ── wagmi.supertrip.land → production API redirect ─────────────────── */
(() => {
  // Only apply on wagmi.supertrip.land
  if (location.hostname !== "wagmi.supertrip.land") return;

  const PROD_ORIGIN = "https://supertrip.land";

  console.log("[Wagmi Dev] Redirecting /api/* requests to production + credentials for all supertrip.land requests");

  const origFetch = window.fetch;
  window.fetch = (input, init = {}) => {
    let url = typeof input === "string" ? input : input.url;

    // Redirect relative /api/* calls to production
    if (url.startsWith("/api/") || url.startsWith("api/")) {
      const newUrl = PROD_ORIGIN + (url.startsWith("/") ? url : "/" + url);
      console.log("[Wagmi Dev] fetch →", url, "⇒", newUrl);
      init.credentials = init.credentials || "include";
      const patched = typeof input === "string" ? newUrl : new Request(newUrl, input);
      return origFetch.call(window, patched, init);
    }

    // For ANY request to supertrip.land, ensure credentials are included
    if (url.includes("supertrip.land")) {
      init.credentials = init.credentials || "include";
    }

    return origFetch.call(window, input, init);
  };
})();

window.addEventListener("load", async function() {
    if ("serviceWorker" in navigator) {
        const swuri = "/ServiceWorker6409.js";
        try {
            // Get all registrations
            const registrations = await navigator.serviceWorker.getRegistrations();
            // Log what we found
            console.log('Found service workers:', registrations.map(reg => reg.active.scriptURL));
            // Only unregister workers that don't match our swuri
            const unregisterResults = await Promise.all(
                registrations
                    .filter(registration => !registration.active.scriptURL.endsWith(swuri))
                    .map(async registration => {
                        const url = registration.active.scriptURL;
                        const success = await registration.unregister();
                        console.log(
                            success ? 
                            `Successfully unregistered SW: ${url}` : 
                            `Failed to unregister SW: ${url}`
                        );
                        return success;
                    })
            );
            // Check remaining registrations
            const remainingRegs = await navigator.serviceWorker.getRegistrations();
            console.log('Remaining service workers:', remainingRegs.map(reg => reg.active.scriptURL));
            // Register our service worker if it's not already registered
            const hasOurWorker = remainingRegs.some(reg => reg.active.scriptURL.endsWith(swuri));
            if (!hasOurWorker) {
                console.log('Registering our service worker:', swuri);
                await navigator.serviceWorker.register(swuri);
            }
        } catch (error) {
            console.error('Service Worker operation failed:', error);
        }
    }
});
  
// Checks if mobile device.
function isMobileDevice() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    var isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent) || 
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0, 4));
    return isMobile;
}

var container = document.querySelector("#unity-container");
var canvas = document.querySelector("#unity-canvas");
var warningBanner = document.querySelector("#unity-warning");
  
function unityShowBanner(msg, type) {
    function updateBannerVisibility() {
        warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
    }
    var div = document.createElement('div');
    div.innerHTML = msg;
    warningBanner.appendChild(div);
    if (type == 'error') div.style = 'background: red; padding: 10px;';
    else {
        if (type == 'warning') div.style = 'background: yellow; padding: 10px;';
        setTimeout(function() {
        warningBanner.removeChild(div);
        updateBannerVisibility();
        }, 5000);
    }
    updateBannerVisibility();
}

/* ── discord proxy shim  v4  (models / materials rewrite) ─────────── */
(() => {
  if (!location.hostname.endsWith("discordsays.com")) return;

  const PROXY_PREFIX   = "/.proxy";
  const IFRAME_ORIGIN  = location.origin;               // https://123456.discordsays.com
  const SITE_ORIGIN    = "https://supertrip.land";
  const MODELS_ORIGIN  = "https://models.supertrip.land";
  const MATERIALS_ORIGIN = "https://materials.supertrip.land";
  const CDN_DEV_ORIGIN = "https://cdn.dev.supertrip.land";

  // JWT token storage for iframe authentication
  let capturedJWT = null;
  
  // No auth state tracking needed - auth runs independently
  
  // Helper function to trigger Unity Bootstrap if loaded
  function triggerUnityBootstrap() {
    if (window.unityInstance) {
      console.log('[Discord Auth] Triggering Unity Bootstrap refresh...');
      window.unityInstance.SendMessage("PlayerInstance", "Bootstrap");
    }
  }
  
  // Full Discord auth flow
  async function startDiscordAuthFlow() {
    console.log('[Discord Auth] Starting Discord authentication flow...');
    
    // Check if Discord SDK is available
    if (!window.discordSDK) {
      console.log('[Discord Auth] Discord SDK not available yet, waiting...');
      // Wait for SDK to load
      let retries = 0;
      const checkSDK = setInterval(() => {
        retries++;
        if (window.discordSDK) {
          clearInterval(checkSDK);
          console.log('[Discord Auth] Discord SDK now available, proceeding...');
          performAuthFlow();
        } else if (retries > 20) { // 10 seconds timeout
          clearInterval(checkSDK);
          console.log('[Discord Auth] Discord SDK failed to load after 10 seconds');
        }
      }, 500);
      return;
    }
    
    // SDK is already available, proceed immediately
    performAuthFlow();
  }
  
  async function performAuthFlow() {
    // First try silent auth
    try {
      console.log('[Discord Auth] performAuthFlow called, SDK available:', !!window.discordSDK);
      console.log('[Discord Auth] SDK commands available:', !!(window.discordSDK && window.discordSDK.commands));
      console.log('[Discord Auth] Attempting silent authorization with prompt=none...');
      
      if (!window.discordSDK || !window.discordSDK.commands) {
        throw new Error('Discord SDK not properly initialized');
      }
      
      const { code } = await window.discordSDK.commands.authorize({
        client_id: '1385721567421665320',
        response_type: 'code',
        scope: ['identify', 'rpc.activities.write'],
        prompt: 'none'
      });
      
      console.log('[Discord Auth] Silent auth successful, got code:', code.substring(0, 10) + '...');
      
      // Exchange and handle response
      await handleDiscordCode(code);
      
    } catch (error) {
      console.log('[Discord Auth] Silent auth failed:', error);
      console.log('[Discord Auth] Error type:', typeof error);
      console.log('[Discord Auth] Error code:', error.code);
      console.log('[Discord Auth] Error message:', error.message);
      console.log('[Discord Auth] Full error:', JSON.stringify(error, null, 2));
      
      // Only show manual auth if it's not a user cancellation
      if (error.code !== 4001 && error.message !== 'Discord SDK not properly initialized') { // 4001 = user cancelled
        console.log('[Discord Auth] Showing manual auth...');
        await showManualAuth();
      } else {
        console.log('[Discord Auth] User cancelled authorization or SDK not ready');
      }
    }
  }
  
  async function showManualAuth() {
    try {
      console.log('[Discord Auth] Showing Discord authorization popup...');
      const { code } = await window.discordSDK.commands.authorize({
        client_id: '1385721567421665320',
        response_type: 'code',
        scope: ['identify', 'rpc', 'rpc.activities.write']
      });
      
      console.log('[Discord Auth] Manual auth successful, got code:', code.substring(0, 10) + '...');
      await handleDiscordCode(code);
      
    } catch (error) {
      console.error('[Discord Auth] Manual auth failed or cancelled:', error);
    }
  }
  
  // Set Discord Rich Presence
  async function setDiscordActivity() {
    console.log('[Discord Rich Presence] setDiscordActivity called');
    
    if (!window.discordSDK) {
      console.log('[Discord Rich Presence] SDK not available');
      return;
    }
    
    console.log('[Discord Rich Presence] SDK available, attempting to set activity...');
    console.log('[Discord Rich Presence] SDK commands:', window.discordSDK.commands);
    
    try {
      const activityData = {
        activity: {
          details: "Playing SuperTrip.Land",
          //state: "Tripping Out 🍄",
          assets: {
            large_image: "1385721567421665320",
            large_text: "SuperTripLand"
          },
          timestamps: {
            start: Date.now()
          }
        }
      };
      
      console.log('[Discord Rich Presence] Sending activity data:', JSON.stringify(activityData, null, 2));
      
      const result = await window.discordSDK.commands.setActivity(activityData);
      
      console.log('[Discord Rich Presence] Activity set successfully!');
      console.log('[Discord Rich Presence] Result:', result);
      console.log('[Discord Rich Presence] Result stringified:', JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('[Discord Rich Presence] Failed to set activity:', err);
      console.error('[Discord Rich Presence] Error type:', typeof err);
      console.error('[Discord Rich Presence] Error stringified:', JSON.stringify(err, null, 2));
      console.error('[Discord Rich Presence] Error stack:', err.stack);
    }
  }
  
  // Authenticate Discord SDK with access token
  async function authenticateDiscordSDK(access_token) {
    if (!window.discordSDK) {
      console.log('[Discord SDK] SDK not available for authentication');
      return false;
    }
    
    if (!access_token) {
      console.log('[Discord SDK] No access token provided for authentication');
      return false;
    }
    
    try {
      console.log('[Discord SDK] Authenticating with access token...');
      const auth = await window.discordSDK.commands.authenticate({
        access_token: access_token
      });
      console.log('[Discord SDK] Authentication successful:', auth);
      return true;
    } catch (err) {
      console.error('[Discord SDK] Authentication failed:', err);
      console.error('[Discord SDK] Error details:', JSON.stringify(err, null, 2));
      return false;
    }
  }

  async function handleDiscordCode(code) {
    console.log('[Discord Auth] Exchanging code with backend...');
    
    const response = await fetch(`${PROXY_PREFIX}/api/discord/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    });
    
    if (!response.ok) {
      console.error('[Discord Auth] Exchange failed:', response.status);
      return;
    }
    
    const data = await response.json();
    console.log('[Discord Auth] Exchange response:', data);
    
    if (data.status === 'existing_user' && data.jwt) {
      console.log('[Discord Auth] Existing user authenticated successfully');
      capturedJWT = data.jwt;
      
      // Authenticate Discord SDK with the access token
      if (data.access_token) {
        await authenticateDiscordSDK(data.access_token);
        // Set Discord activity after SDK authentication
        setDiscordActivity();
      } else {
        console.warn('[Discord Auth] No access_token returned from backend');
      }
      
      triggerUnityBootstrap();
      
    } else if (data.status === 'new_discord_user') {
      console.log('[Discord Auth] New Discord user, showing fusion modal...');
      
      // Wait for React app to be ready
      function showFusionModal() {
        const event = new CustomEvent('showDiscordFusionModal', {
          detail: {
            discordUser: data.discordUser,
            suggestedUsername: data.suggestedUsername,
            access_token: data.access_token
          }
        });
        window.dispatchEvent(event);
      }
      
      // Try to show modal, retry if React isn't ready yet
      let modalRetries = 0;
      const tryShowModal = () => {
        try {
          showFusionModal();
        } catch (e) {
          modalRetries++;
          if (modalRetries < 20) {
            setTimeout(tryShowModal, 500);
          }
        }
      };
      
      tryShowModal();
    }
  }
  
  // Make these functions available globally for modal callbacks
  window.handleDiscordCreate = async (discordId, username, accessToken) => {
    console.log('[Discord Auth] Creating new account...');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add referrer ID if available from Discord SDK
    if (window.discordSDK?.referrerId) {
      headers['X-Discord-Referrer-Id'] = window.discordSDK.referrerId;
      console.log('[Discord Auth] Including referrer ID:', window.discordSDK.referrerId);
    }
    
    const response = await fetch(`${PROXY_PREFIX}/api/discord/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ discordId, username, accessToken })
    });
    
    const data = await response.json();
    
    if (response.ok && data.jwt) {
      console.log('[Discord Auth] Account created, JWT received');
      capturedJWT = data.jwt;
      
      // Set Discord activity after account creation
      setDiscordActivity();
      
      triggerUnityBootstrap();
      return { success: true };
    } else {
      console.error('[Discord Auth] Create failed:', data.error);
      throw new Error(data.error || 'Failed to create account');
    }
  };
  
  window.handleDiscordFuse = async (discordId, username, password) => {
    console.log('[Discord Auth] Fusing accounts...');
    
    const response = await fetch(`${PROXY_PREFIX}/api/discord/fuse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ discordId, username, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.jwt) {
      console.log('[Discord Auth] Accounts fused, JWT received');
      capturedJWT = data.jwt;
      
      // Set Discord activity after account fusion
      setDiscordActivity();
      
      triggerUnityBootstrap();
      return { success: true };
    } else {
      console.error('[Discord Auth] Fuse failed:', data.error);
      throw new Error(data.error || 'Failed to link accounts');
    }
  };
  
  // Start the auth flow immediately
  startDiscordAuthFlow();
  
  function proxify(url) {
    /* 1 ▸ Bundle & data from iframe origin */
    if (url.startsWith(IFRAME_ORIGIN)) {
      const path = url.slice(IFRAME_ORIGIN.length);     // "/Bundles/…"
      return path.startsWith(PROXY_PREFIX) ? url
                                           : PROXY_PREFIX + path;
    }

    /* 2 ▸ Absolute URLs on your main host */
    if (url.startsWith(SITE_ORIGIN)) {
      const path = url.slice(SITE_ORIGIN.length);       // "/api/bootstrap"
      return path.startsWith(PROXY_PREFIX) ? url
                                           : PROXY_PREFIX + path;
    }

    /* 3 ▸ sub-domain: models.supertrip.land */
    if (url.startsWith(MODELS_ORIGIN)) {
      const path = url.slice(MODELS_ORIGIN.length);     // "/LzIxL…bundle"
      return `${PROXY_PREFIX}/supertripland/models${path}`;
    }

    /* 4 ▸ sub-domain: materials.supertrip.land */
    if (url.startsWith(MATERIALS_ORIGIN)) {
      const path = url.slice(MATERIALS_ORIGIN.length);  // "/161"
      return `${PROXY_PREFIX}/supertripland/materials${path}`;
    }

    /* 5 ▸ sub-domain: cdn.dev.supertrip.land */
    if (url.startsWith(CDN_DEV_ORIGIN)) {
      const path = url.slice(CDN_DEV_ORIGIN.length);     // "/path/to/file"
      return `${PROXY_PREFIX}/cdn/dev/supertripland${path}`;
    }

    /* 6 ▸ relative same-origin */
    if (url.startsWith("/") && !url.startsWith(PROXY_PREFIX)) {
      return PROXY_PREFIX + url;
    }

    /* 7 ▸ cross-origin or already proxied ─ leave alone */
    return url;
  }

  /* ---------- patch fetch ------------------------------------------ */
  const origFetch = window.fetch;
  window.fetch = (input, init = {}) => {
    const oldURL = typeof input === "string" ? input : input.url;
    const newURL = proxify(oldURL);

    // Add JWT header if we have one
    if (capturedJWT) {
      if (!init.headers) {
        init.headers = {};
      }
      
      // Handle both Headers object and plain object
      if (init.headers instanceof Headers) {
        init.headers.set('X-TRIP-TOKEN', capturedJWT);
      } else if (typeof init.headers === 'object') {
        init.headers['X-TRIP-TOKEN'] = capturedJWT;
      }
    }

    console.log("fetch  →", oldURL, "⇒", newURL);      // debug
    const patched = typeof input === "string" ? newURL
                                              : new Request(newURL, input);
    
    // Intercept responses to capture JWT
    return origFetch.call(this, patched, init).then(response => {
      // Capture JWT from bootstrap
      if (oldURL.includes('/api/bootstrap')) {
        response.clone().json().then(data => {
          if (data.jwt) {
            capturedJWT = data.jwt;
            console.log("JWT captured from bootstrap response");
          }
        }).catch(() => {});
      }
      
      // Capture JWT from Discord endpoints
      if ((oldURL.includes('/api/discord/exchange') || 
           oldURL.includes('/api/discord/create') || 
           oldURL.includes('/api/discord/fuse')) && 
          response.ok) {
        response.clone().json().then(data => {
          if (data.jwt) {
            capturedJWT = data.jwt;
            console.log("JWT captured from Discord endpoint:", oldURL);
            
            // Trigger Unity Bootstrap refresh
            if (window.unityInstance) {
              console.log("Triggering Unity Bootstrap refresh with new JWT");
              window.unityInstance.SendMessage("PlayerInstance", "Bootstrap");
            }
          }
        }).catch(() => {});
      }
      
      // Clear JWT on logout
      if (oldURL.includes('/api/logout') && response.ok) {
        capturedJWT = null;
        console.log("JWT cleared after logout");
      }
      return response;
    });
  };

  /* ---------- patch XHR -------------------------------------------- */
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function (m, url, ...rest) {
    // Store the URL for later use in send
    this._requestURL = url;
    
    const newURL = proxify(url);
    console.log("XHR    →", url, "⇒", newURL);         // debug
    return origOpen.call(this, m, newURL, ...rest);
  };
  
  XMLHttpRequest.prototype.send = function(...args) {
    // Add JWT header if we have one
    if (capturedJWT) {
      this.setRequestHeader('X-TRIP-TOKEN', capturedJWT);
    }

    // Intercept bootstrap response to capture JWT
    if (this._requestURL && this._requestURL.includes('/api/bootstrap')) {
      this.addEventListener('load', function() {
        try {
          const data = JSON.parse(this.responseText);
          if (data.jwt) {
            capturedJWT = data.jwt;
            console.log("JWT captured from bootstrap XHR response");
          }
        } catch (e) {}
      });
    }

    // Inject preferred_region for multiplayer match requests
    if (this._requestURL && this._requestURL.includes('/multiplayer/match') && args[0]) {
      try {
        let regionSetting = localStorage.getItem('game_settings_region-v2') || '"auto"';
        // Parse JSON string (localStorage stores as JSON)
        try {
          regionSetting = JSON.parse(regionSetting);
        } catch (e) {
          // If not JSON, use as-is
        }

        // Only inject if not 'auto' (auto means use default backend selection)
        if (regionSetting !== 'auto' && typeof args[0] === 'string') {
          const requestData = JSON.parse(args[0]);
          requestData.preferred_region = regionSetting;

          console.log('[Region Override] Injecting preferred_region:', regionSetting);
          args[0] = JSON.stringify(requestData);
        }
      } catch (e) {
        console.error('[Region Override] Error injecting region preference:', e);
        // Continue with original args - no error thrown to caller
      }
    }

    return origSend.call(this, ...args);
  };
})();

(() => {
  if (!location.hostname.endsWith("discordsays.com")) return;

  const CLIENT_ID = location.hostname.split(".")[0];
  const OrigCtor = WebSocket.prototype.constructor;

  function PatchedWebSocket(url, protocols) {
    // Parse the original URL to extract components
    const urlObj = new URL(url);
    
    // Helper function to extract server number from hostname (e.g., "1" from "1.nyc.supertrip.land")
    function extractServerNumber(hostname) {
      const parts = hostname.split('.');
      const firstPart = parts[0];
      // Check if first part is a number (1-50)
      if (/^\d+$/.test(firstPart)) {
        const num = parseInt(firstPart);
        if (num >= 1 && num <= 50) {
          return num;
        }
      }
      return null;
    }
    
    // Handle main supertrip.land domain (for voting websocket)
    if (urlObj.hostname === "supertrip.land") {
      const port = urlObj.port ? `:${urlObj.port}` : '';
      const newUrl = 
        `wss://${CLIENT_ID}.discordsays.com${port}` +
        `/.proxy/supertripland/main` +
        urlObj.pathname + urlObj.search;
      console.log("WS ⇒", newUrl);
      return new OrigCtor(newUrl, protocols);
    }
    
    // Handle any *.nyc.supertrip.land subdomain
    if (urlObj.hostname.endsWith(".nyc.supertrip.land")) {
      const port = urlObj.port ? `:${urlObj.port}` : '';
      const serverNum = extractServerNumber(urlObj.hostname);
      const proxyPath = serverNum ? 
        `/.proxy/supertripland/nyc/${serverNum}` : 
        `/.proxy/supertripland/nyc`;
      const newUrl = `wss://${CLIENT_ID}.discordsays.com${port}${proxyPath}${urlObj.pathname}${urlObj.search}`;
      console.log("WS ⇒", newUrl);
      return new OrigCtor(newUrl, protocols);
    }
    
    // Handle any *.sf.supertrip.land subdomain
    if (urlObj.hostname.endsWith(".sf.supertrip.land")) {
      const port = urlObj.port ? `:${urlObj.port}` : '';
      const serverNum = extractServerNumber(urlObj.hostname);
      const proxyPath = serverNum ? 
        `/.proxy/supertripland/sf/${serverNum}` : 
        `/.proxy/supertripland/sf`;
      const newUrl = `wss://${CLIENT_ID}.discordsays.com${port}${proxyPath}${urlObj.pathname}${urlObj.search}`;
      console.log("WS ⇒", newUrl);
      return new OrigCtor(newUrl, protocols);
    }
    
    // Handle any *.frankfurt.supertrip.land subdomain
    if (urlObj.hostname.endsWith(".frankfurt.supertrip.land")) {
      const port = urlObj.port ? `:${urlObj.port}` : '';
      const serverNum = extractServerNumber(urlObj.hostname);
      const proxyPath = serverNum ? 
        `/.proxy/supertripland/frankfurt/${serverNum}` : 
        `/.proxy/supertripland/frankfurt`;
      const newUrl = `wss://${CLIENT_ID}.discordsays.com${port}${proxyPath}${urlObj.pathname}${urlObj.search}`;
      console.log("WS ⇒", newUrl);
      return new OrigCtor(newUrl, protocols);
    }
    
    // Handle any *.singapore.supertrip.land subdomain
    if (urlObj.hostname.endsWith(".singapore.supertrip.land")) {
      const port = urlObj.port ? `:${urlObj.port}` : '';
      const serverNum = extractServerNumber(urlObj.hostname);
      const proxyPath = serverNum ? 
        `/.proxy/supertripland/singapore/${serverNum}` : 
        `/.proxy/supertripland/singapore`;
      const newUrl = `wss://${CLIENT_ID}.discordsays.com${port}${proxyPath}${urlObj.pathname}${urlObj.search}`;
      console.log("WS ⇒", newUrl);
      return new OrigCtor(newUrl, protocols);
    }

    if (urlObj.hostname.endsWith("floatie.supertrip.land")) {
      const port = urlObj.port ? `:${urlObj.port}` : '';
      const proxyPath = `/.proxy/supertripland/floatie`;
      const newUrl = `wss://${CLIENT_ID}.discordsays.com${port}${proxyPath}${urlObj.pathname}${urlObj.search}`;
      console.log("WS ⇒", newUrl);
      return new OrigCtor(newUrl, protocols);
    }
    
    return new OrigCtor(url, protocols);
  }

  PatchedWebSocket.prototype = WebSocket.prototype;
  window.WebSocket = PatchedWebSocket;
})();






  
// Enhanced itch.io/itch.zone auth patch (handles third-party cookie blocking)
(() => {
    if (!location.hostname.includes('itch.io') && !location.hostname.includes('itch.zone')) return;
    
    let capturedJWT = null;
    
    /* ---------- patch fetch ------------------------------------------ */
    const origFetch = window.fetch;
    window.fetch = (url, init = {}) => {
        // Add JWT header if we have one (only for API calls, not bundles/assets)
        if (url.toString().includes('supertrip.land') && url.toString().includes('/api/') && capturedJWT) {
            init.headers = init.headers || {};
            init.headers['X-TRIP-TOKEN'] = capturedJWT;
        }
        
        // Ensure credentials are included for API calls (but not for bundle/asset requests)
        if (url.toString().includes('supertrip.land') && url.toString().includes('/api/')) {
            init.credentials = 'include';
        }
        
        // Intercept responses to capture JWT
        return origFetch(url, init).then(response => {
            const urlStr = url.toString();
            
            // Capture JWT from bootstrap
            if (urlStr.includes('/api/bootstrap')) {
                response.clone().json().then(data => {
                    if (data.jwt) {
                        capturedJWT = data.jwt;
                        console.log('[Itch Auth] JWT captured from bootstrap');
                    }
                }).catch(() => {});
            }
            
            // Clear JWT on logout
            if (urlStr.includes('/api/logout') && response.ok) {
                capturedJWT = null;
                console.log('[Itch Auth] JWT cleared after logout');
            }
            
            return response;
        });
    };
    
    /* ---------- patch XHR -------------------------------------------- */
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        // Store the URL for later use in send
        this._requestURL = url;
        
        // Set withCredentials for API requests (not bundles/assets)
        if (url.toString().includes('supertrip.land') && url.toString().includes('/api/')) {
            this.withCredentials = true;
        }
        
        return origOpen.call(this, method, url, ...rest);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
        // Add JWT header if we have one (only for API calls)
        if (this._requestURL && this._requestURL.includes('supertrip.land') && this._requestURL.includes('/api/') && capturedJWT) {
            this.setRequestHeader('X-TRIP-TOKEN', capturedJWT);
        }
        
        // Intercept bootstrap response to capture JWT
        if (this._requestURL && this._requestURL.includes('/api/bootstrap')) {
            this.addEventListener('load', function() {
                try {
                    const data = JSON.parse(this.responseText);
                    if (data.jwt) {
                        capturedJWT = data.jwt;
                        console.log('[Itch Auth] JWT captured from bootstrap XHR response');
                    }
                } catch (e) {}
            });
        }
        
        // Clear JWT on logout
        if (this._requestURL && this._requestURL.includes('/api/logout')) {
            this.addEventListener('load', function() {
                if (this.status === 200) {
                    capturedJWT = null;
                    console.log('[Itch Auth] JWT cleared after logout');
                }
            });
        }
        
        return origSend.call(this, ...args);
    };
})();

// CrazyGames auth patch (handles SDK authentication and cookie blocking)
(() => {
    if (!location.hostname.includes('crazygames.com')) return;

    console.log('[CrazyGames] Detected CrazyGames environment');

    // Set laptop controls as default for new CrazyGames users (if they haven't set bindings yet)
    if (!localStorage.getItem('game_settings_keyBindingsV3')) {
        localStorage.setItem('game_settings_default_preset', 'laptop');
        console.log('[CrazyGames] Set default controls preset to laptop for new user');
    }

    // Global variable for party follow feature (accessible from Region Preference Interceptor)
    window.followLeaderUuid = null;

    // Create debug panel
    let debugPanel;
    const debugLines = [];

    function addDebugLine(message) {
        const timestamp = new Date().toLocaleTimeString();
        debugLines.push(`[${timestamp}] ${message}`);
        // Keep only last 20 lines
        if (debugLines.length > 20) {
            debugLines.shift();
        }
        updateDebugPanel();
    }
    
    function updateDebugPanel() {
        // Debug panel disabled - no longer needed
        return;
    }
    
    // Initialize debug panel after page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addDebugLine('CrazyGames environment detected');
            addDebugLine(`Host: ${location.hostname}`);
            addDebugLine(`URL: ${location.href}`);
        });
    } else {
        addDebugLine('CrazyGames environment detected');
        addDebugLine(`Host: ${location.hostname}`);
        addDebugLine(`URL: ${location.href}`);
    }
    
    let capturedCGJWT = null;
    
    // Initialize CrazyGames SDK
    async function initCrazyGames() {
        console.log('[CrazyGames] Initializing SDK...');
        addDebugLine('Starting SDK initialization...');
        
        // Add SDK script if not already loaded
        if (!window.CrazyGames) {
            console.log('[CrazyGames] Loading SDK script...');
            addDebugLine('Loading SDK script from CDN...');
            const script = document.createElement('script');
            script.src = 'https://sdk.crazygames.com/crazygames-sdk-v3.js';
            document.head.appendChild(script);
            
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                setTimeout(() => reject(new Error('SDK load timeout')), 10000);
            }).catch(error => {
                console.error('[CrazyGames] Failed to load SDK:', error);
                addDebugLine('❌ Failed to load SDK: ' + error.message);
                return;
            });
            addDebugLine('✅ SDK script loaded');
        }
        
        // Initialize SDK
        try {
            console.log('[CrazyGames] SDK loaded, initializing...');
            addDebugLine('Calling CrazyGames.SDK.init()...');
            await window.CrazyGames.SDK.init();
            console.log('[CrazyGames] SDK initialized successfully');
            addDebugLine('✅ SDK initialized successfully');

            // Check for leaderId in invite params (party follow feature)
            try {
                const leaderId = window.CrazyGames.SDK.game.getInviteParam('leaderId');
                if (leaderId) {
                    window.followLeaderUuid = leaderId;
                    console.log('[CrazyGames] Following leader:', leaderId);
                    addDebugLine(`👥 Following leader: ${leaderId}`);
                }
            } catch (e) {
                console.log('[CrazyGames] No leaderId in invite params');
            }

            // Start loading tracking for CrazyGames
            try {
                window.CrazyGames.SDK.game.loadingStart();
                console.log('[CrazyGames] loadingStart event sent');
                addDebugLine('📊 Loading tracking started');
            } catch (error) {
                console.error('[CrazyGames] Failed to send loadingStart:', error);
            }
            
            // Get initial user state
            addDebugLine('Checking initial user state...');
            try {
                const user = await window.CrazyGames.SDK.user.getUser();
                if (user) {
                    addDebugLine(`✅ User already logged in: ${user.username || user.id}`);
                    // Start auth flow immediately if user exists
                    startCrazyGamesAuthFlow();
                } else {
                    addDebugLine('⚠️ No user logged in initially');
                }
            } catch (error) {
                addDebugLine('❌ Error getting initial user: ' + error.message);
            }
            
            // Add auth listener for future logins
            addDebugLine('Setting up auth state listener...');
            window.CrazyGames.SDK.user.addAuthListener((user) => {
                console.log('[CrazyGames] Auth listener triggered:', user);
                addDebugLine(`🔄 Auth state changed: ${user ? 'logged in' : 'logged out'}`);

                if (user) {
                    addDebugLine(`User logged in: ${user.username || user.id}`);
                    // Start auth flow - DON'T clear JWT yet, we need it to preserve TTL player progress!
                    // The JWT will be replaced after successful exchange
                    startCrazyGamesAuthFlow();
                } else {
                    // Only clear JWT on logout, not login
                    capturedCGJWT = null;
                    addDebugLine('User logged out, JWT cleared');
                    // Trigger Bootstrap for guest account
                    if (window.unityInstance) {
                        console.log('[CrazyGames] Triggering Bootstrap for guest account');
                        addDebugLine('🔄 Switching to guest account...');
                        window.unityInstance.SendMessage("PlayerInstance", "Bootstrap");
                    }
                }
            });
        } catch (error) {
            console.error('[CrazyGames] SDK initialization failed:', error);
            addDebugLine('❌ SDK init failed: ' + error.message);
        }
    }
    
    // Auth flow - simplified based on SDK v3 docs
    async function startCrazyGamesAuthFlow() {
        console.log('[CrazyGames] Starting auth flow...');
        addDebugLine('🔐 Starting auth flow...');
        
        try {
            // According to docs, we should just call getUser() and getUserToken()
            // No need for isUserAccountAvailable check
            
            // 1. Get user (should already be logged in at this point)
            addDebugLine('Getting current user...');
            const user = await window.CrazyGames.SDK.user.getUser();
            
            if (!user) {
                addDebugLine('⚠️ No user logged in');
                // According to docs, we can show auth prompt if needed
                addDebugLine('Showing auth prompt...');
                try {
                    await window.CrazyGames.SDK.user.showAuthPrompt();
                    addDebugLine('Auth prompt shown');
                } catch (e) {
                    addDebugLine('❌ Auth prompt error: ' + e.message);
                }
                return;
            }
            
            addDebugLine(`✅ User found: ${user.username || 'Unknown'}`);
            addDebugLine(`User ID: ${user.id || user.userId || 'Unknown'}`);
            
            // 2. Get user token (SDK handles refresh, 1-hour lifetime)
            addDebugLine('Getting user token...');
            try {
                const token = await window.CrazyGames.SDK.user.getUserToken();
                
                if (!token) {
                    addDebugLine('❌ No token returned');
                    return;
                }
                
                addDebugLine(`✅ Got token (length: ${token.length})`);
                
                // 3. Exchange with our backend
                await handleCrazyGamesToken(token);
                
            } catch (error) {
                addDebugLine(`❌ Token error: ${error.message}`);
                // Log full error for debugging
                console.error('Full token error:', error);
            }
            
        } catch (error) {
            addDebugLine(`❌ Auth flow error: ${error.message}`);
            console.error('Full auth error:', error);
            
            // Debug: Check what's available in the SDK
            try {
                if (window.CrazyGames?.SDK) {
                    addDebugLine('Debugging SDK structure:');
                    addDebugLine(`SDK keys: ${Object.keys(window.CrazyGames.SDK).join(', ')}`);
                    if (window.CrazyGames.SDK.user) {
                        addDebugLine(`User methods: ${Object.keys(window.CrazyGames.SDK.user).join(', ')}`);
                    }
                }
            } catch (e) {
                addDebugLine('Could not inspect SDK');
            }
        }
    }
    
    // Handle token exchange
    async function handleCrazyGamesToken(token) {
        console.log('[CrazyGames] Exchanging token with backend...');
        addDebugLine('🔄 Exchanging token with backend...');
        addDebugLine(`URL: https://supertrip.land/api/crazygames/exchange`);
        
        try {
            const headers = {
                'Content-Type': 'application/json',
                ...(capturedCGJWT && { 'X-TRIP-TOKEN': capturedCGJWT })
            };
            
            addDebugLine(`Headers: ${JSON.stringify(Object.keys(headers))}`);
            if (capturedCGJWT) {
                addDebugLine('✅ Including existing JWT in X-TRIP-TOKEN');
            }
            
            const response = await fetch('https://supertrip.land/api/crazygames/exchange', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ token })
            });
            
            addDebugLine(`Response status: ${response.status}`);
            
            if (!response.ok) {
                console.error('[CrazyGames] Exchange failed:', response.status);
                const errorText = await response.text();
                console.error('[CrazyGames] Error response:', errorText);
                addDebugLine(`❌ Exchange failed: ${response.status}`);
                addDebugLine(`Error: ${errorText}`);
                return;
            }
            
            const data = await response.json();
            console.log('[CrazyGames] Exchange successful');
            addDebugLine('✅ Exchange successful');
            
            if (data.jwt) {
                capturedCGJWT = data.jwt;
                console.log('[CrazyGames] JWT captured, player:', data.player?.username);
                addDebugLine(`✅ JWT captured`);
                addDebugLine(`Player: ${data.player?.username || 'Unknown'}`);
                addDebugLine(`UUID: ${data.player?.uuid || 'Unknown'}`);

                // Store player UUID globally for party invite feature
                if (data.player?.uuid) {
                    window.localPlayerUuid = data.player.uuid;
                    console.log('[CrazyGames] Stored localPlayerUuid:', window.localPlayerUuid);
                }
                
                // Trigger Unity Bootstrap
                if (window.unityInstance) {
                    console.log('[CrazyGames] Triggering Unity Bootstrap refresh...');
                    addDebugLine('🔄 Triggering Unity Bootstrap...');
                    window.unityInstance.SendMessage("PlayerInstance", "Bootstrap");
                } else {
                    addDebugLine('⚠️ Unity instance not ready yet');
                }
            } else {
                addDebugLine('⚠️ No JWT in response');
            }
        } catch (error) {
            console.error('[CrazyGames] Exchange error:', error);
            addDebugLine('❌ Exchange error: ' + error.message);
        }
    }
    
    // Patch fetch to include JWT
    addDebugLine('📌 Patching window.fetch for JWT injection');
    const origFetch = window.fetch;
    window.fetch = (url, init = {}) => {
        const urlStr = url.toString();
        
        // Add JWT header for API calls
        if (urlStr.includes('/api/') && capturedCGJWT) {
            init.headers = init.headers || {};
            init.headers['X-TRIP-TOKEN'] = capturedCGJWT;
        }
        
        // Ensure credentials are included for API calls
        if (urlStr.includes('/api/')) {
            init.credentials = 'include';
        }
        
        // Intercept responses
        return origFetch(url, init).then(response => {
            // Capture JWT from bootstrap
            if (urlStr.includes('/api/bootstrap')) {
                response.clone().json().then(data => {
                    if (data.jwt) {
                        capturedCGJWT = data.jwt;
                        console.log('[CrazyGames] JWT captured from bootstrap');
                    }
                }).catch(() => {});
            }
            
            // Capture JWT from CrazyGames exchange
            if (urlStr.includes('/api/crazygames/exchange') && response.ok) {
                response.clone().json().then(data => {
                    if (data.jwt) {
                        capturedCGJWT = data.jwt;
                        console.log('[CrazyGames] JWT captured from exchange');
                        
                        // Trigger Unity Bootstrap after successful exchange
                        if (window.unityInstance) {
                            console.log('[CrazyGames] Triggering Unity Bootstrap after exchange');
                            window.unityInstance.SendMessage("PlayerInstance", "Bootstrap");
                        }
                    }
                }).catch(() => {});
            }
            
            // Clear JWT on logout
            if (urlStr.includes('/api/logout') && response.ok) {
                capturedCGJWT = null;
                console.log('[CrazyGames] JWT cleared after logout');
            }
            
            return response;
        });
    };
    
    // Patch XHR
    addDebugLine('📌 Patching XMLHttpRequest for JWT injection');
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._requestURL = url;
        
        // Set withCredentials for API requests
        if (url.toString().includes('/api/')) {
            this.withCredentials = true;
        }
        
        return origOpen.call(this, method, url, ...rest);
    };
    
    XMLHttpRequest.prototype.send = function(...args) {
        // Add JWT header
        if (this._requestURL && this._requestURL.includes('/api/') && capturedCGJWT) {
            this.setRequestHeader('X-TRIP-TOKEN', capturedCGJWT);
        }
        
        // Intercept bootstrap response
        if (this._requestURL && this._requestURL.includes('/api/bootstrap')) {
            this.addEventListener('load', function() {
                try {
                    const data = JSON.parse(this.responseText);
                    if (data.jwt) {
                        capturedCGJWT = data.jwt;
                        console.log('[CrazyGames] JWT captured from bootstrap XHR');
                    }
                } catch (e) {}
            });
        }
        
        // Clear JWT on logout
        if (this._requestURL && this._requestURL.includes('/api/logout')) {
            this.addEventListener('load', function() {
                if (this.status === 200) {
                    capturedCGJWT = null;
                    console.log('[CrazyGames] JWT cleared after logout XHR');
                }
            });
        }
        
        return origSend.call(this, ...args);
    };
    
    // Expose functions for debug panel
    window.startCrazyGamesAuthFlow = startCrazyGamesAuthFlow;
    window.capturedCGJWT = capturedCGJWT;
    
    // Start initialization
    initCrazyGames();
    
    // Listen for custom event from React to trigger CrazyGames login
    window.addEventListener('crazyGamesLogin', function() {
        console.log('[production-unity-bootup.crazyGamesLogin] 🎯 EVENT RECEIVED from React!');
        console.log('[production-unity-bootup.crazyGamesLogin] Checking SDK availability...');
        console.log('[production-unity-bootup.crazyGamesLogin] window.CrazyGames:', window.CrazyGames);
        console.log('[production-unity-bootup.crazyGamesLogin] window.CrazyGames?.SDK:', window.CrazyGames?.SDK);
        console.log('[production-unity-bootup.crazyGamesLogin] window.CrazyGames?.SDK?.user:', window.CrazyGames?.SDK?.user);
        console.log('[production-unity-bootup.crazyGamesLogin] showAuthPrompt exists?:', !!window.CrazyGames?.SDK?.user?.showAuthPrompt);
        
        if (window.CrazyGames?.SDK?.user?.showAuthPrompt) {
            console.log('[production-unity-bootup.crazyGamesLogin] ✅ SDK AVAILABLE - Calling showAuthPrompt NOW');
            try {
                window.CrazyGames.SDK.user.showAuthPrompt();
                console.log('[production-unity-bootup.crazyGamesLogin] ✅ showAuthPrompt called successfully!');
            } catch (error) {
                console.error('[production-unity-bootup.crazyGamesLogin] ❌ Error calling showAuthPrompt:', error);
            }
        } else {
            console.error('[production-unity-bootup.crazyGamesLogin] ❌ SDK NOT AVAILABLE');
            console.error('[production-unity-bootup.crazyGamesLogin] This should not happen - SDK should be initialized by now');
        }
    });
})();

// Unity loading removed - handled by react-unity-webgl
// Keep DPI functions for compatibility
function SetDPI_HIGH_6db73a85728a(){
   // window.unityInstance.Module.devicePixelRatio = 1;
}
   
function SetDPI_Low_b90b5cdf7ec1d1(){
   // window.unityInstance.Module.devicePixelRatio = 1;
}
  
const loadingPhrases = [
    // Original ones
    "Downloading Homescreen...",
    "Dressing your Trippie...", 
    "Undressing your Trippie...",
    "Turning on the lights and camera...",
    "Doing mic check...",
    "Locating your Trippie...",
    "Waking up GuavaGuy...",
    "Calling SuperTrip...",
    "Teaching Trippie to dance...",
    "Mixing some beats...",
    "Polishing your gun...",
    "Loading combat systems...",
    "Checking the ammo count...",
    "Powering up shields...",
    "Calibrating aim assist...",
    "Loading player stats...",
    "Initializing game world...",
    "Loading weapon systems...",
    "Summoning Floaties...",
    "Scanning for targets...",
    "Booting main systems...",
    "Preparing for action...",
    "Running final checks...",
    "Loading game assets...",
    "Generating world...",
    "Syncing player data...",
    "Starting up SuperTripLand..."
];

// Special phrases for when we're at 100% but downloading bundles
const postLoadingPhrases = [
    "Hang tight!",
    "Almost there!",
    "Downloading maps...",
    "Loading game world...",
    "Preparing your adventure...",
    "Just a moment more...",
    "Finalizing setup...",
    "Getting everything ready...",
    "One more second...",
    "Loading the fun stuff...",
    "Warming up the servers...",
    "Almost ready to play!"
];
  
let phraseInterval;
let isShuffling = false;
let usedPhrases = new Set();
let currentPhrases = [...loadingPhrases];
let usePostLoadingPhrases = false;

function startPhraseShuffle() {
    isShuffling = true;
    // When we reach 100%, switch to post-loading phrases
    usePostLoadingPhrases = true;
    currentPhrases = [...postLoadingPhrases];
    
    function shuffle() {
        if (isShuffling) {
            const loadingStatus = document.querySelector("#loading-status");
            const phrasesToUse = usePostLoadingPhrases ? postLoadingPhrases : loadingPhrases;
            
            if (currentPhrases.length === 0) {
                currentPhrases = [...phrasesToUse];
            }
            const randomIndex = Math.floor(Math.random() * currentPhrases.length);
            const phrase = currentPhrases[randomIndex];
            currentPhrases.splice(randomIndex, 1);
            if (loadingStatus) loadingStatus.textContent = phrase;
            const randomInterval = Math.floor(Math.random() * 1000) + 1000;
            phraseInterval = setTimeout(shuffle, randomInterval);
        }
    }
    shuffle();
}

window.stopPhraseShuffle = () => {
    isShuffling = false;
    clearTimeout(phraseInterval);
    currentPhrases = [...loadingPhrases]; // Reset the working copy when stopped
    usePostLoadingPhrases = false; // Reset the flag
};

// Global Tab key prevention and focus management
document.addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    // Check if ANY modal is open
    const anyModalOpen = document.querySelector('[role="dialog"][data-state="open"]') ||
                          document.querySelector('[data-auth-modal="true"]');

    // Only prevent Tab when NO modal is open (playing game)
    if (!anyModalOpen) {
      e.preventDefault();

      // Keep focus on Unity canvas
      const unityCanvas = document.getElementById('unity-canvas');
      if (unityCanvas && document.activeElement !== unityCanvas) {
        unityCanvas.focus();
      }
      return false;
    }
    // Modal is open - allow normal Tab behavior
  }
}, true);

/*
// Prevent any focus changes when game is active
document.addEventListener('focusin', function(e) {
  if (document.pointerLockElement) {
    const unityCanvas = document.getElementById('unity-canvas');
    // If something other than Unity canvas is trying to get focus while playing
    if (unityCanvas && e.target !== unityCanvas) {
      e.preventDefault();
      e.stopPropagation();
      unityCanvas.focus();
    }
  }
}, true);
*/

// Unity loading handled by react-unity-webgl

// Store the original React-defined triggerAnimation
let reactTriggerAnimation = null;

// This wrapper will be called by Unity when ready
const setupTriggerAnimation = () => {
    const originalFunc = window.triggerAnimation;

    window.triggerAnimation = () => {
        console.log('[Unity] triggerAnimation called by Unity - game is ready');

        // Call React's version to hide loading screen
        if (originalFunc) {
            originalFunc();
        }

        // Hide tournament waiting room if active
        if (window.hideWaitingRoom) {
            window.hideWaitingRoom();
        }

        // Send loadingStop to CrazyGames
        if (window.CrazyGames?.SDK?.game) {
            try {
                window.CrazyGames.SDK.game.loadingStop();
                console.log('[CrazyGames] loadingStop event sent - Game ready!');
            } catch (error) {
                console.error('[CrazyGames] Failed to send loadingStop:', error);
            }
        }
    };
};

// Set up the wrapper after a short delay to ensure React has defined its version
setTimeout(setupTriggerAnimation, 1000);

// Haptic functions
const hapticInput = document.createElement('input');
hapticInput.type = 'checkbox';
hapticInput.setAttribute('switch', '');
hapticInput.id = 'unity-haptic';
hapticInput.style.display = 'none';
document.body.appendChild(hapticInput);

const hapticLabel = document.createElement('label');
hapticLabel.htmlFor = 'unity-haptic';
hapticLabel.style.display = 'none';
document.body.appendChild(hapticLabel);

const isIOSDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);

window.triggerHaptic = function(count, duration) {
  count = count || 1;
  duration = duration || 100;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      if (isIOSDevice) {
        hapticLabel.click();
      } else if (navigator.vibrate) {
        navigator.vibrate(duration);
      }
    }, i * (duration + 50));
  }
};

// ===========================
// Region Preference + Party Follow Interceptor (Global - Unity uses FETCH API)
// ===========================
(() => {
  const originalFetch = window.fetch;

  // Helper to show matchmaking error toast (uses sonner via window.showToast from React)
  function showMatchError(message) {
    if (window.showToast && typeof window.showToast.error === 'function') {
      window.showToast.error(message, { duration: 4000 });
    } else {
      console.warn('[Match Interceptor] Toast not available:', message);
    }
  }

  window.fetch = function(input, init = {}) {
    const url = typeof input === 'string' ? input : input.url;
    const isMatchRequest = url && url.includes('/multiplayer/match');

    // Inject preferred_region, follow_leader, and instant_multiplayer for multiplayer match requests
    if (isMatchRequest && init && init.body) {
      try {
        // Check if we have anything to inject
        let regionSetting = localStorage.getItem('game_settings_region-v2');
        let needsRegion = false;
        if (regionSetting) {
          regionSetting = JSON.parse(regionSetting);
          needsRegion = regionSetting !== 'auto';
        }
        const needsFollowLeader = !!window.followLeaderUuid;
        const needsInstantMultiplayer = !!window.isInstantMultiplayerMode;

        // Only modify if we have something to inject
        if ((needsRegion || needsFollowLeader || needsInstantMultiplayer) && init.body instanceof Blob) {
          // Handle Blob body asynchronously
          return init.body.text().then(text => {
            const bodyData = JSON.parse(text);

            // Inject region if set and not auto
            if (needsRegion) {
              bodyData.preferred_region = regionSetting;
              console.log('[Match Interceptor] Injected region:', regionSetting);
            }

            // Inject follow_leader if set (party feature)
            if (needsFollowLeader) {
              bodyData.follow_leader = window.followLeaderUuid;
              console.log('[Match Interceptor] Injected follow_leader:', window.followLeaderUuid);
            }

            // Inject instant_multiplayer ONLY if:
            // - We're in instant multiplayer mode
            // - NOT following someone (they handle creating the unlisted match)
            // - NOT joining a specific match code
            if (needsInstantMultiplayer && !needsFollowLeader && !bodyData.match_code) {
              bodyData.instant_multiplayer = true;
              console.log('[Match Interceptor] Injected instant_multiplayer: true (leader creating unlisted match)');
            }

            init.body = new Blob([JSON.stringify(bodyData)], { type: 'application/json' });
            return originalFetch.call(this, input, init).then(response => {
              // Check for match errors and notices
              response.clone().json().then(data => {
                if (!response.ok && data.error) {
                  showMatchError(data.error);
                } else if (response.ok && data.notice === 'matchNotFound') {
                  showMatchError('Match not found. Joining a new match...');
                }
              }).catch(() => {});
              return response;
            });
          }).catch(e => {
            console.error('[Match Interceptor] Error:', e);
            return originalFetch.call(this, input, init);
          });
        }
      } catch (e) {
        console.error('[Match Interceptor] Error:', e);
      }
    }

    // For match requests without body modification, still check response for errors/notices
    const result = originalFetch.call(this, input, init);
    if (isMatchRequest) {
      return result.then(response => {
        response.clone().json().then(data => {
          if (!response.ok && data.error) {
            showMatchError(data.error);
          } else if (response.ok && data.notice === 'matchNotFound') {
            showMatchError('Match not found. Joining a new match...');
          }
        }).catch(() => {});
        return response;
      });
    }

    // Quest claim success - trigger CrazyGames HappyTime celebration
    const isQuestClaim = url && url.includes('/api/quests/claim');
    if (isQuestClaim) {
      return result.then(response => {
        if (response.ok && typeof window.CrazyGamesHappyTime === 'function') {
          console.log('[Quest Interceptor] Quest claimed successfully - triggering HappyTime!');
          window.CrazyGamesHappyTime();
        }
        return response;
      });
    }

    return result;
  };

  console.log('[Match Interceptor] Fetch interceptor active (region + party follow + error toasts + quest claims)');
})();
