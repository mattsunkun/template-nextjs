
import { v4 as uuidv4 } from 'uuid';

export const generateStringUuid = (): string => {
  return uuidv4();
};


export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
