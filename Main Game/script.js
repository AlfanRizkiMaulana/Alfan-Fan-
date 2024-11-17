// Initial game state variables
let cash, warehouseOil, totalElectricityBill, drillCount, staffCount;
const maxDrills = 50;
let drills = [];
let oilPrice = 50;
let baseDrillCost = 1000; // Base cost for the first drill
let gameDate = 1; // Start on Day 1
const staffRequiredPerDrill = 2;
const staffSalary = 100; // Salary per staff for each payroll cycle
let workers = []; // List to store hired workers
const workerClasses = {
    C: { probability: 0.5, effect: 1.1, salary: 50 },   // 50% chance, +10% production, $50 salary
    R: { probability: 0.3, effect: 1.2, salary: 100 },  // 30% chance, +20% production, $100 salary
    SR: { probability: 0.15, effect: 1.3, salary: 200 }, // 15% chance, +30% production, $200 salary
    SSR: { probability: 0.010, effect: 1.5, salary: 500 }, // 1% chance, +50% production, $500 salary
    UR: { probability: 0.0005, effect: 5.0, salary: 1000 } // 0.05% chance, +100% production, $1000 salary
};

const workerNames = [
    "Alex", "Jamie", "Taylor", "Jordan", "Morgan", "Chris", "Casey", "Drew", "Quinn", "Reese",
    "Avery", "Parker", "Skyler", "Hayden", "River", "Riley", "Sage", "Bailey", "Alexis", "Rowan",
    "Emerson", "Finley", "Dakota", "Blake", "Harper", "Phoenix", "Aspen", "Cameron", "Jules", "Gray",
    "Kai", "Peyton", "Arden", "Ainsley", "Sawyer", "Monroe", "Cody", "Lane", "Marley", "Jaden",
    "Nico", "Toby", "Shay", "Blair", "Reagan", "Kennedy", "Piper", "London", "Easton", "Remy",
    "Micah", "Ellis", "Kendall", "Logan", "Charlie", "Scout", "Sidney", "Milan", "Sterling", "Jesse"
];



// Function to initialize a new game
function newGame() {
    // Reset all game variables
    cash = 2000;
    warehouseOil = 0;
    totalElectricityBill = 0;
    drillCount = 0;
    staffCount = 2; // Start with 2 staff members
    drills = [];
    oilPrice = 50;
    
    // Clear any existing saved game data
    localStorage.removeItem("savedGame");

    // Start random events
    startRandomEvents();

    // Hide the main menu and show the game screen
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";

    // Update the dashboard to reflect the initial state
    updateDashboard();
}

// Game Timer
function startGameTimer() {
    setInterval(() => {
        gameDate += 1; // Move to the next day
        updateDashboard();
        if (gameDate % 15 === 0) {
            payEngineers();
        }
    }, 30000); // 30 seconds per day
}

function payEngineers() {
    const totalSalary = drills.reduce((total, drill) => {
        if (drill.worker) {
            return total + drill.worker.salary;
        }
        return total;
    }, 0);

    if (cash >= totalSalary) {
        cash -= totalSalary;
    } else {
        showModal({
            title: 'Bankruptcy',
            text: 'Bankrupt due to engineer salaries! Restarting the game...',
            confirmButtonText: 'Restart',
            onConfirm: () => {
                resetGame();
            },
        });
    }
}


// Function to open gacha room !+!+!+!+!+!+!+!+!+!+!+!+!++!+!+!+!+!+!+!+!+
function openGachaRoom() {
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("gachaRoom").style.display = "block";
}
function showEngineerCollection() {
    document.getElementById("gachaRoom").style.display = "none";
    document.getElementById("engineerCollection").style.display = "block";
    renderEngineerCollection();
}

function backToGacha() {
    document.getElementById("engineerCollection").style.display = "none";
    document.getElementById("gachaRoom").style.display = "block";
}

function backToGame() {
    document.getElementById("gachaRoom").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
}

