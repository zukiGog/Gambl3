const STORAGE_KEY = "fakeCasinoClubState";
const state = {
  users: {},
  currentUser: null,
  balance: 100,
  streak: 1,
  lastClaim: null,
  history: [],
  avatar: "😎",
  currentGame: null,
  theme: "dark",
  winStreak: 0,
};

let elements = {};

function initializeElements() {
  elements = {
    balance: document.getElementById("balance"),
    streak: document.getElementById("streak"),
    dailyBonus: document.getElementById("daily-bonus"),
    claimButton: document.getElementById("claim-button"),
    claimInfo: document.getElementById("claim-info"),
    gameTitle: document.getElementById("game-title"),
    gameDescription: document.getElementById("game-description"),
    gameContent: document.getElementById("game-content"),
    historyList: document.getElementById("history-list"),
    leaderboardList: document.getElementById("leaderboard-list"),
    loginOverlay: document.getElementById("login-overlay"),
    avatarOverlay: document.getElementById("avatar-overlay"),
    loginTab: document.getElementById("login-tab"),
    signupTab: document.getElementById("signup-tab"),
    loginForm: document.getElementById("login-form"),
    signupForm: document.getElementById("signup-form"),
    loginUsername: document.getElementById("login-username"),
    loginPassword: document.getElementById("login-password"),
    signupUsername: document.getElementById("signup-username"),
    signupPassword: document.getElementById("signup-password"),
    signupAvatar: document.getElementById("signup-avatar"),
    loginButton: document.getElementById("login-button"),
    signupButton: document.getElementById("signup-button"),
    authError: document.getElementById("auth-error"),
    userAvatar: document.getElementById("user-avatar"),
    userName: document.getElementById("user-name"),
    themeToggle: document.getElementById("theme-toggle"),
    changeAvatarButton: document.getElementById("change-avatar-button"),
    saveAvatarButton: document.getElementById("save-avatar-button"),
    cancelAvatarButton: document.getElementById("cancel-avatar-button"),
    changeAvatarSelect: document.getElementById("change-avatar-select"),
    customAvatarInput: document.getElementById("custom-avatar-input"),
    customAvatarGroup: document.getElementById("custom-avatar-group"),
    logoutButton: document.getElementById("logout-button"),
    serverMessage: document.getElementById("server-message"),
    donationOverlay: document.getElementById("donation-overlay"),
    donationRecipient: document.getElementById("donation-recipient"),
    donationAmount: document.getElementById("donation-amount"),
    confirmDonationButton: document.getElementById("confirm-donation-button"),
    cancelDonationButton: document.getElementById("cancel-donation-button"),
    donationError: document.getElementById("donation-error"),
  };
}

const gameDescriptions = {
  mines:
    "Pick safe tiles and avoid mines. Cash out any time before you hit a mine.",
  towers:
    "Climb the tower step by step. Each level increases your multiplier and your risk.",
  crash:
    "Watch the multiplier rise. Cash out before the crash to win your bet times the multiplier.",
  plinko:
    "Drop a ball through the board and collect a random multiplier on the landing zone.",
  dice: "Guess the dice roll outcome and win big with the right prediction.",
  blackjack:
    "Beat the dealer with classic blackjack rules in a quick single-player round.",
  coinflip:
    "Flip a coin against the house. Pick heads or tails and win if you call it right.",
  wheel:
    "Spin the prize wheel for big multipliers or miss the target entirely.",
  slots: "Spin the slot machine and hope the reels line up for a jackpot.",
  roulette:
    "Bet on red, black, odd, even or a single number in classic roulette.",
  scratch: "Scratch a card and reveal matching symbols for instant prizes.",
  keno: "Pick numbers and match the random draw for a chance at big payouts.",
  baccarat: "Bet on Player, Banker, or Tie in a quick baccarat showdown.",
  treasure: "Choose a chest to reveal hidden treasure or a lost bet.",
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    saveState();
    return;
  }
  try {
    const parsed = JSON.parse(saved);
    if (!parsed.users) {
      parsed.users = {};
      if (parsed.balance !== undefined) {
        parsed.users[parsed.currentUser || "player"] = {
          balance: parsed.balance,
          streak: parsed.streak || 1,
          lastClaim: parsed.lastClaim || null,
          history: parsed.history || [],
          avatar: parsed.avatar || "😎",
          password: parsed.password || "",
          createdAt: new Date().toISOString(),
          winStreak: parsed.winStreak || 0,
        };
        parsed.currentUser = parsed.currentUser || "player";
      }
    }
    Object.assign(state, parsed);
    if (state.currentUser && state.users[state.currentUser]) {
      loadUserProfile(state.currentUser);
    }
  } catch (error) {
    console.error("Failed to parse state, resetting to default.", error);
    saveState();
  }
}

