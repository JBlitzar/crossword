import numpy as np

# Load dictionary words
def load_words():
    with open('/usr/share/dict/words', 'r') as file:
        words = file.read().splitlines()
    return [word.lower() for word in words if len(word) > 2]

# Create an empty crossword grid
def create_grid(size):
    grid = np.full((size, size), ' ', dtype=str)  # Start with empty squares
    return grid

# Check if a word fits a whole row
def can_place_row(grid, word, row):
    if len(word) != len(grid):  # Word must fill the entire row
        return False
    for col in range(len(grid)):
        if grid[row, col] != ' ' and grid[row, col] != word[col]:
            return False
    return True

# Check if a word fits a whole column
def can_place_col(grid, word, col):
    if len(word) != len(grid):  # Word must fill the entire column
        return False
    for row in range(len(grid)):
        if grid[row, col] != ' ' and grid[row, col] != word[row]:
            return False
    return True

# Place a word in a row
def place_row(grid, word, row):
    for col in range(len(grid)):
        grid[row, col] = word[col]

# Place a word in a column
def place_col(grid, word, col):
    for row in range(len(grid)):
        grid[row, col] = word[row]

# Remove a word from a row (for backtracking)
def remove_row(grid, word, row):
    for col in range(len(grid)):
        grid[row, col] = ' '

# Remove a word from a column (for backtracking)
def remove_col(grid, word, col):
    for row in range(len(grid)):
        grid[row, col] = ' '

# Recursive function to generate the crossword
def generate_crossword(grid, word_list, idx=0):
    print(grid)

    iteration = list(range(len(grid))) + list(range(len(grid)))

    
    word = word_list[idx]  # Current word to place

    is_col = idx > len(grid)-1

    rc_idx = iteration[idx]

    for word in word_list:
        if is_col:
            if can_place_col(grid, word, rc_idx):
                place_col(grid, word, rc_idx)
                if generate_crossword(grid, word_list, idx + 1):  # Proceed with next row
                    return True
                remove_col(grid, word, rc_idx)  # Backtrack if the next word didn't fit
        else:
            if can_place_row(grid, word, rc_idx):
                place_row(grid, word, rc_idx)
                if generate_crossword(grid, word_list, idx + 1):  # Proceed with next row
                    return True
                remove_row(grid, word, rc_idx)  # Backtrack if the next word didn't fit


    return False  # If no valid placement found

# Print the crossword grid
def print_grid(grid):
    for row in grid:
        print(" ".join(row))

# Example Usage
if __name__ == "__main__":
    size = 3  # Grid size
    word_list = load_words()  # Load dictionary words
    grid = create_grid(size)  # Create an empty grid
    success = generate_crossword(grid, word_list)  # Try to generate the crossword
    if success:
        print_grid(grid)  # Print the resulting crossword grid
    else:
        print("Could not generate a valid crossword!")
