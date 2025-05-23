import { numNull } from "@/utils/const";
import { tCardRawInfo } from "./LocalServer";

export const myMemoryBack = "normal.1";
export const opponentMemoryBack = "normal.1";
export const mySpellBack = "normal.2";
export const opponentSpellBack = "normal.2";

export const myMemoryCardInfos: tCardRawInfo[] = [
  {
    front: "normal.heart.0",
    back: myMemoryBack, 
    real: "normal.heart.0"
  },
  {
    front: "normal.heart.1",
    back: myMemoryBack, 
    real: "normal.heart.1"
  },
  {
    front: "normal.heart.2",
    back: myMemoryBack, 
    real: "normal.heart.2"
  },
  {
    front: "normal.heart.3",
    back: myMemoryBack, 
    real: "normal.heart.3"
  },
  {
    front: "normal.heart.4",
    back: myMemoryBack, 
    real: "normal.heart.4"
  },
  {
    front: "normal.heart.5",
    back: myMemoryBack, 
    real: "normal.heart.5"
  },
  {
    front: "normal.heart.6",
    back: myMemoryBack, 
    real: "normal.heart.6"
  },
  {
    front: "normal.heart.7",
    back: myMemoryBack, 
    real: "normal.heart.7"
  },
  {
    front: "normal.heart.8",
    back: myMemoryBack, 
    real: "normal.heart.8"
  },
  {
    front: "normal.heart.9",
    back: myMemoryBack, 
    real: "normal.heart.9"
  },
  {
    front: "normal.heart.10",
    back: myMemoryBack, 
    real: "normal.heart.10"
  },
  {
    front: "normal.heart.11",
    back: myMemoryBack, 
    real: "normal.heart.11"
  },
  {
    front: "normal.heart.12",
    back: myMemoryBack, 
    real: "normal.heart.12"
  },
  {
    front: "normal.heart.13",
    back: myMemoryBack, 
    real: "normal.heart.13"
  }
].map(card => ({...card, cost: numNull()}));

export const opponentMemoryCardInfos: tCardRawInfo[] = [
  {
    front: "normal.spade.0",
    back: opponentMemoryBack, 
    real: "normal.spade.0"
  },
  {
    front: "normal.spade.1",
    back: opponentMemoryBack, 
    real: "normal.spade.1"
  },
  {
    front: "normal.spade.2",
    back: opponentMemoryBack, 
    real: "normal.spade.2"
  },
  {
    front: "normal.spade.3",
    back: opponentMemoryBack, 
    real: "normal.spade.3"
  },
  {
    front: "normal.spade.4",
    back: opponentMemoryBack, 
    real: "normal.spade.4"
  },
  {
    front: "normal.spade.5",
    back: opponentMemoryBack, 
    real: "normal.spade.5"
  },
  {
    front: "normal.spade.6",
    back: opponentMemoryBack, 
    real: "normal.spade.6"
  },
  {
    front: "normal.spade.7",
    back: opponentMemoryBack, 
    real: "normal.spade.7"
  },
  {
    front: "normal.spade.8",
    back: opponentMemoryBack, 
    real: "normal.spade.8"
  },
  {
    front: "normal.spade.9",
    back: opponentMemoryBack, 
    real: "normal.spade.9"
  },
  {
    front: "normal.spade.10",
    back: opponentMemoryBack, 
    real: "normal.spade.10"
  },
  {
    front: "normal.spade.11",
    back: opponentMemoryBack, 
    real: "normal.spade.11"
  },
  {
    front: "normal.spade.12",
    back: opponentMemoryBack, 
    real: "normal.spade.12"
  },
  {
    front: "normal.spade.13",
    back: opponentMemoryBack, 
    real: "normal.spade.13"
  }
].map(card => ({...card, cost: numNull()}));

const defenceCostDiff = 2;
const attackCostDiff = 2;
const scanCostDiff = -100;
export const mySpellCardInfos: tCardRawInfo[] = [
  {
    front: "shuffle.0",
    back: mySpellBack,
    real: "shuffle.0", 
    cost: 3,
  }, 
  {
    front: "defence.+.2",
    back: mySpellBack,
    real: "defence.+.2",
    cost: 2+defenceCostDiff,
  },
  {
    front: "defence.+.5",
    back: mySpellBack,
    real: "defence.+.5",
    cost: 5+defenceCostDiff,
  },
  {
    front: "attack.-.5",
    back: mySpellBack,
    real: "attack.-.5",
    cost: -5+attackCostDiff,
  },
  {
    front: "attack.+.3",
    back: mySpellBack,
    real: "attack.+.3",
    cost: 3+attackCostDiff,
  },
  {
    front: "attack.+.10",
    back: mySpellBack,
    real: "attack.+.10",
    cost: 10+attackCostDiff,
  },
  {
    front: "scan.1.0",
    back: mySpellBack,
    real: "scan.1.0",
    cost: 1+scanCostDiff,
  },
  {
    front: "scan.3.3",
    back: mySpellBack,
    real: "scan.3.3",
    cost: 3+scanCostDiff,
  },
  {
    front: "scan.5.0",
    back: mySpellBack,
    real: "scan.5.0",
    cost: 5+scanCostDiff,
  },
  {
    front: "scan.7.0",
    back: mySpellBack,
    real: "scan.7.0",
    cost: 7+scanCostDiff,
  },
  {
    front: "scan.10.10",
    back: mySpellBack,
    real: "scan.10.10",
    cost: 10+scanCostDiff,
  }
  
];

export const opponentSpellCardInfos: tCardRawInfo[] = [
  {
    front: "shuffle.0",
    back: opponentSpellBack,
    real: "shuffle.0",
    cost: 3,
  }, 
  {
    front: "defence.+.2",
    back: opponentSpellBack,
    real: "defence.+.2",
    cost: 2+defenceCostDiff,
  },
  {
    front: "defence.+.5",
    back: opponentSpellBack,
    real: "defence.+.5",
    cost: 5+defenceCostDiff,
  },
  {
    front: "attack.-.5",
    back: opponentSpellBack,
    real: "attack.-.5",
    cost: -5+attackCostDiff,
  },
  {
    front: "attack.+.3",
    back: opponentSpellBack,
    real: "attack.+.3",
    cost: 3+attackCostDiff,
  },
  {
    front: "attack.+.10",
    back: opponentSpellBack,
    real: "attack.+.10",
    cost: 10+attackCostDiff,
  },
  {
    front: "scan.1.0",
    back: opponentSpellBack,
    real: "scan.1.0",
    cost: 1+scanCostDiff,
  },
  {
    front: "scan.3.3",
    back: opponentSpellBack,
    real: "scan.3.3",
    cost: 3+scanCostDiff,
  },
  {
    front: "scan.5.0",
    back: opponentSpellBack,
    real: "scan.5.0",
    cost: 5+scanCostDiff,
  },
  {
    front: "scan.7.0",
    back: opponentSpellBack,
    real: "scan.7.0",
    cost: 7+scanCostDiff,
  },
  {
    front: "scan.10.10",
    back: opponentSpellBack,
    real: "scan.10.10",
    cost: 10+scanCostDiff,
  }
  
];