function saveState() {
  persistCurrentUser();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function persistCurrentUser() {
  if (!state.currentUser) return;
  state.users[state.currentUser] = {
    balance: state.balance,
    streak: state.streak,
    lastClaim: state.lastClaim,
    history: state.history,
    avatar: state.avatar,
    password: state.users[state.currentUser]?.password || "",
    createdAt:
      state.users[state.currentUser]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function loadUserProfile(username) {
  if (!state.users[username]) return;
  const user = state.users[username];
  state.currentUser = username;
  state.balance = user.balance;
  state.streak = user.streak;
  state.lastClaim = user.lastClaim;
  state.history = user.history || [];
  state.avatar = user.avatar || "😎";
  state.winStreak = user.winStreak || 0;
}

function getCurrentUserName() {
  return state.currentUser || "Guest";
}

function renderUserBanner() {
  const avatar = state.avatar || "😎";
  if (avatar.startsWith("data:")) {
    elements.userAvatar.innerHTML = `<img src="${avatar}" style="width: 24px; height: 24px; border-radius: 50%;">`;
  } else {
    elements.userAvatar.textContent = avatar;
  }
  elements.userName.textContent = getCurrentUserName();
}

function renderLeaderboard() {
  const entries = Object.entries(state.users)
    .sort(([, a], [, b]) => b.balance - a.balance)
    .slice(0, 10);

  if (entries.length === 0) {
    elements.leaderboardList.innerHTML =
      '<li class="leaderboard-item">No players yet.</li>';
    return;
  }

  elements.leaderboardList.innerHTML = entries
    .map(
      ([name, profile], index) => `
      <li class="leaderboard-item">
        <span>${index + 1}</span>
        <span class="leader-avatar">${profile.avatar || "😎"}</span>
        <div>
          <strong>${name}</strong>
          <div class="muted">$${profile.balance.toFixed(2)}</div>
        </div>
        ${name !== state.currentUser ? `<button class="donate-btn small-btn" data-recipient="${name}">💰 Donate</button>` : ''}
      </li>
    `,
    )
    .join("");
}

function showLoginOverlay() {
  elements.loginOverlay.classList.remove("hidden");
  elements.authError.textContent = "";
}

function hideLoginOverlay() {
  elements.loginOverlay.classList.add("hidden");
}

function switchAuthTab(tab) {
  const loginActive = tab === "login";
  elements.loginTab.classList.toggle("active", loginActive);
  elements.signupTab.classList.toggle("active", !loginActive);
  elements.loginForm.classList.toggle("hidden", !loginActive);
  elements.signupForm.classList.toggle("hidden", loginActive);
  elements.authError.textContent = "";
}

function showAuthError(message) {
  elements.authError.textContent = message;
}

function handleLogin() {
  const username = elements.loginUsername.value.trim();
  const password = elements.loginPassword.value;
  if (!username || !password) {
    showAuthError("Enter both a username and password.");
    return;
  }

  const account = state.users[username];
  if (!account) {
    showAuthError("No account found. Try signing up first.");
    return;
  }
  if (account.password !== password) {
    showAuthError("Password incorrect. Try again.");
    return;
  }

  loadUserProfile(username);
  saveState();
  renderUserBanner();
  renderLeaderboard();
  hideLoginOverlay();
  updateStatus();
  addHistory(`Logged in as ${username}. Welcome back!`);
}

function handleSignup() {
  const username = elements.signupUsername.value.trim();
  const password = elements.signupPassword.value;
  const avatar = elements.signupAvatar.value || "😎";
  if (!username || !password) {
    showAuthError("Enter a username and password to create an account.");
    return;
  }
  if (state.users[username]) {
    showAuthError("That username is already taken. Choose another.");
    return;
  }

  state.users[username] = {
    balance: 100,
    streak: 1,
    lastClaim: null,
    history: [],
    avatar,
    password,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  loadUserProfile(username);
  saveState();
  renderUserBanner();
  renderLeaderboard();
  hideLoginOverlay();
  updateStatus();
  addHistory(`Account created for ${username}. Let the games begin!`);
}

function setServerMessage() {
  const messages = [
    "Server event: streak boost rolling now!",
    "Server message: double fun at the slots!",
    "Server event: leaderboard chase is on!",
    "Server message: lucky day for treasure hunters!",
  ];
  elements.serverMessage.textContent =
    messages[Math.floor(Math.random() * messages.length)];
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.body.classList.toggle("light-mode", state.theme === "light");
  elements.themeToggle.textContent =
    state.theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode";
  saveState();
}

function showAvatarOverlay() {
  elements.avatarOverlay.classList.remove("hidden");
}

function hideAvatarOverlay() {
  elements.avatarOverlay.classList.add("hidden");
}

function toggleCustomAvatar() {
  const isCustom = elements.changeAvatarSelect.value === "custom";
  elements.customAvatarGroup.classList.toggle("hidden", !isCustom);
}

function saveAvatar() {
  let newAvatar = elements.changeAvatarSelect.value;
  if (newAvatar === "custom") {
    const file = elements.customAvatarInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        newAvatar = e.target.result;
        updateAvatar(newAvatar);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select an image file.");
      return;
    }
  } else {
    updateAvatar(newAvatar);
  }
}

function updateAvatar(avatar) {
  if (state.currentUser) {
    state.users[state.currentUser].avatar = avatar;
    state.avatar = avatar;
    saveState();
    renderUserBanner();
  }
  hideAvatarOverlay();
}

function showDonationOverlay(recipient) {
  elements.donationRecipient.textContent = recipient;
  elements.donationAmount.value = "";
  elements.donationError.textContent = "";
  elements.donationOverlay.classList.remove("hidden");
}

function hideDonationOverlay() {
  elements.donationOverlay.classList.add("hidden");
}

function confirmDonation() {
  const recipient = elements.donationRecipient.textContent;
  const amount = parseFloat(elements.donationAmount.value);
  if (isNaN(amount) || amount <= 0) {
    elements.donationError.textContent = "Please enter a valid amount.";
    return;
  }
  if (amount > state.users[state.currentUser].balance) {
    elements.donationError.textContent = "Insufficient balance.";
    return;
  }
  // Perform donation
  state.users[state.currentUser].balance -= amount;
  state.users[recipient].balance += amount;
  // Add to history
  const time = new Date().toLocaleString();
  const historyEntry = {
    type: "donation",
    amount: -amount,
    recipient: recipient,
    time: time,
  };
  state.users[state.currentUser].history.unshift(historyEntry);
  state.history = state.users[state.currentUser].history; // sync
  if (state.history.length > 12) {
    state.history.length = 12;
    state.users[state.currentUser].history.length = 12;
  }
  const recipientHistoryEntry = {
    type: "donation_received",
    amount: amount,
    from: state.currentUser,
    time: time,
  };
  state.users[recipient].history.unshift(recipientHistoryEntry);
  saveState();
  renderLeaderboard();
  renderUserBanner();
  renderHistory();
  hideDonationOverlay();
}

function logout() {
  state.currentUser = null;
  saveState();
  renderUserBanner();
  showLoginOverlay();
}

function showConfetti() {
  const confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti";
  document.body.appendChild(confettiContainer);

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.animationDelay = Math.random() * 3 + "s";
    piece.style.background = [
      "var(--accent)",
      "var(--success)",
      "var(--danger)",
      "#ffd700",
    ][Math.floor(Math.random() * 4)];
    confettiContainer.appendChild(piece);
  }

  setTimeout(() => {
    document.body.removeChild(confettiContainer);
  }, 3000);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(dateA, dateB) {
  return Math.round((new Date(dateA) - new Date(dateB)) / 86400000);
}

function getBonusForStreak(streak) {
  return 100 * Math.max(1, streak - 2);
}

function updateStatus() {
  elements.balance.textContent = `$${state.balance.toFixed(2)}`;
  elements.streak.textContent = state.streak;
  elements.dailyBonus.textContent = `$${getBonusForStreak(state.streak)}`;

  const today = todayKey();
  if (state.lastClaim === today) {
    elements.claimButton.disabled = true;
    elements.claimInfo.textContent =
      "Daily bonus already claimed today. Come back tomorrow for more!";
  } else {
    elements.claimButton.disabled = false;
    elements.claimInfo.textContent = "Claim your streak reward once per day.";
  }

  renderHistory();
}

function addHistory(message) {
  if (!state.currentUser) return;
  const historyEntry = { time: new Date().toLocaleString(), message };
  state.users[state.currentUser].history.unshift(historyEntry);
  state.history = state.users[state.currentUser].history; // sync
  if (state.history.length > 12) {
    state.history.length = 12;
    state.users[state.currentUser].history.length = 12;
  }
  saveState();
  renderHistory();
}

function renderHistory() {
  elements.historyList.innerHTML = state.history
    .map((item) => {
      let message = item.message;
      if (item.type === "donation") {
        message = `Donated $${Math.abs(item.amount)} to ${item.recipient}`;
      } else if (item.type === "donation_received") {
        message = `Received $${item.amount} from ${item.from}`;
      }
      return `<li><strong>${item.time}</strong><br>${message}</li>`;
    })
    .join("");
}

function claimDaily() {
  const today = todayKey();
  if (state.lastClaim === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (state.lastClaim === yesterdayKey) {
    state.streak += 1;
  } else {
    state.streak = 1;
  }

  const bonus = getBonusForStreak(state.streak);
  state.balance += bonus;
  state.lastClaim = today;
  saveState();
  updateStatus();
  addHistory(
    `Claimed daily bonus of $${bonus}. Streak is now ${state.streak} days.`,
  );
}

function chooseGame(gameId) {
  state.currentGame = null;
  elements.gameTitle.textContent =
    gameId.charAt(0).toUpperCase() + gameId.slice(1);
  elements.gameDescription.textContent =
    gameDescriptions[gameId] || "Play and win fake dollars!";

  const html = {
    mines: minesHtml,
    towers: towersHtml,
    crash: crashHtml,
    plinko: plinkoHtml,
    dice: diceHtml,
    blackjack: blackjackHtml,
    coinflip: coinflipHtml,
    wheel: spinWheelHtml,
    slots: slotsHtml,
    roulette: rouletteHtml,
    scratch: scratchHtml,
    keno: kenoHtml,
    baccarat: baccaratHtml,
    treasure: treasureHtml,
  };

  elements.gameContent.innerHTML = html[gameId]();
  if (gameId === "mines") initMines();
  if (gameId === "towers") initTowers();
  if (gameId === "crash") initCrash();
  if (gameId === "plinko") initPlinko();
  if (gameId === "dice") initDice();
  if (gameId === "blackjack") initBlackjack();
  if (gameId === "coinflip") initCoinflip();
  if (gameId === "wheel") initSpinWheel();
  if (gameId === "slots") initSlots();
  if (gameId === "roulette") initRoulette();
  if (gameId === "scratch") initScratch();
  if (gameId === "keno") initKeno();
  if (gameId === "baccarat") initBaccarat();
  if (gameId === "treasure") initTreasure();
}

function createGameForm(gameId, specialFields = "") {
  return `
    <div class="game-card-set">
      <div class="card">
        <div class="input-group">
          <label>Bet amount</label>
          <input id="bet-input" type="number" min="1" value="10" />
        </div>
        ${specialFields}
        <button id="start-game-button" class="primary-btn">Start ${gameId}</button>
      </div>
      <div class="card">
        <div id="game-state" class="status-label">
          <strong>Ready to play</strong>
          <p>Enter a bet and begin. Your balance is safe until you place a bet.</p>
        </div>
      </div>
    </div>
  `;
}

const minesHtml = () =>
  createGameForm(
    "Mines",
    `
  <div class="input-group">
    <label>Mine difficulty</label>
    <select id="mine-difficulty">
      <option value="5">5 Mines</option>
      <option value="7">7 Mines</option>
      <option value="9">9 Mines</option>
    </select>
  </div>
`,
  );
const towersHtml = () => createGameForm("Towers");
const coinflipHtml = () =>
  createGameForm(
    "Coin Flip",
    `
  <div class="input-group">
    <label>Choose</label>
    <select id="coin-guess">
      <option value="heads">Heads</option>
      <option value="tails">Tails</option>
    </select>
  </div>
  <div id="coin-display" class="coinflip-display">🪙</div>
`,
  );
const spinWheelHtml = () =>
  createGameForm(
    "Spin Wheel",
    `
  <div id="wheel-display" class="wheel-display">
    <div id="wheel-visual" class="wheel-visual">
      <div class="wheel-label">1.5x</div>
      <div class="wheel-label">2x</div>
      <div class="wheel-label">2.5x</div>
      <div class="wheel-label">3x</div>
      <div class="wheel-label">5x</div>
      <div class="wheel-label">BUST</div>
      <div class="wheel-label">1.2x</div>
      <div class="wheel-label">0.5x</div>
    </div>
    <div id="wheel-result" class="wheel-result">Ready to spin</div>
  </div>
  <p class="muted">Spin for a multiplier or risk a bust.</p>
`,
  );

const slotsHtml = () => `
  <div class="game-card-set">
    <div class="card">
      <div class="input-group">
        <label>Bet amount</label>
        <input id="bet-input" type="number" min="1" value="10" />
      </div>
      <button id="start-game-button" class="primary-btn">Spin Slots</button>
    </div>
    <div class="card">
      <div id="game-state" class="status-label">
        <strong>Ready to spin</strong>
        <p>Try your luck on the slot machine.</p>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:16px;">
    <div id="slots-display" class="slots-display">🎰 --- --- ---</div>
  </div>
`;
const rouletteHtml = () =>
  createGameForm(
    "Roulette",
    `
  <div class="input-group">
    <label>Bet type</label>
    <select id="roulette-bet-type">
      <option value="red">Red</option>
      <option value="black">Black</option>
      <option value="odd">Odd</option>
      <option value="even">Even</option>
      <option value="number">Number</option>
    </select>
  </div>
  <div class="input-group" id="roulette-number-row" style="display:none;">
    <label>Pick a number</label>
    <select id="roulette-number">
      ${[...Array(37).keys()].map((n) => `<option value="${n}">${n}</option>`).join("")}
    </select>
  </div>
`,
  );
const scratchHtml = () => `
  <div class="game-card-set">
    <div class="card">
      <div class="input-group">
        <label>Bet amount</label>
        <input id="bet-input" type="number" min="1" value="10" />
      </div>
      <button id="start-game-button" class="primary-btn">Reveal Scratch Card</button>
    </div>
    <div class="card">
      <div id="game-state" class="status-label">
        <strong>Ready to scratch</strong>
        <p>Click the covered squares to reveal matching symbols.</p>
      </div>
    </div>
  </div>
  <div id="scratch-grid" class="scratch-grid"></div>
`;
const kenoHtml = () =>
  createGameForm(
    "Keno",
    `
  <div class="input-group">
    <label>Pick 5 numbers (1-20)</label>
    <div class="game-card-set" style="grid-template-columns: repeat(5, minmax(60px, 1fr)); gap: 8px;">
      ${[1, 2, 3, 4, 5]
        .map(
          (i) => `
        <select id="keno-num-${i}">
          ${[...Array(20).keys()]
            .map((n) => `<option value="${n + 1}">${n + 1}</option>`)
            .join("")}
        </select>
      `,
        )
        .join("")}
    </div>
  </div>
`,
  );
const baccaratHtml = () =>
  createGameForm(
    "Baccarat",
    `
  <div class="input-group">
    <label>Bet on</label>
    <select id="baccarat-bet">
      <option value="player">Player</option>
      <option value="banker">Banker</option>
      <option value="tie">Tie</option>
    </select>
  </div>
`,
  );
const treasureHtml = () => createGameForm("Treasure Hunt");
const crashHtml = () => `
  <div class="game-card-set">
    <div class="card">
      <div class="input-group">
        <label>Bet amount</label>
        <input id="bet-input" type="number" min="1" value="10" />
      </div>
      <button id="start-game-button" class="primary-btn">Launch Rocket</button>
    </div>
    <div class="card">
      <div id="game-state" class="status-label">
        <strong>Ready to launch</strong>
        <p>Watch the multiplier rise and cash out before it crashes!</p>
      </div>
    </div>
  </div>
`;
const plinkoHtml = () => `
  <div class="game-card-set">
    <div class="card">
      <div class="input-group">
        <label>Bet amount</label>
        <input id="bet-input" type="number" min="1" value="10" />
      </div>
      <button id="start-game-button" class="primary-btn">Drop Ball</button>
    </div>
    <div class="card">
      <div id="game-state" class="status-label">
        <strong>Ready to drop</strong>
        <p>Drop a ball and watch it bounce down to a multiplier.</p>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:16px;">
    <div id="plinko-board" style="min-height: 300px; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; background: rgba(0,0,0,0.3); position: relative; display: flex; align-items: center; justify-content: center;">
      <div id="plinko-ball" style="font-size: 2rem; position: absolute; top: 0px; left: 50%; transform: translateX(-50%);">⚪</div>
    </div>
  </div>
`;
const diceHtml = () => `
  <div class="game-card-set">
    <div class="card">
      <div class="input-group">
        <label>Bet amount</label>
        <input id="bet-input" type="number" min="1" value="10" />
      </div>
      <div class="input-group">
        <label>Guess result</label>
        <select id="dice-guess">
          <option value="high">Roll 4-6</option>
          <option value="low">Roll 1-3</option>
          <option value="exact">Exact number</option>
        </select>
      </div>
      <div class="input-group" id="exact-value-row" style="display:none;">
        <label>Exact number</label>
        <select id="exact-number">
          ${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}">${n}</option>`).join("")}
        </select>
      </div>
      <button id="start-game-button" class="primary-btn">Roll Dice</button>
    </div>
    <div class="card">
      <div id="dice-display" class="dice-display">🎲</div>
      <div id="game-state" class="status-label">
        <strong>Ready to roll</strong>
        <p>Choose your bet, then predict the dice.</p>
      </div>
    </div>
  </div>
`;
const blackjackHtml = () => `
  <div class="game-card-set">
    <div class="card">
      <div class="input-group">
        <label>Bet amount</label>
        <input id="bet-input" type="number" min="1" value="10" />
      </div>
      <button id="start-game-button" class="primary-btn">Deal Cards</button>
    </div>
    <div class="card">
      <div id="game-state" class="status-label">
        <strong>Ready to deal</strong>
        <p>Start a quick blackjack round and beat the dealer.</p>
      </div>
    </div>
  </div>
`;

function parseBet() {
  const input = document.getElementById("bet-input");
  if (!input) return 0;
  return Math.max(1, Math.min(state.balance, Number(input.value) || 0));
}

function updateGameState(message, status = "Ready to play") {
  // Check luck level: if winStreak >= 5, force loss
  if (status === "Win" && state.winStreak >= 5) {
    status = "Lose";
    message += " (Luck level intervention - too lucky!)";
    // Since balance was already added in the game logic, we need to subtract it back
    // But this is tricky because each game adds different amounts.
    // Perhaps better to prevent the win in the first place.
    // For now, let's assume the balance update happens after this call.
  }

  const stateCard = document.getElementById("game-state");
  if (stateCard) {
    const playAgainBtn =
      status === "Win" || status === "Lose"
        ? '<button id="play-again-btn" class="small-btn">🎲 Play Again</button>'
        : "";
    stateCard.innerHTML = `<strong>${status}</strong><p>${message}</p>${playAgainBtn}`;
    if (playAgainBtn) {
      document.getElementById("play-again-btn").onclick = () =>
        chooseGame(state.currentGame);
    }
  }
  if (status === "Win") {
    state.winStreak++;
    showConfetti();
  } else if (status === "Lose") {
    state.winStreak = 0;
  }
  // Sync to user
  if (state.currentUser) {
    state.users[state.currentUser].winStreak = state.winStreak;
  }
  saveState();
}

// Mines game
function initMines() {
  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    const mineCount = Number(document.getElementById("mine-difficulty").value);
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    const tiles = 36;
    const minePositions = new Set();
    while (minePositions.size < mineCount) {
      minePositions.add(Math.floor(Math.random() * tiles));
    }

    state.currentGame = {
      type: "mines",
      bet,
      tiles,
      mineCount,
      revealed: [],
      banked: 0,
      active: true,
      minePositions: Array.from(minePositions),
      safeCount: 0,
    };
    state.balance -= bet;
    saveState();
    renderMinesBoard();
    updateGameState(
      "Pick safe tiles. Cash out whenever you like.",
      "Mines active",
    );
  };
}

function renderMinesBoard() {
  const game = state.currentGame;
  if (!game || game.type !== "mines") return;

  const tilesHtml = Array.from({ length: game.tiles }, (_, index) => {
    const isRevealed = game.revealed.includes(index) || !game.active;
    const isMine = game.minePositions.includes(index);
    const label = isRevealed
      ? isMine
        ? "💣 MINE"
        : "✅ SAFE"
      : `${index + 1}`;
    const classes = ["tile"];
    if (isRevealed) classes.push(isMine ? "mine" : "safe");

    const style = isRevealed
      ? `style="animation: reveal-pop 0.3s ease; font-weight: bold; font-size: 0.85rem;"`
      : 'style="cursor: pointer;"';

    return `<div class="${classes.join(" ")}" data-index="${index}" data-mine-index="${index}" ${style}>${label}</div>`;
  }).join("");

  const potentialWin = game.bet * (1 + game.safeCount * 0.22);
  const multiplier = (1 + game.safeCount * 0.22).toFixed(2);

  elements.gameContent.innerHTML = `
    <div class="game-card-set">
      <div class="card">
        <p><strong>💰 Bet:</strong> $${game.bet.toFixed(2)}</p>
        <p><strong>💣 Mines:</strong> ${game.mineCount} | <strong>✅ Safe tiles:</strong> ${game.safeCount}</p>
        <p style="font-size: 1.2rem; color: var(--accent); font-weight: bold; margin: 8px 0;">
          💵 Win: ${multiplier}x = $${potentialWin.toFixed(2)}
        </p>
        <button id="cashout-button" class="primary-btn" style="background: linear-gradient(135deg, var(--success), #52d273); font-weight: bold; border: 2px solid var(--success); ${game.safeCount > 0 ? '' : 'opacity: 0.5;'}">💵 CASH OUT!</button>
      </div>
      <div class="card">
        <p style="color: var(--muted); text-align: center; margin-bottom: 12px;">Click tiles to reveal. Find safe tiles, avoid mines!</p>
        <div id="mines-board" class="tile-grid mines-board">${tilesHtml}</div>
      </div>
    </div>
  `;

  document.querySelectorAll(".tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      if (!state.currentGame || !state.currentGame.active) return;
      const index = Number(tile.dataset.index);
      if (state.currentGame.revealed.includes(index)) return;
      revealMineTile(index);
    });
  });

  document.getElementById("cashout-button").onclick = () => {
    if (!state.currentGame || !state.currentGame.active || game.safeCount === 0)
      return;
    const reward =
      state.currentGame.bet * (1 + state.currentGame.safeCount * 0.22);
    state.balance += reward;
    addHistory(
      `Mines cashed out for $${reward.toFixed(2)} after revealing ${state.currentGame.safeCount} safe tiles.`,
    );
    state.currentGame.active = false;
    saveState();
    updateStatus();
    renderMinesBoard();
    updateGameState(
      `✅ Safe escape! Cashed out $${reward.toFixed(2)} (${(1 + state.currentGame.safeCount * 0.22).toFixed(2)}x) after revealing ${state.currentGame.safeCount} safe tiles. Smart play!`,
      "Success",
    );
  };
}

function revealMineTile(index) {
  const game = state.currentGame;
  const isMine = game.minePositions.includes(index);
  game.revealed.push(index);

  const tileElement = document.querySelectorAll("[data-mine-index]")[index];
  if (tileElement) {
    tileElement.style.animation = "reveal-pop 0.3s ease";
  }

  if (isMine) {
    setTimeout(() => {
      game.active = false;
      updateGameState(
        `💥 BOOM! You hit a mine! Lost $${game.bet.toFixed(2)}.`,
        "Danger",
      );
      addHistory(`Mines burst! Lost $${game.bet.toFixed(2)}.`);
      saveState();
      renderMinesBoard();
      updateStatus();
    }, 300);
    return;
  }

  setTimeout(() => {
    game.safeCount += 1;
    renderMinesBoard();
  }, 300);
}

// Towers game
function initTowers() {
  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    state.balance -= bet;
    state.currentGame = {
      type: "towers",
      bet,
      level: 0,
      active: true,
      currentMultiplier: 1,
    };
    saveState();
    renderTowersBoard();
    updateGameState(
      "Climb the tower or cash out before the next floor falls.",
      "Tower started",
    );
  };
}

function renderTowersBoard() {
  const game = state.currentGame;
  if (!game || game.type !== "towers") return;

  const nextStep = game.level + 1;
  const nextMultiplier = (1 + nextStep * 0.15).toFixed(2);
  const towerDisplay = Array(Math.max(3, game.level + 2))
    .fill("🟩")
    .map((floor, i) => (i < game.level ? "🟩" : i === game.level ? "⬜" : "⬜"))
    .join(" ");

  elements.gameContent.innerHTML = `
    <div class="game-card-set">
      <div class="card">
        <p style="text-align: center; font-size: 1.5rem; margin: 16px 0; word-spacing: 4px;">
          ${towerDisplay}
        </p>
        <p><strong>💰 Bet:</strong> $${game.bet.toFixed(2)}</p>
        <p><strong>🏢 Level:</strong> ${game.level} | <strong>📈 Multiplier:</strong> <span style="color: var(--success); font-weight: bold; font-size: 1.2rem;">${game.currentMultiplier.toFixed(2)}x</span></p>
        <p style="color: var(--accent); font-weight: bold; margin: 8px 0;">💵 Current Win: $${(game.bet * game.currentMultiplier).toFixed(2)}</p>
        <p style="color: var(--muted); font-size: 0.9rem;">Next: ${nextMultiplier}x (Risk: ${22 + game.level * 4}%)</p>
        <button id="climb-button" class="primary-btn">🪜 Climb Level ${nextStep}</button>
        <button id="tower-cashout-button" class="primary-btn" style="background: linear-gradient(135deg, var(--success), #52d273); font-weight: bold; border: 2px solid var(--success);">💵 CASH OUT!</button>
      </div>
    </div>
  `;

  document.getElementById("climb-button").onclick = () => {
    if (!game.active) return;
    const failChance = 0.22 + game.level * 0.04;
    const crash = Math.random() < failChance;
    if (crash) {
      game.active = false;
      const climbButton = document.getElementById("climb-button");
      climbButton.classList.add("bomb-exploding");
      climbButton.innerHTML = "💣";
      climbButton.disabled = true;

      const gameCard =
        elements.gameContent.closest(".game-card-set")?.parentElement ||
        elements.gameContent;
      gameCard.classList.add("explosion-effect");

      setTimeout(() => {
        gameCard.classList.remove("explosion-effect");
        climbButton.innerHTML = "🪜 Climb Level " + (game.level + 2);
        climbButton.classList.remove("bomb-exploding");
        updateGameState(
          `💣 KABOOM! Tower collapsed on level ${game.level + 1}! Lost $${game.bet.toFixed(2)}.`,
          "Danger",
        );
        addHistory(
          `Towers exploded at level ${game.level + 1}, lost $${game.bet.toFixed(2)}.`,
        );
        saveState();
        updateStatus();
        renderTowersBoard();
      }, 600);
      return;
    }
    const climbButton = document.getElementById("climb-button");
    climbButton.style.transform = "translateY(-15px)";
    climbButton.style.opacity = "0.6";
    climbButton.disabled = true;

    game.level += 1;
    game.currentMultiplier = 1 + game.level * 0.15;

    setTimeout(() => {
      climbButton.style.transform = "translateY(0)";
      climbButton.style.opacity = "1";
      climbButton.disabled = false;
      saveState();
      renderTowersBoard();
      updateGameState(
        `🎉 Level ${game.level} conquered! Multiplier: ${game.currentMultiplier.toFixed(2)}x | 💵 Win: $${(game.bet * game.currentMultiplier).toFixed(2)}`,
        "Success",
      );
    }, 400);
  };

  document.getElementById("tower-cashout-button").onclick = () => {
    if (!game.active) return;
    const reward = game.bet * game.currentMultiplier;
    state.balance += reward;
    game.active = false;
    addHistory(
      `Towers cashed out for $${reward.toFixed(2)} at level ${game.level}.`,
    );
    saveState();
    updateStatus();
    renderTowersBoard();
    updateGameState(
      `✅ Cashed out at level ${game.level}! Won $${reward.toFixed(2)} (${game.currentMultiplier.toFixed(2)}x). Nice climb!`,
      "Success",
    );
  };
}

// Crash game
function initCrash() {
  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    state.balance -= bet;
    const crashPoint = 1 + Math.random() * 8;
    state.currentGame = {
      type: "crash",
      bet,
      started: false,
      multiplier: 1,
      crashPoint,
      active: true,
    };
    saveState();
    renderCrashBoard();
    updateGameState(
      "Press launch and cash out before it crashes.",
      "Crash ready",
    );
  };
}

function renderCrashBoard() {
  const game = state.currentGame;
  if (!game || game.type !== "crash") return;

  const rocketColor =
    game.active && game.started ? "var(--success)" : "var(--text)";
  const statusText = !game.started
    ? "Ready to launch"
    : game.active
      ? "🚀 Flying..."
      : "💥 Crashed!";

  // Only render once when starting
  if (!document.getElementById("crash-rocket")) {
    elements.gameContent.innerHTML = `
      <div class="game-card-set">
        <div class="card">
          <div style="min-height: 320px; position: relative; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; background: rgba(0,0,0,0.3); display: flex; align-items: flex-end; justify-content: center; padding: 16px;">
            <div id="crash-rocket" class="crash-rocket" style="font-size: 3rem; color: ${rocketColor};">🚀</div>
            <div id="crash-multiplier" style="position: absolute; top: 16px; font-size: 2.4rem; font-weight: bold; color: var(--accent);">${game.multiplier.toFixed(2)}x</div>
            <div id="crash-status" style="position: absolute; bottom: 16px; font-size: 1rem; color: var(--muted);">${statusText}</div>
          </div>
        </div>
        <div class="card">
          <p><strong>💰 Bet:</strong> $${game.bet.toFixed(2)}</p>
          <p><strong>📈 Current Multiplier:</strong> <span style="color: var(--accent); font-weight: bold; font-size: 1.2rem;">${game.multiplier.toFixed(2)}x</span></p>
          <p><strong>💵 Potential Win:</strong> <span style="color: var(--success); font-weight: bold;">$${(game.bet * game.multiplier).toFixed(2)}</span></p>
          <p style="margin-top: 12px; color: var(--muted); font-size: 0.9rem;">🎯 Tip: Cash out quick before it crashes!</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px;">
            <button id="launch-button" class="primary-btn" ${game.started ? 'style="display:none;"' : ""}>🚀 Launch</button>
            <button id="cashout-crash-button" class="primary-btn" style="background: linear-gradient(135deg, var(--success), #52d273); font-weight: bold; border: 2px solid var(--success); ${!game.started || !game.active ? 'display:none;' : 'display:block;'}">💵 CASH OUT!</button>
          </div>
        </div>
        </div>
      </div>
    `;

    const launchBtn = document.getElementById("launch-button");
    const cashoutBtn = document.getElementById("cashout-crash-button");

    if (launchBtn) {
      launchBtn.onclick = () => {
        if (!game.active) return;
        if (!game.started) {
          const crashRocket = document.getElementById("crash-rocket");
          crashRocket.classList.add("flying");
          game.started = true;
          launchBtn.style.display = "none";
          const cashoutBtn = document.getElementById("cashout-crash-button");
          if (cashoutBtn) cashoutBtn.style.display = "block";
          updateCrashMultiplier();
        }
      };
    }

    if (cashoutBtn) {
      cashoutBtn.onclick = () => {
        if (!game.active || !game.started) return;
        const reward = game.bet * game.multiplier;
        state.balance += reward;
        game.active = false;
        addHistory(
          `Crash cashed out at ${game.multiplier.toFixed(2)}x for $${reward.toFixed(2)}.`,
        );
        saveState();
        updateStatus();
        const crashRocket = document.getElementById("crash-rocket");
        if (crashRocket) crashRocket.classList.remove("flying");
        renderCrashBoard();
        updateGameState(
          `✅ Cashed out at ${game.multiplier.toFixed(2)}x! Won $${reward.toFixed(2)}.`,
          "Success",
        );
      };
    }
  } else {
    // Just update the numbers without re-rendering the rocket element
    const multiplierEl = document.getElementById("crash-multiplier");
    const statusEl = document.getElementById("crash-status");
    const potentialWinEl = elements.gameContent.querySelector('p strong:contains("Potential Win")');
    
    if (multiplierEl) multiplierEl.textContent = `${game.multiplier.toFixed(2)}x`;
    if (statusEl) statusEl.textContent = statusText;
    
    // Update the card text
    const cardText = elements.gameContent.querySelectorAll(".card p");
    if (cardText[1]) cardText[1].innerHTML = `<strong>📈 Current Multiplier:</strong> <span style="color: var(--accent); font-weight: bold; font-size: 1.2rem;">${game.multiplier.toFixed(2)}x</span>`;
    if (cardText[2]) cardText[2].innerHTML = `<strong>💵 Potential Win:</strong> <span style="color: var(--success); font-weight: bold;">$${(game.bet * game.multiplier).toFixed(2)}</span>`;
  }
}

function updateCrashMultiplier() {
  const game = state.currentGame;
  if (!game || game.type !== "crash" || !game.active) return;
  const target = game.crashPoint;
  let next = game.multiplier * (1 + Math.random() * 0.12 + 0.05);
  next = Math.min(next, target + 0.05);
  game.multiplier = next;
  
  // Update UI without full re-render
  const multiplierEl = document.getElementById("crash-multiplier");
  const potentialEl = elements.gameContent.querySelectorAll(".card p")[2];
  if (multiplierEl) multiplierEl.textContent = `${game.multiplier.toFixed(2)}x`;
  if (potentialEl) potentialEl.innerHTML = `<strong>💵 Potential Win:</strong> <span style="color: var(--success); font-weight: bold;">$${(game.bet * game.multiplier).toFixed(2)}</span>`;
  
  if (game.multiplier >= target) {
    game.active = false;
    const crashRocket = document.getElementById("crash-rocket");
    if (crashRocket) {
      crashRocket.classList.remove("flying");
      crashRocket.classList.add("crashed");
    }
    const statusEl = document.getElementById("crash-status");
    if (statusEl) statusEl.textContent = "💥 Crashed!";
    const cashoutBtn = document.getElementById("cashout-crash-button");
    if (cashoutBtn) cashoutBtn.style.display = "none";
    saveState();
    
    setTimeout(() => {
      updateGameState(
        `💥 BOOM! The rocket crashed at ${target.toFixed(2)}x. You lost $${game.bet.toFixed(2)}.`,
        "Danger",
      );
      addHistory(`Crash lost $${game.bet.toFixed(2)} at ${target.toFixed(2)}x.`);
      updateStatus();
      if (crashRocket) crashRocket.classList.remove("crashed");
    }, 400);
    return;
  }
  setTimeout(() => {
    if (!game.active) return;
    updateCrashMultiplier();
  }, 350);
}

function initCoinflip() {
  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    state.balance -= bet;
    const guess = document.getElementById("coin-guess").value;
    const coinDisplay = document.getElementById("coin-display");

    // Animate spinning coin
    coinDisplay.textContent = "🪙";
    coinDisplay.style.animation = "roulette-ball-spin 0.8s ease-out";
    updateGameState("Flipping the coin...", "Flipping");

    setTimeout(() => {
      let flip = Math.random() < 0.5 ? "heads" : "tails";
      // Luck level: if winStreak >= 5, force loss
      if (state.winStreak >= 5) {
        flip = guess === "heads" ? "tails" : "heads";
      }
      const win = guess === flip;
      const payout = win ? bet * 2 : 0;

      coinDisplay.style.animation = "none";
      coinDisplay.textContent = flip === "heads" ? "🪙 HEADS" : "🪙 TAILS";
      coinDisplay.style.fontSize = "2rem";
      coinDisplay.style.fontWeight = "bold";

      state.balance += payout;
      saveState();
      updateStatus();

      const message = win
        ? `✅ It's ${flip}! You guessed right! Won $${payout.toFixed(2)}!`
        : `❌ It's ${flip}. You guessed ${guess}. You lost $${bet.toFixed(2)}.`;

      updateGameState(message, win ? "Win" : "Lose");
      addHistory(
        `Coin flip ${win ? `won $${payout.toFixed(2)}` : `lost $${bet.toFixed(2)}`}`,
      );
    }, 800);
  };
}

