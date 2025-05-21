import { eCardArea, eWho, GameClient, tCardAddInfo, tPlace, tRule } from '../clients/GameClient';
import { AbstractCardBoardComponent } from '../components/boards/AbstractCardBoardComponent';
import { DeckCardBoardComponent } from '../components/boards/DeckCardBoardComponent';
import { HandCardBoardComponent } from '../components/boards/HandCardBoardComponent';
import { SummonCardBoardComponent } from '../components/boards/SummonCardBoardComponent';
import { TableCardBoardComponent } from '../components/boards/TableCardBoardComponent';
import { TombCardBoardComponent } from '../components/boards/TombCardBoardComponent';
import { CardComponent } from '../components/CardComponent';
import { CostLabelComponent } from '../components/css/CostLabelComponent';
import { TextLabel } from '../components/utils/TextLabel';
import { AttackPhaseManager } from './AttackPhaseManager';
import { CSSPhaseManager } from './CSSPhaseManager';
import { MemoryPhaseManager } from './MemoryPhaseManager';


// ゲームフェーズを定義
export enum eGamePhase {
    COST_SUMMON_SPELL = 'cost-summon-spell', // コスト変換・キャラ召喚・呪文詠唱フェーズ
    MEMORY_GAME = 'memory-game',            // 神経衰弱フェーズ
    ATTACK = 'attack',                      // 攻撃フェーズ
  }


export class PhaseManager {
    private _isMeFirst: boolean;
    public _currentPhase: eGamePhase;

    private phases:eGamePhase[] = [
      eGamePhase.COST_SUMMON_SPELL,
      eGamePhase.MEMORY_GAME,
      eGamePhase.ATTACK,
    ]


    public table: TableCardBoardComponent;
    public myDeck: DeckCardBoardComponent;
    public opponentDeck: DeckCardBoardComponent;
    public myHand: HandCardBoardComponent;
    public opponentHand: HandCardBoardComponent;
    public myCostLabel: CostLabelComponent;
    public opponentCostLabel: CostLabelComponent;
    public nextButton: Phaser.GameObjects.Text;
    public mySummon: SummonCardBoardComponent;
    public opponentSummon: SummonCardBoardComponent;
    public myTomb: TombCardBoardComponent;
    public opponentTomb: TombCardBoardComponent;
    
  
    private textLabelPhase: TextLabel;
    private textLabelTurn: TextLabel;
    public scene: Phaser.Scene;

    public memoryPhaseManager: MemoryPhaseManager;
    private cssPhaseManager: CSSPhaseManager;
    private attackPhaseManager: AttackPhaseManager;
    public gameClient: GameClient;
    public cardComponents: CardComponent[];
    private rule:tRule;

    constructor(scene: Phaser.Scene, gameClient:GameClient) {
        this.scene = scene;
        this.gameClient = gameClient;
    }

    private createTable(){
      const tableCardComponent = this.cardComponents
          .filter((cardComponent: CardComponent) => 
            cardComponent.cardInfo.place.area === eCardArea.TABLE
          )

      this.table = new TableCardBoardComponent(
        this, tableCardComponent, 4, 8, 10, 
      );
    }

    private createDeck(){

      const screenWidth = this.scene.scale.width;
      const screenHeight = this.scene.scale.height;

      const deckCardComponent = this.cardComponents
          .filter(
            (cardComponent: CardComponent) => 
              cardComponent.cardInfo.place.area === eCardArea.DECK
          )
          

      const deckX = screenWidth / 2;
      const myDeckY = screenHeight - 400; // 下部に配置
      const opponentDeckY = 400; // 上部に配置

      this.myDeck = new DeckCardBoardComponent(
        this, deckX, myDeckY, deckCardComponent
        .filter(
          card => card.cardInfo.place.who === eWho.MY
        )
      );
      this.opponentDeck = new DeckCardBoardComponent(
        this, deckX, opponentDeckY, deckCardComponent
        .filter(
          card => card.cardInfo.place.who === eWho.OPPONENT
        )
      );

    }

