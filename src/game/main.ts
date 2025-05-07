import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { GameScene } from './scenes/GameScene';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: BASE_WIDTH,
        height: BASE_HEIGHT
      },
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        GameScene,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
