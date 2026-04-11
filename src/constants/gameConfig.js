export const GAME_CONFIG = {
  WIDTH: 400,
  HEIGHT: 600,
  CAR_SIZE: 40,
  CAR_SPEED: 4,
  CAR_MOBILE_SPEED: 8,
  SCROLL_SPEED: 3,
  INITIAL_CAR_Y_OFFSET: 80
};

export const COLORS = {
  ROAD: '#3D3D3D',
  LANE_LINE: '#F5F5DC',
  SHOULDER: '#4A4A4A',
  SHOULDER_EDGE: '#2A2A2A',
  REWARD: '#22C55E',
  CAR_FALLBACK: '#3B82F6',
  OBSTACLE_FILL: '#B8560D',
  OBSTACLE_STROKE: '#FF6B35',
  OBSTACLE_ACCENT: '#D4651A',
  OBSTACLE_OVERLAY: 'rgba(255, 107, 53, 0.15)'
};

export const OBSTACLE_CONFIG = {
  MIN_WIDTH: 60,
  MAX_WIDTH: 120,
  HEIGHT: 25,
  SPAWN_INTERVAL: 50,
  COLLISION_PADDING: 2
};

export const REWARD_CONFIG = {
  SIZE: 25,
  SPAWN_INTERVAL: 70,
  SIZE_MIN: 20,
  SIZE_MAX: 40
};

export const REWARD_LEVELS = [
  { score: 1, size: 20, color: '#86EFAC', particleCount: 6, shakeIntensity: 0 },
  { score: 2, size: 24, color: '#4ADE80', particleCount: 8, shakeIntensity: 0 },
  { score: 3, size: 28, color: '#22C55E', particleCount: 10, shakeIntensity: 3 },
  { score: 4, size: 34, color: '#FACC15', particleCount: 14, shakeIntensity: 5, sound: true },
  { score: 5, size: 40, color: '#F97316', particleCount: 18, shakeIntensity: 8, sound: true, vibrate: true }
];

export const CAR_BOUNDARY = {
  HORIZONTAL_MARGIN: 15,
  VERTICAL_MARGIN: 10
};

export const ROAD_DASH = {
  DASH_LENGTH: 30,
  GAP_LENGTH: 20
};