function pullGacha(pulls = 1) {
    const gachaCostPerPull = 10000;
    const totalCost = gachaCostPerPull * pulls;

    if (cash < totalCost) {
        showModal({
            title: 'Not enough Cash',
            text: `You need $${totalCost} for ${pulls} pulls .`,
            confirmButtonText: 'OK',
        });
        return;
    }

    // Deduct total cost
    cash -= totalCost;
    updateDashboard();

    const gachaResults = document.getElementById("gachaResults");
    gachaResults.innerHTML = ""; // Clear previous results
    gachaResults.style.display = "flex"; // Ensure results are visible

    // Array to store engineers pulled
    const engineersPulled = [];

    for (let i = 0; i < pulls; i++) {
        const random = Math.random();
        let selectedClass = "C"; // Default to "C" class

        // Determine the engineer class based on probability
        const probabilities = [
            { class: "UR", probability: workerClasses.UR.probability },
            { class: "SSR", probability: workerClasses.SSR.probability },
            { class: "SR", probability: workerClasses.SR.probability },
            { class: "R", probability: workerClasses.R.probability },
            { class: "C", probability: workerClasses.C.probability }
        ];

        let cumulativeProbability = 0;
        for (const prob of probabilities) {
            cumulativeProbability += prob.probability;
            if (random < cumulativeProbability) {
                selectedClass = prob.class;
                break;
            }
        }

        // Generate engineer
        const workerName = workerNames[Math.floor(Math.random() * workerNames.length)];
        const engineer = {
            name: workerName,
            class: selectedClass,
            effect: workerClasses[selectedClass].effect,
            salary: workerClasses[selectedClass].salary
        };

        // Add engineer to workers and results
        workers.push(engineer);
        engineersPulled.push(engineer);
    }

    // Display pulled engineers
    engineersPulled.forEach((engineer, index) => {
        const engineerDiv = document.createElement("div");
        engineerDiv.className = `engineer-card ${engineer.class}`;
        engineerDiv.style.animationDelay = `${index * 0.1}s`; // Staggered animation

        engineerDiv.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <!-- No content needed unless you want to add something -->
                </div>
                <div class="card-back">
                    <div class="engineer-image">
                        <!-- Optional engineer image inside card back -->
                    </div>
                    <h4>${engineer.name}</h4>
                    <p>Class: ${engineer.class}</p>
                    <p>Effect: +${ parseFloat(((engineer.effect - 1) * 100).toFixed(1)) }% Production</p>
                    <p>Salary: $${engineer.salary}</p>
                </div>
            </div>
        `;

        gachaResults.appendChild(engineerDiv);
    });

    renderEngineerCollection();
    saveGame();
}



function getSellPrice(engineerClass) {
    switch (engineerClass) {
        case "C":
            return 100;
        case "R":
            return 200;
        case "SR":
            return 400;
        case "SSR":
            return 800;
        case "UR":
            return 1600;
        default:
            return 0;
    }
}

function renderEngineerCollection() {
    const engineerList = document.getElementById("engineerList");
    engineerList.innerHTML = ""; // Clear previous list

    workers.forEach((engineer, index) => {
        const engineerDiv = document.createElement("div");
        engineerDiv.className = `engineer-card ${engineer.class}`;

        engineerDiv.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <!-- No content needed unless you want to add something -->
                </div>
                <div class="card-back">
                    <div class="engineer-image">
                        <!-- Optional engineer image inside card back -->
                    </div>
                    <h4>${engineer.name}</h4>
                    <p>Class: ${engineer.class}</p>
                    <p>Effect: +${ parseFloat(((engineer.effect - 1) * 100).toFixed(1)) }% Production</p>
                    <p>Salary: $${engineer.salary}</p>
                    <button onclick="confirmSellEngineer(${index})">Sell for $${getSellPrice(engineer.class)}</button>
                </div>
            </div>
        `;

        engineerList.appendChild(engineerDiv);
    });

    // New code for Sell All SR Engineers button
    const srEngineersCount = workers.filter(engineer => engineer.class === "SR").length;
    const engineerCollection = document.getElementById("engineerCollection");

    let sellAllSRButton = document.getElementById("sellAllSRButton");
    if (sellAllSRButton) {
        sellAllSRButton.remove();
    }

    if (srEngineersCount > 50) {
        sellAllSRButton = document.createElement("button");
        sellAllSRButton.id = "sellAllSRButton";
        sellAllSRButton.textContent = "Sell All SR Engineers";
        sellAllSRButton.onclick = sellAllSR;
        engineerCollection.insertBefore(sellAllSRButton, engineerList);
    }
}

