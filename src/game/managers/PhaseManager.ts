
import { CPUClient } from '../clients/CPUClient';
import { GameClient } from '../clients/GameClient';
import { Card } from '../components/MemoryCardComponent';
import { EventBus } from '../EventBus';
import { TurnManager } from './TurnManager';
// ゲームフェーズを定義
export enum GamePhase {
    COST_SUMMON_SPELL = 'cost-summon-spell', // コスト変換・キャラ召喚・呪文詠唱フェーズ
    MEMORY_GAME = 'memory-game',            // 神経衰弱フェーズ
    ATTACK = 'attack',                      // 攻撃フェーズ
    GAME_END = 'game-end'                   // ゲーム終了
}

// キャラクターカードの状態を定義
export enum CharacterState {
    IN_DECK,       // デッキ内
    IN_HAND,       // 手札
    ON_FIELD,      // 場に出ている
    DISCARDED      // 捨て札
}

// キャラクターカードの情報
export interface Character {
    id: string;
    power: number;
    team: string;
    state: CharacterState;
    damaged?: number; // ダメージを受けた場合の値
}

// 呪文カードの情報
export interface SpellCard {
    id: string;
    name: string;
    cost: number;
    effect: string;
    description: string;
}

// プレイヤー情報
export interface Player {
    id: string;
    characterDeck: Character[];
    spellDeck: SpellCard[];
    hand: (Character | SpellCard)[];
    field: Character[];
    cost: number;
    life: number;
    canConvertToCost: boolean; // このターン、コストに変換できるかどうか
}

export class PhaseManager {
    private currentPhase: GamePhase = GamePhase.MEMORY_GAME; // 神経衰弱フェーズから開始
    private player: Player;
    private cpu: Player;
    private currentPlayer: Player;
    private firstPlayer: Player; // 先行プレイヤー
    private secondPlayer: Player; // 後攻プレイヤー
    private memoryGameCards: Card[] = [];
    private remainingPairs: number = 0;
    private playerMemoryGamePlayed: boolean = false; // プレイヤーが神経衰弱をプレイしたかどうか
    private cpuMemoryGamePlayed: boolean = false;    // CPUが神経衰弱をプレイしたかどうか
    private scene: Phaser.Scene;
    private scoreText: Phaser.GameObjects.Text;
    private turnText: Phaser.GameObjects.Text;

    private memoryPhaseManager: MemoryPhaseManager;
    constructor(scene: Phaser.Scene, myClient:GameClient, opponentClient:CPUClient, turnManager:TurnManager) {
        this.scene = scene;
        this.createScoreText();
        this.createTurnText();
        // プレイヤーとCPUの初期化
        this.player = this.initializePlayer('player');
        this.cpu = this.initializePlayer('cpu');
        
        // 先行・後攻をランダムに決定
        this.determineFirstPlayer();
        
        // イベントリスナーの設定
        this.setupEventListeners();
    }

    // プレイヤーの初期化
    private initializePlayer(id: string): Player {
        return {
            id,
            characterDeck: this.generateCharacterDeck(id),
            spellDeck: this.generateSpellDeck(),
            hand: [],
            field: [],
            cost: 0,
            life: 20,
            canConvertToCost: true
        };
    }


    private updateScoreText() {
        this.scoreText.setText(`あなた: ${this.score}  CPU: ${this.opponentScore}`);
    }


