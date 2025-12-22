// Railroad Map for Dice Train
// Creates a rectangular board with 50 spaces around the edges

const TOTAL_SPACES = 50;
const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 400;
const MARGIN = 40;
const SPACE_SIZE = 24;

// Calculate positions for all 50 spaces around the rectangle
function calculateSpacePositions() {
    const positions = [];
    const innerWidth = BOARD_WIDTH - (MARGIN * 2);
    const innerHeight = BOARD_HEIGHT - (MARGIN * 2);

    // Spaces per side (50 total: 15 top, 10 right, 15 bottom, 10 left)
    const topSpaces = 15;
    const rightSpaces = 10;
    const bottomSpaces = 15;
    const leftSpaces = 10;

    // Top edge (left to right) - spaces 0-14
    for (let i = 0; i < topSpaces; i++) {
        const x = MARGIN + (i / (topSpaces - 1)) * innerWidth;
        positions.push({ x, y: MARGIN, side: 'top' });
    }

    // Right edge (top to bottom) - spaces 15-24
    for (let i = 1; i <= rightSpaces; i++) {
        const y = MARGIN + (i / rightSpaces) * innerHeight;
        positions.push({ x: BOARD_WIDTH - MARGIN, y, side: 'right' });
    }

    // Bottom edge (right to left) - spaces 25-39
    for (let i = 1; i < bottomSpaces; i++) {
        const x = BOARD_WIDTH - MARGIN - (i / (bottomSpaces - 1)) * innerWidth;
        positions.push({ x, y: BOARD_HEIGHT - MARGIN, side: 'bottom' });
    }

    // Left edge (bottom to top) - spaces 40-49
    for (let i = 1; i <= leftSpaces; i++) {
        const y = BOARD_HEIGHT - MARGIN - (i / leftSpaces) * innerHeight;
        positions.push({ x: MARGIN, y, side: 'left' });
    }

    return positions;
}

const SPACE_POSITIONS = calculateSpacePositions();

// Get position for a given space
function getPositionForSpace(space) {
    const normalizedSpace = ((space % TOTAL_SPACES) + TOTAL_SPACES) % TOTAL_SPACES;
    return SPACE_POSITIONS[normalizedSpace];
}

