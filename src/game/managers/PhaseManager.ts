import { sleep } from '@/utils/functions';
import { eCardArea, eWho, GameClient, tCardAddInfo, tGameClient, tPlace, tRule } from '../clients/GameClient';
import { AbstractCardBoardComponent } from '../components/boards/AbstractCardBoardComponent';
import { DeckCardBoardComponent } from '../components/boards/DeckCardBoardComponent';
import { HandCardBoardComponent } from '../components/boards/HandCardBoardComponent';
import { SummonCardBoardComponent } from '../components/boards/SummonCardBoardComponent';
import { TableCardBoardComponent } from '../components/boards/TableCardBoardComponent';
import { TombCardBoardComponent } from '../components/boards/TombCardBoardComponent';
import { CardComponent } from '../components/CardComponent';
import { AttackedLabelComponent } from '../components/css/AttackedLabelComponent';
import { CostLabelComponent } from '../components/css/CostLabelComponent';
import { InstanceSelector } from '../components/utils/InstanceSelector';
import { TextLabel } from '../components/utils/TextLabel';
import { __FULL_DEBUG } from '../servers/LocalServer';
import { AttackPhaseManager } from './AttackPhaseManager';
import { CSSPhaseManager } from './CSSPhaseManager';
import { MemoryPhaseManager } from './MemoryPhaseManager';


// ゲームフェーズを定義
export enum eGamePhase {
    COST_SUMMON_SPELL = 'cost-summon-spell', // コスト変換・キャラ召喚・呪文詠唱フェーズ
    MEMORY_GAME = 'memory-game',            // 神経衰弱フェーズ
    ATTACK = 'attack',                      // 攻撃フェーズ
  }

const __defaultPhase = eGamePhase.COST_SUMMON_SPELL;

export class PhaseManager {
    private _isMeFirst: boolean;
    public _currentPhase: eGamePhase;
    private _isMyTurn: boolean;

    public get isMyTurn(): boolean {
      return this._isMyTurn;
    }

    public set isMyTurn(isMyTurn: boolean) {
      this._isMyTurn = isMyTurn;
      this.textLabelTurn.text = isMyTurn ? '自分のターン' : '相手のターン';
    }

    private phases:eGamePhase[] = [
      eGamePhase.MEMORY_GAME,
      eGamePhase.COST_SUMMON_SPELL,
      eGamePhase.ATTACK,
    ]


    public table: TableCardBoardComponent;
    public deck: InstanceSelector<DeckCardBoardComponent>;
    public hand: InstanceSelector<HandCardBoardComponent>;
    public summon: InstanceSelector<SummonCardBoardComponent>;
    public tomb: InstanceSelector<TombCardBoardComponent>;
    public costLabel: InstanceSelector<CostLabelComponent>;
    public attackedLabel: InstanceSelector<AttackedLabelComponent>;
    public spellLabel: TextLabel;

    
    private myDeck: DeckCardBoardComponent;
    private opponentDeck: DeckCardBoardComponent;
    private myHand: HandCardBoardComponent;
    private opponentHand: HandCardBoardComponent;
    private myCostLabel: CostLabelComponent;
    private opponentCostLabel: CostLabelComponent;
    private mySummon: SummonCardBoardComponent;
    private opponentSummon: SummonCardBoardComponent;
    private myTomb: TombCardBoardComponent;
    private opponentTomb: TombCardBoardComponent;
    private myAttackedLabel: AttackedLabelComponent;
    private opponentAttackedLabel: AttackedLabelComponent;
    
  
    private textLabelPhase: TextLabel;
    private textLabelTurn: TextLabel;
    public scene: Phaser.Scene;

    public memoryPhaseManager: MemoryPhaseManager;
    private cssPhaseManager: CSSPhaseManager;
    public attackPhaseManager: AttackPhaseManager;
    public gameClient: GameClient;
    public cardComponents: CardComponent[];
    private rule:tRule;

    constructor(scene: Phaser.Scene, idGameClient:tGameClient) {
        this.scene = scene;
        this.gameClient = new GameClient(idGameClient, this);


    }