function initSpinWheel() {
  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    const wheelDisplay = document.getElementById("wheel-display");
    const wheelResult = document.getElementById("wheel-result");
    const wheelVisual = document.getElementById("wheel-visual");
    
    // Each segment is 45 degrees, labels are at: 22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5
    // Pointer is always at the top (0 degrees)
    const segments = [
      { value: 1.5, text: "1.5x", rotation: 22.5 },
      { value: 2, text: "2x", rotation: 67.5 },
      { value: 2.5, text: "2.5x", rotation: 112.5 },
      { value: 3, text: "3x", rotation: 157.5 },
      { value: 5, text: "5x", rotation: 202.5 },
      { value: 0, text: "BUST", rotation: 247.5 },
      { value: 1.2, text: "1.2x", rotation: 292.5 },
      { value: 0.5, text: "0.5x", rotation: 337.5 },
    ];
    
    const resultIndex = Math.floor(Math.random() * segments.length);
    const result = segments[resultIndex].value;
    const reward = result > 0 ? bet * result : 0;
    const outcome = result > 0 ? `${result === 1.5 || result === 0.5 ? result.toFixed(1) : result.toFixed(0)}x` : "BUST";
    
    // To land on a segment, rotate wheel so that segment is at top (0 degrees)
    // If segment center is at 22.5 degrees, we need to rotate wheel by -22.5 degrees (or 360-22.5 = 337.5)
    // Add multiple full rotations for dramatic effect
    const baseSpin = 1800; // 5 full spins = 1800 degrees
    const landingRotation = segments[resultIndex].rotation;
    const targetRotation = baseSpin + (360 - landingRotation); // Spin 5 times, then rotate to land segment

    state.balance -= bet;
    wheelDisplay.classList.add("spinning");
    wheelVisual.style.transform = 'rotate(0deg)';
    wheelVisual.style.transition = 'none';
    wheelResult.textContent = "🎡 Spinning...";
    updateGameState("The wheel is spinning. Hold tight!", "Spinning");

    setTimeout(() => {
      wheelDisplay.classList.remove("spinning");
      wheelVisual.style.transition = 'transform 0.5s ease-out';
      wheelVisual.style.transform = `rotate(${targetRotation}deg)`;
      
      setTimeout(() => {
        state.balance += reward;
        saveState();
        updateStatus();
        wheelResult.textContent = `🎁 Result: ${outcome}`;
        wheelResult.style.color = result > 0 ? "var(--success)" : "var(--danger)";
        if (result > 0) wheelResult.classList.add("flash-win");
        
        updateGameState(
          result > 0
            ? `🎉 You spun ${outcome} and won $${reward.toFixed(2)}!`
            : `💥 The wheel busted! You lost $${bet.toFixed(2)}.`,
          result > 0 ? "Success" : "Danger",
        );
        addHistory(
          `Spin Wheel ${result > 0 ? `won $${reward.toFixed(2)}` : `lost $${bet.toFixed(2)}`}`,
        );
      }, 500);
    }, 2000);
  };
}

