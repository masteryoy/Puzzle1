// game_logic.dart

class GameLogic {
    int score = 0;

    // Method to clear lines
    void clearLines(List<List<int>> board) {
        int clearedLines = 0;
        // Logic to check for filled lines and clear them
        for (int i = 0; i < board.length; i++) {
            if (board[i].every((cell) => cell != 0)) {
                clearedLines++;
                board.removeAt(i);
                board.insert(0, List<int>.filled(board[i].length, 0)); // Insert an empty line at the top
            }
        }
        updateScore(clearedLines);
    }

    // Method to update the score based on cleared lines
    void updateScore(int clearedLines) {
        score += clearedLines * 100; // Example scoring logic
    }
}