    private createScoreText() {
        this.scoreText = this.scene.add.text(this.scene.scale.width / 2, 30, 'あなた: 0  CPU: 0', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
    }

    private createTurnText() {
        this.turnText = this.scene.add.text(this.scene.scale.width / 2, 80, 'あなたのターン', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
    }

    // キャラクターデッキの生成
    private generateCharacterDeck(team: string): Character[] {
        const deck: Character[] = [];
        
        // 20枚のキャラクターカードを生成
        for (let i = 1; i <= 20; i++) {
            // パワー値は1〜10の範囲でランダム設定
            const power = Math.floor(Math.random() * 10) + 1;
            
            deck.push({
                id: `${team}_char_${i}`,
                power,
                team,
                state: CharacterState.IN_DECK
            });
        }
        
        // デッキをシャッフル
        return this.shuffleArray(deck);
    }

    // 呪文デッキの生成
    private generateSpellDeck(): SpellCard[] {
        const spells: SpellCard[] = [];
        
        // 20枚の呪文カードを生成
        for (let i = 1; i <= 20; i++) {
            spells.push({
                id: `spell_${i}`,
                name: `呪文${i}`,
                cost: Math.floor(Math.random() * 3) + 1, // コスト1〜3
                effect: `effect_${i}`,
                description: `呪文${i}の効果説明`
            });
        }
        
        // デッキをシャッフル
        return this.shuffleArray(spells);
    }

    // 配列をシャッフルするヘルパーメソッド
    private shuffleArray<T>(array: T[]): T[] {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // 先行プレイヤーをランダムに決定
    private determineFirstPlayer(): void {
        // 0か1のランダムな値を生成
        const random = Math.floor(Math.random() * 2);
        
        if (random === 0) {
            // プレイヤーが先行
            this.firstPlayer = this.player;
            this.secondPlayer = this.cpu;
            console.log('プレイヤーが先行です');
        } else {
            // CPUが先行
            this.firstPlayer = this.cpu;
            this.secondPlayer = this.player;
            console.log('CPUが先行です');
        }
        
        // 現在のプレイヤーを先行プレイヤーに設定
        this.currentPlayer = this.firstPlayer;
    }

    // ゲームの初期化
    public initializeGame(): void {
        // 各プレイヤーからカードを1枚ずつ捨てる
        this.discardRandomCard(this.player.characterDeck);
        this.discardRandomCard(this.cpu.characterDeck);

        // 残りのキャラクターカードをシャッフルして神経衰弱用に配置
        this.setupMemoryGameCards();
        
        // 先行プレイヤーの情報を通知
        EventBus.emit('first-player-determined', {
            firstPlayerId: this.firstPlayer.id
        });
        
        // 神経衰弱フェーズから開始
        this.startPhase(GamePhase.MEMORY_GAME);
    }

    // 指定されたデッキからランダムに1枚捨てる
    private discardRandomCard(deck: Character[]): void {
        const index = Math.floor(Math.random() * deck.length);
        deck[index].state = CharacterState.DISCARDED;
        console.log(`カードが捨てられました: ${deck[index].id}`);
    }

    // 神経衰弱用のカードをセットアップ
    private setupMemoryGameCards(): void {
        // プレイヤーとCPUのキャラクターデッキを結合して混ぜる
        const playerCards = this.player.characterDeck.filter(card => card.state === CharacterState.IN_DECK);
        const cpuCards = this.cpu.characterDeck.filter(card => card.state === CharacterState.IN_DECK);
        
        const allCards = [...playerCards, ...cpuCards];
        const shuffledCards = this.shuffleArray(allCards);
        
        // ここでは仮のメモリーゲームカードを設定
        // 実際の実装では、これらのカードをPhaser.Gameオブジェクトとして生成する
        this.memoryGameCards = shuffledCards.map(card => {
            return {
                id: card.id,
                power: card.power,
                team: card.team
            } as unknown as Card;
        });
        
        this.remainingPairs = Math.floor(this.memoryGameCards.length / 2);
        
        // 神経衰弱用のカードが準備できたことを通知
        EventBus.emit('memory-game-cards-ready', {
            cards: this.memoryGameCards
        });
    }

    // フェーズを開始
    private startPhase(phase: GamePhase): void {
        this.currentPhase = phase;
        
        switch (phase) {
            case GamePhase.COST_SUMMON_SPELL:
                this.startCostSummonSpellPhase();
                break;
            case GamePhase.MEMORY_GAME:
                this.startMemoryGamePhase();
                break;
            case GamePhase.ATTACK:
                this.startAttackPhase();
                break;
            case GamePhase.GAME_END:
                this.handleGameEnd();
                break;
        }
        
        // フェーズが変わったことを通知
        EventBus.emit('phase-changed', {
            phase: this.currentPhase,
            currentPlayer: this.currentPlayer.id
        });
    }

    // コスト変換・キャラ召喚・呪文詠唱フェーズの開始
    private startCostSummonSpellPhase(): void {
        // このターン、コスト変換可能に設定
        this.currentPlayer.canConvertToCost = true;
        
        if (this.currentPlayer === this.cpu) {
            // CPUのAI処理
            this.processCpuCostSummonSpell();
        } else {
            // プレイヤーのターン開始を通知
            EventBus.emit('player-cost-summon-spell-phase', {
                player: this.player
            });
        }
    }

    // CPUのコスト変換・キャラ召喚・呪文詠唱フェーズの処理
    private processCpuCostSummonSpell(): void {
        // 簡易的なAI処理
        const cpuHand = this.cpu.hand.filter(card => 'power' in card) as Character[];
        
        // 手札にキャラがあればコストに変換
        if (cpuHand.length > 0 && this.cpu.canConvertToCost) {
            const cardToConvert = cpuHand[0];
            this.convertToCost(this.cpu, cardToConvert as Character);
        }
        
        // コストがあればキャラを召喚
        const charactersToSummon = cpuHand.filter(char => 
            this.cpu.cost >= char.power / 2
        );
        
        for (const char of charactersToSummon) {
            if (this.cpu.cost >= char.power / 2) {
                this.summonCharacter(this.cpu, char);
            }
        }
        
        // 次のフェーズへ
        setTimeout(() => {
            this.startPhase(GamePhase.MEMORY_GAME);
        }, 1000);
    }

    // 神経衰弱フェーズの開始
    private startMemoryGamePhase(): void {
        // プレイ状態をリセット
        if (this.currentPlayer === this.player) {
            this.playerMemoryGamePlayed = false;
        } else {
            this.cpuMemoryGamePlayed = false;
        }
        
        if (this.currentPlayer === this.cpu) {
            // CPUのAI処理
            this.processCpuMemoryGame();
        } else {
            // プレイヤーのターン開始を通知
            EventBus.emit('player-memory-game-phase', {
                cards: this.memoryGameCards
            });
        }
    }

    // CPUの神経衰弱フェーズの処理
    private processCpuMemoryGame(): void {
        // 簡易的なAI処理（ランダムにカードを選ぶ）
        // 実際の実装では、もう少し賢いAIロジックを実装する
        
        setTimeout(() => {
            // 神経衰弱に失敗したと仮定して呪文カードを引く
            this.drawSpellCard(this.cpu);
            
            // CPUの神経衰弱プレイ完了
            this.cpuMemoryGamePlayed = true;
            
            // 後攻プレイヤーがプレイ済みならコスト変換フェーズへ
            if (this.currentPlayer === this.secondPlayer) {
                this.startPhase(GamePhase.COST_SUMMON_SPELL);
            } else {
                // 後攻プレイヤーのターンへ
                this.switchPlayerTurn();
            }
        }, 2000);
    }

    // プレイヤーを切り替える
    private switchPlayerTurn(): void {
        this.currentPlayer = this.currentPlayer === this.player ? this.cpu : this.player;
        
        // 現在のフェーズを継続
        EventBus.emit('phase-changed', {
            phase: this.currentPhase,
            currentPlayer: this.currentPlayer.id
        });
        
        // 新しいプレイヤーのフェーズを開始
        switch (this.currentPhase) {
            case GamePhase.MEMORY_GAME:
                this.startMemoryGamePhase();
                break;
            case GamePhase.COST_SUMMON_SPELL:
                this.startCostSummonSpellPhase();
                break;
            case GamePhase.ATTACK:
                this.startAttackPhase();
                break;
        }
    }

    // 攻撃フェーズの開始
    private startAttackPhase(): void {
        if (this.currentPlayer === this.cpu) {
            // CPUのAI処理
            this.processCpuAttack();
        } else {
            // プレイヤーのターン開始を通知
            EventBus.emit('player-attack-phase', {
                playerField: this.player.field,
                cpuField: this.cpu.field
            });
        }
    }

    // CPUの攻撃フェーズの処理
    private processCpuAttack(): void {
        // 簡易的なAI処理
        // CPUの各キャラで攻撃
        for (const attacker of this.cpu.field) {
            // プレイヤーの場にキャラがいれば最も弱いものを選んで攻撃
            if (this.player.field.length > 0) {
                const weakestDefender = this.player.field.reduce((prev, current) => 
                    (prev.power < current.power) ? prev : current
                );
                
                this.processAttack(attacker, weakestDefender);
            } else {
                // 直接プレイヤーに攻撃
                this.player.life -= attacker.power;
                EventBus.emit('player-damaged', {
                    damage: attacker.power,
                    remainingLife: this.player.life
                });
            }
        }
        
        // ターン終了
        this.endTurn();
    }

    // ゲーム終了処理
    private handleGameEnd(): void {
        const winner = this.player.life > this.cpu.life ? 'player' : 'cpu';
        
        EventBus.emit('game-end', {
            winner,
            playerLife: this.player.life,
            cpuLife: this.cpu.life
        });
    }

    // イベントリスナーの設定
    private setupEventListeners(): void {
        // プレイヤーのアクションに対応するイベントリスナー
        EventBus.on('convert-to-cost', this.handleConvertToCost, this);
        EventBus.on('summon-character', this.handleSummonCharacter, this);
        EventBus.on('cast-spell', this.handleCastSpell, this);
        EventBus.on('next-phase', this.handleNextPhase, this);
        EventBus.on('memory-game-match', this.handleMemoryGameMatch, this);
        EventBus.on('memory-game-mismatch', this.handleMemoryGameMismatch, this);
        EventBus.on('attack', this.handleAttack, this);
        EventBus.on('end-turn', this.handleEndTurn, this);
    }

    // コストへの変換処理ハンドラ
    private handleConvertToCost(data: { character: Character }): void {
        if (this.currentPlayer === this.player && this.currentPhase === GamePhase.COST_SUMMON_SPELL) {
            this.convertToCost(this.player, data.character);
        }
    }

    // キャラ召喚処理ハンドラ
    private handleSummonCharacter(data: { character: Character }): void {
        if (this.currentPlayer === this.player && this.currentPhase === GamePhase.COST_SUMMON_SPELL) {
            this.summonCharacter(this.player, data.character);
        }
    }

    // 呪文詠唱処理ハンドラ
    private handleCastSpell(data: { spell: SpellCard }): void {
        if (this.currentPlayer === this.player && this.currentPhase === GamePhase.COST_SUMMON_SPELL) {
            this.castSpell(this.player, data.spell);
        }
    }

    // 次のフェーズへの移行ハンドラ
    private handleNextPhase(): void {
        switch (this.currentPhase) {
            case GamePhase.MEMORY_GAME:
                if (this.currentPlayer === this.player) {
                    this.playerMemoryGamePlayed = true;
                    // 後攻プレイヤーがプレイ済みならコスト変換フェーズへ
                    if (this.currentPlayer === this.secondPlayer) {
                        this.startPhase(GamePhase.COST_SUMMON_SPELL);
                    } else {
                        // 後攻プレイヤーのターンへ
                        this.switchPlayerTurn();
                    }
                } else {
                    this.cpuMemoryGamePlayed = true;
                    // 後攻プレイヤーがプレイ済みならコスト変換フェーズへ
                    if (this.currentPlayer === this.secondPlayer) {
                        this.startPhase(GamePhase.COST_SUMMON_SPELL);
                    } else {
                        // 後攻プレイヤーのターンへ
                        this.switchPlayerTurn();
                    }
                }
                break;
            case GamePhase.COST_SUMMON_SPELL:
                this.startPhase(GamePhase.ATTACK);
                break;
            case GamePhase.ATTACK:
                // 両方のフラグをリセット
                this.playerMemoryGamePlayed = false;
                this.cpuMemoryGamePlayed = false;
                // 神経衰弱フェーズに戻る
                this.startPhase(GamePhase.MEMORY_GAME);
                break;
        }
    }

    // 神経衰弱でマッチした時のハンドラ
    private handleMemoryGameMatch(data: { cards: Card[] }): void {
        if (this.currentPlayer === this.player && this.currentPhase === GamePhase.MEMORY_GAME) {
            // マッチしたキャラクターを手札に加える
            this.addCharactersToHand(this.player, data.cards);
            
            // 残りのペア数を減らす
            this.remainingPairs--;
            
            // プレイヤーの神経衰弱プレイ完了
            this.playerMemoryGamePlayed = true;
            
            // ゲーム終了チェック
            if (this.remainingPairs <= 1) { // 残り1ペアの場合、ゲーム終了
                this.checkGameEnd();
                return;
            }
            
            // 後攻プレイヤーがプレイ済みならコスト変換フェーズへ
            if (this.currentPlayer === this.secondPlayer) {
                this.startPhase(GamePhase.COST_SUMMON_SPELL);
            } else {
                // 後攻プレイヤーのターンへ
                this.switchPlayerTurn();
            }
        }
    }

    // 神経衰弱でミスマッチした時のハンドラ
    private handleMemoryGameMismatch(): void {
        if (this.currentPlayer === this.player && this.currentPhase === GamePhase.MEMORY_GAME) {
            // 呪文カードを1枚引く
            this.drawSpellCard(this.player);
            
            // プレイヤーの神経衰弱プレイ完了
            this.playerMemoryGamePlayed = true;
            
            // 後攻プレイヤーがプレイ済みならコスト変換フェーズへ
            if (this.currentPlayer === this.secondPlayer) {
                this.startPhase(GamePhase.COST_SUMMON_SPELL);
            } else {
                // 後攻プレイヤーのターンへ
                this.switchPlayerTurn();
            }
        }
    }

    // 攻撃処理ハンドラ
    private handleAttack(data: { attacker: Character, defender: Character }): void {
        if (this.currentPlayer === this.player && this.currentPhase === GamePhase.ATTACK) {
            this.processAttack(data.attacker, data.defender);
        }
    }

    // ターン終了ハンドラ
    private handleEndTurn(): void {
        this.endTurn();
    }

    // キャラクターをコストに変換
    private convertToCost(player: Player, character: Character): void {
        if (!player.canConvertToCost) {
            console.log('このターンはもうコスト変換できません');
            return;
        }
        
        // 手札から指定キャラクターを探す
        const index = player.hand.findIndex(card => 
            'power' in card && card.id === character.id
        );
        
        if (index === -1) {
            console.log('指定されたキャラクターは手札にありません');
            return;
        }
        
        // コストに変換（パワーの半分をコストとして加算）
        player.cost += Math.floor(character.power / 2);
        
        // 手札から削除
        player.hand.splice(index, 1);
        
        // このターンのコスト変換フラグをオフに
        player.canConvertToCost = false;
        
        // コスト変換を通知
        EventBus.emit('cost-converted', {
            playerId: player.id,
            cost: player.cost
        });
    }

    // キャラクターを召喚
    private summonCharacter(player: Player, character: Character): void {
        // 手札から指定キャラクターを探す
        const index = player.hand.findIndex(card => 
            'power' in card && card.id === character.id
        );
        
        if (index === -1) {
            console.log('指定されたキャラクターは手札にありません');
            return;
        }
        
        // 召喚コスト（パワーの半分）をチェック
        const summonCost = Math.floor(character.power / 2);
        if (player.cost < summonCost) {
            console.log('コストが足りません');
            return;
        }
        
        // コストを消費
        player.cost -= summonCost;
        
        // 手札から削除
        const summonedCharacter = player.hand.splice(index, 1)[0] as Character;
        
        // キャラクターの状態を変更
        summonedCharacter.state = CharacterState.ON_FIELD;
        
        // 場に追加
        player.field.push(summonedCharacter);
        
        // キャラクター召喚を通知
        EventBus.emit('character-summoned', {
            playerId: player.id,
            character: summonedCharacter
        });
    }

    // 呪文を唱える
    private castSpell(player: Player, spell: SpellCard): void {
        // 手札から指定呪文を探す
        const index = player.hand.findIndex(card => 
            !('power' in card) && card.id === spell.id
        );
        
        if (index === -1) {
            console.log('指定された呪文は手札にありません');
            return;
        }
        
        // コストをチェック
        if (player.cost < spell.cost) {
            console.log('コストが足りません');
            return;
        }
        
        // コストを消費
        player.cost -= spell.cost;
        
        // 手札から削除
        player.hand.splice(index, 1);
        
        // 呪文の効果を適用（ここでは簡易的に）
        console.log(`${player.id}が呪文「${spell.name}」を唱えました`);
        
        // 呪文詠唱を通知
        EventBus.emit('spell-cast', {
            playerId: player.id,
            spell
        });
    }

    // 攻撃処理
    private processAttack(attacker: Character, defender: Character): void {
        // ジャイアントキリングの判定（パワー10 vs パワー1）
        if (attacker.power === 10 && defender.power === 1) {
            // 1パワーのキャラが勝利
            attacker.state = CharacterState.DISCARDED;
            
            // 攻撃側のフィールドから削除
            const attackerPlayer = this.getPlayerByCharacter(attacker);
            if (attackerPlayer) {
                const index = attackerPlayer.field.findIndex(char => char.id === attacker.id);
                if (index !== -1) {
                    attackerPlayer.field.splice(index, 1);
                }
            }
            
            // ジャイアントキリングを通知
            EventBus.emit('giant-killing', {
                attacker,
                defender
            });
            
            return;
        } else if (attacker.power === 1 && defender.power === 10) {
            // 1パワーのキャラが勝利
            defender.state = CharacterState.DISCARDED;
            
            // 防御側のフィールドから削除
            const defenderPlayer = this.getPlayerByCharacter(defender);
            if (defenderPlayer) {
                const index = defenderPlayer.field.findIndex(char => char.id === defender.id);
                if (index !== -1) {
                    defenderPlayer.field.splice(index, 1);
                }
            }
            
            // ジャイアントキリングを通知
            EventBus.emit('giant-killing', {
                attacker,
                defender
            });
            
            return;
        }
        
        // 通常の攻撃処理
        if (attacker.power > defender.power) {
            // 攻撃側の勝利
            defender.state = CharacterState.DISCARDED;
            
            // 防御側のフィールドから削除
            const defenderPlayer = this.getPlayerByCharacter(defender);
            if (defenderPlayer) {
                const index = defenderPlayer.field.findIndex(char => char.id === defender.id);
                if (index !== -1) {
                    defenderPlayer.field.splice(index, 1);
                }
                
                // ダメージ計算
                const damage = attacker.power - defender.power;
                defenderPlayer.life -= damage;
                
                // ダメージを通知
                EventBus.emit('player-damaged', {
                    playerId: defenderPlayer.id,
                    damage,
                    remainingLife: defenderPlayer.life
                });
            }
        } else if (attacker.power < defender.power) {
            // 防御側の勝利
            attacker.state = CharacterState.DISCARDED;
            
            // 攻撃側のフィールドから削除
            const attackerPlayer = this.getPlayerByCharacter(attacker);
            if (attackerPlayer) {
                const index = attackerPlayer.field.findIndex(char => char.id === attacker.id);
                if (index !== -1) {
                    attackerPlayer.field.splice(index, 1);
                }
            }
            
            // 防御側キャラクターのパワーを減少
            defender.damaged = (defender.damaged || 0) + (defender.power - attacker.power);
            
            // ダメージを通知
            EventBus.emit('character-damaged', {
                character: defender,
                damage: defender.power - attacker.power
            });
        } else {
            // 引き分け（両方とも破壊）
            attacker.state = CharacterState.DISCARDED;
            defender.state = CharacterState.DISCARDED;
            
            // フィールドから削除
            const attackerPlayer = this.getPlayerByCharacter(attacker);
            if (attackerPlayer) {
                const index = attackerPlayer.field.findIndex(char => char.id === attacker.id);
                if (index !== -1) {
                    attackerPlayer.field.splice(index, 1);
                }
            }
            
            const defenderPlayer = this.getPlayerByCharacter(defender);
            if (defenderPlayer) {
                const index = defenderPlayer.field.findIndex(char => char.id === defender.id);
                if (index !== -1) {
                    defenderPlayer.field.splice(index, 1);
                }
            }
            
            // 引き分けを通知
            EventBus.emit('attack-draw', {
                attacker,
                defender
            });
        }
    }

    // キャラクターの所有プレイヤーを取得
    private getPlayerByCharacter(character: Character): Player | null {
        if (this.player.field.some(char => char.id === character.id)) {
            return this.player;
        } else if (this.cpu.field.some(char => char.id === character.id)) {
            return this.cpu;
        }
        return null;
    }

    // 神経衰弱でマッチしたキャラクターを手札に追加
    private addCharactersToHand(player: Player, cards: Card[]): void {
        // カードのIDから元のキャラクターを探す
        for (const card of cards) {
            // カードのオリジナルデータを取得（setData('originalData', ...)で設定されたデータ）
            const originalData = card.getData('originalData');
            if (!originalData) continue;
            
            const cardId = originalData.id as string;
            
            // プレイヤーのデッキから探す
            let character = this.player.characterDeck.find(char => char.id === cardId);
            
            // CPUのデッキからも探す
            if (!character) {
                character = this.cpu.characterDeck.find(char => char.id === cardId);
            }
            
            if (character) {
                // キャラクターの状態を変更
                character.state = CharacterState.IN_HAND;
                
                // 手札に追加
                player.hand.push({...character});
                
                // 手札追加を通知
                EventBus.emit('character-added-to-hand', {
                    playerId: player.id,
                    character
                });
            }
        }
    }

    // 呪文カードを引く
    private drawSpellCard(player: Player): void {
        if (player.spellDeck.length > 0) {
            const card = player.spellDeck.pop()!;
            player.hand.push(card);
            
            // カードを引いたことを通知
            EventBus.emit('spell-card-drawn', {
                playerId: player.id,
                card
            });
        }
    }

    // ターン終了処理
    private endTurn(): void {
        // ゲーム終了チェック
        if (this.remainingPairs <= 1 || this.player.life <= 0 || this.cpu.life <= 0) {
            this.checkGameEnd();
            return;
        }
        
        // 神経衰弱フェーズに戻る
        this.playerMemoryGamePlayed = false;
        this.cpuMemoryGamePlayed = false;
        this.startPhase(GamePhase.MEMORY_GAME);
    }

    // ゲーム終了チェック
    private checkGameEnd(): void {
        if (this.remainingPairs <= 1 || this.player.life <= 0 || this.cpu.life <= 0) {
            this.startPhase(GamePhase.GAME_END);
        }
    }

    // 現在のフェーズを取得するメソッド
    public getCurrentPhase(): GamePhase {
        return this.currentPhase;
    }
} 