function initSlots() {
  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    state.balance -= bet;
    const symbols = ["🍒", "🍋", "🔔", "7️⃣", "🍀", "💎"];
    const slotsDisplay = document.getElementById("slots-display");

    // Show spinning animation
    slotsDisplay.classList.add("reel-spinning");
    slotsDisplay.textContent = "🎰 🎰 🎰";
    updateGameState("Spinning the reels...", "Spinning");

    setTimeout(() => {
      const reels = Array.from(
        { length: 3 },
        () => symbols[Math.floor(Math.random() * symbols.length)],
      );
      const payout =
        reels[0] === reels[1] && reels[1] === reels[2]
          ? bet * 10
          : reels[0] === reels[1] ||
              reels[0] === reels[2] ||
              reels[1] === reels[2]
            ? bet * 2
            : 0;

      state.balance += payout;
      saveState();
      updateStatus();

      slotsDisplay.classList.remove("reel-spinning");
      slotsDisplay.textContent = reels.join("  ");

      if (payout > 0) {
        slotsDisplay.classList.add("flash-win");
      }

      updateGameState(
        payout > 0
          ? `🎉 Slots: ${reels.join(" ")} - You won $${payout.toFixed(2)}!`
          : `Slots: ${reels.join(" ")} - No match this time.`,
        payout > 0 ? "Success" : "Danger",
      );
      addHistory(
        `Slots ${payout > 0 ? `won $${payout.toFixed(2)}` : `lost $${bet.toFixed(2)}`}`,
      );
    }, 800);
  };
}

