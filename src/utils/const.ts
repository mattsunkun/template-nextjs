import { tCardAddInfo } from "@/game/clients/GameClient";

export const numNull = (): number => {
    // console.trace()
    // debugger
    // unexpectError("numNull must not be called");
    // console.log("numNull called")
    return -4869;
  };

export const cardAddInfoNull: tCardAddInfo = {
  idFrontBack: "",
  pair_id: numNull(),
  image_id: {
    front: "",
    real: "",
    back: ""
  },
  cost: numNull(),
  attack: numNull(),
  ability: undefined,
  isSpellable: false,
  isSummonable: false,
  nowAttack: numNull()
}