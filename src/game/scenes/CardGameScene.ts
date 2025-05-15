// import { Scene } from 'phaser';
// import { Card } from '../components/MemoryCardComponent';
// import { EventBus } from '../EventBus';
// import { Character, GamePhase, PhaseManager, Player, SpellCard } from '../managers/PhaseManager';

// export class CardGameScene extends Scene {
//     private phaseManager: PhaseManager;
//     private memoryGameCards: Card[] = [];
//     private cardWidth: number = 80;
//     private cardHeight: number = 120;
//     private cardPadding: number = 10;
//     private rows: number = 5;
//     private cols: number = 8;
//     private firstCard: Card | null = null;
//     private secondCard: Card | null = null;
//     private isProcessing: boolean = false;
//     private playerHandArea: Phaser.GameObjects.Container;
//     private playerFieldArea: Phaser.GameObjects.Container;
//     private cpuFieldArea: Phaser.GameObjects.Container;
//     private phaseText: Phaser.GameObjects.Text;
//     private playerLifeText: Phaser.GameObjects.Text;
//     private cpuLifeText: Phaser.GameObjects.Text;
//     private playerCostText: Phaser.GameObjects.Text;

//     constructor() {
//         super('CardGameScene');
//     }

//     preload() {
//         // カード背景の読み込み
//         this.load.image('card_back', 'assets/card_back/default.png');
        
//         // キャラクターカードのアセット読み込み
//         for (let i = 1; i <= 10; i++) {
//             this.load.image(`character_${i}`, `assets/characters/${i}.png`);
//         }
        
//         // 呪文カードのアセット読み込み
//         for (let i = 1; i <= 10; i++) {
//             this.load.image(`spell_${i}`, `assets/spells/${i}.png`);
//         }
        
//         // UI要素のアセット読み込み
//         this.load.image('button', 'assets/ui/button.png');
//         this.load.image('panel', 'assets/ui/panel.png');
//     }

//     create() {
//         // 背景色の設定
//         this.cameras.main.setBackgroundColor(0x3a745f);
        
//         // PhaseManagerの初期化
//         this.phaseManager = new PhaseManager();
        
//         // UI要素の作成
//         this.createUI();
        
//         // イベントリスナーの設定
//         this.setupEventListeners();
        
//         // ゲーム開始
//         this.phaseManager.initializeGame();
//     }

//     private createUI() {
//         // ゲームフェーズを表示するテキスト
//         this.phaseText = this.add.text(this.scale.width / 2, 20, 'フェーズ: 準備中', {
//             fontSize: '24px',
//             color: '#ffffff'
//         }).setOrigin(0.5);
        
//         // プレイヤーのライフ表示
//         this.playerLifeText = this.add.text(100, 20, 'ライフ: 20', {
//             fontSize: '24px',
//             color: '#ffffff'
//         });
        
//         // CPUのライフ表示
//         this.cpuLifeText = this.add.text(this.scale.width - 200, 20, 'CPUライフ: 20', {
//             fontSize: '24px',
//             color: '#ffffff'
//         });
        
//         // プレイヤーのコスト表示
//         this.playerCostText = this.add.text(100, 50, 'コスト: 0', {
//             fontSize: '24px',
//             color: '#ffffff'
//         });
        
//         // プレイヤーの手札エリア
//         this.playerHandArea = this.add.container(50, this.scale.height - 150);
//         this.add.text(50, this.scale.height - 180, '手札', {
//             fontSize: '20px',
//             color: '#ffffff'
//         });
        
//         // プレイヤーのフィールドエリア
//         this.playerFieldArea = this.add.container(50, this.scale.height - 300);
//         this.add.text(50, this.scale.height - 330, 'プレイヤーの場', {
//             fontSize: '20px',
//             color: '#ffffff'
//         });
        
//         // CPUのフィールドエリア
//         this.cpuFieldArea = this.add.container(50, 200);
//         this.add.text(50, 170, 'CPUの場', {
//             fontSize: '20px',
//             color: '#ffffff'
//         });
        
//         // フェーズ切替ボタン
//         this.add.text(this.scale.width - 200, this.scale.height - 50, '次のフェーズ', {
//             fontSize: '20px',
//             color: '#ffffff',
//             backgroundColor: '#333333',
//             padding: { x: 10, y: 5 }
//         }).setInteractive()
//             .on('pointerdown', () => {
//                 EventBus.emit('next-phase', {});
//             });
//     }

