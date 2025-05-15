
export class TurnManager {
  private _isMyTurn: boolean = false;

  constructor(isMyTurn: boolean) {
    this._isMyTurn = isMyTurn;
  }

  public get isMyTurn(): boolean {
    return this._isMyTurn;
  }

  public set isMyTurn(isMyTurn: boolean) {
    this._isMyTurn = isMyTurn;
  }
}