// Plinko game
function initPlinko() {
  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    state.balance -= bet;
    const slot = Math.floor(Math.random() * 7);
    const multipliers = [0.5, 0.75, 1, 1.5, 2, 3, 5];
    const result = multipliers[slot];
    const reward = bet * result;

    const plinkoBoard = document.getElementById("plinko-board");
    const plinkoBall = document.getElementById("plinko-ball");

    // Animate the ball dropping
    plinkoBall.classList.add("dropping");
    updateGameState("⚪ Ball dropping... 🎯", "Dropping");

    setTimeout(() => {
      plinkoBall.classList.remove("dropping");
      plinkoBall.classList.add("bouncing");

      setTimeout(() => {
        plinkoBall.classList.remove("bouncing");
        state.balance += reward;
        saveState();
        updateStatus();

        const resultEmoji = result >= 3 ? "🎉" : result >= 1.5 ? "😊" : "🤔";
        updateGameState(
          `${resultEmoji} Ball landed in slot ${slot + 1}! Multiplier: ${result.toFixed(2)}x\nWon: $${reward.toFixed(2)}`,
          result >= 1.5 ? "Success" : "Danger",
        );

        addHistory(
          `Plinko landed in slot ${slot + 1} for ${result.toFixed(2)}x, winning $${reward.toFixed(2)}.`,
        );
      }, 600);
    }, 2000);
  };
}