function sellAllSR() {
    const srEngineers = workers.filter(engineer => engineer.class === "SR");
    const srEngineersCount = srEngineers.length;
    const sellPricePerSR = getSellPrice("SR");
    const totalSellPrice = srEngineersCount * sellPricePerSR;

    showModal({
        title: 'Sell All SR Engineers',
        text: `Are you sure you want to sell all ${srEngineersCount} SR engineers for a total of $${totalSellPrice}?`,
        showCancelButton: true,
        confirmButtonText: 'Yes, sell all',
        cancelButtonText: 'No, cancel',
        onConfirm: () => {
            // Remove all SR engineers from the workers array
            workers = workers.filter(engineer => engineer.class !== "SR");

            // Add the cash
            cash += totalSellPrice;

            // Update the UI
            renderEngineerCollection();
            updateDashboard();
            saveGame();

            showModal({
                title: 'Engineers Sold',
                text: `Sold all SR engineers for $${totalSellPrice}.`,
                confirmButtonText: 'OK',
            });
        },
    });
}








// Function to sell an engineer
// Function to sell an engineer based on class
function sellEngineer(index) {
    const engineer = workers[index];
    let sellPrice;

    // Determine sell price based on class
    switch (engineer.class) {
        case "C":
            sellPrice = 100;
            break;
        case "R":
            sellPrice = 200;
            break;
        case "SR":
            sellPrice = 400;
            break;
        case "SSR":
            sellPrice = 800;
            break;
        default:
            showModal();
            showModal({
                title: 'Cannot Sell',
                text: `Cannot sell ${engineer.class} engineer.`,
                confirmButtonText: 'OK',
            });
            return;
    }

    // Add cash and remove engineer
    cash += sellPrice;
    workers.splice(index, 1);
    showModal(`${engineer.name} (Class: ${engineer.class}) sold for $${sellPrice}.`);
    renderEngineerCollection();
    updateDashboard();
    saveGame();
}

// Confirm sale for engineer classes with their selling prices
function confirmSellEngineer(index) {
    const engineer = workers[index];
    const sellPrice = getSellPrice(engineer.class);

    showModal({
        title: 'Sell Engineer',
        text: `Are you sure you want to sell ${engineer.name} (Class: ${engineer.class}) for $${sellPrice}?`,
        showCancelButton: true,
        confirmButtonText: 'Yes, sell',
        cancelButtonText: 'No, keep',
        onConfirm: () => {
            sellEngineer(index);
        },
    });
}



function sellAllCAndR() {
    let totalCash = 0;
    workers = workers.filter(engineer => {
        if (engineer.class === "C") {
            totalCash += 100;
            return false; // Remove "C" class
        } else if (engineer.class === "R") {
            totalCash += 200;
            return false; // Remove "R" class
        }
        return true; // Keep other classes
    });

    cash += totalCash;
    showModal({
        title: 'Engineers Sold',
        text: `Sold all C and R engineers for $${totalCash}.`,
        confirmButtonText: 'OK',
    });
    renderEngineerCollection();
    updateDashboard();
}

// Function to  save game
function saveGame() {
    const gameState = {
        cash: cash,
        warehouseOil: warehouseOil,
        totalElectricityBill: totalElectricityBill,
        drillCount: drillCount,
        oilPrice: oilPrice,
        staffCount: staffCount,
        gameDate: gameDate,
        workers: workers.map(worker => ({
            name: worker.name,
            class: worker.class,
            effect: worker.effect,
            salary: worker.salary
        })),
        drills: drills.map(drill => ({
            id: drill.id,
            level: drill.level,
            productionRate: drill.productionRate,
            electricityCost: drill.electricityCost,
            repetitions: drill.repetitions || 0,
            worker: drill.worker ? { ...drill.worker } : null
        }))
    };
    localStorage.setItem("savedGame", JSON.stringify(gameState));
}