    private createHand(){
      const handCardComponent = this.cardComponents
          .filter((cardComponent: CardComponent) => 
            cardComponent.cardInfo.place.area === eCardArea.HAND
          )

          const screenWidth = this.scene.scale.width;
          const screenHeight = this.scene.scale.height;
          const handTableWidth = 800;
          const handTableHeight = 300;
        // 中央下に配置
        const myX = (screenWidth - handTableWidth) / 2;
        const myY = screenHeight - handTableHeight - 50;

        // 中央上に配置 
        const opponentX = (screenWidth - handTableWidth) / 2;
        const opponentY = 50;

      const myHandPosition = {x: myX, y: myY, size:{width: handTableWidth, height: handTableHeight}};
      const opponentHandPosition = {x: opponentX, y: opponentY, size:{width: handTableWidth, height: handTableHeight}};
      
      this.myHand = new HandCardBoardComponent(this, handCardComponent.filter(card => card.cardInfo.place.who === eWho.MY), myHandPosition, false);
      this.opponentHand = new HandCardBoardComponent(this, handCardComponent.filter(card => card.cardInfo.place.who === eWho.OPPONENT), opponentHandPosition, true);
    }

    private createSummon(): void {
      const summonCardComponent = this.cardComponents
          .filter((cardComponent: CardComponent) => 
            cardComponent.cardInfo.place.area === eCardArea.SUMMON

          )

      const screenWidth = this.scene.scale.width;
      const screenHeight = this.scene.scale.height;
      const summonTableWidth = 1900;
      const summonTableHeight = 500;

      const diff = 280;

      // 中央下に配置
      const myX = screenWidth / 2;
      const myY = screenHeight - diff;

      // 中央上に配置 
      const opponentX = screenWidth / 2;
      const opponentY = diff;

      const mySummonSize = { width: summonTableWidth, height: summonTableHeight };
      const opponentSummonSize = { width: summonTableWidth, height: summonTableHeight };

      this.mySummon = new SummonCardBoardComponent(
        this,
        summonCardComponent.filter(card => card.cardInfo.place.who === eWho.MY),
        3,
        6,
        10,
        mySummonSize,
        myX,
        myY
      );

      this.opponentSummon = new SummonCardBoardComponent(
        this,
        summonCardComponent.filter(card => card.cardInfo.place.who === eWho.OPPONENT),
        2,
        6,
        10,
        opponentSummonSize,
        opponentX,
        opponentY
      );
    }

    private createTomb(){
      const tombCardComponent = this.cardComponents
          .filter((cardComponent: CardComponent) => 
            cardComponent.cardInfo.place.area === eCardArea.TOMB
          )

      this.myTomb = new TombCardBoardComponent(this, tombCardComponent.filter(card => card.cardInfo.place.who === eWho.MY));
      this.opponentTomb = new TombCardBoardComponent(this, tombCardComponent.filter(card => card.cardInfo.place.who === eWho.OPPONENT));
          
    }

    private createCostLabel(){
      const screenWidth = this.scene.scale.width;
      const screenHeight = this.scene.scale.height;
      const handTableWidth = 800;
      const handTableHeight = 300;
      const myX = (screenWidth - handTableWidth) / 2;
      const myY = screenHeight - handTableHeight;
        // コスト表示のラベルを追加
        this.myCostLabel = new CostLabelComponent(this.scene, myX - 50, myY + handTableHeight/2, '自分のコスト\n');
        this.opponentCostLabel = new CostLabelComponent(this.scene, myX + handTableWidth + 50, myY + handTableHeight/2, '相手のコスト\n');

    }

    async create(){
         const cardInfos = await this.gameClient.fetchShuffledCardKnownInfoAsync();
        this.rule = await this.gameClient.fetchRuleAsync();


        this.memoryPhaseManager = new MemoryPhaseManager(this);
        this.cssPhaseManager = new CSSPhaseManager(this);
        this.attackPhaseManager = new AttackPhaseManager(this);


        this.createLabelText();
        this.isMeFirst = this.rule.isMyTurn;
  


      const cardSize = { width: 100, height: 150 };

        this.cardComponents = cardInfos.map(card => new CardComponent(this.scene, card, cardSize));

        this.createDeck();
        this.createTable();
        this.createHand();
        this.createSummon();
        this.createCostLabel();
        this.createTomb();


        this.currentPhase = eGamePhase.COST_SUMMON_SPELL;
    }