// Dice game
function initDice() {
  const guessSelect = document.getElementById("dice-guess");
  const exactRow = document.getElementById("exact-value-row");
  guessSelect.onchange = () => {
    exactRow.style.display = guessSelect.value === "exact" ? "block" : "none";
  };

  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    state.balance -= bet;
    const guess = guessSelect.value;
    const diceDisplay = document.getElementById("dice-display");

    // Animate rolling
    diceDisplay.classList.add("dice-rolling");
    diceDisplay.textContent = "🎲🎲🎲";
    updateGameState("Rolling the dice...", "Rolling");

    setTimeout(() => {
      let roll = Math.floor(Math.random() * 6) + 1;
      // Luck level: if winStreak >= 5, force loss
      if (state.winStreak >= 5) {
        if (guess === "high") {
          roll = Math.floor(Math.random() * 3) + 1; // 1-3, lose
        } else if (guess === "low") {
          roll = Math.floor(Math.random() * 3) + 4; // 4-6, lose
        } else {
          const exact = Number(document.getElementById("exact-number").value);
          roll = exact === 1 ? 2 : 1; // force not exact
        }
      }
      const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      diceDisplay.classList.remove("dice-rolling");
      diceDisplay.textContent = `${diceFaces[roll - 1]} ${roll}`;

      let won = false;
      let payout = 0;
      let message = "";

      if (guess === "high") {
        won = roll >= 4;
        payout = won ? bet * 1.9 : 0;
        message = `Rolled a ${roll}. ${won ? `✅ Win $${payout.toFixed(2)}!` : "❌ Lost."}`;
      } else if (guess === "low") {
        won = roll <= 3;
        payout = won ? bet * 1.9 : 0;
        message = `Rolled a ${roll}. ${won ? `✅ Win $${payout.toFixed(2)}!` : "❌ Lost."}`;
      } else {
        const exact = Number(document.getElementById("exact-number").value);
        won = roll === exact;
        payout = won ? bet * 5 : 0;
        message =
          `Rolled a ${roll}. ` +
          (won
            ? `🎯 Exact hit! Win $${payout.toFixed(2)}.`
            : "❌ Missed the exact number.");
      }

      if (won) {
        state.balance += payout;
        diceDisplay.classList.add("flash-win");
        addHistory(`Dice won $${payout.toFixed(2)} on roll ${roll}.`);
      } else {
        addHistory(`Dice lost $${bet.toFixed(2)} on roll ${roll}.`);
      }
      saveState();
      updateStatus();
      updateGameState(message, won ? "You win!" : "You lose");
    }, 800);
  };
}

// Blackjack game
function initBlackjack() {
  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    state.balance -= bet;
    const deck = createDeck();
    shuffle(deck);
    const player = [deck.pop(), deck.pop()];
    const dealer = [deck.pop(), deck.pop()];

    state.currentGame = {
      type: "blackjack",
      bet,
      deck,
      player,
      dealer,
      active: true,
      finished: false,
    };
    saveState();
    renderBlackjackBoard();
    updateGameState("Hit or stand and beat the dealer.", "Blackjack started");
  };
}

