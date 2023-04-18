export default class HiveWorld {
  constructor(copyFrom=null) {
    if (copyFrom !== null) {
      this.blackHand = copyFrom.blackHand;
      this.whiteHand = copyFrom.whiteHand;
      this.board = copyFrom.board;
      this.turn = copyFrom.turn;
    } else {
      this.blackHand = this.#makeStartingHand(Color.BLACK);
      this.whiteHand = this.#makeStartingHand(Color.WHITE);
      this.board = new Map();
      this.turn = 0;
    }
  }

  get currColor() {
    return ((this.turn % 2) === 0) ? Color.BLACK : Color.WHITE;
  }

  #makeStartingHand(color) {
    return new Set([
      new Piece(PieceType.QUEEN, color),
      new Piece(PieceType.ANT, color),
      new Piece(PieceType.ANT, color),
      new Piece(PieceType.ANT, color),
      new Piece(PieceType.ANT, color),
      new Piece(PieceType.ANT, color),
      new Piece(PieceType.ANT, color),
      new Piece(PieceType.ANT, color),
      new Piece(PieceType.ANT, color),
      new Piece(PieceType.ANT, color),
      new Piece(PieceType.ANT, color),
    ]);
  }

  doMove(move) {
    this.getHand(move.piece.color).delete(move.piece);
    this.board.set(move.pos, move.piece);
    this.turn++;
  }

  // returns piece if it exists, otherwise undefined
  findPieceAt(pos) {
    // const pieceWithPos = this.board.get(pos)
    // if (pieceWithPos)
    //   return pieceWithPos;
    return this.board.get(Array.from(this.board.keys()).find(p => p.equals(pos)));
  }

  getPieces(color) {
    let result = [];
    this.getAllPiecePositions().forEach(pos => {
      const piece = this.board.get(pos);
      if (piece.color === color) {
        result.push(piece);
      }
    });
    return result;
  }

  isEmpty() {
    return true;
  }

  getHand(color) {
    return color === Color.WHITE ? this.whiteHand : this.blackHand;
  }

  getQueenInHand() {
    for (const piece of this.getHand(this.currColor)) {
      if (piece.type === PieceType.QUEEN) {
        return piece;
      }
    }
    return undefined;
  }

  getFirstOfEachPieceInHand() {
    let result = []
    let includedType = new Set();
    this.getHand(this.currColor).forEach(piece => {
      if(!includedType.has(piece.type)) {
        includedType.add(piece.type);
        result.push(piece);
      }
    })
    return result;
  }

  #getFirstTurnPlaceMoves() {
    return [...this.getFirstOfEachPieceInHand()]
              .map(piece => new Move(piece, ORIGIN));
  }

  #getSecondTurnPlaceMoves() {
    const placeMoves = this.#getPlaceMovesFromPositionsForEachPieceInHand(ORIGIN.adjacent);
    return placeMoves;
  }

  #getAfterSecondTurnPlaceMoves() {
    const adjPositions = this.#getAllAdjacentPositions();
    const nonAdjToOpponent = this.#filterOutPosAdjToOpponentPieces(adjPositions);
    const placeMoves = this.#getPlaceMovesFromPositionsForEachPieceInHand(nonAdjToOpponent);
    return placeMoves;
  }

  #getAllAdjacentPositions() {
    let positions = [];
    for (const pos of this.getAllPiecePositions()) {
      for (const potentialPos of pos.adjacent) {
        if (this.findPieceAt(potentialPos) === undefined) {
          positions.push(potentialPos);
        }
      }
    }
    return positions;
  }

  #filterOutPosAdjToOpponentPieces(pos) {
    const filtered = pos.filter(pos => {
      for (const adj of pos.adjacent) {
        const adjPiece = this.findPieceAt(adj);
        if (adjPiece !== undefined && adjPiece.color !== this.currColor) {
          return false;
        }
      }
      return true;
    })
    return filtered;
  }

  #getPlaceMovesFromPositionsForEachPieceInHand(positions) {
    let moves = [];
    this.getFirstOfEachPieceInHand().forEach(piece => {
      for (const pos of positions) {
        moves.push(new Move(piece, pos))
      }
    });
    return moves;
  }

  getPlaceMoves() {
    if (this.turn === 0)
      return this.#getFirstTurnPlaceMoves();
    else if (this.turn === 1)
      return this.#getSecondTurnPlaceMoves();
    

    const placeMoves = this.#getAfterSecondTurnPlaceMoves();
    if (this.turn >= 6) {
      const queen = this.getQueenInHand();
      if (queen !== undefined) {
        return placeMoves.filter(move => move.piece.type === PieceType.QUEEN);
      }
    }
    return placeMoves;
    
  }

  getPieceMoves(pos) {
    // const moves = [];
    // for (const adj of pos.adjacent) {
    //   const piece = this.findPieceAt(adj);
    //   if (this.findPieceAt(adj) !== undefined && this.posIsAdjToAPiece(adj) && !moves.includes(pos)) {
        
    //   }
    // }
    return [];
  }

  isPosFreeAndAdjToAnyPiece(pos) {
    // pos.adjacent.forEach(pos => {
    //   if (this.findPieceAt(pos))
    // })

  }

  getAllPiecePositions() {
    return Array.from(this.board.keys());
  }

  // testing utilities

  findPlaceMoveAt(pos) {
    return this.getPlaceMoves().find(move => 
      move.pos.equals(pos));
  }
}

export class Piece {
  constructor(type, color) {
    this.type = type;
    this.color = color;
  }
}

export class Move {
  constructor(piece, pos) {
    this.piece = piece;
    this.pos = pos;
  }

  equals(otherMove) {
    return Object.is(this.piece, otherMove.piece) && this.pos.equals(otherMove.pos);
  }
}

export class HexPos {
  constructor(q, r) {
    this.q = q;
    this.r = r;
  }

  equals(other) {
    return (this.q === other.q && this.r === other.r );
  }

  get adjacent() {
    return [this.topLeft, this.topRight, this.top, this.bot, this.botLeft, this.botRight];
  }

  get top() {
    return new HexPos(this.q, this.r - 1);
  }

  get bot() {
    return new HexPos(this.q, this.r + 1);
  }

  get topLeft() {
    return new HexPos(this.q - 1, this.r);
  }

  get botRight() {
    return new HexPos(this.q + 1, this.r);
  }

  get topRight() {
    return new HexPos(this.q + 1, this.r - 1);
  }

  get botLeft() {
    return new HexPos(this.q - 1, this.r + 1);
  }
}

export const ORIGIN = new HexPos(0, 0, 0);

export const Color = {
  BLACK: "black",
  WHITE: "white",
};

export const PieceType = {
  QUEEN: "queen",
  SPIDER: "spider",
  BEETLE: "beetle",
  GRASSHOPPER: "grasshopper",
  ANT: "ant",
};
