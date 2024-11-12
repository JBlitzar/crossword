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
        rowData.push({ input, filled: false });
        tr.appendChild(td);
      }
      this.grid.push(rowData);
      table.appendChild(tr);
    }

    container.appendChild(table);
    this.fetchWords();
  }

  // Handle input events
  handleInput(event, row, col) {
    const value = event.target.value;
    this.grid[row][col].filled = value === "#";

    // Update the background color of the square based on whether it's filled
    const square = this.grid[row][col];
    if (square.filled) {
      event.target.style.backgroundColor = "black"; // color the square black
      event.target.style.color = "white"; // change text color to white for visibility
    } else {
      event.target.style.backgroundColor = ""; // reset the color when it's not filled
      event.target.style.color = ""; // reset text color
    }

    this.updateClues();
  }

  // Fetch word list from the API
  async fetchWords() {
    const response = await fetch(
      "https://api.allorigins.win/raw?url=https://www.mit.edu/~ecprice/wordlist.10000"
    );
    const words = await response.text();
    this.wordList = words.filter((word) => word.length <= this.size);
    console.log("Fetched word list:", this.wordList);
    this.solvePuzzle();
  }

  // Update the clues
  updateClues() {
    let clueIdx = 0;

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const square = this.grid[row][col];
        if (!square.filled) {
          let isDown = row === 0 || this.grid[row - 1][col].filled;
          let isAcross = col === 0 || this.grid[row][col - 1].filled;
          if (isDown && isAcross) {
            this.grid[row][col].downClue = "Down Clue: ";
            this.grid[row][col].acrossClue = "Across Clue: ";
            this.grid[row][col].clueIdx = clueIdx;
            clueIdx++;
          } else if (isDown) {
            this.grid[row][col].downClue = "Down Clue: ";
            this.grid[row][col].clueIdx = clueIdx;
            clueIdx++;
          } else if (isAcross) {
            this.grid[row][col].acrossClue = "Across Clue: ";
            this.grid[row][col].clueIdx = clueIdx;
            clueIdx++;
          }
        }
      }
    }
  }

  // Solve the crossword puzzle automatically
  solvePuzzle() {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const square = this.grid[row][col];
        if (square.filled === false) {
          const word = this.findMatchingWord(row, col);
          if (word) {
            this.fillWord(row, col, word);
          }
        }
      }
    }
  }

  // Find a matching word from the word list
  findMatchingWord(row, col) {
    const word = this.wordList.find((w) => w.length === this.size);
    return word ? word.toUpperCase() : null;
  }

  // Fill the word into the grid
  fillWord(row, col, word) {
    for (let i = 0; i < word.length; i++) {
      this.grid[row][col + i].input.value = word[i];
    }
  }

  // Export the crossword puzzle to JSON
  exportPuzzle() {
    const crosswordJSON = JSON.stringify(this.grid);
    console.log("Exported crossword puzzle:", crosswordJSON);
  }

  // Switch to play mode (disable editing)
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
