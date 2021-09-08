//Copied from https://www.npmjs.com/package/tictactoe-board / https://github.com/chokonaira/tictactoe-board/blob/main/lib/Board.ts
//because the package itself used unnecessary dependencies
export default class Board {
  constructor(grid = ['', '', '', '', '', '', '', '', '']) {
    this.grid = grid;
  }

  boardState(position) {
    const grid = [];
    for (let index = 0; index < this.availablePositions.length; index++) {
      grid.push(position);
    }
    return grid;
  }

  makeMove(position, symbol) {
    const newGrid = [...this.grid];
    newGrid[position - 1] = symbol;
    return new Board(newGrid);
  }

  currentMark() {
    if (this.availablePositionCount() % 2 !== 0) {
      return 'X';
    }
    return 'O';
  }

  defaultPositionState(position) {
    return (this.grid[position - 1] = '');
  }

  isPositionTaken(position) {
    return this.grid[position - 1] !== '';
  }

  isMoveValid(input) {
    return this.availablePositions().includes(input);
  }

  markedBoardPositionValue(index) {
    return this.grid[index - 1]
  }

  availablePositions() {
    const result = [];
    this.grid.forEach((_position, index) => {
      if (!this.isPositionTaken(index + 1)) result.push(index + 1);
    });
    return result;
  }

  availablePositionCount() {
    let counter = 0;
    for (let index = 0; index < this.grid.length; index++) {
      this.grid[index] === '' && counter++;
    }
    return counter;
  }

  isGameDraw() {
    return !this.hasWinner() && this.availablePositionCount() === 0;
  }

  isGameOver() {
    return this.hasWinner() || this.isGameDraw();
  }

  hasWinner() {
    const rows = this.rows();
    const columns = this.columns();
    const diagonals = this.diagonals();
    const lines = rows.concat(columns, diagonals);

    const result = lines.filter((line) => line.every((position) => position !== '' && position === line[0]));

    return result.length !== 0;
  }

  rows() {
    const rows = [];
    for (let index = 0; index < this.grid.length; index += 3) rows.push(this.grid.slice(index, index + 3));
    return rows;
  }

  columns() {
    const columns = [];
    for (let index = 0; index < this.rows().length; index++) {
      const column = [];
      this.rows().forEach((row) => column.push(row[index]));
      columns.push(column);
    }
    return columns;
  }

  diagonals() {
    const firstDiagonal = [];
    const secondDiagonal = [];
    for (let row = 0; row < this.rows().length; row++) {
      firstDiagonal.push(this.rows()[row][row]);
      secondDiagonal.push(this.rows()[row][this.rows().length - row - 1]);
    }
    return [firstDiagonal, secondDiagonal];
  }

  winningPlayer() {
    const rows = this.rows();
    const columns = this.columns();
    const diagonals = this.diagonals();
    const lines = rows.concat(columns, diagonals);

    const result = lines.filter((line) => line.every((position) => position !== '' && position === line[0]));
    if (result.length === 0) return '';
    return result[0][0];
  }
}