    public saveCardAddInfo(cardAddInfo: tCardAddInfo){
      this.getCardComponent(cardAddInfo.idFrontBack).setCardAddInfo(cardAddInfo);
    
    }

    public getCostLabel(isMy: boolean): CostLabelComponent {
      return isMy ? this.myCostLabel : this.opponentCostLabel;
    }

    public getCardComponent(cardIdFrontBack: string): CardComponent {
      const cardComponent = this.cardComponents.find(card => card.cardInfo.idFrontBack === cardIdFrontBack);
      if(cardComponent){
        return cardComponent;
      }else{
        throw new Error("cardComponent is undefined");
      }
    }

    public getBoardComponent(area: eCardArea, who: eWho): AbstractCardBoardComponent {
      // ここで、whoがundefinedかどうかの処理もかければ描きたい。

      switch(area){
        case eCardArea.DECK:
          return who === eWho.MY ? this.myDeck : this.opponentDeck;
        case eCardArea.HAND:
          return who === eWho.MY ? this.myHand : this.opponentHand;
        case eCardArea.TABLE:
          return this.table;
        case eCardArea.SUMMON:
          return who === eWho.MY ? this.mySummon : this.opponentSummon;
        case eCardArea.DISCARD:
        case eCardArea.TOMB:
          return who === eWho.MY ? this.myTomb : this.opponentTomb;
        default:
          debugger
          throw new Error("Invalid area");
      }
    }

    public async updateCardPlace(cardIdFrontBack: string, place: tPlace) {
      const cardComponent = this.getCardComponent(cardIdFrontBack);
      this.getBoardComponent(cardComponent.cardInfo.place.area, cardComponent.cardInfo.place.who).removeCard(cardIdFrontBack);

      cardComponent.cardInfo.place = place;

      this.getBoardComponent(place.area, place.who).addCard(cardIdFrontBack);
      
      await this.gameClient.postCardInfoPlaceAsync(cardIdFrontBack, place);
        
    }
    

  private createLabelText(){
    this.textLabelPhase = new TextLabel(this.scene, this.scene.scale.width * 2/3, 30, '', {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#000000',
    }).setOrigin(0.5);

    this.textLabelTurn = new TextLabel(this.scene, this.scene.scale.width * 1/3, 30, '', {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#000000',
    }).setOrigin(0.5);
}

  public get isMeFirst(): boolean {
    return this._isMeFirst;
  }

  public set isMeFirst(isMeFirst: boolean) {
    this._isMeFirst = isMeFirst;
    this.textLabelTurn.text = isMeFirst ? '自分のターン' : '相手のターン';
  }

  public get currentPhase(): eGamePhase {
    return this._currentPhase;
  }

  public set currentPhase(phase: eGamePhase) {
    this._currentPhase = phase;
    this.textLabelPhase.text = this.currentPhase;
    switch(phase){
      case eGamePhase.MEMORY_GAME:
        this.memoryPhaseManager.startPhaseAsync();
        break;
      case eGamePhase.COST_SUMMON_SPELL:
        this.cssPhaseManager.startPhaseAsync();
        break;
      case eGamePhase.ATTACK:
        this.attackPhaseManager.startPhaseAsync();
    }
  }

  public nextTurn():boolean {

    this.isMeFirst = !this.isMeFirst;

    if(this.rule.isMyTurn === this.isMeFirst) {
      this.nextPhase();
      return false;
    }else{
        return true;
    }
  }


  public nextPhase() {
    const index = this.phases.indexOf(this.currentPhase);
    if(index === this.phases.length - 1){
      this.currentPhase = this.phases[0];
    }else{
      this.currentPhase = this.phases[index + 1];
    }

  }
} 