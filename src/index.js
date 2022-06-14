import { getByPlaceholderText } from "@testing-library/react";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function Square(props) {
    var className = props.isHighlighted ? "highlightedSquare" : "square";
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        isHighlighted={this.props.highlightedSquares.indexOf(i) > -1}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    
    var board = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
    ];

    return (
      <div>
        {board.map((row, index) => (
          <div key={index} className="board-row">
            {row.map((i) => this.renderSquare(i))}
          </div>
        ))}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          location: null,
        },
      ],
      xIsNext: true,
      stepNumber: 0,
      isAscOrdered: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          location: [Math.floor(i / 3), i % 3],
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  orderMoves(ordered) {
      this.setState({
          isAscOrdered: !ordered,
      })
  }
  

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move
        ? `Go to move #${move} ${`(${step.location[0]}, ${step.location[1]})`}`
        : "Go to game start";

      let style = { fontWeight: "normal" };
      if (this.state.stepNumber === move) {
        style.fontWeight = "bold";
      }

      return (
        <li key={move}>
          <button style={style} onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      );
    });
    
    if (!this.state.isAscOrdered) moves.reverse();

    let status;
    let highlightedSquares = [];
    if (winner) {
      status = "Winner: " + winner.name;
      highlightedSquares = winner.wonSquares;
    } else {
      status = current.squares.some((square) => square === null) 
      ? "Next player: " + (this.state.xIsNext ? "X" : "O")
      : "The result of match is a draw"
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            highlightedSquares={highlightedSquares || []}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
        <div>
            <label className="toggle">
                <input type="checkbox" onChange={() => this.orderMoves(this.state.isAscOrdered)}></input>
                <span className="slider"></span>
            </label>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
      return {name: squares[a], wonSquares: [a, b, c]};
    }
  }
  return null;
}
