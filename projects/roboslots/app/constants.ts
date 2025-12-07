import { PartType, Rarity, RobotPart } from './types';

export const SLOT_SYMBOLS = [
  { id: 'coin', icon: '💰', weight: 45 },
  { id: 'head', icon: '🤖', weight: 20 },
  { id: 'body', icon: '🛡️', weight: 20 },
  { id: 'arms', icon: '🦾', weight: 20 },
  { id: 'legs', icon: '🦿', weight: 20 },
  { id: 'weapon', icon: '⚔️', weight: 15 },
  { id: 'wild', icon: '💎', weight: 8 },
];

export const COST_PER_SPIN = 5;
export const WIN_REWARD_COINS = 25;
export const JACKPOT_REWARD_COINS = 150;

export const MOCK_ROBOT_IMAGES = [
  "https://images.unsplash.com/photo-1535378437323-95288fb8e65e?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1589254065878-42c9da9e2dc6?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1589254066213-a0c9dc853511?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563205632-42da09b85c16?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534078362425-387ae9668c17?q=80&w=1000&auto=format&fit=crop"
];

export const MOCK_BATTLE_IMAGES = [
    "https://images.unsplash.com/photo-1593062096033-9a26b09da705?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1628126235206-5260b9ea6441?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518364538800-6bae3c2db0f2?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
];

export const MOCK_PARTS: Omit<RobotPart, 'id' | 'level' | 'equippedTo'>[] = [
  { templateId: 'head_1', name: 'Rusted Sensor', description: 'A round, rusty sensor head with a single glowing yellow eye.', type: PartType.HEAD, rarity: Rarity.COMMON, statBonus: 5 },
  { templateId: 'head_2', name: 'Optical Visor', description: 'Sleek blue visor head unit with antenna ears.', type: PartType.HEAD, rarity: Rarity.RARE, statBonus: 15 },
  { templateId: 'head_3', name: 'Quantum Brain', description: 'Floating crystal brain encased in a golden forcefield.', type: PartType.HEAD, rarity: Rarity.EPIC, statBonus: 40 },
  
  { templateId: 'body_1', name: 'Scrap Hull', description: 'A boxy chest piece made of welded scrap metal plates.', type: PartType.BODY, rarity: Rarity.COMMON, statBonus: 10 },
  { templateId: 'body_2', name: 'Titanium Plate', description: 'Polished silver chest armor with a glowing blue core reactor.', type: PartType.BODY, rarity: Rarity.RARE, statBonus: 25 },
  { templateId: 'body_3', name: 'Nanofiber Core', description: 'Organic-looking black matte armor with red pulsating veins.', type: PartType.BODY, rarity: Rarity.LEGENDARY, statBonus: 80 },

  { templateId: 'arms_1', name: 'Hydraulic Grippers', description: 'Industrial yellow loader arms with heavy clamps.', type: PartType.ARMS, rarity: Rarity.COMMON, statBonus: 8 },
  { templateId: 'arms_2', name: 'Reinforced Pistons', description: 'Chrome muscle-like arms with carbon fiber knuckles.', type: PartType.ARMS, rarity: Rarity.RARE, statBonus: 20 },
  
  { templateId: 'legs_1', name: 'Tank Treads', description: 'Heavy duty triangular tank treads, muddy and worn.', type: PartType.LEGS, rarity: Rarity.COMMON, statBonus: 8 },
  { templateId: 'legs_2', name: 'Hover Jets', description: 'Anti-gravity thrusters emitting a purple flame.', type: PartType.LEGS, rarity: Rarity.EPIC, statBonus: 35 },
  
  { templateId: 'wep_1', name: 'Rusty Pipe', description: 'A jagged metal pipe wrapped in barbed wire.', type: PartType.WEAPON, rarity: Rarity.COMMON, statBonus: 12 },
  { templateId: 'wep_2', name: 'Laser Cutter', description: 'Industrial orange laser tool modified for combat.', type: PartType.WEAPON, rarity: Rarity.RARE, statBonus: 30 },
  { templateId: 'wep_3', name: 'Plasma Cannon', description: 'Massive shoulder-mounted cannon glowing with unstable energy.', type: PartType.WEAPON, rarity: Rarity.LEGENDARY, statBonus: 100 },
];

export const INITIAL_PLAYER_STATE = {
  playerName: 'COMMANDER',
  coins: 200, // Increased to ensure player can collect parts
  inventory: [],
  robots: [{
      id: 'robot_1',
      name: 'Unit-01',
      parts: {},
      isActive: true,
  }],
  activeRobotId: 'robot_1',
  wins: 0,
  losses: 0,
  battleHistory: [],
  tutorialStep: 0,
  spinCount: 0,
};

export const ENEMY_NAMES = [
  "Scrap Crusher", "Neon Viper", "Steel Sentinel", "Cyber Stalker", "Rust Bucket", "Prime Unit"
];

export const TUTORIAL_STEPS = [
  "Welcome! Spin the slots to earn coins and robot parts.",
  "Great start! Keep spinning. You need 1 of each part type (Head, Body, Arms, Legs, Weapon).",
  "You found a part! Collect all 5 types to build your robot.",
  "You have all the parts! Go to the WORKSHOP to assemble your bot.",
  "Equip your parts, then click 'GENERATE ROBOT' to bring it to life!",
  "Your robot is ready! Go to BATTLE and climb the leaderboard."
];

export const BATTLE_LOADING_TEXTS = [
    "Initializing Combat Systems...",
    "Scanning Enemy Weaknesses...",
    "Charging Plasma Cannons...",
    "Rerouting Power to Shields...",
    "Engaging Tactical Matrix...",
    "Calculating Trajectory...",
    "Dodging Incoming Fire...",
    "Deploying Countermeasures...",
    "Overclocking Servos...",
    "Executing Finishing Move..."
];

export const MOCK_LEADERBOARD = [
  { name: 'ScrapLord', wins: 42 },
  { name: 'NeonViper', wins: 38 },
  { name: 'IronMike', wins: 15 },
  { name: 'Unit-734', wins: 25 },
  { name: 'Glitch', wins: 8 },
];