//     private setupEventListeners() {
//         // PhaseManagerからのイベントをリッスン
//         EventBus.on('phase-changed', this.onPhaseChanged, this);
//         EventBus.on('memory-game-cards-ready', this.onMemoryGameCardsReady, this);
//         EventBus.on('player-cost-summon-spell-phase', this.onPlayerCostSummonSpellPhase, this);
//         EventBus.on('player-memory-game-phase', this.onPlayerMemoryGamePhase, this);
//         EventBus.on('player-attack-phase', this.onPlayerAttackPhase, this);
//         EventBus.on('character-added-to-hand', this.onCharacterAddedToHand, this);
//         EventBus.on('character-summoned', this.onCharacterSummoned, this);
//         EventBus.on('player-damaged', this.onPlayerDamaged, this);
//         EventBus.on('cost-converted', this.onCostConverted, this);
//         EventBus.on('spell-card-drawn', this.onSpellCardDrawn, this);
//         EventBus.on('game-end', this.onGameEnd, this);
//     }

//     private onPhaseChanged(data: { phase: GamePhase, currentPlayer: string }) {
//         // フェーズ表示を更新
//         let phaseText = '';
//         switch (data.phase) {
//             case GamePhase.COST_SUMMON_SPELL:
//                 phaseText = 'コスト変換・キャラ召喚・呪文詠唱フェーズ';
//                 break;
//             case GamePhase.MEMORY_GAME:
//                 phaseText = '神経衰弱フェーズ';
//                 break;
//             case GamePhase.ATTACK:
//                 phaseText = '攻撃フェーズ';
//                 break;
//             case GamePhase.GAME_END:
//                 phaseText = 'ゲーム終了';
//                 break;
//         }
        
//         this.phaseText.setText(`フェーズ: ${phaseText} (${data.currentPlayer === 'player' ? 'あなた' : 'CPU'}のターン)`);
//     }

//     private onMemoryGameCardsReady(data: { cards: any[] }) {
//         // 神経衰弱のカードを配置
//         this.createMemoryGameBoard(data.cards);
//     }

//     private createMemoryGameBoard(cardData: any[]) {
//         const offsetX = (this.scale.width - (this.cols * (this.cardWidth + this.cardPadding))) / 2;
//         const offsetY = 150;
        
//         // メモリーゲームカードを作成
//         for (let i = 0; i < cardData.length; i++) {
//             const row = Math.floor(i / this.cols);
//             const col = i % this.cols;
//             const x = offsetX + col * (this.cardWidth + this.cardPadding);
//             const y = offsetY + row * (this.cardHeight + this.cardPadding);
            
//             const cardConfig = {
//                 pair: cardData[i].power,
//                 cost: 0,
//                 attack: cardData[i].power,
//                 team: cardData[i].team,
//                 size: { width: this.cardWidth, height: this.cardHeight }
//             };
            
//             const card = new Card(this, x, y, cardConfig);
//             card.setInteractive();
//             card.on('cardClicked', this.onMemoryCardClicked, this);
//             card.hide(); // 最初は裏向き
            
//             // カードデータを関連付け
//             card.setData('originalData', cardData[i]);
            
//             this.memoryGameCards.push(card);
//         }
//     }

//     private onMemoryCardClicked(card: Card) {
//         // 現在の処理中またはカードが既に表になっている場合は無視
//         if (this.isProcessing || card.isFaceUp() || card.isPaired()) {
//             return;
//         }
        
//         // 神経衰弱フェーズ以外では無視
//         if (this.phaseManager.getCurrentPhase() !== GamePhase.MEMORY_GAME) {
//             return;
//         }
        
//         card.reveal();
        
//         if (!this.firstCard) {
//             // 1枚目のカード
//             this.firstCard = card;
//         } else {
//             // 2枚目のカード
//             this.secondCard = card;
//             this.isProcessing = true;
            
//             // マッチングチェック
//             setTimeout(() => {
//                 if (this.firstCard && this.secondCard) {
//                     const firstCardValue = this.firstCard.getValue();
//                     const secondCardValue = this.secondCard.getValue();
                    