// Function to save the current game state
function continueGame() {
    const savedGame = JSON.parse(localStorage.getItem("savedGame"));
    if (savedGame) {
        // Load basic game state variables
        cash = savedGame.cash;
        warehouseOil = savedGame.warehouseOil;
        totalElectricityBill = savedGame.totalElectricityBill;
        drillCount = savedGame.drillCount;
        oilPrice = savedGame.oilPrice || 50;
        staffCount = savedGame.staffCount || 2;
        gameDate = savedGame.gameDate || 1;

        // Load workers correctly with names and other properties intact
        workers = savedGame.workers.map(worker => ({
            name: worker.name,
            class: worker.class,
            effect: worker.effect,
            salary: worker.salary
        }));

        // Initialize drills correctly with `interval` set to `null`
        drills = savedGame.drills.map(drill => ({
            id: drill.id,
            level: drill.level,
            productionRate: drill.productionRate,
            electricityCost: drill.electricityCost,
            repetitions: drill.repetitions || 0,
            worker: drill.worker ? { ...drill.worker } : null,
            interval: null,  // Ensure no interval is running after load
            isDrilling: drill.isDrilling || false // Restore drilling state
        }));

        // Start timers and events needed for the game to continue running
        startRandomEvents();
        startGameTimer();
        document.getElementById("mainMenu").style.display = "none";
        document.getElementById("gameScreen").style.display = "block";

        // Render UI elements to reflect loaded state
        renderDrills();
        renderEngineerCollection();
        updateDashboard();

        // Resume drills that were drilling
        drills.forEach(drill => {
            if (drill.isDrilling) {
                startDrilling(drill.id);
            }
        });
    } else {
        showModal("No saved game found. Starting a new game instead.");
        showModal({
            title: 'Not saved game found',
            text: `Starting a new game Instead.`,
            confirmButtonText: 'OK',
        });
        newGame();
    }
}





// Function to calculate the next drill cost
function getNextDrillCost() {
    return baseDrillCost * Math.pow(1.1, drillCount); // Increases by 10% with each new drill
}

// Function to add a new drill
// Example function to add a drill
function addDrill() {
    const drillCost = getNextDrillCost();
    if (drillCount >= maxDrills) {
        showModal({
            title: 'Maximum Drill Limit Reached',
            text: `You have reached the maximum number of drills.`,
            confirmButtonText: 'OK',
        });
        return;
    }

    if (cash < drillCost) {
        showModal({
            title: 'Insufficient Cash',
            text: `You need $${drillCost.toFixed(2)} to buy a new drill.`,
            confirmButtonText: 'OK',
        });
        return;
    }

    // Show confirmation dialog
    showModal({
        title: 'Confirm Purchase',
        text: `Buy a new drill for $${drillCost.toFixed(2)}?\nYour current cash: $${cash.toFixed(2)}`,
        showCancelButton: true,
        confirmButtonText: 'Buy',
        cancelButtonText: 'Cancel',
        onConfirm: () => {
            cash -= drillCost;
            drillCount++;  // Increment drill count

            const newDrill = {
                id: drillCount,
                level: 1,
                productionRate: 0.1,
                electricityCost: 2,
                interval: null // No active interval yet
            };

            drills.push(newDrill);
            updateDashboard(); // Update UI to reflect new drill
            renderDrills();    // Render the new drill on screen
            saveGame();
        },
    });
}



// Example render function to display drills in #drillsContainer
// Function to render each drill section


// Updated pullGacha function to handle both 1x and 10x pulls



// Function to render each drill section
function renderDrills() {
    const container = document.getElementById("drillsContainer");
    container.innerHTML = "";

    drills.forEach(drill => {
        const drillDiv = document.createElement("div");
        drillDiv.className = "drill";
        drillDiv.id = `drill-${drill.id}`; // Assign an ID to the drill div
        drillDiv.innerHTML = `
            <h3>Drill ${drill.id}</h3>
            <p><strong>Level:</strong> ${drill.level}</p>
            <p><strong>Production Rate:</strong> ${drill.productionRate.toFixed(2)} barrels/sec</p>
            <p><strong>Electricity Cost:</strong> $${drill.electricityCost.toFixed(2)}/sec</p>
        `;

        // Create Start, Stop, and Upgrade buttons
        const startButton = document.createElement("button");
        startButton.textContent = "Start";
        startButton.onclick = () => startDrilling(drill.id);

        const stopButton = document.createElement("button");
        stopButton.textContent = "Stop";
        stopButton.onclick = () => stopDrilling(drill.id);

        const upgradeButton = document.createElement("button");
        upgradeButton.textContent = "Upgrade";
        upgradeButton.onclick = () => upgradeDrill(drill.id);

        // Append buttons to the drill div
        drillDiv.appendChild(startButton);
        drillDiv.appendChild(stopButton);
        drillDiv.appendChild(upgradeButton);

        // Create Assign Worker button
        const assignWorkerButton = document.createElement("button");
        assignWorkerButton.textContent = "Assign Worker";
        assignWorkerButton.onclick = () => assignWorkerToDrill(drill.id);
        drillDiv.appendChild(assignWorkerButton);

        // Create Remove Worker button if a worker is assigned
        if (drill.worker) {
            const removeWorkerButton = document.createElement("button");
            removeWorkerButton.textContent = "Remove Worker";
            removeWorkerButton.onclick = () => removeWorkerFromDrill(drill.id);
            drillDiv.appendChild(removeWorkerButton);

            // Display worker info
            const workerInfo = document.createElement("p");
            workerInfo.className = "worker-info"; // Add class for selection
            workerInfo.textContent = `Worker: ${drill.worker.name} (${drill.worker.class})`;
            drillDiv.appendChild(workerInfo);
        }

        // Add the drill section to the container
        container.appendChild(drillDiv);
    });
}




