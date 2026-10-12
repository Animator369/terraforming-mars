import {CreateGameModel} from './CreateGameModel';
import {RandomMAOptionType} from '@/common/ma/RandomMAOptionType';

export type GamePresetId = 'standard' | 'all_official' | 'classic' | 'solo' | 'all_in';

export interface GamePreset {
  id: GamePresetId;
  label: string;
  description: string;
  icon: string;
}

export const GAME_PRESETS: Array<GamePreset> = [
  {
    id: 'standard',
    label: 'Standard Competitive',
    description: 'Corporate Era + Prelude with Draft & Real-time VP',
    icon: '⚡',
  },
  {
    id: 'all_official',
    label: 'All Official',
    description: 'All 7 official expansions with Solar Phase & Milestones',
    icon: '🪐',
  },
  {
    id: 'classic',
    label: 'Classic Base',
    description: 'Corporate Era core experience with Draft',
    icon: '🎯',
  },
  {
    id: 'solo',
    label: 'Solo Challenge',
    description: '1 Player 63 TR solo mode with Corporate Era',
    icon: '👤',
  },
  {
    id: 'all_in',
    label: 'All-In (Fan)',
    description: 'Official expansions plus popular community expansions',
    icon: '🌌',
  },
];

export function applyGamePreset(model: CreateGameModel, presetId: GamePresetId): void {
  switch (presetId) {
    case 'standard': {
      if (model.playersCount === 1) {
        model.playersCount = 3;
      }
      model.allOfficialExpansions = false;
      model.expansions.corpera = true;
      model.expansions.prelude = true;
      model.expansions.prelude2 = false;
      model.expansions.venus = false;
      model.expansions.colonies = false;
      model.expansions.turmoil = false;
      model.expansions.promo = false;
      model.expansions.community = false;
      model.expansions.ares = false;
      model.expansions.moon = false;
      model.expansions.pathfinders = false;
      model.expansions.ceo = false;
      model.expansions.starwars = false;
      model.expansions.underworld = false;
      model.expansions.deltaProject = false;
      model.expansions.postlude = false;

      model.draftVariant = true;
      model.showOtherPlayersVP = true;
      model.randomFirstPlayer = true;
      model.solarPhaseOption = false;
      model.soloTR = false;
      break;
    }
    case 'all_official': {
      if (model.playersCount === 1) {
        model.playersCount = 3;
      }
      model.allOfficialExpansions = true;
      model.expansions.corpera = true;
      model.expansions.prelude = true;
      model.expansions.prelude2 = true;
      model.expansions.venus = true;
      model.expansions.colonies = true;
      model.expansions.turmoil = true;
      model.expansions.promo = true;

      model.expansions.community = false;
      model.expansions.ares = false;
      model.expansions.moon = false;
      model.expansions.pathfinders = false;
      model.expansions.ceo = false;
      model.expansions.starwars = false;
      model.expansions.underworld = false;
      model.expansions.deltaProject = false;
      model.expansions.postlude = false;

      model.solarPhaseOption = true;
      model.draftVariant = true;
      model.showOtherPlayersVP = true;
      model.randomFirstPlayer = true;
      model.randomMA = RandomMAOptionType.LIMITED;
      model.soloTR = false;
      break;
    }
    case 'classic': {
      if (model.playersCount === 1) {
        model.playersCount = 3;
      }
      model.allOfficialExpansions = false;
      model.expansions.corpera = true;
      model.expansions.prelude = false;
      model.expansions.prelude2 = false;
      model.expansions.venus = false;
      model.expansions.colonies = false;
      model.expansions.turmoil = false;
      model.expansions.promo = false;
      model.expansions.community = false;
      model.expansions.ares = false;
      model.expansions.moon = false;
      model.expansions.pathfinders = false;
      model.expansions.ceo = false;
      model.expansions.starwars = false;
      model.expansions.underworld = false;
      model.expansions.deltaProject = false;
      model.expansions.postlude = false;

      model.draftVariant = true;
      model.solarPhaseOption = false;
      model.soloTR = false;
      break;
    }
    case 'solo': {
      model.playersCount = 1;
      model.allOfficialExpansions = false;
      model.expansions.corpera = true;
      model.expansions.prelude = false;
      model.expansions.prelude2 = false;
      model.expansions.venus = false;
      model.expansions.colonies = false;
      model.expansions.turmoil = false;
      model.expansions.promo = false;
      model.expansions.community = false;
      model.expansions.ares = false;
      model.expansions.moon = false;
      model.expansions.pathfinders = false;
      model.expansions.ceo = false;
      model.expansions.starwars = false;
      model.expansions.underworld = false;
      model.expansions.deltaProject = false;
      model.expansions.postlude = false;

      model.soloTR = true;
      model.draftVariant = false;
      break;
    }
    case 'all_in': {
      if (model.playersCount === 1) {
        model.playersCount = 3;
      }
      model.allOfficialExpansions = true;
      model.expansions.corpera = true;
      model.expansions.prelude = true;
      model.expansions.prelude2 = true;
      model.expansions.venus = true;
      model.expansions.colonies = true;
      model.expansions.turmoil = true;
      model.expansions.promo = true;

      model.expansions.community = true;
      model.expansions.ares = true;
      model.expansions.moon = true;
      model.expansions.pathfinders = true;
      model.expansions.ceo = true;

      model.solarPhaseOption = true;
      model.draftVariant = true;
      model.showOtherPlayersVP = true;
      model.randomFirstPlayer = true;
      model.randomMA = RandomMAOptionType.LIMITED;
      model.soloTR = false;
      break;
    }
  }
}