//                     if (firstCardValue === secondCardValue) {
//                         // マッチング成功
//                         this.firstCard.match();
//                         this.secondCard.match();
                        
//                         // イベント発行
//                         EventBus.emit('memory-game-match', {
//                             cards: [
//                                 this.firstCard.getData('originalData'),
//                                 this.secondCard.getData('originalData')
//                             ]
//                         });
//                     } else {
//                         // マッチング失敗
//                         this.firstCard.hide();
//                         this.secondCard.hide();
                        
//                         // イベント発行
//                         EventBus.emit('memory-game-mismatch', {});
//                     }
                    
//                     this.firstCard = null;
//                     this.secondCard = null;
//                     this.isProcessing = false;
//                 }
//             }, 1000);
//         }
//     }

//     private onPlayerCostSummonSpellPhase(data: { player: Player }) {
//         // 手札のカードを操作可能にする
//         this.enableHandInteraction(true);
//     }

//     private onPlayerMemoryGamePhase(data: { cards: any[] }) {
//         // メモリーゲームボードを操作可能にする
//         this.memoryGameCards.forEach(card => {
//             if (!card.isPaired()) {
//                 card.setInteractive();
//             }
//         });
        
//         // 手札のカードを操作不可にする
//         this.enableHandInteraction(false);
//     }

//     private onPlayerAttackPhase(data: { playerField: Character[], cpuField: Character[] }) {
//         // 攻撃フェーズのUI設定
//         this.enableAttack(data.playerField, data.cpuField);
//     }

//     private enableHandInteraction(enable: boolean) {
//         // 手札内のカードを操作可能/不可にする
//         this.playerHandArea.each((child: any) => {
//             if (child instanceof Card) {
//                 if (enable) {
//                     child.setInteractive();
//                 } else {
//                     child.disableInteractive();
//                 }
//             }
//         });
//     }

//     private enableAttack(playerCharacters: Character[], cpuCharacters: Character[]) {
//         // プレイヤーのキャラクターを攻撃可能に
//         this.playerFieldArea.each((child: any) => {
//             if (child instanceof Card) {
//                 const charData = child.getData('character') as Character;
//                 if (playerCharacters.some(c => c.id === charData.id)) {
//                     child.setInteractive()
//                         .on('pointerdown', () => {
//                             this.selectAttacker(charData);
//                         });
//                 }
//             }
//         });
//     }

//     private selectAttacker(attacker: Character) {
//         // 攻撃者を選択し、防御者選択UIを表示
//         console.log(`攻撃者選択: ${attacker.id}, パワー: ${attacker.power}`);
        
//         // CPUのキャラクターを防御者として選択可能に
//         this.cpuFieldArea.each((child: any) => {
//             if (child instanceof Card) {
//                 const defender = child.getData('character') as Character;
//                 child.setInteractive()
//                     .on('pointerdown', () => {
//                         this.selectDefender(attacker, defender);
//                     });
//             }
//         });
//     }

//     private selectDefender(attacker: Character, defender: Character) {
//         // 防御者を選択し、攻撃を実行
//         console.log(`防御者選択: ${defender.id}, パワー: ${defender.power}`);
        
//         // 攻撃イベントを発行
//         EventBus.emit('attack', {
//             attacker,
//             defender
//         });
        
//         // 選択状態をリセット
//         this.resetAttackSelection();
//     }

//     private resetAttackSelection() {
//         // 攻撃/防御選択状態をリセット
//         this.playerFieldArea.each((child: any) => {
//             if (child instanceof Card) {
//                 child.disableInteractive();
//             }
//         });
        
//         this.cpuFieldArea.each((child: any) => {
//             if (child instanceof Card) {
//                 child.disableInteractive();
//             }
//         });
//     }

//     private onCharacterAddedToHand(data: { playerId: string, character: Character }) {
//         if (data.playerId === 'player') {
//             // プレイヤーの手札にキャラクターを追加
//             this.addCardToHand(data.character);
//         }
//     }

//     private addCardToHand(character: Character) {
//         // 手札の位置を計算
//         const handCardCount = this.playerHandArea.length;
//         const x = handCardCount * (this.cardWidth + 5);
        
//         // キャラクターカードを作成
//         const cardConfig = {
//             pair: character.power,
//             cost: Math.floor(character.power / 2),
//             attack: character.power,
//             team: character.team,
//             size: { width: this.cardWidth, height: this.cardHeight }
//         };
        
