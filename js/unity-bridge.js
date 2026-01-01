/**
 * Unity Bridge - Unified Communication Layer
 * Handles all communication between Unity WebGL and the React app
 * 
 * This consolidates all Unity bridge functionality into one file
 */

(function() {
  'use strict';

  // ===========================
  // Configuration
  // ===========================
  const CONFIG = { 
    storagePrefix: 'game_settings_'
  };

  // ===========================
  // Bridge State Management
  // ===========================
  window.UnityBridge = {
    // State tracking
    isReady: false,
    currentOverlay: null,
    callbacks: new Map(),
    pendingMessages: [],
    
    // Register a callback that Unity can call
    registerCallback: function(name, callback) {
      this.callbacks.set(name, callback);
      window[name] = callback;
    },
    
    // Send message to Unity (with queueing if Unity not ready)
    sendToUnity: function(objectName, methodName, data) {
      if (!window.unityInstance) {
        console.warn('Unity instance not ready, queuing message');
        this.pendingMessages.push({ objectName, methodName, data });
        return;
      }
      
      try {
        if (data !== undefined) {
          if (typeof data === 'object') {
            window.unityInstance.SendMessage(objectName, methodName, JSON.stringify(data));
          } else {
            window.unityInstance.SendMessage(objectName, methodName, data);
          }
        } else {
          window.unityInstance.SendMessage(objectName, methodName);
        }
      } catch (error) {
        console.error('Error sending message to Unity:', error);
      }
    },
    
    // Process pending messages when Unity is ready
    processPendingMessages: function() {
      while (this.pendingMessages.length > 0) {
        const msg = this.pendingMessages.shift();
        this.sendToUnity(msg.objectName, msg.methodName, msg.data);
      }
    },
    
    // Called when Unity is ready
    onUnityReady: function() {
      this.isReady = true;
      this.processPendingMessages();
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('unityReady', { detail: { instance: window.unityInstance } }));
      
      // Call original UnityReady if it exists
      if (typeof window.UnityReady === 'function') {
        window.UnityReady();
      }
    }
  };

  // ===========================
  // Settings Management
  // ===========================
  
  // Hidden settings that should not be accessed
  const HIDDEN_SETTINGS = [
    'general', 'video', 'audio_settings', 'audioDevice', 'audioQuality', 
    'spatialAudio', 'muteWhenInactive', 'startupSound', 'serverType', 
    'crossRegion', 'matchmakingPreferences', 'matchmakingPriority', 
    'lowLatencyMode', 'autoDeclineHighPing', 'difficulty', 'autoWeaponSwitch', 
    'teammateOutlines', 'pollingRate', 'rawInput', 'dpi', 'export', 
    'advanced_tab', 'meleeWeapon', 'useAbility', 'useUltimate', 'throwGrenade',
    'interact', 'voice', 'map', 'scoreboard', 'inventory', 'security', 
    'notifications', 'profile_membership', 'profile_logout', 'wallets_logout'
  ];

  // Default values for settings
  const DEFAULT_SETTINGS = {
    // General settings
    language: 'en',
    theme: 'dark',
    showFps: true,
    showNetworkStats: false,
    autoLogin: true,
    hardwareAcceleration: true,
    backgroundProcessing: false,
    
    // Mouse settings
    mouseSensitivity: 1.0,
    adsSensitivity: 1.0,
    scopedSensitivity: 0.75,
    invertY: false,
    mouseAcceleration: false,
    
    // Audio settings
    masterVolume: 80,
    musicVolume: 60,
    sfxVolume: 90,
    voiceChatVolume: 70,
    ambientVolume: 75,
    
    // Region settings
    region: 'nyc',
    'region-v2': 'auto',
    
    // Gameplay settings
    autoReload: true,
    toggleAds: false,
    crosshairStyle: 'default',
    crosshairSize: 2,
    dynamicCrosshair: true,
    hitMarker: true,
    damageNumbers: true,
    killFeed: true,
    hudScale: 100,
    sprintMode: 'hold',
    invinsibilityWhiteOverlay: false,

    // Key Bindings V2 (using Unity KeyCode numeric values)
    keyBindingsV2: {
      moveForward: 119,      // W
      moveBackward: 115,     // S
      moveLeft: 97,          // A
      moveRight: 100,        // D
      jump: 32,              // Space
      reload: 114,           // R
      sprint: 304,           // LeftShift
      slide: 101,            // E
      inspectWeapon: 102,    // F
      primaryWeapon: 49,     // 1
      secondaryWeapon: 50,   // 2
      knifeWeapon: 51,       // 3
      fire: 323,             // Mouse0
      aim: 324               // Mouse1
    }
  };

  // Helper functions
  function isHiddenSetting(settingName) {
    return HIDDEN_SETTINGS.includes(settingName);
  }

  function getTypedSettingValue(settingName, rawValue) {
    if (rawValue === null || rawValue === undefined) {
      return DEFAULT_SETTINGS[settingName];
    }
    
    try {
      const parsed = JSON.parse(rawValue);
      const defaultValue = DEFAULT_SETTINGS[settingName];
      if (defaultValue !== undefined) {
        if (typeof defaultValue === 'boolean') return Boolean(parsed);
        if (typeof defaultValue === 'number') return Number(parsed);
      }
      return parsed;
    } catch (e) {
      return rawValue;
    }
  }

  // ===========================
  // Navigation Functions
  // ===========================
  
  window.showSettings = function() {
    window.UnityBridge.currentOverlay = 'settings';
    // Use postMessage to communicate with React (same as before)
    window.postMessage({type: 'NAVIGATE', route: '/settings'}, '*');
  };

  window.showClans = function() {
    window.UnityBridge.currentOverlay = 'settings';
    // Navigate to settings with clans section
    window.postMessage({type: 'NAVIGATE', route: '/settings', section: 'clans'}, '*');
  };

  window.showReleaseLogs = function() {
    window.UnityBridge.currentOverlay = 'releasenotes';
    window.postMessage({type: 'NAVIGATE', route: '/release-notes'}, '*');
  };

  window.showLevelProgress = function() {
    window.UnityBridge.currentOverlay = 'levelprogress';
    window.postMessage({type: 'NAVIGATE', route: '/level-progress'}, '*');
  };

  window.hideOverlay = function() {
    const prevOverlay = window.UnityBridge.currentOverlay;
    window.UnityBridge.currentOverlay = null;
    
    // Navigate back to game
    window.postMessage({type: 'NAVIGATE', route: '/'}, '*');
    
    // Notify Unity of closure
    if (window.unityInstance) {
      if (prevOverlay === 'settings') {
        window.UnityBridge.sendToUnity('>>>JAVASCRIPT BRIDGE<<<', 'OnSettingsClosed');
      } else if (prevOverlay === 'releasenotes') {
        window.UnityBridge.sendToUnity('GameManager', 'OnReleaseNotesClosed');
      } else if (prevOverlay === 'levelprogress') {
        window.UnityBridge.sendToUnity('GameManager', 'OnLevelProgressClosed');
      }
    }
  };

  // Aliases for backwards compatibility
  window.hideSettings = window.hideOverlay;
  window.hideLevelProgress = window.hideOverlay;
  
  // Direct modal functions - show login/register without navigating to settings
  window.showSettingsLogin = function() {
    console.log('[unity-bridge.showSettingsLogin] Called from Unity!');
    console.log('[unity-bridge.showSettingsLogin] Hostname:', window.location.hostname);
    
    // On CrazyGames, trigger SDK auth directly
    if (window.location.hostname.includes('crazygames.com')) {
      console.log('[unity-bridge.showSettingsLogin] ON CRAZYGAMES - Triggering SDK auth!');
      if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.user && window.CrazyGames.SDK.user.showAuthPrompt) {
        window.CrazyGames.SDK.user.showAuthPrompt();
        console.log('[unity-bridge.showSettingsLogin] Called CrazyGames.SDK.user.showAuthPrompt()');
      } else {
        console.error('[unity-bridge.showSettingsLogin] CrazyGames SDK not available');
      }
      return; // Don't send the postMessage
    }
    
    // Not on CrazyGames - send normal postMessage
    console.log('[unity-bridge.showSettingsLogin] NOT on CrazyGames - Sending postMessage');
    window.postMessage({type: 'SHOW_AUTH_MODAL', modalType: 'login'}, '*');
  };
  
  window.showSettingsRegister = function() {
    console.log('[unity-bridge.showSettingsRegister] Called from Unity!');
    console.log('[unity-bridge.showSettingsRegister] Hostname:', window.location.hostname);

    // On CrazyGames, trigger SDK auth directly (same as login)
    if (window.location.hostname.includes('crazygames.com')) {
      console.log('[unity-bridge.showSettingsRegister] ON CRAZYGAMES - Triggering SDK auth!');
      if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.user && window.CrazyGames.SDK.user.showAuthPrompt) {
        window.CrazyGames.SDK.user.showAuthPrompt();
        console.log('[unity-bridge.showSettingsRegister] Called CrazyGames.SDK.user.showAuthPrompt()');
      } else {
        console.error('[unity-bridge.showSettingsRegister] CrazyGames SDK not available');
      }
      return; // Don't send the postMessage
    }

    // Not on CrazyGames - send normal postMessage
    console.log('[unity-bridge.showSettingsRegister] NOT on CrazyGames - Sending postMessage');
    window.postMessage({type: 'SHOW_AUTH_MODAL', modalType: 'register'}, '*');
  };

  // ===========================
  // Marketplace Modal Functions
  // ===========================

  window.showTransferModal = function(itemUuid) {
    console.log('[unity-bridge.showTransferModal] Called with UUID:', itemUuid);
    const message = {type: 'SHOW_MARKETPLACE_MODAL', modalType: 'transfer', itemUuid: itemUuid};
    console.log('[unity-bridge.showTransferModal] Sending message:', message);
    window.postMessage(message, window.location.origin);
  };

  window.showTransferModal2 = function() {
    console.log('[unity-bridge.showTransferModal2] Called without UUID (dropdown mode)');
    const message = {type: 'SHOW_MARKETPLACE_MODAL', modalType: 'transfer'};
    console.log('[unity-bridge.showTransferModal2] Sending message:', message);
    window.postMessage(message, window.location.origin);
  };

  window.showBuyModal = function(itemUuid) {
    console.log('[unity-bridge.showBuyModal] Called with UUID:', itemUuid);
    const message = {type: 'SHOW_MARKETPLACE_MODAL', modalType: 'buy', itemUuid: itemUuid};
    console.log('[unity-bridge.showBuyModal] Sending message:', message);
    window.postMessage(message, window.location.origin);
  };

  window.showSellModal = function(itemUuid) {
    console.log('[unity-bridge.showSellModal] Called with UUID:', itemUuid);
    const message = {type: 'SHOW_MARKETPLACE_MODAL', modalType: 'sell', itemUuid: itemUuid};
    console.log('[unity-bridge.showSellModal] Sending message:', message);
    window.postMessage(message, window.location.origin);
  };

  window.showSellModal2 = function() {
    console.log('[unity-bridge.showSellModal2] Called without UUID (dropdown mode)');
    const message = {type: 'SHOW_MARKETPLACE_MODAL', modalType: 'sell'};
    console.log('[unity-bridge.showSellModal2] Sending message:', message);
    window.postMessage(message, window.location.origin);
  };

  window.showRemovedItemsModal = function(removedItemsJson) {
    console.log('[unity-bridge.showRemovedItemsModal] Called with items:', removedItemsJson);
    try {
      const removedItems = JSON.parse(removedItemsJson);
      const message = {type: 'SHOW_REMOVED_ITEMS_MODAL', removedItems: removedItems};
      console.log('[unity-bridge.showRemovedItemsModal] Sending message:', message);
      window.postMessage(message, window.location.origin);
    } catch (error) {
      console.error('[unity-bridge.showRemovedItemsModal] Failed to parse JSON:', error);
    }
  };

  // CoinFlip modals
  window.showCoinFlipOfferModal = function() {
    console.log('[unity-bridge.showCoinFlipOfferModal] Called');
    const message = {type: 'SHOW_COINFLIP_MODAL', modalType: 'create'};
    console.log('[unity-bridge.showCoinFlipOfferModal] Sending message:', message);
    window.postMessage(message, window.location.origin);
  };

  // Crate Shop modal
  // @param crateVersionId - 0 for Base Set I (v1), 1 for Base Set II (v2), 2 for Base Set III (v3)
  window.showCrateShopModal = function(crateVersionId = 0) {
    console.log('[unity-bridge.showCrateShopModal] Called with version:', crateVersionId);
    const message = {type: 'SHOW_CRATE_SHOP_MODAL', crateVersionId: crateVersionId};
    console.log('[unity-bridge.showCrateShopModal] Sending message:', message);
    window.postMessage(message, window.location.origin);
  };

  // Crate Open modal
  window.showCrateOpenModal = function() {
    console.log('[unity-bridge.showCrateOpenModal] Called');
    const message = {type: 'SHOW_CRATE_OPEN_MODAL'};
    console.log('[unity-bridge.showCrateOpenModal] Sending message:', message);
    window.postMessage(message, window.location.origin);
  };

  // Mythical Bridge modal - requires ticketUuid parameter
  window.showMythicalBridge = function(ticketUuid) {
    console.log('[unity-bridge.showMythicalBridge] Called with ticketUuid:', ticketUuid);
    if (!ticketUuid) {
      console.error('[unity-bridge.showMythicalBridge] ERROR: ticketUuid is required');
      return;
    }
    const message = {type: 'SHOW_MYTHICAL_BRIDGE_MODAL', ticketUuid: ticketUuid};
    console.log('[unity-bridge.showMythicalBridge] Sending message:', message);
    window.postMessage(message, window.location.origin);
  };

  // Sorry Popup modal (for traffic/database issues)
  // Track if popup has been shown this session
  let hasShownSorryPopup = false;

  window.triggerSorryPopup = function() {
    console.log('[unity-bridge.triggerSorryPopup] Called');

    // Check if popup has already been shown this session
    if (hasShownSorryPopup) {
      console.log('[unity-bridge.triggerSorryPopup] Popup already shown this session, skipping');
      return;
    }

    // Mark as shown for this session
    hasShownSorryPopup = true;

    const message = {type: 'SHOW_SORRY_POPUP'};
    console.log('[unity-bridge.triggerSorryPopup] Sending message:', message);
    window.postMessage(message, window.location.origin);
  };

  // Marketplace listing confirmation modals
  window.buyListing = function(listingId) {
    console.log('[unity-bridge.buyListing] Called with listing ID:', listingId);
    const message = {type: 'SHOW_MARKETPLACE_LISTING_MODAL', modalType: 'buyConfirm', listingId: listingId};
    console.log('[unity-bridge.buyListing] Sending message:', message);
    window.postMessage(message, window.location.origin);
  };

  window.cancelListing = function(listingId) {
    console.log('[unity-bridge.cancelListing] Called with listing ID:', listingId);
    const message = {type: 'SHOW_MARKETPLACE_LISTING_MODAL', modalType: 'cancelConfirm', listingId: listingId};
    console.log('[unity-bridge.cancelListing] Sending message:', message);
    window.postMessage(message, window.location.origin);
  };

  // Enhanced navigation functions
  window.UnityNavigateToSettings = window.showSettings;
  window.UnityNavigateToGame = window.hideOverlay;
  window.UnityNavigate = function(route) {
    window.postMessage({type: 'NAVIGATE', route: route}, '*');
  };

  // ===========================
  // Settings Access Functions
  // ===========================
  
  window.getSetting = function(settingName) {
    if (isHiddenSetting(settingName)) {
      console.debug(`Ignoring request for hidden setting: ${settingName}`);
      return DEFAULT_SETTINGS[settingName];
    }
    
    try {
      const storageKey = `${CONFIG.storagePrefix}${settingName}`;
      const storedValue = localStorage.getItem(storageKey);
      return getTypedSettingValue(settingName, storedValue);
    } catch (error) {
      console.error(`Error retrieving setting ${settingName}:`, error);
      return DEFAULT_SETTINGS[settingName];
    }
  };

  // Get typed setting functions (called by Unity with requestId)
  window.getBoolSetting = function(settingName, requestId) {
    try {
      // Force invinsibilityWhiteOverlay to always be false (disabled)
      if (settingName === 'invinsibilityWhiteOverlay') {
        window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnReceiveBoolSetting",
          {
            requestId: requestId,
            value: 0
          }
        );
        return;
      }

      const value = window.getSetting(settingName);
      const boolValue = Boolean(value);
      
      window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnReceiveBoolSetting", 
        {
          requestId: requestId,
          value: boolValue ? 1 : 0
        }
      );
    } catch (error) {
      console.error(`Error in getBoolSetting for ${settingName}:`, error);
      window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnSettingError", 
        {
          requestId: requestId,
          settingName: settingName,
          error: error.message
        }
      );
    }
  };

  window.getFloatSetting = function(settingName, requestId) {
    try {
      const value = window.getSetting(settingName);
      const floatValue = parseFloat(value) || 0;
      
      window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnReceiveFloatSetting", 
        {
          requestId: requestId,
          value: floatValue.toString()
        }
      );
    } catch (error) {
      console.error(`Error in getFloatSetting for ${settingName}:`, error);
      window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnSettingError", 
        {
          requestId: requestId,
          settingName: settingName,
          error: error.message
        }
      );
    }
  };

  window.getIntSetting = function(settingName, requestId) {
    try {
      const value = window.getSetting(settingName);
      const intValue = parseInt(value) || 0;
      
      window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnReceiveIntSetting", 
        {
          requestId: requestId,
          value: intValue
        }
      );
    } catch (error) {
      console.error(`Error in getIntSetting for ${settingName}:`, error);
      window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnSettingError", 
        {
          requestId: requestId,
          settingName: settingName,
          error: error.message
        }
      );
    }
  };

  window.getStringSetting = function(settingName, requestId) {
    try {
      const value = window.getSetting(settingName);
      const stringValue = String(value || '');
      
      window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnReceiveStringSetting", 
        {
          requestId: requestId,
          value: stringValue
        }
      );
    } catch (error) {
      console.error(`Error in getStringSetting for ${settingName}:`, error);
      window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnSettingError", 
        {
          requestId: requestId,
          settingName: settingName,
          error: error.message
        }
      );
    }
  };


  // Get all keybindings as a JSON object with numeric Unity KeyCode values
  window.getKeyBindings = function(requestId) {
    try {
      const keyBindings = window.getSetting('keyBindingsV2');
      
      // Default keybindings with Unity KeyCode numeric values
      const defaultBindings = {
        moveForward: 119,     // W
        moveBackward: 115,    // S
        moveLeft: 97,         // A
        moveRight: 100,       // D
        jump: 32,             // Space
        sprint: 304,          // LeftShift
        slide: 101,           // E
        fire: 323,            // Mouse0
        aim: 324,             // Mouse1
        reload: 114,          // R
        primaryWeapon: 49,    // 1
        secondaryWeapon: 50,  // 2
        knifeWeapon: 51,      // 3
        inspectWeapon: 102    // F
      };
      
      // Use stored values or defaults (no string conversion needed with V2)
      const finalBindings = keyBindings && typeof keyBindings === 'object' 
        ? { ...defaultBindings, ...keyBindings }
        : defaultBindings;
      
      window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnSettingResponse", 
        JSON.stringify({
          requestId: requestId,
          response: JSON.stringify(finalBindings)
        })
      );
    } catch (error) {
      console.error('Error in getKeyBindings:', error);
      window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnSettingError", 
        {
          requestId: requestId,
          settingName: 'keyBindingsV2',
          error: error.message
        }
      );
    }
  };

  window.getObjectSetting = function(settingName, requestId) {
    try {
      const value = window.getSetting(settingName);
      
      if (typeof value !== 'object' || value === null) {
        throw new Error(`Setting ${settingName} is not an object`);
      }
      
      window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnReceiveStringSetting", 
        {
          requestId: requestId,
          value: JSON.stringify(value)
        }
      );
    } catch (error) {
      console.error(`Error in getObjectSetting for ${settingName}:`, error);
      window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnSettingError", 
        {
          requestId: requestId,
          settingName: settingName,
          error: error.message
        }
      );
    }
  };

  // Enhanced settings request functions
  window.UnityRequestSetting = function(name, requestId) {
    const value = window.getSetting(name);
    window.UnityBridge.sendToUnity(">>>JAVASCRIPT BRIDGE<<<", "OnReceiveStringSetting", 
      {
        requestId: requestId,
        value: String(value)
      }
    );
  };

  window.UnityRequestBoolSetting = window.getBoolSetting;

  // ===========================
  // Authentication Functions
  // ===========================

  window.sendLoginResponse = function(jsonResponse) {
    console.log('Sending login response to Unity');
    window.UnityBridge.sendToUnity('PlayerInstance', 'ReceiveLoginResponse', jsonResponse);
  };

  window.sendRegisterResponse = function(jsonResponse) {
    console.log('Sending registration response to Unity');
    window.UnityBridge.sendToUnity('PlayerInstance', 'ReceiveLoginResponse', jsonResponse);
  };

  window.sendLogoutResponse = function(jsonResponse) {
    console.log('Sending logout response to Unity');
    window.UnityBridge.sendToUnity('PlayerInstance', 'ReceiveLogoutResponse', jsonResponse);
  };

  // ===========================
  // Discord Verification Modal
  // ===========================

  /**
   * Show Discord verification modal (called when user needs to verify for Daily Spin)
   */
  window.showDiscordVerificationModal = function() {
    console.log('[unity-bridge] showDiscordVerificationModal called');
    // Send message to React app to show the modal
    window.postMessage({ type: 'DAILY_SPIN_NOT_VERIFIED' }, window.location.origin);
  };

  // ===========================
  // Turnstile Token Functions
  // ===========================

  /**
   * Request a Turnstile token for secure endpoints (called by Unity)
   * HIJACKED FOR DAILY SPIN: Now checks eligibility first, then either shows Discord modal or returns empty token
   * @param {string} gameObjectName - The Unity GameObject to send the token back to
   * @param {string} callbackMethod - The method name to call on the GameObject
   */
  window.getTurnstileToken = function(gameObjectName, callbackMethod) {
    console.log('[getTurnstileToken] Requested by Unity:', gameObjectName, callbackMethod);

    // Check if this is for Daily Spin (DailyLoginManager)
    if (gameObjectName.includes('DailyLoginManager') || gameObjectName.includes('Daily')) {
      console.log('[getTurnstileToken] Daily Spin detected - returning bypass token (backend handles validation)');
      // SIMPLIFIED: Just return bypass token immediately, let backend handle ALL validation
      // This prevents "Security verification failed" errors - backend will return proper error messages
      window.UnityBridge.sendToUnity(gameObjectName, callbackMethod, '---');
      return; // Early return for Daily Spin
    }

    // For other uses (login/register), use the old Turnstile flow
    console.log('[getTurnstileToken] Non-Daily-Spin request - using Turnstile');

    // Check if we have the Turnstile widget ready
    if (!window.TurnstileWidget || !window.TurnstileWidget.getToken) {
      console.error('[getTurnstileToken] Turnstile widget not initialized!');
      // Send error back to Unity
      window.UnityBridge.sendToUnity(gameObjectName, callbackMethod, 'ERROR: Turnstile not ready');
      return;
    }

    // Request token from the React Turnstile widget
    window.TurnstileWidget.getToken()
      .then(token => {
        console.log('[getTurnstileToken] Token received, sending to Unity');
        window.UnityBridge.sendToUnity(gameObjectName, callbackMethod, token);
      })
      .catch(error => {
        console.error('[getTurnstileToken] Failed to get token:', error);
        window.UnityBridge.sendToUnity(gameObjectName, callbackMethod, 'ERROR: ' + error.message);
      });
  };

  // ===========================
  // Communication Functions
  // ===========================
  
  window.displayWallet = function(walletResponse) {
    console.log('Displaying wallet notification:', walletResponse);
    // Send wallet notification to React app via postMessage
    window.postMessage({
      type: 'WALLET_NOTIFICATION',
      walletData: walletResponse
    }, '*');
  };

  // ===========================
  // Wallet Connection Functions
  // ===========================
  
  // Fallback function in case Web3Modal hasn't loaded yet
  // Web3Modal will override this when it loads
  /*
  if (!window.openModal) {
    window.openModal = function() {
      console.log('Waiting for Web3Modal to load...');
      // Try again in a moment if Web3Modal is still loading
      setTimeout(() => {
        if (window.SE && window.SE.openModal) {
          window.SE.openModal();
        } else {
          console.warn('Web3Modal not loaded yet. Falling back to custom modal.');
          window.postMessage({
            type: 'OPEN_WALLET_MODAL'
          }, '*');
        }
      }, 100);
    };
  }*/

  window.UnityWalletNotification = function(walletDataJson) {
    try {
      const walletData = JSON.parse(walletDataJson);
      window.displayWallet(walletData);
    } catch (error) {
      console.error('Failed to parse wallet notification:', error);
    }
  };

  window.UnityProfileUpdate = function(profileDataJson) {
    try {
      const profileData = JSON.parse(profileDataJson);
      window.postMessage({ type: 'PROFILE_UPDATE', profileData: profileData }, '*');
    } catch (error) {
      console.error('Failed to parse profile update:', error);
    }
  };

  window.UnityChatMessage = function(chatDataJson) {
    try {
      const chatData = JSON.parse(chatDataJson);
      window.postMessage({ type: 'CHAT_MESSAGE', chatData: chatData }, '*');
    } catch (error) {
      console.error('Failed to parse chat message:', error);
    }
  };

  window.UnityAuthUpdate = function(authDataJson) {
    try {
      const authData = JSON.parse(authDataJson);
      window.postMessage({ type: 'AUTH_UPDATE', authData: authData }, '*');
    } catch (error) {
      console.error('Failed to parse auth update:', error);
    }
  };

  // ===========================
  // Site-wide Leave Prevention
  // ===========================
  
  window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    e.returnValue = '';
  });
  
  // ===========================
  // Unity Ready Detection
  // ===========================
  
  let checkUnityInterval = setInterval(function() {
    if (window.unityInstance) {
      clearInterval(checkUnityInterval);
      window.UnityBridge.onUnityReady();
    }
  }, 100);

  // ===========================
  // Message Listener for React Communication
  // ===========================
  
  window.addEventListener('message', function(event) {
    // Only accept messages from the same origin
    if (event.origin !== window.location.origin) return;
    
    const message = event.data;
    
    switch(message.type) {
      case 'CONNECT_WALLET':
        console.log('Received CONNECT_WALLET message');
        window.openModal();
        break;
      
      case 'WALLET_CONNECTED':
        console.log('Wallet connected:', message.walletData);
        // Send to Unity if needed
        if (window.unityInstance && message.walletData) {
          window.UnityBridge.sendToUnity('PlayerInstance', 'OnWalletConnected', message.walletData);
        }
        break;
        
      case 'WALLET_DISCONNECTED':
        console.log('Wallet disconnected:', message.address);
        // Send to Unity if needed
        if (window.unityInstance && message.address) {
          window.UnityBridge.sendToUnity('PlayerInstance', 'OnWalletDisconnected', message.address);
        }
        break;
    }
  });

  // ===========================
  // Input System V3
  // ===========================

  /**
   * Set input bindings for V3 input system
   * Called from React settings when user configures controls
   * @param {string|object} bindingsJson - JSON string or object with binding configuration
   */
  window.setInputBindingsV3 = function(bindingsJson) {
    try {
      const bindings = typeof bindingsJson === 'string' ? JSON.parse(bindingsJson) : bindingsJson;

      // Save to localStorage (same key, just nested structure now)
      localStorage.setItem('game_settings_keyBindingsV3', JSON.stringify(bindings));

      // Update global cache
      window._inputBindingsV3 = bindings;

      // Clear cached bindings to force reload
      cachedBindings = bindings;

      console.log('[InputV3] Bindings saved and updated:', bindings);
    } catch (e) {
      console.error('[InputV3] Failed to save bindings:', e);
    }
  };

  /**
   * Default Input Bindings V3 - Nested Structure
   * Supports both keyboard/mouse and controller bindings
   *
   * CrazyGames users get laptop controls by default:
   * - Sprint: Double-tap W (instead of hold Shift)
   * - Aim: Left Shift (instead of Right-click)
   */
  const isCrazyGamesHost = location.hostname.includes('crazygames.com');

  const defaultBindingsV3 = {
    keyboard: {
      // Movement
      moveForward: { type: 'keyboard', keyCode: 87 },      // W
      moveBackward: { type: 'keyboard', keyCode: 83 },     // S
      moveLeft: { type: 'keyboard', keyCode: 65 },         // A
      moveRight: { type: 'keyboard', keyCode: 68 },        // D

      // Actions
      jump: { type: 'keyboard', keyCode: 32 },             // Space
      // CrazyGames: Double-tap W to sprint | Others: Hold Shift
      sprint: isCrazyGamesHost
        ? { type: 'keyboard', keyCode: 87, behavior: 'doubleTap' }  // W double-tap
        : { type: 'keyboard', keyCode: 16, behavior: 'hold' },       // Shift (hold)
      slide: { type: 'keyboard', keyCode: 69 },            // E
      crouch: { type: 'keyboard', keyCode: 17 },           // Ctrl

      // Combat
      fire: { type: 'mouseButton', button: 0 },            // Left click
      // CrazyGames: Shift to aim | Others: Right-click
      aim: isCrazyGamesHost
        ? { type: 'keyboard', keyCode: 16 }                // Left Shift
        : { type: 'mouseButton', button: 1 },              // Right click
      reload: { type: 'keyboard', keyCode: 82 },           // R
      inspectWeapon: { type: 'keyboard', keyCode: 70 },    // F

      // Weapons
      primaryWeapon: { type: 'keyboard', keyCode: 49 },    // 1
      secondaryWeapon: { type: 'keyboard', keyCode: 50 },  // 2
      knifeWeapon: { type: 'keyboard', keyCode: 51 },      // 3

      // System
      escape: { type: 'keyboard', keyCode: 66 }            // B (Escape key handled in C#)
    },
    controller: {
      // Movement - Left Stick
      moveForward: { type: 'gamepadAxis', axis: 1, threshold: 0.2, inverted: true, gamepadIndex: 0 },
      moveBackward: { type: 'gamepadAxis', axis: 1, threshold: 0.2, inverted: false, gamepadIndex: 0 },
      moveLeft: { type: 'gamepadAxis', axis: 0, threshold: 0.2, inverted: true, gamepadIndex: 0 },
      moveRight: { type: 'gamepadAxis', axis: 0, threshold: 0.2, inverted: false, gamepadIndex: 0 },

      // Actions
      jump: { type: 'gamepadButton', button: 0, gamepadIndex: 0 },         // A (Xbox) / Cross (PS)
      sprint: { type: 'gamepadButton', button: 10, gamepadIndex: 0 },      // Left Stick Click
      slide: { type: 'gamepadButton', button: 1, gamepadIndex: 0 },        // B (Xbox) / Circle (PS)
      crouch: { type: 'gamepadButton', button: 11, gamepadIndex: 0 },      // Right Stick Click

      // Look (Camera) - Right Stick
      lookX: { type: 'gamepadAxis', axis: 2, threshold: 0.1, inverted: false, gamepadIndex: 0 },  // Right Stick X
      lookY: { type: 'gamepadAxis', axis: 3, threshold: 0.1, inverted: false, gamepadIndex: 0 },  // Right Stick Y

      // Combat - Use buttons for triggers (standard gamepad mapping)
      fire: { type: 'gamepadButton', button: 7, gamepadIndex: 0 },    // Right Trigger (R2)
      aim: { type: 'gamepadButton', button: 6, gamepadIndex: 0 },     // Left Trigger (L2)
      reload: { type: 'gamepadButton', button: 2, gamepadIndex: 0 },              // X (Xbox) / Square (PS)
      inspectWeapon: { type: 'gamepadButton', button: 12, gamepadIndex: 0 },      // D-Pad Up

      // Weapons
      primaryWeapon: { type: 'gamepadButton', button: 3, gamepadIndex: 0 },       // Y (Xbox) / Triangle (PS)
      secondaryWeapon: { type: 'gamepadButton', button: 14, gamepadIndex: 0 },    // D-Pad Left
      knifeWeapon: { type: 'gamepadButton', button: 15, gamepadIndex: 0 },        // D-Pad Right

      // System
      escape: { type: 'gamepadButton', button: 9, gamepadIndex: 0 }                // Start
    },
    activeMethod: 'keyboard'  // Default to keyboard
  };

  /**
   * Evaluate a binding - returns true/false for buttons, value for axes
   */
  function evaluateBinding(binding, inputState) {
    if (!binding) return false;

    switch (binding.type) {
      case 'keyboard':
        return inputState.keyStates[binding.keyCode] || false;

      case 'mouseButton':
        return inputState.mouseButtons[binding.button] || false;

      case 'gamepadButton':
        const pads = navigator.getGamepads();
        const pad = pads[binding.gamepadIndex || 0];
        if (!pad) return false;
        const button = pad.buttons[binding.button];
        return button ? button.pressed : false;

      case 'gamepadAxis':
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[binding.gamepadIndex || 0];
        if (!gamepad) return 0;
        const value = gamepad.axes[binding.axis] || 0;
        const threshold = binding.threshold || 0.2;
        if (Math.abs(value) < threshold) return 0;
        // Invert lookY (axis 3) for natural FPS camera control (push up = look up)
        if (binding.axis === 3) return -value;
        return binding.inverted ? -value : value;

      default:
        return false;
    }
  }

  /**
   * Evaluate sprint binding with behavior support (hold, toggle, doubleTap)
   */
  let previousMoveForwardState = false;

  function evaluateSprintBinding(sprintBinding, inputState, movingForward) {
    if (!sprintBinding) return false;

    const behavior = sprintBinding.behavior || 'hold';
    const now = Date.now() / 1000; // Convert to seconds for consistency with C#

    // Check if sprint key is currently pressed
    const sprintKeyPressed = evaluateBinding(sprintBinding, inputState);

    switch (behavior) {
      case 'hold':
        // Traditional: hold key to sprint
        return sprintKeyPressed && movingForward;

      case 'toggle':
        // Toggle: press key to toggle sprint on/off
        if (sprintKeyPressed && !InputSystemV3.sprintState.toggle.lastSprintKeyState) {
          // Rising edge - toggle
          InputSystemV3.sprintState.toggle.isToggled = !InputSystemV3.sprintState.toggle.isToggled;
        }
        InputSystemV3.sprintState.toggle.lastSprintKeyState = sprintKeyPressed;

        // Sprint is active if toggled and moving forward
        return InputSystemV3.sprintState.toggle.isToggled && movingForward;

      case 'doubleTap':
        // Double-tap forward key to sprint
        const allBindings = getBindings();
        const moveForwardBinding = allBindings.keyboard ? allBindings.keyboard.moveForward : null;
        if (!moveForwardBinding) break;

        const moveForwardPressed = evaluateBinding(moveForwardBinding, inputState);

        // Detect keydown (rising edge)
        if (moveForwardPressed && !previousMoveForwardState) {
          const state = InputSystemV3.sprintState.doubleTap;

          if (state.keyPressedOnce && (now - state.timeWhenPressedFirst) < state.timeThreshold) {
            // Double tap detected!
            state.awaitingHold = true;
            state.keyPressedOnce = false;
          } else {
            // First tap or too slow
            state.keyPressedOnce = true;
            state.timeWhenPressedFirst = now;
            state.awaitingHold = false;
          }
        }

        previousMoveForwardState = moveForwardPressed;

        // Maintain sprint if moving forward and awaitingHold is true
        if (InputSystemV3.sprintState.doubleTap.awaitingHold && movingForward) {
          // Keep sprinting
        } else if (!movingForward) {
          // Stop if not moving forward
          InputSystemV3.sprintState.doubleTap.awaitingHold = false;
        }

        // Allow instant sprint with sprint key even in double-tap mode
        if (sprintKeyPressed && movingForward) {
          return true;
        }

        // Reset first tap if too much time has passed
        if (InputSystemV3.sprintState.doubleTap.keyPressedOnce &&
            (now - InputSystemV3.sprintState.doubleTap.timeWhenPressedFirst) > InputSystemV3.sprintState.doubleTap.timeThreshold) {
          InputSystemV3.sprintState.doubleTap.keyPressedOnce = false;
        }

        return InputSystemV3.sprintState.doubleTap.awaitingHold;

      default:
        return sprintKeyPressed && movingForward;
    }
  }

  /**
   * Get current bindings (from cache, localStorage, or defaults)
   * Handles migration from old flat structure to new nested structure
   */
  let cachedBindings = null;
  function getBindings() {
    // Return cached if available
    if (cachedBindings) return cachedBindings;

    // Try window global first (set by setInputBindingsV3)
    if (window._inputBindingsV3) {
      cachedBindings = window._inputBindingsV3;
      return cachedBindings;
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem('game_settings_keyBindingsV3');
      if (stored) {
        const parsed = JSON.parse(stored);

        // Check if it's the new nested structure (has keyboard/controller keys)
        if (parsed.keyboard || parsed.controller) {
          // Already new structure - but check for old naming issues
          let needsSave = false;

          // Migrate old 'inspect' to 'inspectWeapon'
          if (parsed.keyboard && parsed.keyboard.inspect && !parsed.keyboard.inspectWeapon) {
            parsed.keyboard.inspectWeapon = parsed.keyboard.inspect;
            delete parsed.keyboard.inspect;
            needsSave = true;
            console.log('[InputV3] Migrated inspect → inspectWeapon');
          }

          // Add knifeWeapon binding if missing (new weapon slot)
          if (parsed.keyboard && !parsed.keyboard.knifeWeapon) {
            parsed.keyboard.knifeWeapon = { type: 'keyboard', keyCode: 51 }; // 3 key
            needsSave = true;
            console.log('[InputV3] Added missing knifeWeapon binding');
          }

          // No need to migrate escape binding - both Escape and B will work

          if (needsSave) {
            localStorage.setItem('game_settings_keyBindingsV3', JSON.stringify(parsed));
          }

          cachedBindings = parsed;
          return cachedBindings;
        } else {
          // Old flat structure - migrate it
          let keyboardBindings = parsed;

          // Migrate old 'inspect' to 'inspectWeapon' in flat structure
          if (keyboardBindings.inspect && !keyboardBindings.inspectWeapon) {
            keyboardBindings.inspectWeapon = keyboardBindings.inspect;
            delete keyboardBindings.inspect;
            console.log('[InputV3] Migrated inspect → inspectWeapon in flat structure');
          }

          // No need to migrate escape binding - both Escape and B will work

          cachedBindings = {
            keyboard: keyboardBindings,
            controller: defaultBindingsV3.controller,
            activeMethod: 'keyboard'
          };
          // Save migrated version back to same key
          localStorage.setItem('game_settings_keyBindingsV3', JSON.stringify(cachedBindings));
          console.log('[InputV3] Migrated old bindings to new nested structure');
          return cachedBindings;
        }
      }
    } catch (e) {
      console.error('[InputV3] Failed to load bindings from localStorage:', e);
    }

    // Fallback to defaults
    console.log('[InputV3] Using default bindings');
    cachedBindings = defaultBindingsV3;
    return cachedBindings;
  }

  /**
   * Detect current input method based on recent input activity
   * Returns 'keyboard' or 'controller'
   */
  let lastInputMethod = 'keyboard';
  let lastInputTime = Date.now();

  function getCurrentInputMethod() {
    const now = Date.now();

    // Check for gamepad input
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const pad = gamepads[i];
      if (!pad) continue;

      // Check buttons
      for (let j = 0; j < pad.buttons.length; j++) {
        if (pad.buttons[j].pressed) {
          lastInputMethod = 'controller';
          lastInputTime = now;
          return 'controller';
        }
      }

      // Check axes (threshold to avoid drift)
      for (let k = 0; k < pad.axes.length; k++) {
        if (Math.abs(pad.axes[k]) > 0.3) {
          lastInputMethod = 'controller';
          lastInputTime = now;
          return 'controller';
        }
      }
    }

    // Check for keyboard/mouse input
    const hasKeyboardInput = Object.values(InputSystemV3.keyStates).some(pressed => pressed);
    const hasMouseInput = InputSystemV3.mouseButtons.some(pressed => pressed);
    const hasMouseMovement = Math.abs(InputSystemV3.mouseDelta.x) > 1 || Math.abs(InputSystemV3.mouseDelta.y) > 1;

    if (hasKeyboardInput || hasMouseInput || hasMouseMovement) {
      lastInputMethod = 'keyboard';
      lastInputTime = now;
      return 'keyboard';
    }

    // Return last known input method
    return lastInputMethod;
  }

  /**
   * Input System V3 - Input Polling Engine
   * Runs in unity-bridge.js so you can iterate without Unity rebuilds!
   */
  const InputSystemV3 = {
    // State
    bufferPtr: null,
    bufferSize: 20,
    pollingIntervalId: null,
    initialized: false,

    // Input tracking
    keyStates: {},
    mouseButtons: [false, false, false],
    mouseDelta: { x: 0, y: 0 },

    // Sprint state tracking (for double-tap and toggle)
    sprintState: {
      doubleTap: {
        keyPressedOnce: false,
        timeWhenPressedFirst: 0,
        awaitingHold: false,
        timeThreshold: 0.5 // 500ms
      },
      toggle: {
        isToggled: false
      }
    },

    // Sensitivity tuning (easily adjustable here!)
    mouseSensitivity: 10.0, // Higher = less sensitive

    /**
     * Initialize - wait for Unity to be ready
     */
    init: function() {
      if (InputSystemV3.initialized) {
        console.warn('[InputV3] Already initialized');
        return;
      }

      // Get buffer pointer from .jslib (set by InitInputSystem)
      if (typeof window._inputSystemBufferPtr !== 'undefined') {
        InputSystemV3.bufferPtr = window._inputSystemBufferPtr;
        console.log('[InputV3] Got buffer pointer: 0x' + InputSystemV3.bufferPtr.toString(16));
      } else {
        console.warn('[InputV3] Buffer pointer not ready yet, will retry...');
        return;
      }

      // Setup event listeners
      InputSystemV3.setupEventListeners();

      // Start polling
      InputSystemV3.startPolling();

      InputSystemV3.initialized = true;
      console.log('[InputV3] Initialized successfully');
    },

    /**
     * Setup browser input event listeners
     */
    setupEventListeners: function() {
      // Keyboard
      document.addEventListener('keydown', function(e) {
        InputSystemV3.keyStates[e.keyCode] = true;
      }, false);

      document.addEventListener('keyup', function(e) {
        InputSystemV3.keyStates[e.keyCode] = false;
      }, false);

      // Mouse buttons (convert browser indices to Unity indices)
      // Browser: 0=left, 1=middle, 2=right
      // Unity: 0=left, 1=right, 2=middle
      document.addEventListener('mousedown', function(e) {
        let unityButton = e.button;
        if (e.button === 1) unityButton = 2; // Middle -> Unity middle
        else if (e.button === 2) unityButton = 1; // Right -> Unity right

        if (unityButton < 3) {
          InputSystemV3.mouseButtons[unityButton] = true;
        }
      }, false);

      document.addEventListener('mouseup', function(e) {
        let unityButton = e.button;
        if (e.button === 1) unityButton = 2; // Middle -> Unity middle
        else if (e.button === 2) unityButton = 1; // Right -> Unity right

        if (unityButton < 3) {
          InputSystemV3.mouseButtons[unityButton] = false;
        }
      }, false);

      // Mouse movement - accumulate delta
      document.addEventListener('mousemove', function(e) {
        InputSystemV3.mouseDelta.x += e.movementX;
        InputSystemV3.mouseDelta.y += e.movementY;
      }, false);

      console.log('[InputV3] Event listeners registered');
    },

    /**
     * Poll inputs and write to Unity's buffer
     */
    poll: function() {
      // Safety check - if Module or buffer not ready, write zeros
      if (!window.unityInstance || !window.unityInstance.Module || !window.unityInstance.Module.HEAPU8 || !InputSystemV3.bufferPtr) {
        InputSystemV3.writeZeros();
        return;
      }

      try {
        const buffer = window.unityInstance.Module.HEAPU8.buffer;
        const view = new DataView(buffer, InputSystemV3.bufferPtr, InputSystemV3.bufferSize);

        // Get all bindings (nested structure)
        const allBindings = getBindings();

        // Detect active input method and select appropriate binding set
        const inputMethod = getCurrentInputMethod();
        const bindings = allBindings[inputMethod] || allBindings.keyboard || allBindings;

        // Create input state object for evaluation
        const inputState = {
          keyStates: InputSystemV3.keyStates,
          mouseButtons: InputSystemV3.mouseButtons
        };

        // --- Movement: Dynamic based on bindings ---
        let movementX = 0, movementY = 0;

        // Evaluate movement bindings
        const moveLeftValue = evaluateBinding(bindings.moveLeft, inputState);
        const moveRightValue = evaluateBinding(bindings.moveRight, inputState);
        const moveForwardValue = evaluateBinding(bindings.moveForward, inputState);
        const moveBackwardValue = evaluateBinding(bindings.moveBackward, inputState);

        // Handle digital (button) or analog (axis) input
        if (typeof moveLeftValue === 'number') movementX -= moveLeftValue;
        else if (moveLeftValue) movementX -= 1;

        if (typeof moveRightValue === 'number') movementX += moveRightValue;
        else if (moveRightValue) movementX += 1;

        if (typeof moveForwardValue === 'number') movementY += moveForwardValue;
        else if (moveForwardValue) movementY += 1;

        if (typeof moveBackwardValue === 'number') movementY -= moveBackwardValue;
        else if (moveBackwardValue) movementY -= 1;

        // Write movement (offset 0, 4)
        view.setFloat32(0, movementX, true);
        view.setFloat32(4, movementY, true);

        // --- Look delta (mouse or controller) ---
        // ACCUMULATE deltas between Unity frames (don't overwrite!)
        // Read current accumulated value from buffer
        const currentLookX = view.getFloat32(8, true);
        const currentLookY = view.getFloat32(12, true);

        let deltaX = 0;
        let deltaY = 0;

        // If using controller, check for look bindings
        if (inputMethod === 'controller' && bindings.lookX && bindings.lookY) {
          const lookXValue = evaluateBinding(bindings.lookX, inputState);
          const lookYValue = evaluateBinding(bindings.lookY, inputState);

          // Controller look is continuous (not delta), so treat as velocity
          // 4x multiplier for controllers
          if (typeof lookXValue === 'number') deltaX = lookXValue * 4;
          if (typeof lookYValue === 'number') deltaY = lookYValue * 4;
        } else {
          // Keyboard/mouse: use mouse delta
          deltaX = InputSystemV3.mouseDelta.x / InputSystemV3.mouseSensitivity;
          deltaY = -InputSystemV3.mouseDelta.y / InputSystemV3.mouseSensitivity; // Negative = correct Y
        }

        // ADD to accumulated value (don't replace!)
        const newLookX = currentLookX + deltaX;
        const newLookY = currentLookY + deltaY;

        // Write accumulated delta back to buffer
        view.setFloat32(8, newLookX, true);
        view.setFloat32(12, newLookY, true);

        // Reset JS accumulator for next poll
        InputSystemV3.mouseDelta.x = 0;
        InputSystemV3.mouseDelta.y = 0;

        // --- Buttons bitfield: Dynamic based on bindings ---
        let buttons = 0;

        // Match RawInputState.cs button indices
        if (evaluateBinding(bindings.jump, inputState)) buttons |= (1 << 0);
        if (evaluateBinding(bindings.fire, inputState)) buttons |= (1 << 1);
        if (evaluateBinding(bindings.aim, inputState)) buttons |= (1 << 2);
        if (evaluateBinding(bindings.reload, inputState)) buttons |= (1 << 3);

        // Sprint handling with behavior support
        if (evaluateSprintBinding(bindings.sprint, inputState, movementY > 0)) {
          buttons |= (1 << 4);
        }

        if (evaluateBinding(bindings.slide, inputState)) buttons |= (1 << 5);
        if (evaluateBinding(bindings.primaryWeapon, inputState)) buttons |= (1 << 6);
        if (evaluateBinding(bindings.secondaryWeapon, inputState)) buttons |= (1 << 7);
        if (evaluateBinding(bindings.inspectWeapon, inputState)) buttons |= (1 << 8);
        if (evaluateBinding(bindings.crouch, inputState)) buttons |= (1 << 9);
        // Escape: Check user binding, hardcoded Escape key (27), and P key (80)
        if (evaluateBinding(bindings.escape, inputState) || inputState.keyStates[27] || inputState.keyStates[80]) buttons |= (1 << 10);
        if (evaluateBinding(bindings.knifeWeapon, inputState)) buttons |= (1 << 11);

        // Write buttons (offset 16)
        view.setUint32(16, buttons, true);

      } catch (error) {
        console.error('[InputV3] Error polling inputs:', error);
        InputSystemV3.writeZeros(); // Safe fallback
      }
    },

    /**
     * Write zeros to buffer (safe fallback)
     */
    writeZeros: function() {
      if (!window.unityInstance || !window.unityInstance.Module || !window.unityInstance.Module.HEAPU8 || !InputSystemV3.bufferPtr) {
        return; // Can't even write zeros, just bail
      }

      try {
        const buffer = window.unityInstance.Module.HEAPU8.buffer;
        const view = new DataView(buffer, InputSystemV3.bufferPtr, InputSystemV3.bufferSize);

        for (let i = 0; i < InputSystemV3.bufferSize; i += 4) {
          view.setFloat32(i, 0, true);
        }
      } catch (e) {
        // Silent fail - don't spam console
      }
    },

    /**
     * Start polling loop - synced to browser refresh rate
     */
    startPolling: function() {
      if (InputSystemV3.pollingIntervalId) {
        console.warn('[InputV3] Already polling');
        return;
      }

      // Use requestAnimationFrame for lowest latency
      // Automatically matches monitor refresh rate (60/120/144Hz)
      function pollLoop() {
        InputSystemV3.poll();
        InputSystemV3.pollingIntervalId = requestAnimationFrame(pollLoop);
      }

      InputSystemV3.pollingIntervalId = requestAnimationFrame(pollLoop);
      console.log('[InputV3] Polling started (synced to monitor refresh rate)');
    },

    /**
     * Stop polling
     */
    stopPolling: function() {
      if (InputSystemV3.pollingIntervalId) {
        cancelAnimationFrame(InputSystemV3.pollingIntervalId);
        InputSystemV3.pollingIntervalId = null;
        console.log('[InputV3] Polling stopped');
      }
    }
  };

  // Event-driven initialization
  // This function is called by .jslib when buffer is ready
  let initRetryCount = 0;
  const maxInitRetries = 50; // Max 5 seconds
  let isRetrying = false;

  window.initInputV3Manually = function() {
    // Prevent spam if already initialized
    if (InputSystemV3.initialized) {
      console.log('[InputV3] Already initialized, ignoring callback');
      return;
    }

    // Prevent duplicate retry timers
    if (isRetrying) {
      return;
    }

    console.log('[InputV3] Initialization callback triggered (attempt ' + (initRetryCount + 1) + ')');

    // Validate prerequisites
    if (!window._inputSystemBufferPtr) {
      console.error('[InputV3] Buffer pointer not set!');
      return;
    }

    if (!window.unityInstance || !window.unityInstance.Module || !window.unityInstance.Module.HEAPU8) {
      initRetryCount++;
      if (initRetryCount < maxInitRetries) {
        console.warn('[InputV3] Unity Module not ready, retrying in 100ms... (attempt ' + initRetryCount + '/' + maxInitRetries + ')');
        isRetrying = true;
        setTimeout(function() {
          isRetrying = false;
          window.initInputV3Manually();
        }, 100);
      } else {
        console.error('[InputV3] Failed to initialize - Unity Module never became ready after ' + maxInitRetries + ' attempts');
      }
      return;
    }

    // Initialize
    InputSystemV3.init();
  };

  // Expose for debugging
  window.InputSystemV3 = InputSystemV3;

  // Expose bindings helpers for debugging
  window.getInputBindingsV3 = function() {
    return getBindings();
  };

  window.resetInputBindingsV3 = function() {
    localStorage.removeItem('game_settings_keyBindingsV3');
    window._inputBindingsV3 = null;
    cachedBindings = null;
    console.log('[InputV3] Bindings reset to defaults');
  };

  // Helper to clear cached bindings (for live updates from settings UI)
  window.clearCachedBindingsV3 = function() {
    cachedBindings = null;
    console.log('[InputV3] Cached bindings cleared - will reload on next poll');
  };

  // Debug helper for controller look input
  window.debugLookInput = function(enabled = true) {
    window._debugLookInput = enabled;
    if (enabled) {
      console.log('===================================');
      console.log('CONTROLLER LOOK DEBUG ENABLED');
      console.log('Move your right stick to see debug output');
      console.log('To disable: debugLookInput(false)');
      console.log('===================================');
    } else {
      console.log('[Debug] Controller look debugging disabled');
    }
  };

  console.log('[InputV3] Waiting for .jslib to trigger initialization...');
  console.log('[InputV3] Debug helpers available:');
  console.log('  - debugLookInput(true)  : Enable controller look debugging');
  console.log('  - debugLookInput(false) : Disable debugging');

  console.log('Unity Bridge initialized (consolidated version)');
})();