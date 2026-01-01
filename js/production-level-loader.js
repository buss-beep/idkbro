// Bundle URI mapping
const HOMESCREEN_BUNDLE_URI = "https://supertrip.land/Bundles/459homescreen.bundle";
const HOMESCREEN_ATLAS_BUNDLE_URI = "https://supertrip.land/Bundles/459homescreen_atlas.bundle";
const VERTIGO_BUNDLE_URI = "https://supertrip.land/Bundles/462vertigo.bundle";
const SHIPPING_BUNDLE_URI = "https://supertrip.land/Bundles/462shipping.bundle";
const FIDELIO_BUNDLE_URI = "https://supertrip.land/Bundles/462fidelio.bundle";``
const ECSTASY_BUNDLE_URI = "https://supertrip.land/Bundles/462ecstasy.bundle";
const PLAYER_BUNDLE_URI = "https://supertrip.land/Bundles/459player.bundle";
const FACTORY_BUNDLE_URI = "https://supertrip.land/Bundles/459factory_crate.bundle";

// Brain Stem Asset Bundles
const BRAINSTEM_DAILY_SPIN_BUNDLE_URI = "https://supertrip.land/Bundles/459daily_spin.bundle";
const BRAINSTEM_INVENTORY_BUNDLE_URI = "https://supertrip.land/Bundles/459inventory.bundle";
const BRAINSTEM_HALL_OF_FAME_BUNDLE_URI = "https://supertrip.land/Bundles/459hall_of_fame.bundle";
const BRAINSTEM_QUESTS_BUNDLE_URI = "https://supertrip.land/Bundles/459quests.bundle";
const BRAINSTEM_FLOATIE_CRASH_BUNDLE_URI = "https://supertrip.land/Bundles/459floatie_crash.bundle";
const BRAINSTEM_COIN_FLIP_BUNDLE_URI = "https://supertrip.land/Bundles/459coin_flip.bundle";
const BRAINSTEM_DEGEN_HUB_BUNDLE_URI = "https://supertrip.land/Bundles/460degen_hub.bundle";
const BRAINSTEM_CRATE_BUNDLE_URI = "https://supertrip.land/Bundles/459crate.bundle";
const BRAINSTEM_SERVERSELECTOR_BUNDLE_URI = "https://supertrip.land/Bundles/459serverselector.bundle";

// Crate Scene Bundles (for CrateManager)
const CRATE_BASESET_I_BUNDLE_URI = "https://supertrip.land/Bundles/459base_set_one_scene.bundle";
const CRATE_BASESET_II_BUNDLE_URI = "https://supertrip.land/Bundles/459base_set_two_scene.bundle";
const CRATE_BASESET_III_BUNDLE_URI = "https://supertrip.land/Bundles/459base_set_three_scene.bundle";

const mapping = {
    0: HOMESCREEN_BUNDLE_URI,
    1: VERTIGO_BUNDLE_URI,
    2: SHIPPING_BUNDLE_URI,
    3: FIDELIO_BUNDLE_URI,
    4: ECSTASY_BUNDLE_URI,
    100: PLAYER_BUNDLE_URI,
    200: HOMESCREEN_ATLAS_BUNDLE_URI,
};

// Brain Stem path-to-bundle mapping (string-based)
const brainStemMapping = {
    "daily_spin": BRAINSTEM_DAILY_SPIN_BUNDLE_URI,
    "inventory": BRAINSTEM_INVENTORY_BUNDLE_URI,
    "hall_of_fame": BRAINSTEM_HALL_OF_FAME_BUNDLE_URI,
    "quests": BRAINSTEM_QUESTS_BUNDLE_URI,
    "floatie_crash": BRAINSTEM_FLOATIE_CRASH_BUNDLE_URI,
    "coin_flip": BRAINSTEM_COIN_FLIP_BUNDLE_URI,
    "degen_hub": BRAINSTEM_DEGEN_HUB_BUNDLE_URI,
    "crate": BRAINSTEM_CRATE_BUNDLE_URI,
    "serverselector": BRAINSTEM_SERVERSELECTOR_BUNDLE_URI
};

// Crate version-to-bundle mapping (int-based)
const crateMapping = {
    0: CRATE_BASESET_I_BUNDLE_URI,
    1: CRATE_BASESET_II_BUNDLE_URI,
    2: CRATE_BASESET_III_BUNDLE_URI
};