//         const card = new Card(this, x, 0, cardConfig);
//         card.reveal();
//         card.setData('character', character);
        
//         // カードイベント
//         card.on('pointerdown', () => {
//             if (this.phaseManager.getCurrentPhase() === GamePhase.COST_SUMMON_SPELL) {
//                 // コンテキストメニューを表示
//                 this.showCardActionMenu(card, character);
//             }
//         });
        
//         this.playerHandArea.add(card);
//     }

//     private showCardActionMenu(card: Card, character: Character) {
//         // カードアクション選択メニューを表示
//         const menuX = card.x + this.playerHandArea.x;
//         const menuY = card.y + this.playerHandArea.y - 50;
        
//         const convertButton = this.add.text(menuX, menuY, 'コストに変換', {
//             fontSize: '16px',
//             backgroundColor: '#333333',
//             padding: { x: 10, y: 5 }
//         }).setInteractive();
        
//         const summonButton = this.add.text(menuX, menuY + 30, '召喚', {
//             fontSize: '16px',
//             backgroundColor: '#333333',
//             padding: { x: 10, y: 5 }
//         }).setInteractive();
        
//         // ボタンイベント
//         convertButton.on('pointerdown', () => {
//             EventBus.emit('convert-to-cost', { character });
//             convertButton.destroy();
//             summonButton.destroy();
//         });
        
//         summonButton.on('pointerdown', () => {
//             EventBus.emit('summon-character', { character });
//             convertButton.destroy();
//             summonButton.destroy();
//         });
        
//         // 3秒後に自動的に消える
//         setTimeout(() => {
//             convertButton.destroy();
//             summonButton.destroy();
//         }, 3000);
//     }

//     private onCharacterSummoned(data: { playerId: string, character: Character }) {
//         if (data.playerId === 'player') {
//             // プレイヤーの場にキャラクターを追加
//             this.addCardToField(this.playerFieldArea, data.character);
            
//             // 手札から削除
//             this.removeFromHand(data.character);
//         } else {
//             // CPUの場にキャラクターを追加
//             this.addCardToField(this.cpuFieldArea, data.character);
//         }
//     }

//     private addCardToField(fieldArea: Phaser.GameObjects.Container, character: Character) {
//         // フィールドの位置を計算
//         const fieldCardCount = fieldArea.length;
//         const x = fieldCardCount * (this.cardWidth + 10);
        
//         // キャラクターカードを作成
//         const cardConfig = {
//             pair: character.power,
//             cost: Math.floor(character.power / 2),
//             attack: character.power,
//             team: character.team,
//             size: { width: this.cardWidth, height: this.cardHeight }
//         };
        
//         const card = new Card(this, x, 0, cardConfig);
//         card.reveal();
//         card.setData('character', character);
        
//         fieldArea.add(card);
//     }

//     private removeFromHand(character: Character) {
//         // 手札から指定キャラクターを削除
//         this.playerHandArea.each((child: any) => {
//             if (child instanceof Card) {
//                 const cardChar = child.getData('character') as Character;
//                 if (cardChar && cardChar.id === character.id) {
//                     this.playerHandArea.remove(child);
//                     child.destroy();
//                     return;
//                 }
//             }
//         });
        
//         // 手札の再配置
//         this.rearrangeHand();
//     }

//     private rearrangeHand() {
//         // 手札のカードを再配置
//         let x = 0;
//         this.playerHandArea.each((child: any) => {
//             if (child instanceof Card) {
//                 child.x = x;
//                 x += this.cardWidth + 5;
//             }
//         });
//     }

//     private onPlayerDamaged(data: { playerId: string, damage: number, remainingLife: number }) {
//         if (data.playerId === 'player') {
//             // プレイヤーのライフ表示を更新
//             this.playerLifeText.setText(`ライフ: ${data.remainingLife}`);
            
//             // ダメージエフェクト
//             this.showDamageEffect(this.playerLifeText, data.damage);
//         } else {
//             // CPUのライフ表示を更新
//             this.cpuLifeText.setText(`CPUライフ: ${data.remainingLife}`);
            
//             // ダメージエフェクト
//             this.showDamageEffect(this.cpuLifeText, data.damage);
//         }
//     }

