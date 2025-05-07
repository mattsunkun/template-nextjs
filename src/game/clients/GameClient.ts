export class GameClient {
    async getOpponentMove(): Promise<any> {
      const res = await fetch('/api/game/opponent-move');
      return await res.json();
    }
  
    async sendMyMove(): Promise<void> {
      await fetch('/api/game/my-move', {
        method: 'POST',
        body: JSON.stringify({ move: '...' }),
      });
    }
  
    async getOpponentStatus(): Promise<any> {
      const res = await fetch('/api/game/opponent-status');
      return await res.json();
    }
  }
  