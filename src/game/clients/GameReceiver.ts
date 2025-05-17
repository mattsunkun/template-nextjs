// import { LocalServer } from "../servers/MockServer";

// export type tOpponentAction = {
//   type: 'card-select' | 'turn-end';
//   idFrontBack?: string;
//   timestamp: number;
// }

// export class GameReceiver {
//   private roomId: string;
//   private myId: string;
//   private opponentId: string;
//   private localServer: LocalServer | undefined;

//   constructor(roomId: string, myId: string, opponentId: string) {
//     this.roomId = roomId;
//     this.myId = myId;
//     this.opponentId = opponentId;

//     if (roomId.substring(0, 6) === "local-") {
//       this.localServer = new LocalServer(roomId, myId, opponentId);
//     }
//   }

//   /**
//    * サーバーからの通知を受け取るメソッド
//    * WebSocketまたはポーリングで実装可能
//    */
//   async subscribeToOpponentActions(callback: (action: tOpponentAction) => void): Promise<void> {
//     if (this.localServer) {
//       // ローカルサーバーの場合はモックデータを使用
//       setInterval(() => {
//         const mockAction: tOpponentAction = {
//           type: Math.random() > 0.5 ? 'card-select' : 'turn-end',
//           idFrontBack: Math.random() > 0.5 ? `card-${Math.floor(Math.random() * 10)}` : undefined,
//           timestamp: Date.now()
//         };
//         callback(mockAction);
//       }, 5000); // 5秒ごとにモックアクションを生成
//     } else {
//       // 本番環境の場合はWebSocketを使用
//       const ws = new WebSocket(`ws://${window.location.host}/api/game/actions/${this.roomId}`);
      
//       ws.onmessage = (event) => {
//         const action: tOpponentAction = JSON.parse(event.data);
//         callback(action);
//       };

//       ws.onerror = (error) => {
//         console.error('WebSocket error:', error);
//       };
//     }
//   }

//   /**
//    * 接続を終了するメソッド
//    */
//   disconnect(): void {
//     // WebSocket接続のクリーンアップなどを行う
//     // 実装は実際の要件に応じて追加
//   }
// } 