// Initialize the railroad map SVG
export function initRailroadMap(svgElement) {
    if (!svgElement) return;

    svgElement.innerHTML = '';
    svgElement.setAttribute('viewBox', `0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`);

    // Create board background (aged wood look)
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', BOARD_WIDTH);
    bg.setAttribute('height', BOARD_HEIGHT);
    bg.setAttribute('fill', '#c4b393');
    bg.setAttribute('rx', '8');
    svgElement.appendChild(bg);

    // Add wood grain texture pattern
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="100" height="100">
            <rect width="100" height="100" fill="#c4b393"/>
            <line x1="0" y1="20" x2="100" y2="22" stroke="#b5a583" stroke-width="0.5" opacity="0.5"/>
            <line x1="0" y1="45" x2="100" y2="43" stroke="#b5a583" stroke-width="0.3" opacity="0.4"/>
            <line x1="0" y1="70" x2="100" y2="72" stroke="#b5a583" stroke-width="0.4" opacity="0.3"/>
            <line x1="0" y1="90" x2="100" y2="88" stroke="#b5a583" stroke-width="0.3" opacity="0.4"/>
        </pattern>
    `;
    svgElement.appendChild(defs);

    // Apply wood grain
    const woodOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    woodOverlay.setAttribute('width', BOARD_WIDTH);
    woodOverlay.setAttribute('height', BOARD_HEIGHT);
    woodOverlay.setAttribute('fill', 'url(#woodGrain)');
    woodOverlay.setAttribute('rx', '8');
    svgElement.appendChild(woodOverlay);

    // Draw board border
    const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    border.setAttribute('x', '4');
    border.setAttribute('y', '4');
    border.setAttribute('width', BOARD_WIDTH - 8);
    border.setAttribute('height', BOARD_HEIGHT - 8);
    border.setAttribute('fill', 'none');
    border.setAttribute('stroke', '#4a2c1a');
    border.setAttribute('stroke-width', '4');
    border.setAttribute('rx', '6');
    svgElement.appendChild(border);

    // Draw track path (connecting all spaces)
    drawTrack(svgElement);

    // Draw all space markers
    SPACE_POSITIONS.forEach((pos, index) => {
        drawSpace(svgElement, pos, index);
    });

    // Draw center decorations
    drawCenterArea(svgElement);
}

// Draw the railroad track
function drawTrack(svg) {
    let pathData = 'M ';

    SPACE_POSITIONS.forEach((pos, index) => {
        if (index === 0) {
            pathData += `${pos.x},${pos.y} `;
        } else {
            pathData += `L ${pos.x},${pos.y} `;
        }
    });
    pathData += 'Z'; // Close the path

    // Track bed
    const trackBed = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    trackBed.setAttribute('d', pathData);
    trackBed.setAttribute('fill', 'none');
    trackBed.setAttribute('stroke', '#3d2914');
    trackBed.setAttribute('stroke-width', '12');
    trackBed.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(trackBed);

    // Rails
    const rails = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    rails.setAttribute('d', pathData);
    rails.setAttribute('fill', 'none');
    rails.setAttribute('stroke', '#6b3d22');
    rails.setAttribute('stroke-width', '6');
    rails.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(rails);

    // Draw ties between spaces
    for (let i = 0; i < SPACE_POSITIONS.length; i++) {
        const current = SPACE_POSITIONS[i];
        const next = SPACE_POSITIONS[(i + 1) % SPACE_POSITIONS.length];

        // Calculate midpoint
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;

        // Calculate perpendicular
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) continue;

        const perpX = -dy / len * 8;
        const perpY = dx / len * 8;

        const tie = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tie.setAttribute('x1', midX - perpX);
        tie.setAttribute('y1', midY - perpY);
        tie.setAttribute('x2', midX + perpX);
        tie.setAttribute('y2', midY + perpY);
        tie.setAttribute('stroke', '#2d1810');
        tie.setAttribute('stroke-width', '2');
        svg.appendChild(tie);
    }
}

// Draw a single space marker
function drawSpace(svg, pos, index) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Space background
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pos.x);
    circle.setAttribute('cy', pos.y);
    circle.setAttribute('r', SPACE_SIZE / 2);
    circle.setAttribute('fill', '#e8e0d0');
    circle.setAttribute('stroke', '#4a2c1a');
    circle.setAttribute('stroke-width', '2');
    group.appendChild(circle);

    // Space number (every 5 spaces and start/corners)
    if (index % 5 === 0 || index === 0) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y + 4);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '10');
        text.setAttribute('font-family', 'Georgia, serif');
        text.setAttribute('fill', '#3d2914');
        text.setAttribute('font-weight', 'bold');
        text.textContent = index;
        group.appendChild(text);
    }

    svg.appendChild(group);
}

// Draw the center area with decorations
function drawCenterArea(svg) {
    const centerX = BOARD_WIDTH / 2;
    const centerY = BOARD_HEIGHT / 2;

    // Center panel background
    const panel = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    panel.setAttribute('x', centerX - 200);
    panel.setAttribute('y', centerY - 100);
    panel.setAttribute('width', 400);
    panel.setAttribute('height', 200);
    panel.setAttribute('fill', '#d4c4a8');
    panel.setAttribute('stroke', '#4a2c1a');
    panel.setAttribute('stroke-width', '3');
    panel.setAttribute('rx', '8');
    svg.appendChild(panel);

    // Title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', centerX);
    title.setAttribute('y', centerY - 70);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', '18');
    title.setAttribute('font-family', 'Georgia, serif');
    title.setAttribute('fill', '#3d2914');
    title.setAttribute('font-weight', 'bold');
    title.textContent = 'DICE TRAIN';
    svg.appendChild(title);

    // Subtitle
    const subtitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    subtitle.setAttribute('x', centerX);
    subtitle.setAttribute('y', centerY - 52);
    subtitle.setAttribute('text-anchor', 'middle');
    subtitle.setAttribute('font-size', '10');
    subtitle.setAttribute('font-family', 'Georgia, serif');
    subtitle.setAttribute('fill', '#6b3d22');
    subtitle.setAttribute('font-style', 'italic');
    subtitle.textContent = 'Est. 1869';
    svg.appendChild(subtitle);

    // --- Enhancement Deck (left) ---
    const deckX = centerX - 140;
    const deckY = centerY - 20;

    // Stack of cards effect
    for (let i = 3; i >= 0; i--) {
        const card = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        card.setAttribute('x', deckX - 25 + i * 2);
        card.setAttribute('y', deckY - 35 + i * 2);
        card.setAttribute('width', 50);
        card.setAttribute('height', 70);
        card.setAttribute('fill', i === 0 ? '#8b4513' : '#6b3d22');
        card.setAttribute('stroke', '#2d1810');
        card.setAttribute('stroke-width', '1');
        card.setAttribute('rx', '3');
        svg.appendChild(card);
    }

    // Card back design
    const cardDesign = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    cardDesign.setAttribute('x', deckX - 20);
    cardDesign.setAttribute('y', deckY - 28);
    cardDesign.setAttribute('width', 40);
    cardDesign.setAttribute('height', 56);
    cardDesign.setAttribute('fill', 'none');
    cardDesign.setAttribute('stroke', '#b5893a');
    cardDesign.setAttribute('stroke-width', '2');
    cardDesign.setAttribute('rx', '2');
    svg.appendChild(cardDesign);

    const deckLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    deckLabel.setAttribute('x', deckX);
    deckLabel.setAttribute('y', deckY + 55);
    deckLabel.setAttribute('text-anchor', 'middle');
    deckLabel.setAttribute('font-size', '9');
    deckLabel.setAttribute('font-family', 'Georgia, serif');
    deckLabel.setAttribute('fill', '#3d2914');
    deckLabel.textContent = 'CARDS';
    svg.appendChild(deckLabel);

    // --- Dice Tray (center) ---
    const trayX = centerX;
    const trayY = centerY + 10;

    // Tray
    const tray = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    tray.setAttribute('x', trayX - 50);
    tray.setAttribute('y', trayY - 40);
    tray.setAttribute('width', 100);
    tray.setAttribute('height', 70);
    tray.setAttribute('fill', '#2d1810');
    tray.setAttribute('stroke', '#b5893a');
    tray.setAttribute('stroke-width', '3');
    tray.setAttribute('rx', '5');
    svg.appendChild(tray);

    // Tray inner felt
    const felt = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    felt.setAttribute('x', trayX - 45);
    felt.setAttribute('y', trayY - 35);
    felt.setAttribute('width', 90);
    felt.setAttribute('height', 60);
    felt.setAttribute('fill', '#1a4a1a');
    felt.setAttribute('rx', '3');
    svg.appendChild(felt);

    // Draw multiple dice in the tray
    const dicePositions = [
        { x: -30, y: -20, val: 6 },
        { x: 5, y: -25, val: 4 },
        { x: 25, y: -15, val: 3 },
        { x: -20, y: 5, val: 5 },
        { x: 15, y: 10, val: 2 },
        { x: -5, y: -5, val: 1 },
        { x: 30, y: 5, val: 6 }
    ];

    dicePositions.forEach(dice => {
        const dieGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        dieGroup.setAttribute('transform', `translate(${trayX + dice.x}, ${trayY + dice.y})`);

        const dieRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        dieRect.setAttribute('x', -8);
        dieRect.setAttribute('y', -8);
        dieRect.setAttribute('width', 16);
        dieRect.setAttribute('height', 16);
        dieRect.setAttribute('fill', '#f5f0e6');
        dieRect.setAttribute('stroke', '#4a2c1a');
        dieRect.setAttribute('stroke-width', '1');
        dieRect.setAttribute('rx', '2');
        dieGroup.appendChild(dieRect);

        const dieText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dieText.setAttribute('x', 0);
        dieText.setAttribute('y', 4);
        dieText.setAttribute('text-anchor', 'middle');
        dieText.setAttribute('font-size', '10');
        dieText.setAttribute('font-family', 'Georgia, serif');
        dieText.setAttribute('fill', '#2d1810');
        dieText.setAttribute('font-weight', 'bold');
        dieText.textContent = dice.val;
        dieGroup.appendChild(dieText);

        svg.appendChild(dieGroup);
    });

    const trayLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    trayLabel.setAttribute('x', trayX);
    trayLabel.setAttribute('y', trayY + 55);
    trayLabel.setAttribute('text-anchor', 'middle');
    trayLabel.setAttribute('font-size', '9');
    trayLabel.setAttribute('font-family', 'Georgia, serif');
    trayLabel.setAttribute('fill', '#3d2914');
    trayLabel.textContent = 'DICE';
    svg.appendChild(trayLabel);

    // --- Gold Coin Bank (right) ---
    const bankX = centerX + 140;
    const bankY = centerY + 5;

    // Coin pile (stacked coins)
    const coinColors = ['#b5893a', '#d4a84b', '#c49a3c', '#b5893a', '#d4a84b'];
    const coinPositions = [
        { x: 0, y: 20 },
        { x: -15, y: 10 },
        { x: 15, y: 10 },
        { x: -8, y: 0 },
        { x: 8, y: 0 },
        { x: -20, y: -10 },
        { x: 0, y: -10 },
        { x: 20, y: -10 },
        { x: -10, y: -22 },
        { x: 10, y: -22 }
    ];

    coinPositions.forEach((pos, i) => {
        const coin = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        coin.setAttribute('cx', bankX + pos.x);
        coin.setAttribute('cy', bankY + pos.y);
        coin.setAttribute('rx', 12);
        coin.setAttribute('ry', 6);
        coin.setAttribute('fill', coinColors[i % coinColors.length]);
        coin.setAttribute('stroke', '#8b6914');
        coin.setAttribute('stroke-width', '1');
        svg.appendChild(coin);

        // Coin detail
        const coinDetail = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        coinDetail.setAttribute('cx', bankX + pos.x);
        coinDetail.setAttribute('cy', bankY + pos.y - 1);
        coinDetail.setAttribute('rx', 8);
        coinDetail.setAttribute('ry', 3);
        coinDetail.setAttribute('fill', 'none');
        coinDetail.setAttribute('stroke', '#dbc070');
        coinDetail.setAttribute('stroke-width', '0.5');
        svg.appendChild(coinDetail);
    });

    const bankLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    bankLabel.setAttribute('x', bankX);
    bankLabel.setAttribute('y', bankY + 50);
    bankLabel.setAttribute('text-anchor', 'middle');
    bankLabel.setAttribute('font-size', '9');
    bankLabel.setAttribute('font-family', 'Georgia, serif');
    bankLabel.setAttribute('fill', '#3d2914');
    bankLabel.textContent = 'GOLD';
    svg.appendChild(bankLabel);
}

// Update player positions on the map
export function updatePlayerPositions(svg, players, positionsContainer) {
    if (!svg) return;

    // Remove existing train tokens
    svg.querySelectorAll('.train-token').forEach(el => el.remove());

    // Draw train tokens for each player
    players.forEach((player, index) => {
        const space = player.totalDistance % TOTAL_SPACES;
        const pos = getPositionForSpace(space);

        // Offset tokens slightly so they don't overlap
        const offsetAngle = (index / players.length) * Math.PI * 2;
        const offsetX = Math.cos(offsetAngle) * 15;
        const offsetY = Math.sin(offsetAngle) * 15;

        // Create train token
        const token = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        token.setAttribute('class', `train-token player-${index + 1}`);
        token.setAttribute('transform', `translate(${pos.x + offsetX}, ${pos.y + offsetY})`);

        // Train body
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        body.setAttribute('x', '-10');
        body.setAttribute('y', '-6');
        body.setAttribute('width', '20');
        body.setAttribute('height', '12');
        body.setAttribute('rx', '2');
        token.appendChild(body);

        // Smokestack
        const stack = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        stack.setAttribute('x', '-7');
        stack.setAttribute('y', '-11');
        stack.setAttribute('width', '5');
        stack.setAttribute('height', '5');
        token.appendChild(stack);

        // Wheel
        const wheel = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        wheel.setAttribute('cx', '5');
        wheel.setAttribute('cy', '6');
        wheel.setAttribute('r', '4');
        wheel.setAttribute('fill', '#2d1810');
        token.appendChild(wheel);

        svg.appendChild(token);
    });

    // Update position legend
    if (positionsContainer) {
        positionsContainer.innerHTML = '';
        players.forEach((player, index) => {
            const laps = Math.floor(player.totalDistance / TOTAL_SPACES);
            const currentSpace = player.totalDistance % TOTAL_SPACES;

            const entry = document.createElement('div');
            entry.className = 'position-entry';
            entry.innerHTML = `
                <span class="position-dot player-${index + 1}"></span>
                <span>${player.name}: ${player.totalDistance} mi (Lap ${laps + 1})</span>
            `;
            positionsContainer.appendChild(entry);
        });
    }
}

export { TOTAL_SPACES, getPositionForSpace };