function renderBlackjackBoard() {
  const game = state.currentGame;
  if (!game || game.type !== "blackjack") return;

  const playerValue = handValue(game.player);
  const playerCards = game.player.map(cardHtml).join("");
  const dealerDisplayCards = game.active
    ? `<div style="position: relative; display: inline-block;">${game.dealer.slice(0, 1).map(cardHtml).join("")}<div class="playing-card hidden-card" style="animation: reveal-pop 0.5s ease;"></div></div>`
    : game.dealer.map(cardHtml).join("");

  const actionButtons = game.active
    ? `<button id="hit-button" class="primary-btn">🎴 Hit Me</button>
       <button id="stand-button" class="primary-btn" style="background: var(--success);">⏹️ Stand</button>`
    : "";

  const resultText =
    !game.active && game.finished
      ? (() => {
          const result = settleBlackjack(game);
          const resultEmoji = result.win ? "🎉✅" : result.push ? "🤝" : "❌";
          return `<p style="font-weight: bold; color: ${result.win ? "var(--success)" : "var(--danger)"}; margin: 16px 0;">${resultEmoji} ${result.message}</p><p style="font-size: 0.95rem;">💰 ${result.change}</p>`;
        })()
      : "";

  elements.gameContent.innerHTML = `
    <div class="game-card-set">
      <div class="card">
        <p style="color: var(--accent); font-weight: bold; margin-bottom: 12px;">👤 Your Hand</p>
        <div class="card-row" style="margin-bottom: 12px;">${playerCards}</div>
        <p><strong>Total:</strong> <span style="color: var(--accent); font-size: 1.3rem; font-weight: bold;">${playerValue}</span> ${playerValue > 21 ? "💥 BUST" : ""}</p>
        <p style="font-size: 0.85rem; color: var(--muted);">💰 Bet: $${game.bet.toFixed(2)}</p>
      </div>
      <div class="card">
        <p style="color: var(--accent); font-weight: bold; margin-bottom: 12px;">🏦 Dealer Hand</p>
        <div class="card-row" style="margin-bottom: 12px;">${dealerDisplayCards}</div>
        ${
          game.active
            ? `<p style="color: var(--muted); font-size: 0.85rem;">Dealer's hole card hidden...</p>${actionButtons}`
            : `<p><strong>Total:</strong> <span style="color: var(--accent); font-size: 1.3rem; font-weight: bold;">${handValue(game.dealer)}</span> ${handValue(game.dealer) > 21 ? "💥 BUST" : ""}</p>${resultText}`
        }
      </div>
    </div>
  `;

  if (!game.active && game.finished) {
    const result = settleBlackjack(game);
    return;
  }

  if (game.active) {
    document.getElementById("hit-button").onclick = () => {
      const hitButton = document.getElementById("hit-button");
      const newCard = game.deck.pop();
      game.player.push(newCard);

      hitButton.disabled = true;
      hitButton.style.opacity = "0.6";

      setTimeout(() => {
        const playerTotal = handValue(game.player);
        if (playerTotal > 21) {
          game.active = false;
          game.finished = true;
          saveState();
          updateGameState(
            `💥 You busted at ${playerTotal}! Lost $${game.bet.toFixed(2)}.`,
            "Danger",
          );
          addHistory(
            `Blackjack busted at ${playerTotal} and lost $${game.bet.toFixed(2)}.`,
          );
          updateStatus();
          renderBlackjackBoard();
          return;
        }
        hitButton.disabled = false;
        hitButton.style.opacity = "1";
        saveState();
        renderBlackjackBoard();
      }, 500);
    };

    document.getElementById("stand-button").onclick = () => {
      const standButton = document.getElementById("stand-button");
      standButton.disabled = true;
      standButton.style.opacity = "0.6";

      setTimeout(() => {
        game.active = false;
        game.finished = true;
        playDealerTurn(game);
        saveState();
        const result = settleBlackjack(game);
        if (result.payout > 0) {
          state.balance += result.payout;
        }
        saveState();
        updateStatus();
        addHistory(result.history);
        const resultEmoji = result.win ? "🎉" : result.push ? "🤝" : "❌";
        updateGameState(
          `${resultEmoji} ${result.message} | ${result.change}`,
          result.win ? "Success" : "Danger",
        );
        renderBlackjackBoard();
      }, 300);
    };
  }
}

function initRoulette() {
  const typeSelect = document.getElementById("roulette-bet-type");
  const numberRow = document.getElementById("roulette-number-row");
  typeSelect.onchange = () => {
    numberRow.style.display = typeSelect.value === "number" ? "block" : "none";
  };

  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    state.balance -= bet;
    const betType = typeSelect.value;
    const chosenNumber = Number(
      document.getElementById("roulette-number").value,
    );
    const result = Math.floor(Math.random() * 37);
    const color = rouletteColor(result);

    // Show spinning animation
    const gameContent = elements.gameContent;
    gameContent.innerHTML = `
      <div class="game-card-set">
        <div class="card">
          <div style="font-size: 4rem; text-align: center; animation: roulette-ball-spin 2.5s ease-out; margin: 20px 0;">🎱</div>
          <p style="text-align: center; color: var(--muted);">Spinning...</p>
        </div>
      </div>
    `;
    updateGameState("Spinning the wheel...", "Spinning");

    setTimeout(() => {
      let payout = 0;
      let win = false;
      let message = `🎰 The wheel landed on <strong>${result}</strong> (${color}). `;
      const emoji = color === "red" ? "🔴" : color === "black" ? "⚫" : "🟢";

      if (betType === "number") {
        win = result === chosenNumber;
        payout = win ? bet * 35 : 0;
        message += win
          ? `✅ Exact hit on ${chosenNumber}!`
          : `❌ You missed ${chosenNumber}.`;
      } else if (betType === "red") {
        win = color === "red";
        payout = win ? bet * 2 : 0;
        message += win ? "✅ Red wins!" : "❌ Red lost.";
      } else if (betType === "black") {
        win = color === "black";
        payout = win ? bet * 2 : 0;
        message += win ? "✅ Black wins!" : "❌ Black lost.";
      } else if (betType === "odd") {
        win = result !== 0 && result % 2 === 1;
        payout = win ? bet * 2 : 0;
        message += win ? "✅ Odd wins!" : "❌ Odd lost.";
      } else {
        win = result !== 0 && result % 2 === 0;
        payout = win ? bet * 2 : 0;
        message += win ? "✅ Even wins!" : "❌ Even lost.";
      }

      state.balance += payout;
      saveState();
      updateStatus();

      gameContent.innerHTML = `
        <div class="game-card-set">
          <div class="card">
            <p style="text-align: center; font-size: 2rem; margin: 20px 0;">${emoji} ${result}</p>
            <p><strong>Bet type:</strong> ${betType}</p>
            <p><strong>Result:</strong> ${message}</p>
            <p style="color: ${win ? "var(--success)" : "var(--danger)"}; font-weight: bold; margin-top: 12px;">
              ${win ? `✅ Won $${payout.toFixed(2)}` : `❌ Lost $${bet.toFixed(2)}`}
            </p>
          </div>
        </div>
      `;

      updateGameState(message, win ? "Roulette win" : "Roulette lose");
      addHistory(
        `Roulette ${betType} bet ${win ? `won $${payout.toFixed(2)}` : `lost $${bet.toFixed(2)}`}`,
      );
    }, 2500);
  };
}

function rouletteColor(value) {
  if (value === 0) return "green";
  return value % 2 === 0 ? "black" : "red";
}

function renderScratchBoard() {
  const game = state.currentGame;
  if (!game || game.type !== "scratch") return;

  const gridHtml = game.symbols
    .map(
      (symbol, index) => `
      <div class="scratch-cell ${game.revealed[index] ? "revealed" : ""}" data-index="${index}" style="font-size: 2.5rem; cursor: pointer; transition: all 0.2s ease;">
        <span>${game.revealed[index] ? symbol : "❓"}</span>
      </div>
    `,
    )
    .join("");

  const revealedCount = game.revealed.filter(Boolean).length;
  const statusMessage = game.active
    ? `Scratched: ${revealedCount}/3`
    : game.message || "Complete!";

  elements.gameContent.innerHTML = `
    <div class="game-card-set">
      <div class="card">
        <p><strong>💰 Bet:</strong> $${game.bet.toFixed(2)}</p>
        <p><strong>🎯 Progress:</strong> ${revealedCount}/3 scratched</p>
      </div>
      <div class="card" id="game-state">
        <strong>${game.active ? "🎰 Scratch cards" : "✨ Complete!"}</strong>
        <p>${statusMessage}</p>
      </div>
    </div>
    <div id="scratch-grid" class="scratch-grid">
      ${gridHtml}
    </div>
  `;

  document.querySelectorAll(".scratch-cell").forEach((cell) => {
    cell.onclick = () => {
      if (!game.active) return;
      const index = Number(cell.dataset.index);
      if (game.revealed[index]) return;
      game.revealed[index] = true;
      cell.classList.add("revealed");
      cell.style.animation = "reveal-pop 0.4s ease";
      renderScratchBoard();
      if (game.revealed.filter(Boolean).length === 3) {
        const counts = game.symbols.reduce((acc, symbol) => {
          acc[symbol] = (acc[symbol] || 0) + 1;
          return acc;
        }, {});
        const bestCount = Math.max(...Object.values(counts));
        let payout = 0;
        let resultMessage = `🎴 Scratched: ${game.symbols.join(" ")} - `;

        if (bestCount === 3) {
          payout = game.bet * 5;
          resultMessage = `🎉🎉🎉 THREE OF A KIND! ${game.symbols[0].repeat(3)} - Won $${payout.toFixed(2)}!`;
        } else if (bestCount === 2) {
          payout = game.bet * 2;
          resultMessage = `🎉 TWO MATCH! Won $${payout.toFixed(2)}.`;
        } else {
          payout = 0;
          resultMessage = `❌ No match. Better luck next time.`;
        }

        game.active = false;
        game.message = resultMessage;
        game.payout = payout;
        state.balance += payout;
        saveState();
        updateStatus();
        updateGameState(
          resultMessage,
          payout > 0 ? "Scratch win" : "Scratch lose",
        );
        addHistory(
          `Scratch card ${payout > 0 ? `won $${payout.toFixed(2)}` : `lost $${game.bet.toFixed(2)}`}`,
        );
        setTimeout(() => renderScratchBoard(), 200);
      }
    };
  });
}

function initScratch() {
  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    const symbols = ["🍒", "🍋", "💎", "7️⃣", "🍀"];
    const picks = Array.from(
      { length: 3 },
      () => symbols[Math.floor(Math.random() * symbols.length)],
    );

    state.balance -= bet;
    state.currentGame = {
      type: "scratch",
      bet,
      active: true,
      symbols: picks,
      revealed: [false, false, false],
      message: "Scratch all squares to reveal your prize.",
    };
    saveState();
    renderScratchBoard();
    updateGameState(
      "Choose squares to scratch and reveal your symbols.",
      "Scratch started",
    );
  };
}

function initKeno() {
  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    state.balance -= bet;
    const picks = [1, 2, 3, 4, 5].map((i) =>
      Number(document.getElementById(`keno-num-${i}`).value),
    );
    const pool = [...Array(20).keys()].map((n) => n + 1);
    const drawn = [];

    // Show drawing animation
    updateGameState("🎰 Drawing numbers...", "Drawing");
    const gameContent = elements.gameContent;
    let drawCount = 0;

    const drawInterval = setInterval(() => {
      if (drawn.length < 10) {
        const index = Math.floor(Math.random() * pool.length);
        drawn.push(pool.splice(index, 1)[0]);
        drawCount++;

        gameContent.innerHTML = `
          <div class="game-card-set">
            <div class="card">
              <p><strong>📋 Your picks:</strong> ${picks.sort((a, b) => a - b).join(", ")}</p>
              <p><strong>🎲 Drawn (${drawn.length}/10):</strong> ${drawn.sort((a, b) => a - b).join(", ")}</p>
            </div>
          </div>
        `;
      } else {
        clearInterval(drawInterval);

        const matches = picks.filter((number) => drawn.includes(number)).length;
        const payoutTable = { 0: 0, 1: 0, 2: 1.2, 3: 2, 4: 4, 5: 10 };
        const multiplier = payoutTable[matches] || 0;
        const payout = bet * multiplier;
        const win = multiplier > 0;

        const matchEmojis = picks.map((num) =>
          drawn.includes(num) ? "✅" : "❌",
        );

        state.balance += payout;
        saveState();
        updateStatus();

        gameContent.innerHTML = `
          <div class="game-card-set">
            <div class="card">
              <p><strong>📋 Your picks:</strong></p>
              <p style="font-size: 1.2rem; margin: 8px 0;">
                ${picks.map((n, i) => `${n} ${matchEmojis[i]}`).join("  ")}
              </p>
              <p style="margin-top: 12px;"><strong>🎲 All drawn:</strong> ${drawn.sort((a, b) => a - b).join(", ")}</p>
              <p style="margin-top: 16px; font-size: 1.4rem; font-weight: bold; color: ${win ? "var(--success)" : "var(--danger)"};">
                ${win ? `✅ Matched ${matches}! Won $${payout.toFixed(2)}` : `❌ Matched ${matches}. Lost $${bet.toFixed(2)}`}
              </p>
            </div>
          </div>
        `;

        updateGameState(
          `🎯 Keno draw complete! You matched ${matches} numbers.`,
          multiplier > 0 ? "Keno win" : "Keno lose",
        );
        addHistory(
          `Keno matched ${matches} and ${multiplier > 0 ? `won $${payout.toFixed(2)}` : `lost $${bet.toFixed(2)}`}`,
        );
      }
    }, 200);
  };
}

function initBaccarat() {
  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    state.balance -= bet;
    const choice = document.getElementById("baccarat-bet").value;
    const deck = createDeck();
    shuffle(deck);
    const playerHand = [deck.pop(), deck.pop()];
    const bankerHand = [deck.pop(), deck.pop()];

    const playerTotal = baccaratTotal(playerHand);
    const bankerTotal = baccaratTotal(bankerHand);
    const result =
      playerTotal > bankerTotal
        ? "player"
        : bankerTotal > playerTotal
          ? "banker"
          : "tie";

    let payout = 0;
    if (choice === result) {
      if (result === "player") payout = bet * 2;
      if (result === "banker") payout = bet * 1.95;
      if (result === "tie") payout = bet * 8;
    }

    state.balance += payout;
    const win = payout > 0;
    saveState();
    updateStatus();

    const playerCards = playerHand.map(cardHtml).join("");
    const bankerCards = bankerHand.map(cardHtml).join("");
    const emoji =
      result === "player" ? "👤" : result === "banker" ? "🏦" : "🤝";

    elements.gameContent.innerHTML = `
      <div class="game-card-set">
        <div class="card">
          <p><strong>👤 Player Cards:</strong></p>
          <div class="card-row">${playerCards}</div>
          <p><strong>Total: ${playerTotal}</strong></p>
        </div>
        <div class="card">
          <p><strong>🏦 Banker Cards:</strong></p>
          <div class="card-row">${bankerCards}</div>
          <p><strong>Total: ${bankerTotal}</strong></p>
        </div>
      </div>
      <div class="card" style="margin-top: 16px; text-align: center;">
        <p style="font-size: 1.2rem; margin: 12px 0;">
          ${emoji} <strong>${result.toUpperCase()}</strong> wins!
        </p>
        <p style="color: ${win ? "var(--success)" : "var(--danger)"}; font-weight: bold; font-size: 1.1rem;">
          ${win ? `✅ Won $${payout.toFixed(2)}` : `❌ Lost $${bet.toFixed(2)}`}
        </p>
      </div>
    `;

    updateGameState(
      `${emoji} ${result.toUpperCase()} wins! Player: ${playerTotal} vs Banker: ${bankerTotal}`,
      win ? "Baccarat win" : "Baccarat lose",
    );
    addHistory(
      `Baccarat ${choice} ${win ? `won $${payout.toFixed(2)}` : `lost $${bet.toFixed(2)}`}`,
    );
  };
}

function baccaratTotal(hand) {
  const raw = hand.reduce((sum, card) => {
    if (card.rank === "A") return sum + 1;
    if (["10", "J", "Q", "K"].includes(card.rank)) return sum + 0;
    return sum + Number(card.rank);
  }, 0);
  return raw % 10;
}

function initTreasure() {
  document.getElementById("start-game-button").onclick = () => {
    const bet = parseBet();
    if (bet <= 0 || bet > state.balance) {
      updateGameState("Enter a valid bet that you can afford.", "Invalid bet");
      return;
    }

    state.currentGame = {
      type: "treasure",
      bet,
      active: true,
      choices: [0, 1.8, 3].sort(() => Math.random() - 0.5),
    };
    state.balance -= bet;
    saveState();
    renderTreasureBoard();
    updateGameState(
      "Pick one of the chests to reveal your reward.",
      "Treasure ready",
    );
  };
}

function renderTreasureBoard() {
  const game = state.currentGame;
  if (!game || game.type !== "treasure") return;

  const chestTiles = game.choices
    .map(
      (reward, index) => `
        <div class="chest ${game.opened === index ? "open" : ""}" data-chest="${index}" style="cursor: ${game.active ? "pointer" : "default"}; opacity: ${game.opened !== undefined && game.opened !== index ? "0.6" : "1"}; transition: all 0.2s ease;">
          ${game.opened === index ? (reward > 0 ? `💰 +${(game.bet * reward).toFixed(2)}` : `💨 Lost`) : `🎁 Chest ${index + 1}`}
        </div>
      `,
    )
    .join("");

  const statusText =
    game.opened === undefined
      ? "Pick a chest to reveal your fortune!"
      : game.message || "Reveal complete";

  elements.gameContent.innerHTML = `
    <div class="game-card-set">
      <div class="card">
        <p><strong>💰 Bet:</strong> $${game.bet.toFixed(2)}</p>
        <p><strong>🎁 Chests Available:</strong> ${game.choices.filter((_, i) => game.opened !== i).length}</p>
      </div>
      <div class="card" id="game-state">
        <strong>${game.opened === undefined ? "🎁 Treasure Hunt" : game.message ? (game.choices[game.opened] > 0 ? "🎉 Found Treasure!" : "💨 Empty!") : "Complete"}</strong>
        <p>${statusText}</p>
      </div>
    </div>
    <div class="chest-row">
      ${chestTiles}
    </div>
  `;

  document.querySelectorAll(".chest").forEach((tile) => {
    tile.onclick = () => {
      if (!game.active) return;
      const choice = Number(tile.dataset.chest);
      const reward = game.choices[choice];
      game.active = false;
      game.opened = choice;
      tile.classList.add("open");
      tile.style.animation = "chest-open 0.4s ease";

      setTimeout(() => {
        if (reward > 0) {
          const payout = game.bet * reward;
          state.balance += payout;
          game.message = `🎉🎉🎉 Chest ${choice + 1} WINS ${reward.toFixed(2)}x! +$${payout.toFixed(2)}`;
          addHistory(`Treasure chest won $${payout.toFixed(2)}.`);
          updateGameState(game.message, "Treasure win");
        } else {
          game.message = `💨 Chest ${choice + 1} was empty. Lost $${game.bet.toFixed(2)}.`;
          addHistory(`Treasure chest lost $${game.bet.toFixed(2)}.`);
          updateGameState(game.message, "Treasure lose");
        }
        saveState();
        updateStatus();
        renderTreasureBoard();
      }, 400);
    };
  });
}

function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  return suits.flatMap((suit) => ranks.map((rank) => ({ rank, suit })));
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function cardLabel(card) {
  return `${card.rank}${card.suit}`;
}

function cardHtml(card) {
  const colorClass = card.suit === "♥" || card.suit === "♦" ? "red" : "black";
  return `
    <div class="playing-card ${colorClass}">
      <div class="card-rank">${card.rank}</div>
      <div class="card-suit">${card.suit}</div>
    </div>
  `;
}

function cardValue(card) {
  if (card.rank === "A") return 11;
  if (["K", "Q", "J"].includes(card.rank)) return 10;
  return Number(card.rank);
}

function handValue(hand) {
  let total = hand.reduce((sum, card) => sum + cardValue(card), 0);
  let aces = hand.filter((card) => card.rank === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function playDealerTurn(game) {
  while (handValue(game.dealer) < 17) {
    game.dealer.push(game.deck.pop());
  }
}

function settleBlackjack(game) {
  const playerTotal = handValue(game.player);
  const dealerTotal = handValue(game.dealer);
  const playerNatural = playerTotal === 21 && game.player.length === 2;
  const dealerNatural = dealerTotal === 21 && game.dealer.length === 2;

  let message = "";
  let payout = 0;
  let win = false;
  let history = "";

  if (playerTotal > 21) {
    message = `You busted with ${playerTotal}. Lost $${game.bet.toFixed(2)}.`;
    payout = 0;
  } else if (dealerTotal > 21) {
    win = true;
    payout = game.bet * 2;
    message = `Dealer busted. You win $${payout.toFixed(2)}!`;
  } else if (playerNatural && !dealerNatural) {
    win = true;
    payout = game.bet * 2.5;
    message = `Blackjack! You win $${payout.toFixed(2)}.`;
  } else if (dealerNatural && !playerNatural) {
    message = `Dealer has blackjack. Lost $${game.bet.toFixed(2)}.`;
  } else if (playerTotal > dealerTotal) {
    win = true;
    payout = game.bet * 2;
    message = `You beat dealer ${playerTotal} to ${dealerTotal}. Win $${payout.toFixed(2)}!`;
  } else if (playerTotal === dealerTotal) {
    payout = game.bet;
    message = `Push. Your bet of $${game.bet.toFixed(2)} is returned.`;
  } else {
    message = `Dealer wins ${dealerTotal} to ${playerTotal}. Lost $${game.bet.toFixed(2)}.`;
  }

  if (win) {
    history = `Blackjack won $${payout.toFixed(2)}.`;
  } else if (payout === game.bet) {
    history = `Blackjack push, returned $${payout.toFixed(2)}.`;
  } else {
    history = `Blackjack lost $${game.bet.toFixed(2)}.`;
  }

  return {
    message,
    payout,
    win,
    history,
    change: win
      ? `+$${payout.toFixed(2)}`
      : payout === game.bet
        ? "$0"
        : `-$${game.bet.toFixed(2)}`,
  };
}

function initApp() {
  initializeElements();
  loadState();
  document.body.classList.toggle("light-mode", state.theme === "light");
  elements.themeToggle.textContent =
    state.theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode";
  setServerMessage();
  renderLeaderboard();
  renderUserBanner();

  elements.claimButton.onclick = claimDaily;
  elements.themeToggle.onclick = toggleTheme;
  elements.changeAvatarButton.onclick = showAvatarOverlay;
  elements.saveAvatarButton.onclick = saveAvatar;
  elements.cancelAvatarButton.onclick = hideAvatarOverlay;
  elements.changeAvatarSelect.onchange = toggleCustomAvatar;
  elements.logoutButton.onclick = logout;
  elements.loginTab.onclick = () => switchAuthTab("login");
  elements.signupTab.onclick = () => switchAuthTab("signup");
  elements.loginButton.onclick = handleLogin;
  elements.signupButton.onclick = handleSignup;
  elements.confirmDonationButton.onclick = confirmDonation;
  elements.cancelDonationButton.onclick = hideDonationOverlay;

  elements.leaderboardList.addEventListener("click", (e) => {
    if (e.target.classList.contains("donate-btn")) {
      const recipient = e.target.dataset.recipient;
      showDonationOverlay(recipient);
    }
  });

  document.querySelectorAll(".game-card").forEach((button) => {
    button.addEventListener("click", () => chooseGame(button.dataset.game));
  });

  if (!state.currentUser || !state.users[state.currentUser]) {
    showLoginOverlay();
  } else {
    hideLoginOverlay();
  }
}

window.addEventListener("load", initApp);