//     private showDamageEffect(target: Phaser.GameObjects.Text, damage: number) {
//         // ダメージ表示エフェクト
//         const x = target.x + target.width + 10;
//         const y = target.y;
        
//         const damageText = this.add.text(x, y, `-${damage}`, {
//             fontSize: '24px',
//             color: '#ff0000'
//         });
        
//         this.tweens.add({
//             targets: damageText,
//             y: y - 50,
//             alpha: 0,
//             duration: 1000,
//             onComplete: () => {
//                 damageText.destroy();
//             }
//         });
//     }

//     private onCostConverted(data: { playerId: string, cost: number }) {
//         if (data.playerId === 'player') {
//             // プレイヤーのコスト表示を更新
//             this.playerCostText.setText(`コスト: ${data.cost}`);
//         }
//     }

//     private onSpellCardDrawn(data: { playerId: string, card: SpellCard }) {
//         if (data.playerId === 'player') {
//             // プレイヤーの手札に呪文カードを追加
//             this.addSpellCardToHand(data.card);
//         }
//     }

//     private addSpellCardToHand(spell: SpellCard) {
//         // 呪文カードを手札に追加（簡易版）
//         const handCardCount = this.playerHandArea.length;
//         const x = handCardCount * (this.cardWidth + 5);
        
//         // カードの背景を作成
//         const cardBg = this.add.rectangle(x, 0, this.cardWidth, this.cardHeight, 0x6666ff);
        
//         // 呪文名テキスト
//         const nameText = this.add.text(x, -this.cardHeight/3, spell.name, {
//             fontSize: '12px',
//             color: '#ffffff',
//             align: 'center'
//         }).setOrigin(0.5);
        
//         // コストテキスト
//         const costText = this.add.text(x - this.cardWidth/3, -this.cardHeight/2 + 10, `${spell.cost}`, {
//             fontSize: '16px',
//             color: '#ffff00',
//             fontStyle: 'bold'
//         }).setOrigin(0.5);
        
//         // 説明テキスト
//         const descText = this.add.text(x, this.cardHeight/4, spell.description, {
//             fontSize: '8px',
//             color: '#ffffff',
//             align: 'center',
//             wordWrap: { width: this.cardWidth - 10 }
//         }).setOrigin(0.5);
        
//         // コンテナにまとめる
//         const container = this.add.container(0, 0, [cardBg, nameText, costText, descText]);
//         container.setData('spell', spell);
//         container.setInteractive(new Phaser.Geom.Rectangle(-this.cardWidth/2, -this.cardHeight/2, this.cardWidth, this.cardHeight), Phaser.Geom.Rectangle.Contains);
        
//         // クリックイベント
//         container.on('pointerdown', () => {
//             if (this.phaseManager.getCurrentPhase() === GamePhase.COST_SUMMON_SPELL) {
//                 // 呪文使用アクション
//                 EventBus.emit('cast-spell', { spell });
//                 container.destroy();
//                 this.rearrangeHand();
//             }
//         });
        
//         this.playerHandArea.add(container);
//     }

//     private onGameEnd(data: { winner: string, playerLife: number, cpuLife: number }) {
//         // ゲーム終了表示
//         const winner = data.winner === 'player' ? 'あなた' : 'CPU';
        
//         const gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2, `ゲーム終了！\n${winner}の勝利！`, {
//             fontSize: '48px',
//             color: '#ffffff',
//             align: 'center',
//             backgroundColor: '#000000',
//             padding: { x: 20, y: 10 }
//         }).setOrigin(0.5);
        
//         // スコア表示
//         this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, `プレイヤーライフ: ${data.playerLife}\nCPUライフ: ${data.cpuLife}`, {
//             fontSize: '24px',
//             color: '#ffffff',
//             align: 'center'
//         }).setOrigin(0.5);
        
//         // 再開ボタン
//         this.add.text(this.scale.width / 2, this.scale.height / 2 + 180, 'タイトルに戻る', {
//             fontSize: '24px',
//             color: '#ffffff',
//             backgroundColor: '#333333',
//             padding: { x: 20, y: 10 }
//         }).setOrigin(0.5)
//             .setInteractive()
//             .on('pointerdown', () => {
//                 this.scene.start('GameStart');
//             });
//     }

//     update() {
//         // 継続的な更新処理（必要に応じて実装）
//     }
// } 