function assignWorkerToDrill(drillId) {
    if (workers.length === 0) {
        showModal({
            title: 'No Workers',
            text: 'No workers available. Please hire workers from the Gacha Room.',
            confirmButtonText: 'OK',
        });
        return;
    }

    const modal = document.getElementById('assignWorkerModal');
    const availableWorkersContainer = document.getElementById('availableWorkersContainer');
    const assignWorkerCancelButton = document.getElementById('assignWorkerCancelButton');
    const closeButton = document.querySelector('.assign-worker-close');

    // Clear previous content
    availableWorkersContainer.innerHTML = '';

    // Generate worker cards
    workers.forEach((worker, index) => {
        const workerDiv = document.createElement('div');
        workerDiv.className = `worker-card ${worker.class}`;
        workerDiv.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-details">
                    <h4>${worker.name}</h4>
                    <p>Class: ${worker.class}</p>
                    <p>Effect: +${parseFloat(((worker.effect - 1) * 100).toFixed(1))}%</p>
                </div>
            </div>
        `;

        workerDiv.onclick = () => {
            const selectedWorker = workers[index];
            const drill = drills.find(d => d.id === drillId);

            if (drill) {
                if (drill.worker) {
                    showModal({
                        title: 'Worker Assigned',
                        text: `Drill ${drill.id} already has a worker assigned. Please remove them first.`,
                        confirmButtonText: 'OK',
                    });
                    return;
                }

                drill.worker = selectedWorker;
                drill.productionRate *= selectedWorker.effect; // Apply worker effect to production

                // Remove the assigned worker from the available workers list
                workers.splice(index, 1);

                showModal({
                    title: 'Worker Assigned',
                    text: `Assigned ${selectedWorker.name} (Class: ${selectedWorker.class}) to Drill ${drill.id}.`,
                    confirmButtonText: 'OK',
                });

                renderDrills();
                updateDashboard();
                saveGame();

                // Close the modal
                modal.style.display = 'none';
            }
        };

        availableWorkersContainer.appendChild(workerDiv);
    });

    // Show the modal
    modal.style.display = 'block';

    // Close modal on cancel button click
    assignWorkerCancelButton.onclick = () => {
        modal.style.display = 'none';
    };

    // Close modal on close button click
    closeButton.onclick = () => {
        modal.style.display = 'none';
    };

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}


function removeWorkerFromDrill(drillId) {
    const drill = drills.find(d => d.id === drillId);

    if (drill && drill.worker) {
        workers.push(drill.worker); // Add worker back to the available workers list
        drill.productionRate /= drill.worker.effect; // Revert the production effect
        showModal(``);
        showModal({
            title : 'Worker Removed',
            text: `Removed ${drill.worker.name} from Drill ${drill.id}.`,
            confirmButtonText: 'OK',
        });

        drill.worker = null; // Clear the assigned worker
        renderDrills();
        updateDashboard();
        saveGame();
    } else {
        showModal({
            title: 'No Worker Assigned to',
            text: `Drill ${drill.id}.`,
            confirmButtonText: 'OK',
        });
    }
}




// Function to start drilling for a specific drill
function startDrilling(drillId) {
    const drill = drills.find(d => d.id === drillId);

    if (!drill.interval) {
        drill.isDrilling = true; // Set drilling state
        drill.interval = setInterval(() => {
            if (cash >= drill.electricityCost) {
                // Check if cash is sufficient to cover electricity cost
                if (cash - drill.electricityCost <= 50*drill.level) { // Stop if cash goes below a safe threshold
                    stopAllDrills();
                    showModal({
                        title: 'Auto-Stop Activated',
                        text: 'Drills have been automatically stopped to prevent bankruptcy.',
                        confirmButtonText: 'OK',
                    });
                    return;
                }

                cash -= drill.electricityCost;
                totalElectricityBill += drill.electricityCost;
                warehouseOil += drill.productionRate;
                updateDashboard();
            } else {
                stopAllDrills();
                showModal({
                    title: 'BANKRUPT!',
                    text: 'Not enough cash to cover electricity costs. Restarting the game...',
                    confirmButtonText: 'OK',
                });
                resetGame();
            }
        }, 1000);
        saveGame(); // Save the game state
    }
}


// Function to start all drills at once
function startAllDrills() {
    drills.forEach(drill => {
        if (!drill.interval) {
            startDrilling(drill.id);
        }
    });
    showModal({
        title: 'Drills Started',
        text: 'All drills have been started.',
        confirmButtonText: 'OK',
    });
}

// Function to stop drilling for a specific drill
function stopDrilling(drillId) {
    const drill = drills.find(d => d.id === drillId);
    clearInterval(drill.interval);
    drill.interval = null;
    drill.isDrilling = false; // Update drilling state
    saveGame(); // Save the game state
}


// Function to stop all drills at once
function stopAllDrills() {
    drills.forEach(drill => {
        if (drill.interval) {
            clearInterval(drill.interval);
            drill.interval = null;
            drill.isDrilling = false;
        }
    });
    showModal({
        title: 'Drills Stopped',
        text: 'All drills have been stopped.',
        confirmButtonText: 'OK',
    });
    saveGame();
}

// Function to upgrade a specific drill
function upgradeDrill(drillId) {
    const drill = drills.find(d => d.id === drillId);
    const upgradeCost = 700 * drill.level;

    if (drill.level >= 1000) {
        showModal({
            text: `Drill ${drill.id} is already at the maximum level.`,
            confirmButtonText: 'OK',
        });
        return;
    }

    if (cash < upgradeCost) {
        showModal({
            title: 'Insufficient Funds',
            text: `You need $${upgradeCost.toFixed(2)} to upgrade Drill ${drill.id}.`,
            confirmButtonText: 'OK',
        });
        return;
    }

    // Show confirmation dialog
    showModal({
        title: 'Confirm Upgrade',
        text: `Upgrade Drill ${drill.id} to Level ${drill.level + 1} for $${upgradeCost.toFixed(2)}?\nYour current cash: $${cash.toFixed(2)}`,
        showCancelButton: true,
        confirmButtonText: 'Upgrade',
        cancelButtonText: 'Cancel',
        onConfirm: () => {
            cash -= upgradeCost;
            drill.level++;
            drill.productionRate += 0.1;
            drill.electricityCost += 3;
            renderDrills();
            updateDashboard();
            saveGame();
        },
    });
}


// Function to sell oil
function sellOil() {
    showModal({
        title: 'Sell Oil',
        text: 'How much oil do you want to sell?',
        showInput: true,
        inputType: 'number',
        showCancelButton: true,
        confirmButtonText: 'Sell',
        cancelButtonText: 'Cancel',
        onConfirm: (value) => {
            const oilToSell = parseInt(value);

            if (isNaN(oilToSell) || oilToSell <= 0) {
                showModal({
                    title: 'Invalid Amount',
                    text: 'Please enter a valid amount of oil to sell.',
                    confirmButtonText: 'OK',
                });
                return;
            }

            if (oilToSell > warehouseOil) {
                showModal({
                    title: 'Not Enough Oil',
                    text: 'Not enough oil in the warehouse to sell.',
                    confirmButtonText: 'OK',
                });
            } else {
                const revenue = oilToSell * oilPrice;
                warehouseOil -= oilToSell;
                cash += revenue;
                totalElectricityBill = 0;
                updateDashboard();
                showModal({
                    title: 'Oil Sold',
                    text: `You sold ${oilToSell} barrels for $${revenue.toFixed(2)} at $${oilPrice.toFixed(2)} per barrel.`,
                    confirmButtonText: 'OK',
                });
                saveGame();
            }
        },
    });
}


// Function to trigger random events
function triggerRandomEvent() {
    const eventType = Math.random();

    if (eventType < 0.5) {
        const priceChange = Math.floor(Math.random() * 20) - 10;
        oilPrice += priceChange;
        oilPrice = Math.max(40, oilPrice); // Set minimum oil price to $40
        showModal({
            title: 'Market Fluctuation',
            text: `New oil price is $${oilPrice.toFixed(2)} per barrel.`,
            confirmButtonText: 'OK',
        });
    } else {
        const affectedDrill = drills[Math.floor(Math.random() * drills.length)];
        if (affectedDrill && affectedDrill.interval) {
            clearInterval(affectedDrill.interval);
            affectedDrill.interval = null;
            const repairCost = affectedDrill.level * 100;
            showModal({
                title: 'Equipment Failure',
                text: `Drill ${affectedDrill.id} has failed! Repair cost: $${repairCost}.`,
                showCancelButton: true,
                confirmButtonText: 'Repair',
                cancelButtonText: 'Later',
                onConfirm: () => {
                    if (cash >= repairCost) {
                        cash -= repairCost;
                        startDrilling(affectedDrill.id);
                        showModal({
                            title: 'Drill Repaired',
                            text: `Drill ${affectedDrill.id} repaired for $${repairCost}.`,
                            confirmButtonText: 'OK',
                        });
                    } else {
                        showModal({
                            title: 'Insufficient Funds',
                            text: `Not enough cash to repair Drill ${affectedDrill.id}.`,
                            confirmButtonText: 'OK',
                        });
                    }
                },
            });
        }
    }
}


// Start random events every 5 minutes
function startRandomEvents() {
    eventInterval = setInterval(triggerRandomEvent, 300000);
}

function showModal({ title, text, showCancelButton = false, showInput = false, inputType = 'text', confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) {
    const modal = document.getElementById('customModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalText = document.getElementById('modalText');
    const modalInputContainer = document.getElementById('modalInputContainer');
    const modalInput = document.getElementById('modalInput');
    const modalConfirmButton = document.getElementById('modalConfirmButton');
    const modalCancelButton = document.getElementById('modalCancelButton');
    const closeButton = document.querySelector('.close-button');

    modalTitle.textContent = title;
    modalText.textContent = text;
    modalInputContainer.style.display = showInput ? 'block' : 'none';
    modalInput.type = inputType;
    modalInput.value = '';

    modalConfirmButton.textContent = confirmButtonText;
    modalCancelButton.textContent = cancelButtonText;
    modalCancelButton.style.display = showCancelButton ? 'inline-block' : 'none';

    modal.style.display = 'block';

    modalConfirmButton.onclick = () => {
        const inputValue = modalInput.value;
        modal.style.display = 'none';
        if (onConfirm) onConfirm(inputValue);
    };

    modalCancelButton.onclick = () => {
        modal.style.display = 'none';
        if (onCancel) onCancel();
    };

    closeButton.onclick = () => {
        modal.style.display = 'none';
        if (onCancel) onCancel();
    };
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('customModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};


// Function to update the dashboard
function updateDashboard() {
    document.getElementById("cash").textContent = cash.toFixed(2);
    document.getElementById("warehouseOil").textContent = warehouseOil.toFixed(2);
    document.getElementById("totalElectricityBill").textContent = totalElectricityBill.toFixed(2);
    document.getElementById("drillCount").textContent = drillCount;
    document.getElementById("oilPrice").textContent = oilPrice.toFixed(2);

    drills.forEach(drill => {
        const drillElement = document.querySelector(`#drill-${drill.id}`);
        if (drillElement && drill.worker) {
            let workerInfoElement = drillElement.querySelector(".worker-info");
            if (workerInfoElement) {
                workerInfoElement.textContent = `Worker: ${drill.worker.name} (${drill.worker.class})`;
            } else {
                // Create the worker-info element if it doesn't exist
                const workerInfo = document.createElement("p");
                workerInfo.className = "worker-info";
                workerInfo.textContent = `Worker: ${drill.worker.name} (${drill.worker.class})`;
                drillElement.appendChild(workerInfo);
            }
        }
    });

    const dailyProduction = drills.reduce((total, drill) => total + drill.productionRate * 86400, 0); // Assume 86400 seconds/day
    const totalEngineerSalary = drills.reduce((total, drill) => (drill.worker ? total + drill.worker.salary : total), 0);

    document.getElementById("gameDate").textContent = `Day ${gameDate}`;
    document.getElementById("dailyProduction").textContent = dailyProduction.toFixed(2);
    document.getElementById("engineerSalary").textContent = totalEngineerSalary.toFixed(2);
}


// Initial dashboard update
updateDashboard();
