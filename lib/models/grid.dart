// grid.dart

/// A class representing the game grid system.
class Grid {
  final int rows;
  final int columns;
  List<List<int>> grid;

  Grid(this.rows, this.columns) : grid = List.generate(rows, (_) => List.filled(columns, 0));

  /// Initialize the grid with default values.
  void initialize() {
    for (int i = 0; i < rows; i++) {
      for (int j = 0; j < columns; j++) {
        grid[i][j] = 0;
      }
    }
  }

  /// Set the value at a specific position.
  void setValue(int row, int column, int value) {
    if (row >= 0 && row < rows && column >= 0 && column < columns) {
      grid[row][column] = value;
    }
  }

  /// Get the value at a specific position.
  int getValue(int row, int column) {
    if (row >= 0 && row < rows && column >= 0 && column < columns) {
      return grid[row][column];
    }
    throw Exception('Index out of bounds');
  }
}