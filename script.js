class CrosswordCell {
  constructor(inputElement, row, col) {
    this.input = inputElement;
    this.row = row;
    this.col = col;
    this.filled = false;
    this.downClue = "";
    this.acrossClue = "";
    this.clueIdx = null;

    this.key = `${row}-${col}`;
    this.input.addEventListener("contextmenu", (e) => this.showClueEditor(e));
  }

  handleInput(event) {
    const value = event.target.value;
    this.filled = value === "#";

    if (this.filled) {
      event.target.style.backgroundColor = "black";
      event.target.style.color = "white";
    } else {
      event.target.style.backgroundColor = "";
      event.target.style.color = "";
    }

    // Trigger clue update in the CrosswordGrid instance
    game.grid.updateClues();
  }

  showClueEditor(event) {
    event.preventDefault();

    const clueEditor = document.getElementById("clue-editor");
    clueEditor.style.display = "block";
    clueEditor.dataset.row = this.row;
    clueEditor.dataset.col = this.col;

    document.getElementById("down-clue").value = this.downClue || "";
    document.getElementById("across-clue").value = this.acrossClue || "";

    document
      .getElementById("update-clue-btn")
      .addEventListener("click", updateCluesFromEditor);
  }

  updateClueDisplay() {
    const clueIndex = this.clueIdx !== null ? this.clueIdx : "";
    this.input.setAttribute("data-clue-idx", clueIndex);
  }
}

// Move updateCluesFromEditor to a more global scope (or where the clue editor logic lives)
function updateCluesFromEditor() {
  const clueEditor = document.getElementById("clue-editor");
  const row = clueEditor.dataset.row;
  const col = clueEditor.dataset.col;

  const downClue = document.getElementById("down-clue").value;
  const acrossClue = document.getElementById("across-clue").value;

  const cell = game.grid.crosswordMap.get(`${row}-${col}`);
  if (cell) {
    cell.downClue = downClue;
    cell.acrossClue = acrossClue;
    cell.updateClueDisplay();
  }

  clueEditor.style.display = "none";
  game.grid.updateClues();
}

class CrosswordGrid {
  constructor(size) {
    this.size = size;
    this.grid = [];
    this.wordList = [];
    this.crosswordMap = new Map(); // Store crossword cells with a map
  }

  generateGrid() {
    this.grid = [];
    this.crosswordMap.clear(); // Clear any existing map entries
    const container = document.getElementById("crossword-container");
    container.innerHTML = "";

    const table = document.createElement("table");

    for (let row = 0; row < this.size; row++) {
      const tr = document.createElement("tr");
      const rowData = [];
      for (let col = 0; col < this.size; col++) {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.addEventListener("input", (e) => this.handleInput(e, row, col));
        td.appendChild(input);

        const crosswordCell = new CrosswordCell(input, row, col);
        rowData.push(crosswordCell);
        this.crosswordMap.set(crosswordCell.key, crosswordCell); // Store the cell in the map
        tr.appendChild(td);
      }
      this.grid.push(rowData);
      table.appendChild(tr);
    }

    container.appendChild(table);
    this.fetchWords();
  }

  handleInput(event, row, col) {
    const cell = this.crosswordMap.get(`${row}-${col}`);
    if (cell) {
      cell.handleInput(event);
      this.updateClues();
    }
  }

  updateClues() {
    const acrossClues = document.getElementById("across-clues");
    const downClues = document.getElementById("down-clues");
    acrossClues.innerHTML = "";
    downClues.innerHTML = "";

    let clueIdx = 0;
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const cell = this.grid[row][col];
        if (!cell.filled) {
          const isNewDown = row === 0 || this.grid[row - 1][col].filled;
          const isNewAcross = col === 0 || this.grid[row][col - 1].filled;

          if (isNewDown) {
            cell.downClue = cell.downClue || `Down Clue ${clueIdx + 1}`;
            cell.clueIdx = clueIdx;
            downClues.innerHTML += `<li>${cell.downClue}</li>`;
            clueIdx++;
          }

          if (isNewAcross) {
            cell.acrossClue = cell.acrossClue || `Across Clue ${clueIdx + 1}`;
            cell.clueIdx = clueIdx;
            acrossClues.innerHTML += `<li>${cell.acrossClue}</li>`;
            clueIdx++;
          }

          cell.updateClueDisplay();
        } else {
          cell.downClue = "";
          cell.acrossClue = "";
          cell.clueIdx = null;
          cell.updateClueDisplay();
        }
      }
    }
  }

  async fetchWords() {
    const response = await fetch(
      "https://api.allorigins.win/raw?url=https://www.mit.edu/~ecprice/wordlist.10000"
    );
    const words = await response.text();
    this.wordList = words
      .split("\n")
      .filter((word) => word.length <= this.size);
    console.log("Fetched word list:", this.wordList);
    this.solvePuzzle();
  }

  solvePuzzle() {
    console.log("Puzzle solving not implemented yet.");
  }

  exportPuzzle() {
    const crosswordJSON = JSON.stringify(this.grid);
    console.log("Exported crossword puzzle:", crosswordJSON);
  }

  playMode() {
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
      input.disabled = true;
    });
    console.log("Entering play mode, no further edits allowed.");
  }
}

class CrosswordGame {
  constructor() {
    this.grid = null;
  }

  generateGrid() {
    const size = parseInt(document.getElementById("grid-size").value);
    this.grid = new CrosswordGrid(size);
    this.grid.generateGrid();
    this.grid.updateClues();
  }

  exportPuzzle() {
    if (this.grid) {
      this.grid.exportPuzzle();
    } else {
      console.log("No puzzle generated yet.");
    }
  }

  playMode() {
    if (this.grid) {
      this.grid.playMode();
    } else {
      console.log("No puzzle generated yet.");
    }
  }
}

const game = new CrosswordGame();
