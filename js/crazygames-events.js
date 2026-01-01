// CrazyGames SDK Event Integration
// This script provides window-level functions that Unity can call via Application.ExternalCall

(function() {
    'use strict';
    
    // Track if we're on CrazyGames
    let isOnCrazyGames = false;
    let sdkInitialized = false;
    let sdkInstance = null;
    let debugPanel = null;
    let debugLines = [];
    
    // Check if CrazyGames SDK is available
    function checkCrazyGamesSDK() {
        return typeof window.CrazyGames !== 'undefined' && 
               typeof window.CrazyGames.SDK !== 'undefined';
    }
    
    // Create debug panel
    function createDebugPanel() {
        // Debug panel disabled - no longer needed
        return;
    }
    
    // Add debug line
    function addDebugLine(message) {
        const timestamp = new Date().toLocaleTimeString();
        debugLines.push(`[${timestamp}] ${message}`);
        
        // Keep only last 50 lines
        if (debugLines.length > 50) {
            debugLines.shift();
        }
        
        updateDebugDisplay();
    }
    
    // Update debug display
    function updateDebugDisplay() {
        if (!debugPanel) return;
        
        const content = document.getElementById('cg-events-debug-content');
        if (content) {
            content.innerHTML = debugLines.join('<br>');
            content.scrollTop = content.scrollHeight;
        }
    }
    
    // Initialize SDK reference when available
    function initializeSDK() {
        if (checkCrazyGamesSDK() && !sdkInitialized) {
            try {
                // CrazyGames SDK v3 doesn't use getInstance() - access directly
                sdkInstance = window.CrazyGames.SDK;
                sdkInitialized = true;
                console.log('[CrazyGames Events] SDK initialized successfully');
                addDebugLine('✅ SDK initialized successfully');
            } catch (error) {
                console.error('[CrazyGames Events] Failed to initialize SDK:', error);
                addDebugLine('❌ Failed to initialize SDK: ' + error.message);
            }
        }
    }
    
    // Check if we're running on CrazyGames
    window.IsCrazyGamesEnvironment = function() {
        isOnCrazyGames = location.hostname.includes('crazygames.com');
        
        // Create debug panel if on CrazyGames
        if (isOnCrazyGames) {
            createDebugPanel();
            addDebugLine('🎮 CrazyGames environment detected');
            addDebugLine(`Host: ${location.hostname}`);
        }
        
        // Notify Unity of the environment
        if (window.unityInstance) {
            window.unityInstance.SendMessage(
                "PlayerInstance", 
                "SetCrazyGamesEnvironment", 
                isOnCrazyGames ? "true" : "false"
            );
        }
        
        // Initialize SDK if on CrazyGames
        if (isOnCrazyGames) {
            console.log('[CrazyGames Events] Detected CrazyGames environment');
            
            // Wait for SDK to be available
            if (!checkCrazyGamesSDK()) {
                console.log('[CrazyGames Events] Waiting for SDK to load...');
                addDebugLine('⏳ Waiting for SDK to load...');
                const checkInterval = setInterval(() => {
                    if (checkCrazyGamesSDK()) {
                        clearInterval(checkInterval);
                        initializeSDK();
                    }
                }, 100);
                
                // Stop checking after 10 seconds
                setTimeout(() => clearInterval(checkInterval), 10000);
            } else {
                initializeSDK();
            }
        }
    };
    
    // Gameplay Start Event
    window.CrazyGamesGameplayStart = function() {
        if (!isOnCrazyGames || !sdkInitialized || !sdkInstance) {
            console.log('[CrazyGames Events] gameplayStart - SDK not available');
            addDebugLine('⚠️ gameplayStart - SDK not available');
            return;
        }
        
        try {
            window.CrazyGames.SDK.game.gameplayStart();
            console.log('[CrazyGames Events] gameplayStart event sent');
            addDebugLine('▶️ gameplayStart event sent');
        } catch (error) {
            console.error('[CrazyGames Events] Error sending gameplayStart:', error);
            addDebugLine('❌ Error: gameplayStart - ' + error.message);
        }
    };
    
    // Gameplay Stop Event
    window.CrazyGamesGameplayStop = function() {
        if (!isOnCrazyGames || !sdkInitialized || !sdkInstance) {
            console.log('[CrazyGames Events] gameplayStop - SDK not available');
            addDebugLine('⚠️ gameplayStop - SDK not available');
            return;
        }
        
        try {
            window.CrazyGames.SDK.game.gameplayStop();
            console.log('[CrazyGames Events] gameplayStop event sent');
            addDebugLine('⏸️ gameplayStop event sent');
        } catch (error) {
            console.error('[CrazyGames Events] Error sending gameplayStop:', error);
            addDebugLine('❌ Error: gameplayStop - ' + error.message);
        }
    };
    
    // Loading Start Event
    window.CrazyGamesLoadingStart = function() {
        if (!isOnCrazyGames || !sdkInitialized || !sdkInstance) {
            console.log('[CrazyGames Events] loadingStart - SDK not available');
            addDebugLine('⚠️ loadingStart - SDK not available');
            return;
        }
        
        try {
            window.CrazyGames.SDK.game.loadingStart();
            console.log('[CrazyGames Events] loadingStart event sent');
            addDebugLine('⏳ loadingStart event sent');
        } catch (error) {
            console.error('[CrazyGames Events] Error sending loadingStart:', error);
            addDebugLine('❌ Error: loadingStart - ' + error.message);
        }
    };
    
    // Loading Stop Event
    window.CrazyGamesLoadingStop = function() {
        if (!isOnCrazyGames || !sdkInitialized || !sdkInstance) {
            console.log('[CrazyGames Events] loadingStop - SDK not available');
            addDebugLine('⚠️ loadingStop - SDK not available');
            return;
        }
        
        try {
            window.CrazyGames.SDK.game.loadingStop();
            console.log('[CrazyGames Events] loadingStop event sent');
            addDebugLine('✅ loadingStop event sent - Game ready!');
        } catch (error) {
            console.error('[CrazyGames Events] Error sending loadingStop:', error);
            addDebugLine('❌ Error: loadingStop - ' + error.message);
        }
    };
    
    // HappyTime Event - Use sparingly for major achievements!
    window.CrazyGamesHappyTime = function() {
        if (!isOnCrazyGames || !sdkInitialized || !sdkInstance) {
            console.log('[CrazyGames Events] happytime - SDK not available');
            addDebugLine('⚠️ happytime - SDK not available');
            return;
        }
        
        try {
            window.CrazyGames.SDK.game.happytime();
            console.log('[CrazyGames Events] 🎉 happytime event sent - Celebration triggered!');
            addDebugLine('🎉 happytime event sent - Celebration!');
        } catch (error) {
            console.error('[CrazyGames Events] Error sending happytime:', error);
            addDebugLine('❌ Error: happytime - ' + error.message);
        }
    };
    
    // Error Reporting
    window.CrazyGamesReportError = function(message, stackTrace) {
        if (!isOnCrazyGames) {
            console.log('[CrazyGames Events] Error reporting - Not on CrazyGames');
            return;
        }
        
        // Log the error for analytics
        console.error('[CrazyGames Error Report]', message, stackTrace || '');
        addDebugLine(`🔴 Error: ${message}`);
        if (stackTrace) {
            addDebugLine(`Stack: ${stackTrace.substring(0, 100)}...`);
        }
        
        // Note: CrazyGames SDK doesn't have a direct error reporting method in the game module
        // This is logged for potential future integration or custom analytics
    };
    
    // Check for invite parameters on load
    window.CrazyGamesCheckInvite = function() {
        if (!isOnCrazyGames || !sdkInitialized || !sdkInstance) {
            console.log('[CrazyGames Events] checkInvite - SDK not available');
            return;
        }
        
        try {
            // Check if we have invite parameters
            const roomId = window.CrazyGames.SDK.game.getInviteParam('roomId');
            if (roomId) {
                console.log('[CrazyGames Events] Invite detected, roomId:', roomId);
                addDebugLine(`🔗 Invite detected, roomId: ${roomId}`);
                
                // Send to Unity
                if (window.unityInstance) {
                    window.unityInstance.SendMessage(
                        "PlayerInstance", 
                        "OnCrazyGamesInvite", 
                        roomId
                    );
                }
            }
        } catch (error) {
            console.error('[CrazyGames Events] Error checking invite:', error);
            addDebugLine('❌ Error checking invite: ' + error.message);
        }
    };
    
    // Show Invite Button with roomId, mapName, and leaderId (for party follow feature)
    // If leaderId is not provided, automatically uses window.localPlayerUuid (set by CrazyGames auth)
    window.CrazyGamesShowInviteButton = function(roomId, mapName, leaderId) {
        if (!isOnCrazyGames || !sdkInitialized || !sdkInstance) {
            console.log('[CrazyGames Events] showInviteButton - SDK not available');
            addDebugLine('⚠️ showInviteButton - SDK not available');
            return;
        }

        try {
            const params = { roomId: roomId };

            // Use provided leaderId, or fall back to local player's UUID (for party follow feature)
            const effectiveLeaderId = leaderId || window.localPlayerUuid;
            if (effectiveLeaderId) {
                params.leaderId = effectiveLeaderId;
                console.log('[CrazyGames Events] Using leaderId for party follow:', effectiveLeaderId);
            }

            const inviteLink = window.CrazyGames.SDK.game.showInviteButton(params);
            console.log('[CrazyGames Events] Invite button shown, link:', inviteLink, 'leaderId:', effectiveLeaderId);
            addDebugLine(`🔗 Invite button shown for room: ${roomId}, map: ${mapName}, leader: ${effectiveLeaderId || 'N/A'}`);
        } catch (error) {
            console.error('[CrazyGames Events] Error showing invite button:', error);
            addDebugLine('❌ Error: showInviteButton - ' + error.message);
        }
    };
    
    // Show Invite Button - Advanced version with JSON params
    window.CrazyGamesShowInviteButtonWithParams = function(jsonParams) {
        if (!isOnCrazyGames || !sdkInitialized || !sdkInstance) {
            console.log('[CrazyGames Events] showInviteButton - SDK not available');
            addDebugLine('⚠️ showInviteButton - SDK not available');
            return;
        }
        
        try {
            const params = JSON.parse(jsonParams);
            const inviteLink = window.CrazyGames.SDK.game.showInviteButton(params);
            console.log('[CrazyGames Events] Invite button shown with params:', params, 'link:', inviteLink);
            addDebugLine(`🔗 Invite button shown: ${JSON.stringify(params)}`);
        } catch (error) {
            console.error('[CrazyGames Events] Error showing invite button with params:', error);
            addDebugLine('❌ Error: showInviteButton - ' + error.message);
        }
    };
    
    // Hide Invite Button
    window.CrazyGamesHideInviteButton = function() {
        if (!isOnCrazyGames || !sdkInitialized || !sdkInstance) {
            console.log('[CrazyGames Events] hideInviteButton - SDK not available');
            addDebugLine('⚠️ hideInviteButton - SDK not available');
            return;
        }
        
        try {
            window.CrazyGames.SDK.game.hideInviteButton();
            console.log('[CrazyGames Events] Invite button hidden');
            addDebugLine('🚫 Invite button hidden');
        } catch (error) {
            console.error('[CrazyGames Events] Error hiding invite button:', error);
            addDebugLine('❌ Error: hideInviteButton - ' + error.message);
        }
    };
    
    // Get Invite Link (generates CrazyGames invite URL and sends to Unity callback)
    window.CrazyGamesGetInviteLink = function(roomId, callbackObject, callbackMethod) {
        if (!isOnCrazyGames || !sdkInitialized || !sdkInstance) {
            console.log('[CrazyGames Events] getInviteLink - SDK not available');
            addDebugLine('⚠️ getInviteLink - SDK not available');
            // Send empty string to indicate not on CrazyGames
            if (window.unityInstance && callbackObject && callbackMethod) {
                window.unityInstance.SendMessage(callbackObject, callbackMethod, "");
            }
            return;
        }

        try {
            const params = { roomId: roomId };

            // Add leaderId for party follow feature if available
            if (window.localPlayerUuid) {
                params.leaderId = window.localPlayerUuid;
            }

            const inviteLink = window.CrazyGames.SDK.game.inviteLink(params);
            console.log('[CrazyGames Events] Generated invite link:', inviteLink);
            addDebugLine(`🔗 Generated invite link for room: ${roomId}`);

            // Send result back to Unity
            if (window.unityInstance && callbackObject && callbackMethod) {
                window.unityInstance.SendMessage(callbackObject, callbackMethod, inviteLink || "");
            }
        } catch (error) {
            console.error('[CrazyGames Events] Error generating invite link:', error);
            addDebugLine('❌ Error: getInviteLink - ' + error.message);
            // Send empty string on error
            if (window.unityInstance && callbackObject && callbackMethod) {
                window.unityInstance.SendMessage(callbackObject, callbackMethod, "");
            }
        }
    };

    // Get Invite Parameter (with callback to Unity)
    window.CrazyGamesGetInviteParam = function(paramName) {
        if (!isOnCrazyGames || !sdkInitialized || !sdkInstance) {
            console.log('[CrazyGames Events] getInviteParam - SDK not available');
            return;
        }
        
        try {
            const value = window.CrazyGames.SDK.game.getInviteParam(paramName);
            if (value && window.unityInstance) {
                // Send result back to Unity
                window.unityInstance.SendMessage(
                    "PlayerInstance", 
                    "OnCrazyGamesInviteParam", 
                    JSON.stringify({ param: paramName, value: value })
                );
            }
            console.log(`[CrazyGames Events] Invite param '${paramName}':`, value);
            addDebugLine(`📋 Invite param '${paramName}': ${value || 'null'}`);
        } catch (error) {
            console.error('[CrazyGames Events] Error getting invite param:', error);
            addDebugLine('❌ Error: getInviteParam - ' + error.message);
        }
    };
    
    // Show debug panel function (can be called from console)
    window.CrazyGamesShowDebug = function() {
        if (debugPanel) {
            debugPanel.style.display = 'block';
        } else if (isOnCrazyGames) {
            createDebugPanel();
        }
    };
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Check environment when DOM is ready
            setTimeout(() => {
                window.IsCrazyGamesEnvironment();
            }, 100);
        });
    } else {
        // DOM already loaded
        setTimeout(() => {
            window.IsCrazyGamesEnvironment();
        }, 100);
    }
    
    // Debug info
    console.log('[CrazyGames Events] Script loaded. Functions available:');
    console.log('- CrazyGamesGameplayStart()');
    console.log('- CrazyGamesGameplayStop()');
    console.log('- CrazyGamesLoadingStart()');
    console.log('- CrazyGamesLoadingStop()');
    console.log('- CrazyGamesHappyTime()');
    console.log('- CrazyGamesReportError(message, stackTrace)');
    console.log('- CrazyGamesCheckInvite()');
    console.log('- CrazyGamesShowInviteButton(roomId, mapName)');
    console.log('- CrazyGamesShowInviteButtonWithParams(jsonParams)');
    console.log('- CrazyGamesHideInviteButton()');
    console.log('- CrazyGamesGetInviteParam(paramName)');
    console.log('- CrazyGamesGetInviteLink(roomId, callbackObject, callbackMethod)');
    
})();