// Map names to IDs for CrazyGames invites
const mapNameToId = {
    'vertigo': 1,
    'shipping': 2,
    'fidelio': 3,
    'ecstasy': 4
};

function REQUEST_MAP_URL_ccg0d486d8eb(map_id){
    console.log(`Downloading Map: ${map_id}`);

    // Note: We do NOT clear followLeaderUuid on homescreen because
    // the normal flow between matches goes through homescreen.
    // followLeaderUuid persists until page refresh.

    const waitForMultiplayerJoin = map_id !== 0;
    const downloadData = {
        uri: mapping[map_id],
        waitForMultiplayerJoin: waitForMultiplayerJoin
    };
    
    // Track map loading event for analytics
    if (window.analytics && typeof window.analytics.trackMapEvent === 'function') {
        window.analytics.trackMapEvent(map_id);
    }
    
    const checkUnityInstance = setInterval(() => {
        console.log(`Downloading Map: ${window.unityInstance} --- ${window.unityInstance.Module} --- ${window.unityInstance.Module.calledRun}`);
        if (window.unityInstance) {
            console.log(`Window.unityInstance exists ${window.unityInstance}`);
            clearInterval(checkUnityInstance);
            
            // Check if this is the player bundle (map_id 100)
            if (map_id === 100) {
                window.unityInstance.SendMessage(
                    "PlayerBundleManager",
                    "HandlePlayerBundleUri",
                    mapping[map_id]
                );
            }
            // Check if this is the atlas bundle (map_id 200)
            else if (map_id === 200) {
                console.log(`Sending atlas bundle URI: ${mapping[map_id]}`);
                window.unityInstance.SendMessage(
                    "SceneLoaderHook",
                    "CALLBACK_ATLAS_BUNDLE_URI",
                    mapping[map_id]
                );
            }
            else {
                console.log(`Window.unityInstance Scene Callback DOwnload Scene ${JSON.stringify(downloadData)}`);

                // Always send atlas bundle for all scenes
                console.log(`Sending atlas bundle URI: ${mapping[200]}`);
                window.unityInstance.SendMessage(
                    "SceneLoaderHook",
                    "CALLBACK_ATLAS_BUNDLE_URI",
                    mapping[200]
                );

                window.unityInstance.SendMessage(
                    "SceneLoaderHook",
                    "CALLBACK_DOWNLOAD_SCENE",
                    JSON.stringify(downloadData)
                );
            }
        }
    }, 25);
}

// ============================================================================
// TOURNAMENT WAITING ROOM
// ============================================================================

// Waiting room state
let waitingRoomActive = false;
let waitingRoomPollInterval = null;
let waitingRoomTimerInterval = null;
let waitingRoomGracePeriodEndsAt = null;
let waitingRoomRoundStartsAt = null;
let waitingRoomMatchCode = null;

/**
 * Create and show the tournament waiting room overlay
 */
