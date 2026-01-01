let deferredPrompt;

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    // Save the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button to the user
    const installButton = document.getElementById('install-btn');
    installButton.style.display = 'block';
});

function requestInstallableCheck(){
    if(deferredPrompt){
        window.unityInstance.SendMessage("PWA Install Listener", "IsInstallableCallback", 1);
        return;
    }
    window.unityInstance.SendMessage("PWA Install Listener", "IsInstallableCallback", 0);
}

async function installPWARequest(){
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
    }
}

/* ---------- 1.  POINTER-LOCK  ---------- */
window.requestPointerLock = function requestPointerLock () {
  const el = document.documentElement;
  el.requestPointerLock?.({ unadjustedMovement: true })    // Chrome / Firefox
     ?? el.webkitRequestPointerLock?.()                    // Old WebKit
     ?? console.warn('Pointer-lock not supported');
};

window.requestPointerUnlock = function requestPointerUnlock () {
  if (document.pointerLockElement) {
    document.exitPointerLock?.() ||
    document.webkitExitPointerLock?.();
  }
};

/* ---------- 2.  FULLSCREEN + ESC-LOCK  ---------- */
window.requestFullScreenLock = function requestFullScreenLock () {
  const el = document.documentElement;

  el.requestFullscreen?.({ navigationUI: 'hide' }) ||
  el.webkitRequestFullscreen?.();

  /* lock Esc if the API exists (Chrome / Edge) */
  navigator.keyboard?.lock?.(['Escape']).catch(()=>{});
};

window.requestFullscreenUnlock = function requestFullscreenUnlock () {
  if (document.fullscreenElement) {
    document.exitFullscreen?.() ||
    document.webkitExitFullscreen?.();
  }
  navigator.keyboard?.unlock?.();
};

window.requestPointerLockAndFullscreen = function requestPointerLockAndFullscreen () {
  const el = document.documentElement;

  /* 1️⃣  ask for pointer-lock (uses activation, does NOT consume it) */
  const lockSucceeded =
        el.requestPointerLock?.({ unadjustedMovement:true }) ||
        el.webkitRequestPointerLock?.();

  if (!lockSucceeded) {
    console.warn('Pointer-lock not supported');
    return;
  }

  /* 2️⃣  when the lock is confirmed (same JS task), go fullscreen + lock Esc */
  const once = () => {
    document.removeEventListener('pointerlockchange', once);

    (el.requestFullscreen?.({ navigationUI:'hide' }) ||
     el.webkitRequestFullscreen?.());

    /* Esc lock is best-effort (only Chrome / Edge implement it) */
    navigator.keyboard?.lock?.(['Escape']).catch(()=>{});
  };

  document.addEventListener('pointerlockchange', once, { once:true });
};

function shouldAskForNotifs(){
    if ('Notification' in window && navigator.serviceWorker) {
        const permission = Notification.permission;
        if(permission == 'default'){
          return true;
        }
    }
    return false;
}

function getSafeAreaInsets() {
    const style = getComputedStyle(document.documentElement);
    const topInset = parseFloat(style.getPropertyValue('--safe-area-inset-top')) || 0;
    const bottomInset = parseFloat(style.getPropertyValue('--safe-area-inset-bottom')) || 0;
    const leftInset = parseFloat(style.getPropertyValue('--safe-area-inset-left')) || 0;
    const rightInset = parseFloat(style.getPropertyValue('--safe-area-inset-right')) || 0;
    return {
        top: topInset,
        bottom: bottomInset,
        left: leftInset,
        right: rightInset
    };
}

function sendSafeAreaToUnity() {
    try {
        const safeAreaInsets = getSafeAreaInsets();
        const safeAreaJson = JSON.stringify(safeAreaInsets);
        if (window.unityInstance) {
        window.unityInstance.SendMessage("SafeAreaStatic", "UpdateSafeArea", safeAreaJson);
        } 
        else {
        console.warn('Unity instance not found. Cannot send safe area insets.');
        }
    } catch (error) {
        console.error('Error sending safe area to Unity:', error);
    }
}

// Function called from Unity to set the username for analytics
function SetAnalyticsUsername(username) {
    window.tripUsername = username;
    console.log("[Analytics] Username set:", username);
}

// Function called from Unity to set the auth token for analytics
function SetAnalyticsAuthToken(token) {
    window.tripAuthToken = token;
    console.log("[Analytics] Auth token set");
}

// Function called from Unity to set a signature for analytics events
function SetAnalyticsSignature(signature) {
    window.tripSignature = signature;
    console.log("[Analytics] Signature set");
}

// Register the functions to be callable from Unity
window.SetAnalyticsUsername = SetAnalyticsUsername;
window.SetAnalyticsAuthToken = SetAnalyticsAuthToken;
window.SetAnalyticsSignature = SetAnalyticsSignature;