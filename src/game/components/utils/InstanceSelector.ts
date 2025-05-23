export type tInstanceSelector<T> = {
    my: T;
    opponent: T;
}

// 選択対象となるインスタンスの型をジェネリックで定義
export class InstanceSelector<T> {
    private instances: tInstanceSelector<T>;

    /**
     * コンストラクタ
     * @param instances 選択対象となるインスタンス
     */
    constructor(instances: tInstanceSelector<T>) {
      this.instances = instances;
    }
  
    /**
     * 保持している2つのインスタンスのうち、どちらかを返す
     * @param isMy true の場合は1つ目のインスタンス、false の場合は2つ目のインスタンスを返す
     * @returns 選択されたインスタンス
     */
    public get(isMy: boolean): T {
      return isMy ? this.instances.my : this.instances.opponent;
    }
  }