class CrosswordCell {
  constructor(inputElement, row, col) {
    this.input = inputElement;
    this.row = row;
    this.col = col;
    this.filled = false;
    this.downClue = "";
    this.acrossClue = "";
    this.clueIdx = null;

    // Add right-click listener for editing clues
    this.input.addEventListener("contextmenu", (e) => this.showClueEditor(e));
  }

  // Handle input events for this cell
  handleInput(event) {
    const value = event.target.value;
    this.filled = value === "#";

    // Update the background color based on whether it's filled
    if (this.filled) {
      event.target.style.backgroundColor = "black";
      event.target.style.color = "white"; // White text for visibility
    } else {
      event.target.style.backgroundColor = "";
      event.target.style.color = "";
    }
  }

  // Show the clue editor on right-click
  showClueEditor(event) {
    event.preventDefault(); // Prevent the default right-click menu

    // Display clue editor and pre-fill with current clues
    const clueEditor = document.getElementById("clue-editor");
    clueEditor.style.display = "block";
    clueEditor.dataset.row = this.row;
    clueEditor.dataset.col = this.col;

    // Fill the clue editor with current down and across clues
    document.getElementById("down-clue").value = this.downClue || "";
    document.getElementById("across-clue").value = this.acrossClue || "";
  }

  // Update the down and across clues from the clue editor
  updateCluesFromEditor() {
    const clueEditor = document.getElementById("clue-editor");
    const row = clueEditor.dataset.row;
    const col = clueEditor.dataset.col;

    const downClue = document.getElementById("down-clue").value;
    const acrossClue = document.getElementById("across-clue").value;

    // Update the cell's clues
    this.downClue = downClue;
    this.acrossClue = acrossClue;

    // Optionally, update the displayed clues on the side
    this.grid[row][col].downClue = downClue;
    this.grid[row][col].acrossClue = acrossClue;
    clueEditor.style.display = "none";
    this.updateClueDisplay();
  }

  // Display the clue index in the corner of each cell
  updateClueDisplay() {
    const clueIndex = this.clueIdx !== null ? this.clueIdx : "";
    this.input.setAttribute("data-clue-idx", clueIndex);
  }
}

class CrosswordGrid {
  constructor(size) {
    this.size = size;
    this.grid = [];
    this.wordList = [];
  }

  // Generate the crossword grid
  generateGrid() {
    this.grid = [];
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
        tr.appendChild(td);
      }
      this.grid.push(rowData);
      table.appendChild(tr);
    }

    container.appendChild(table);
    this.fetchWords();
  }

  // Handle input events for the entire grid
  handleInput(event, row, col) {
    const cell = this.grid[row][col];
    cell.handleInput(event);
    this.updateClues();
  }

  // Fetch word list from the API
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

  // Update the clues based on the grid
  updateClues() {
    let clueIdx = 0;

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const cell = this.grid[row][col];
        if (!cell.filled) {
          let isDown = row === 0 || this.grid[row - 1][col].filled;
          let isAcross = col === 0 || this.grid[row][col - 1].filled;
          if (isDown && isAcross) {
            cell.downClue = "Down Clue: ";
            cell.acrossClue = "Across Clue: ";
            cell.clueIdx = clueIdx;
            clueIdx++;
          } else if (isDown) {
            cell.downClue = "Down Clue: ";
            cell.clueIdx = clueIdx;
            clueIdx++;
          } else if (isAcross) {
            cell.acrossClue = "Across Clue: ";
            cell.clueIdx = clueIdx;
            clueIdx++;
          }
        }
      }
    }
  }

  // Solve the crossword puzzle by filling in words
  solvePuzzle() {
    // Add solving logic here based on the word list
    console.log("Puzzle solving not implemented yet.");
  }

  // Export the crossword as a JSON object
  exportPuzzle() {
    const crosswordJSON = JSON.stringify(this.grid);
    console.log("Exported crossword puzzle:", crosswordJSON);
  }

  // Switch to play mode where users can't edit
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

  // Initialize a new game
  generateGrid() {
    const size = parseInt(document.getElementById("grid-size").value);
    this.grid = new CrosswordGrid(size);
    this.grid.generateGrid();
  }

  // Export the current crossword puzzle
  exportPuzzle() {
    if (this.grid) {
      this.grid.exportPuzzle();
    } else {
      console.log("No puzzle generated yet.");
    }
  }

  // Switch to play mode
  playMode() {
    if (this.grid) {
      this.grid.playMode();
    } else {
      console.log("No puzzle generated yet.");
    }
  }
}

// Instantiate the game
const game = new CrosswordGame();
