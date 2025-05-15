import Phaser from 'phaser';
import { CardGameScene } from './scenes/CardGameScene';
import { GameOver } from './scenes/GameOver';
import { GameScene } from './scenes/GameScene';
import { GameStart } from './scenes/GameStart';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    backgroundColor: '#333333',
    scene: [GameStart, GameScene, GameOver, CardGameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

export default game; 