function createWaitingRoomOverlay() {
    // Remove existing overlay if any
    const existing = document.getElementById('tournament-waiting-room');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'tournament-waiting-room';
    overlay.innerHTML = `
        <div class="twr-content">
            <div class="twr-header">
                <img src="/images/tournament/weapon-knife.png" alt="Knife" class="twr-knife-icon" />
                <h1>OSG KNIFE TOURNAMENT</h1>
                <h2 id="twr-round-name">Loading...</h2>
            </div>
            <div class="twr-players">
                <div class="twr-player twr-you">
                    <div class="twr-player-label">YOU</div>
                    <div class="twr-player-name" id="twr-your-name">---</div>
                    <div class="twr-player-status twr-ready">READY</div>
                </div>
                <div class="twr-vs">VS</div>
                <div class="twr-player twr-opponent">
                    <div class="twr-player-label">OPPONENT</div>
                    <div class="twr-player-name" id="twr-opponent-name">???</div>
                    <div class="twr-player-status" id="twr-opponent-status">WAITING...</div>
                </div>
            </div>
            <div class="twr-status" id="twr-main-status">
                <div class="twr-waiting-text" id="twr-waiting-text">Waiting for opponent...</div>
                <div class="twr-timer" id="twr-timer">10:00</div>
                <div class="twr-timer-label" id="twr-timer-label">grace period remaining</div>
            </div>
            <div class="twr-countdown" id="twr-countdown" style="display: none;">
                <div class="twr-countdown-label">MATCH STARTING IN</div>
                <div class="twr-countdown-number" id="twr-countdown-number">10</div>
            </div>
            <div class="twr-forfeit" id="twr-forfeit" style="display: none;">
                <div class="twr-forfeit-text">Opponent no-show!</div>
                <div class="twr-forfeit-win">YOU WIN BY FORFEIT</div>
            </div>
            <div class="twr-error" id="twr-error" style="display: none;"></div>
        </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

/**
 * Update the waiting room timer (runs every second)
 * Shows either "round starts in" or "grace period remaining"
 */
function updateWaitingRoomTimer() {
    const timer = document.getElementById('twr-timer');
    const timerLabel = document.getElementById('twr-timer-label');
    const waitingText = document.getElementById('twr-waiting-text');
    if (!timer) return;

    const now = Date.now();

    // Check if round hasn't started yet
    if (waitingRoomRoundStartsAt && now < waitingRoomRoundStartsAt) {
        const remaining = Math.max(0, Math.ceil((waitingRoomRoundStartsAt - now) / 1000));
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        if (timerLabel) timerLabel.textContent = 'until round starts';
        if (waitingText) waitingText.textContent = 'Round not started yet...';
        return;
    }

    // Round has started - show grace period countdown
    if (!waitingRoomGracePeriodEndsAt) {
        timer.textContent = '10:00';
        if (timerLabel) timerLabel.textContent = 'grace period remaining';
        if (waitingText) waitingText.textContent = 'Waiting for opponent...';
        return;
    }

    const remaining = Math.max(0, Math.ceil((waitingRoomGracePeriodEndsAt - now) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (timerLabel) timerLabel.textContent = 'grace period remaining';
    if (waitingText) waitingText.textContent = 'Waiting for opponent...';

    // DISABLED: No forfeit - just keep waiting
    // if (remaining <= 0) {
    //     clearInterval(waitingRoomTimerInterval);
    //     waitingRoomTimerInterval = null;
    //     handleGracePeriodExpired();
    // }
    if (remaining <= 0) {
        // Just show "waiting" - no forfeit
        timer.textContent = '0:00';
        if (timerLabel) timerLabel.textContent = 'waiting for opponent';
    }
}

/**
 * Handle grace period expiration (opponent no-show)
 */
async function handleGracePeriodExpired() {
    console.log('[Tournament Waiting Room] Grace period expired, claiming forfeit...');

    const mainStatus = document.getElementById('twr-main-status');
    const forfeitDiv = document.getElementById('twr-forfeit');

    if (mainStatus) mainStatus.style.display = 'none';
    if (forfeitDiv) forfeitDiv.style.display = 'block';

    // Stop polling
    if (waitingRoomPollInterval) {
        clearInterval(waitingRoomPollInterval);
        waitingRoomPollInterval = null;
    }

    try {
        // Claim forfeit win
        const response = await fetch('/api/knife-tournament/waiting-room/forfeit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matchCode: waitingRoomMatchCode })
        });

        const data = await response.json();
        console.log('[Tournament Waiting Room] Forfeit result:', data);

        // Redirect to bracket page after 3 seconds
        setTimeout(() => {
            hideWaitingRoom();
            window.location.href = '/knifetourney';
        }, 3000);

    } catch (error) {
        console.error('[Tournament Waiting Room] Forfeit error:', error);
        showWaitingRoomError('Error claiming forfeit. Please check the bracket.');
    }
}

/**
 * Update the waiting room UI
 */
function updateWaitingRoomUI(data) {
    const roundName = document.getElementById('twr-round-name');
    const yourName = document.getElementById('twr-your-name');
    const opponentName = document.getElementById('twr-opponent-name');
    const opponentStatus = document.getElementById('twr-opponent-status');
    const mainStatus = document.getElementById('twr-main-status');
    const countdown = document.getElementById('twr-countdown');

    if (data.matchInfo) {
        roundName.textContent = `${data.matchInfo.roundName} - Match ${data.matchInfo.matchNumber}`;
    }

    if (data.you) {
        yourName.textContent = data.you.username;
    }

    if (data.opponent) {
        opponentName.textContent = data.opponent.username;
    }

    if (data.opponentReady) {
        opponentStatus.textContent = 'READY';
        opponentStatus.classList.add('twr-ready');
    } else {
        opponentStatus.textContent = 'WAITING...';
        opponentStatus.classList.remove('twr-ready');
    }

    // Store round start time (for "round starts in" countdown)
    if (data.roundStartsAt && !waitingRoomRoundStartsAt) {
        waitingRoomRoundStartsAt = new Date(data.roundStartsAt).getTime();
    }

    // Store grace period end time for smooth countdown
    if (data.gracePeriodEndsAt && !waitingRoomGracePeriodEndsAt) {
        waitingRoomGracePeriodEndsAt = new Date(data.gracePeriodEndsAt).getTime();
    }

    // Start smooth 1-second timer updates (handles both round start and grace period)
    if (!waitingRoomTimerInterval) {
        waitingRoomTimerInterval = setInterval(updateWaitingRoomTimer, 1000);
        updateWaitingRoomTimer(); // Immediate first update
    }

    // Show countdown when both ready
    if (data.ready && data.startAt) {
        // Stop grace period timer
        if (waitingRoomTimerInterval) {
            clearInterval(waitingRoomTimerInterval);
            waitingRoomTimerInterval = null;
        }
        mainStatus.style.display = 'none';
        countdown.style.display = 'block';
        startMatchCountdown(data.startAt);
    }
}

/**
 * Start the countdown to match start (10 second countdown when both players ready)
 */
function startMatchCountdown(startAtISO) {
    const countdownNumber = document.getElementById('twr-countdown-number');
    const startAt = new Date(startAtISO).getTime();

    // Clear any existing poll
    if (waitingRoomPollInterval) {
        clearInterval(waitingRoomPollInterval);
        waitingRoomPollInterval = null;
    }

    const countdownInterval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.ceil((startAt - now) / 1000);

        if (remaining <= 0) {
            clearInterval(countdownInterval);
            countdownNumber.textContent = 'GO!';

            // Join the match!
            console.log(`[Tournament Waiting Room] Countdown complete, joining match: ${waitingRoomMatchCode}`);

            window.unityInstance.SendMessage(
                ">>>UNIFIED MATCHMAKING SERVICE<<<",
                "JoinMatchFromInviteCodeJS",
                waitingRoomMatchCode
            );

            // Keep overlay visible - will be hidden by triggerAnimation
        } else {
            countdownNumber.textContent = remaining.toString();
        }
    }, 100);
}

/**
 * Show error in waiting room
 */
function showWaitingRoomError(message) {
    const errorDiv = document.getElementById('twr-error');
    const mainStatus = document.getElementById('twr-main-status');

    if (errorDiv && mainStatus) {
        mainStatus.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = message;
    }

    // Redirect to homescreen after 3 seconds
    setTimeout(() => {
        hideWaitingRoom();
        window.unityInstance.SendMessage(
            "SceneLoaderHook",
            "CALLBACK_TARGET_SCENE",
            "homescreen"
        );
    }, 3000);
}

/**
 * Hide the waiting room overlay
 */
function hideWaitingRoom() {
    waitingRoomActive = false;
    waitingRoomGracePeriodEndsAt = null;
    waitingRoomRoundStartsAt = null;
    waitingRoomMatchCode = null;

    if (waitingRoomPollInterval) {
        clearInterval(waitingRoomPollInterval);
        waitingRoomPollInterval = null;
    }
    if (waitingRoomTimerInterval) {
        clearInterval(waitingRoomTimerInterval);
        waitingRoomTimerInterval = null;
    }

    const overlay = document.getElementById('tournament-waiting-room');
    if (overlay) {
        overlay.classList.add('twr-hiding');
        setTimeout(() => overlay.remove(), 300);
    }
}

// Expose globally so triggerAnimation can call it
window.hideWaitingRoom = hideWaitingRoom;

/**
 * Start the tournament waiting room flow
 */
async function startTournamentWaitingRoom(matchCode) {
    console.log(`[Tournament Waiting Room] Starting for match: ${matchCode}`);

    waitingRoomActive = true;
    waitingRoomMatchCode = matchCode;

    // Create overlay
    createWaitingRoomOverlay();

    // Pre-download player bundle while waiting
    if (window.REQUEST_MAP_URL_ccg0d486d8eb) {
        console.log('[Tournament Waiting Room] Pre-downloading player bundle...');
        window.REQUEST_MAP_URL_ccg0d486d8eb(100);
    }

    try {
        // Join the waiting room
        const joinResponse = await fetch('/api/knife-tournament/waiting-room/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matchCode })
        });

        if (!joinResponse.ok) {
            const error = await joinResponse.json();
            console.error('[Tournament Waiting Room] Join failed:', error);
            showWaitingRoomError(error.error || 'Failed to join waiting room');
            return;
        }

        const joinData = await joinResponse.json();
        console.log('[Tournament Waiting Room] Joined:', joinData);

        updateWaitingRoomUI(joinData);

        // If already ready (both players), countdown will start
        if (joinData.ready && joinData.startAt) {
            return; // Countdown started in updateWaitingRoomUI
        }

        // Start polling for opponent (every 3s)
        waitingRoomPollInterval = setInterval(async () => {
            if (!waitingRoomActive) {
                clearInterval(waitingRoomPollInterval);
                return;
            }

            try {
                const statusResponse = await fetch(`/api/knife-tournament/waiting-room/status?matchCode=${matchCode}`);

                if (!statusResponse.ok) {
                    console.error('[Tournament Waiting Room] Status check failed');
                    return;
                }

                const statusData = await statusResponse.json();
                updateWaitingRoomUI(statusData);

                // If ready, countdown started - stop polling
                if (statusData.ready && statusData.startAt) {
                    clearInterval(waitingRoomPollInterval);
                    waitingRoomPollInterval = null;
                }

                // If forfeit detected from backend, handle it
                if (statusData.forfeit && statusData.forfeitWinnerUuid) {
                    handleGracePeriodExpired();
                }
            } catch (error) {
                console.error('[Tournament Waiting Room] Poll error:', error);
            }
        }, 3000);

    } catch (error) {
        console.error('[Tournament Waiting Room] Error:', error);
        showWaitingRoomError('Connection error. Please try again.');
    }
}

// ============================================================================
// MAIN TARGET SCENE HANDLER
// ============================================================================

// Called by Unity to determine target scene based on domain
window.GET_TARGET_SCENE = function() {
    const checkUnityInstance = setInterval(() => {
        if (window.unityInstance) {
            clearInterval(checkUnityInstance);

            // Check CrazyGames invite params FIRST (highest priority)
            // Invite links with roomId/leaderId should always be respected over instant multiplayer
            if (typeof window.CrazyGames !== 'undefined' &&
                typeof window.CrazyGames.SDK !== 'undefined' &&
                typeof window.CrazyGames.SDK.game !== 'undefined') {
                try {
                    const inviteRoomId = window.CrazyGames.SDK.game.getInviteParam('roomId');
                    const inviteLeaderId = window.CrazyGames.SDK.game.getInviteParam('leaderId');

                    // Store leaderId for party follow feature
                    if (inviteLeaderId) {
                        window.followLeaderUuid = inviteLeaderId;
                        console.log(`[CrazyGames Invite] Following leader: ${inviteLeaderId}`);
                    }

                    if (inviteRoomId) {
                        console.log(`[CrazyGames Invite] Detected invite for room: ${inviteRoomId}`);
                        // Direct to map, skipping homescreen
                        window.unityInstance.SendMessage(
                            ">>>UNIFIED MATCHMAKING SERVICE<<<",
                            "JoinMatchFromInviteCodeJS",
                            inviteRoomId
                        );
                        return;
                    }
                } catch (error) {
                    console.log('[CrazyGames Invite] Error checking invite params:', error);
                }
            }

            // Check CrazyGames Instant Multiplayer (only if no invite params)
            // If isInstantMultiplayer is true, skip homescreen and create a fresh private match
            if (typeof window.CrazyGames !== 'undefined' &&
                typeof window.CrazyGames.SDK !== 'undefined' &&
                typeof window.CrazyGames.SDK.game !== 'undefined' &&
                window.CrazyGames.SDK.game.isInstantMultiplayer === true) {
                console.log('[CrazyGames] Instant Multiplayer detected - creating fresh match');
                // Persist instant multiplayer mode for subsequent match requests
                window.isInstantMultiplayerMode = true;
                window.unityInstance.SendMessage(
                    ">>>UNIFIED MATCHMAKING SERVICE<<<",
                    "JoinMatchFromInviteCodeJS",
                    "instant-multiplayer"
                );
                return;
            }
            /*
            // CrazyGames Auto-Matchmake: On first CrazyGames load, skip homescreen and join public match
            // This triggers when on CrazyGames but NOT via instant multiplayer or invite link
            if (location.hostname.includes('crazygames.com')) {
                console.log('[CrazyGames] Auto-matchmaking to public match');
                window.unityInstance.SendMessage(
                    ">>>UNIFIED MATCHMAKING SERVICE<<<",
                    "JoinMatchFromInviteCodeJS",
                    "auto-matchmake"
                );
                return;
            }*/

            // Check for URL hash invite
            const hash = window.location.hash.slice(1); // Remove #
            if (hash && hash.length >= 8) {
                const matchCode = hash;

                // Check if this is a tournament match (starts with "osg")
                if (matchCode.startsWith('osg')) {
                    console.log(`[Tournament Match] Detected tournament match: ${matchCode}`);
                    startTournamentWaitingRoom(matchCode);
                    return;
                }

                // Regular match - join directly
                console.log(`[URL Hash Invite] Detected invite for match: ${matchCode}`);
                window.unityInstance.SendMessage(
                    ">>>UNIFIED MATCHMAKING SERVICE<<<",
                    "JoinMatchFromInviteCodeJS",
                    matchCode
                );
                return;
            }

            // Normal flow - go to homescreen
            let targetScene = "homescreen";
            window.unityInstance.SendMessage(
                "SceneLoaderHook",
                "CALLBACK_TARGET_SCENE",
                targetScene
            );
        }
    }, 25);
};

// Hash management functions for match sharing
window.SetMatchHash = function(matchCode) {    
    window.location.hash = matchCode;
    console.log(`[Match Hash] Set hash: ${window.location.hash}`);
};

window.ClearMatchHash = function() {
    window.location.hash = '';
    console.log('[Match Hash] Cleared hash');
};

function REQUEST_BRAINSTEM_URL_ccg0d486d8eb(stem_path){
    console.log(`Downloading Brain Stem Asset: ${stem_path}`);

    // Check if path exists in mapping
    if (!brainStemMapping[stem_path]) {
        console.error(`Brain stem path not found in mapping: ${stem_path}`);
        return;
    }

    const bundleUri = brainStemMapping[stem_path];

    const checkUnityInstance = setInterval(() => {
        if (window.unityInstance) {
            console.log(`Sending brain stem bundle URI for: ${stem_path}`);
            clearInterval(checkUnityInstance);

            // Send path|uri to Unity (BrainStem component)
            window.unityInstance.SendMessage(
                "BrainStem",
                "HandleBrainStemBundleURI",
                `${stem_path}|${bundleUri}`
            );
        }
    }, 25);
}

function REQUEST_CRATE_BUNDLE_URL(crate_version) {
    console.log(`Downloading Crate Bundle: ${crate_version}`);

    // Check if crate version exists in mapping
    if (crateMapping[crate_version] === undefined) {
        console.error(`Crate version not found in mapping: ${crate_version}`);
        return;
    }

    const bundleUri = crateMapping[crate_version];

    const checkUnityInstance = setInterval(() => {
        if (window.unityInstance) {
            console.log(`Sending crate bundle URI for version: ${crate_version}`);
            clearInterval(checkUnityInstance);

            // Send version|uri to Unity (CrateManager component)
            window.unityInstance.SendMessage(
                ">>>JAVASCRIPT BRIDGE<<<",
                "HandleCrateBundleURICallback",
                `${crate_version}|${bundleUri}`
            );
        }
    }, 25);
}

// Export functions to global scope for Unity to call
window.REQUEST_MAP_URL_ccg0d486d8eb = REQUEST_MAP_URL_ccg0d486d8eb;
window.REQUEST_BRAINSTEM_URL_ccg0d486d8eb = REQUEST_BRAINSTEM_URL_ccg0d486d8eb;
window.REQUEST_CRATE_BUNDLE_URL = REQUEST_CRATE_BUNDLE_URL;


function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        console.log('Copied to clipboard: ' + text);
    }).catch(function(err) {
        console.error('Failed to copy: ', err);
    });
}

window.copyToClipboard = copyToClipboard;