    private createAttackedLabel(){
      const screenWidth = this.scene.scale.width;
      const screenHeight = this.scene.scale.height;

      const xMid = screenWidth / 2;
      const xDiff = (screenWidth) / 3;
      const y = screenHeight*2/5;
      

      this.myAttackedLabel = new AttackedLabelComponent(this.scene, xMid - xDiff, y, '与えたダメージ\n');
      this.opponentAttackedLabel = new AttackedLabelComponent(this.scene, xMid + xDiff, y, '喰らったダメージ\n');

      this.attackedLabel = new InstanceSelector({my: this.myAttackedLabel, opponent: this.opponentAttackedLabel});
    }

    private createSpellLabel(){
      const screenWidth = this.scene.scale.width;
      const screenHeight = this.scene.scale.height;
      const x = screenWidth / 2;
      const y = screenHeight / 2;

      this.spellLabel = new TextLabel(this.scene, x, y, '', {
        fontSize: '64px',
        color: '#ffffff',
        backgroundColor: '#000000',
      });
    }

    private createTable(){
      const tableCardComponent = this.cardComponents
          .filter((cardComponent: CardComponent) => 
            cardComponent.place.area === eCardArea.TABLE
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
              cardComponent.place.area === eCardArea.DECK
          )
          

      const deckX = screenWidth / 2;
      const myDeckY = screenHeight - 400; // 下部に配置
      const opponentDeckY = 400; // 上部に配置

      this.myDeck = new DeckCardBoardComponent(
        this, deckX, myDeckY, deckCardComponent
        .filter(
          card => card.place.who === eWho.MY
        )
      );
      this.opponentDeck = new DeckCardBoardComponent(
        this, deckX, opponentDeckY, deckCardComponent
        .filter(
          card => card.place.who === eWho.OPPONENT
        )
      );

      this.deck = new InstanceSelector({my: this.myDeck, opponent: this.opponentDeck});
    }

