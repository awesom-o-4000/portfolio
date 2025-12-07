import { MOCK_PARTS, SLOT_SYMBOLS, ENEMY_NAMES } from '../constants';
import { BattleResult, BattleTurn, PartType, PlayerState, Robot, RobotPart } from '../types';

// Helper function to get missing part types
const getMissingPartTypes = (inventory: RobotPart[]): PartType[] => {
    const existingTypes = new Set(inventory.map(p => p.type));
    const allTypes: PartType[] = [PartType.HEAD, PartType.BODY, PartType.ARMS, PartType.LEGS, PartType.WEAPON];
    return allTypes.filter(type => !existingTypes.has(type));
}

// Helper function to map PartType to symbol id
const partTypeToSymbolId = (partType: PartType): string | null => {
    switch(partType) {
        case PartType.HEAD: return 'head';
        case PartType.BODY: return 'body';
        case PartType.ARMS: return 'arms';
        case PartType.LEGS: return 'legs';
        case PartType.WEAPON: return 'weapon';
        default: return null;
    }
}

export const spinReels = (playerState: PlayerState) => {
  const { inventory } = playerState;
  const spinCount = playerState.spinCount || 0;

  // Pity timer to ensure player gets all 5 unique part types within ~20 spins
  const missingPartTypes = getMissingPartTypes(inventory);
  const helpThreshold = 5; // Start helping after 5 spins
  let forceMissingPart = false;

  if (spinCount > helpThreshold && missingPartTypes.length > 0) {
    // Probability increases from ~20% at spin 6 to 100% at spin 20
    const pityProbability = Math.min(1.0, 0.2 + (spinCount - helpThreshold) * 0.055);
    if (Math.random() < pityProbability) {
      forceMissingPart = true;
    }
  }

  if (forceMissingPart) {
    const partToGive = missingPartTypes[Math.floor(Math.random() * missingPartTypes.length)];
    const symbolToGive = partTypeToSymbolId(partToGive);
    if (symbolToGive) {
        return [symbolToGive, symbolToGive, symbolToGive];
    }
  }


  // Original Biased RNG: 45% chance to force a 3-match win
  if (Math.random() < 0.45) {
      const possibleWins = SLOT_SYMBOLS.filter(s => s.id !== 'wild').map(s => s.id);
      const forcedSymbol = possibleWins[Math.floor(Math.random() * possibleWins.length)];
      return [forcedSymbol, forcedSymbol, forcedSymbol];
  }

  const pool: string[] = [];
  SLOT_SYMBOLS.forEach(sym => {
    for (let i = 0; i < sym.weight; i++) {
      pool.push(sym.id);
    }
  });

  const reel1 = pool[Math.floor(Math.random() * pool.length)];
  const reel2 = pool[Math.floor(Math.random() * pool.length)];
  const reel3 = pool[Math.floor(Math.random() * pool.length)];

  return [reel1, reel2, reel3];
};

export const getRandomPart = (specificType?: string): RobotPart => {
  let candidates = MOCK_PARTS;
  
  if (specificType && specificType !== 'wild' && specificType !== 'coin') {
      let pType: PartType | undefined;
      if (specificType === 'head') pType = PartType.HEAD;
      if (specificType === 'body') pType = PartType.BODY;
      if (specificType === 'arms') pType = PartType.ARMS;
      if (specificType === 'legs') pType = PartType.LEGS;
      if (specificType === 'weapon') pType = PartType.WEAPON;

      if (pType) {
          candidates = MOCK_PARTS.filter(p => p.type === pType);
      }
  }

  const selectedTemplate = candidates[Math.floor(Math.random() * candidates.length)];

  return {
      ...selectedTemplate,
      id: `${selectedTemplate.templateId}_${Date.now()}_${Math.floor(Math.random() * 99999)}`,
      level: 1,
  };
};

export const calculateLevelUpStats = (part: RobotPart): RobotPart => {
    // Increase power by 20% of base (approximately) per level
    const powerIncrease = Math.ceil(part.statBonus * 0.2) + 1;
    return {
        ...part,
        level: part.level + 1,
        statBonus: part.statBonus + powerIncrease
    };
};

export const hasFullRobotSet = (inventory: RobotPart[]): boolean => {
    const types = new Set(inventory.map(p => p.type));
    return types.has(PartType.HEAD) && 
           types.has(PartType.BODY) && 
           types.has(PartType.ARMS) && 
           types.has(PartType.LEGS) && 
           types.has(PartType.WEAPON);
};

export const calculatePower = (robot: Robot): number => {
  let power = 0;
  Object.values(robot.parts).forEach(part => {
    if (part) power += part.statBonus;
  });
  return power;
};

export const simulateBattle = (playerRobot: Robot): BattleResult => {
  const playerPower = calculatePower(playerRobot);
  const powerVariance = Math.floor(Math.random() * 40) - 10;
  const enemyPower = Math.max(10, playerPower + powerVariance);
  const enemyName = ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)];

  const log: BattleTurn[] = [];
  let playerHp = playerPower * 5 + 100;
  let enemyHp = enemyPower * 5 + 100;
  let turn = 0;

  while (playerHp > 0 && enemyHp > 0 && turn < 20) {
    turn++;
    
    // Player Turn
    const playerDmg = Math.floor(playerPower * (0.8 + Math.random() * 0.4));
    const playerCrit = Math.random() > 0.8;
    const finalPlayerDmg = playerCrit ? playerDmg * 1.5 : playerDmg;
    enemyHp -= finalPlayerDmg;
    log.push({
      attacker: playerRobot.name,
      defender: enemyName,
      damage: Math.floor(finalPlayerDmg),
      isCrit: playerCrit,
      description: `attacked with ${playerRobot.parts.WEAPON?.name || 'bare fists'}`
    });

    if (enemyHp <= 0) break;

    // Enemy Turn
    const enemyDmg = Math.floor(enemyPower * (0.8 + Math.random() * 0.4));
    const enemyCrit = Math.random() > 0.8;
    const finalEnemyDmg = enemyCrit ? enemyDmg * 1.5 : enemyDmg;
    playerHp -= finalEnemyDmg;
    log.push({
      attacker: enemyName,
      defender: playerRobot.name,
      damage: Math.floor(finalEnemyDmg),
      isCrit: enemyCrit,
      description: `counter-attacked!`
    });
  }

  const winner = playerHp > 0 ? 'PLAYER' : 'ENEMY';
  const reward = winner === 'PLAYER' ? Math.floor(enemyPower * 1.5) : 10;

  return {
    winner,
    log,
    reward,
    enemyName
  };
};