    private createHand(){
      const handCardComponent = this.cardComponents
          .filter((cardComponent: CardComponent) => 
            cardComponent.place.area === eCardArea.HAND
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
      
      this.myHand = new HandCardBoardComponent(this, handCardComponent.filter(card => card.place.who === eWho.MY), myHandPosition, false);
      this.opponentHand = new HandCardBoardComponent(this, handCardComponent.filter(card => card.place.who === eWho.OPPONENT), opponentHandPosition, true);

      this.hand = new InstanceSelector({my: this.myHand, opponent: this.opponentHand});
    }

    private createSummon(): void {
      const summonCardComponent = this.cardComponents
          .filter((cardComponent: CardComponent) => 
            cardComponent.place.area === eCardArea.SUMMON

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
        summonCardComponent.filter(card => card.place.who === eWho.MY),
        3,
        6,
        10,
        mySummonSize,
        myX,
        myY
      );

      this.opponentSummon = new SummonCardBoardComponent(
        this,
        summonCardComponent.filter(card => card.place.who === eWho.OPPONENT),
        2,
        6,
        10,
        opponentSummonSize,
        opponentX,
        opponentY
      );

      this.summon = new InstanceSelector({my: this.mySummon, opponent: this.opponentSummon});
    }

    private createTomb(){
      const tombCardComponent = this.cardComponents
          .filter((cardComponent: CardComponent) => 
            cardComponent.place.area === eCardArea.TOMB || 
            cardComponent.place.area === eCardArea.DISCARD
          )

      this.myTomb = new TombCardBoardComponent(this, tombCardComponent.filter(card => card.place.who === eWho.MY));
      this.opponentTomb = new TombCardBoardComponent(this, tombCardComponent.filter(card => card.place.who === eWho.OPPONENT));

      this.tomb = new InstanceSelector({my: this.myTomb, opponent: this.opponentTomb});
    }

    private createCostLabel(){
      const screenWidth = this.scene.scale.width;
      const screenHeight = this.scene.scale.height;
      const handTableWidth = 800;
      const handTableHeight = 300;
      const myX = (screenWidth - handTableWidth) / 2;
      const myY = screenHeight - handTableHeight;
      const xOffset = 200;
        // コスト表示のラベルを追加
        this.myCostLabel = new CostLabelComponent(this.scene, myX - xOffset, myY + handTableHeight/2, '自分のコスト\n');
        this.opponentCostLabel = new CostLabelComponent(this.scene, myX + handTableWidth + xOffset, myY + handTableHeight/2, '相手のコスト\n');

        this.costLabel = new InstanceSelector({my: this.myCostLabel, opponent: this.opponentCostLabel});
    }

    public async endGame(){
      const attackDiff = (this.attackedLabel.get(true).attacked - this.attackedLabel.get(false).attacked)

      if(attackDiff > 0){
        this.spellLabel.txt = "自分の勝ち";
      }else if(attackDiff < 0){
        this.spellLabel.txt = "相手の勝ち";
      }else{
        this.spellLabel.txt = "引き分け";
      }
      await sleep(1000*1000)
    }

    async create(){
         const cardInfos = await this.gameClient.fetchShuffledCardKnownInfoAsync();
        this.rule = await this.gameClient.fetchRuleAsync();


        this.memoryPhaseManager = new MemoryPhaseManager(this);
        this.cssPhaseManager = new CSSPhaseManager(this);
        this.attackPhaseManager = new AttackPhaseManager(this);


        this._isMeFirst = this.rule.isMyTurn;
  


      const cardSize = { width: 100, height: 150 };

      this.cardComponents = cardInfos.map(card => new CardComponent(this.scene, card, cardSize));
      if(__FULL_DEBUG){
       
        this.cardComponents.forEach(async card => {
          card.addInfo = await this.gameClient.fetchSpecificCardFullInfoAsync(card.idFrontBack);
        });
      }
    

        this.createDeck();
        this.createTable();
        this.createHand();
        this.createSummon();
        this.createCostLabel();
        this.createTomb();
        this.createAttackedLabel();

        this.createLabelText();
        this.createSpellLabel();


        // this.mySummon.addCard(this.cardComponents[0].idFrontBack);

        // this.cardComponents.forEach(card => {
        //   const place = {...card.place};
        //   place.area = eCardArea.SUMMON;
        //   place.cardStatus = CardStatus.FRONT;
        //   // place.who = eWho.OPPONENT;
        //   this.updateCardPlace(card.idFrontBack, place);
        // });

        this.currentPhase = __defaultPhase;
    }

    public saveCardAddInfo(cardAddInfo: tCardAddInfo){
      this.getCardComponent(cardAddInfo.idFrontBack).addInfo = cardAddInfo;
    
    }

    public getCostLabel(isMy: boolean): CostLabelComponent {
      return isMy ? this.myCostLabel : this.opponentCostLabel;
    }

    public getCardComponent(cardIdFrontBack: string): CardComponent {
      const cardComponent = this.cardComponents.find(card => card.idFrontBack === cardIdFrontBack);
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
          return this.deck.get(who === eWho.MY);
        case eCardArea.HAND:
          return this.hand.get(who === eWho.MY);
        case eCardArea.TABLE:
          return this.table;
        case eCardArea.SUMMON:
          return this.summon.get(who === eWho.MY);
        case eCardArea.DISCARD:
        case eCardArea.TOMB:
          return this.tomb.get(who === eWho.MY);
        default:
          debugger
          throw new Error("Invalid area");
      }
    }

    public async updateCardPlace(cardIdFrontBack: string, place: tPlace) {
      const cardComponent = this.getCardComponent(cardIdFrontBack);
      this.getBoardComponent(cardComponent.place.area, cardComponent.place.who).removeCard(cardIdFrontBack);

      cardComponent._place = place;

      this.getBoardComponent(place.area, place.who).addCard(cardIdFrontBack);
      
      await this.gameClient.postCardInfoPlaceAsync(cardIdFrontBack, place);
        
    }
    

  private createLabelText(){
    this.textLabelPhase = new TextLabel(this.scene, this.scene.scale.width * 2/3, 30, '', {
        fontSize: '64px',
        color: '#ffffff',
        backgroundColor: '#000000',
    }).setOrigin(0.5);

    this.textLabelTurn = new TextLabel(this.scene, this.scene.scale.width * 1/3, 30, '', {
        fontSize: '64px',
        color: '#ffffff',
        backgroundColor: '#000000',
    }).setOrigin(0.5);
}

  public get isMeFirst(): boolean {
    return this._isMeFirst;
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
     this.nextPhase()
     return false;
// debugger
//     this.isMeFirst = !this.isMeFirst;

//     if(this.rule.isMyTurn === this.isMeFirst) {
//       this.nextPhase();
//       return false;
//     }else{
//         return true;
//     }
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