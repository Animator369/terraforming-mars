import {expect} from 'chai';
import {defaultCreateGameModel} from '@/client/components/create/defaultCreateGameModel';
import {applyGamePreset, GAME_PRESETS} from '@/client/components/create/presets';
import {RandomMAOptionType} from '@/common/ma/RandomMAOptionType';

describe('Game Presets', () => {
  it('defines the standard presets list with ids and labels', () => {
    const ids = GAME_PRESETS.map((p) => p.id);
    expect(ids).to.include.members(['standard', 'all_official', 'classic', 'solo', 'all_in']);
    for (const preset of GAME_PRESETS) {
      expect(preset.label).to.be.a('string').and.not.empty;
      expect(preset.description).to.be.a('string').and.not.empty;
      expect(preset.icon).to.be.a('string').and.not.empty;
    }
  });

  it('applies standard competitive preset (Prelude + Draft + Realtime VP)', () => {
    const model = defaultCreateGameModel();
    applyGamePreset(model, 'standard');
    expect(model.playersCount).to.eq(3);
    expect(model.expansions.corpera).to.be.true;
    expect(model.expansions.prelude).to.be.true;
    expect(model.draftVariant).to.be.true;
    expect(model.showOtherPlayersVP).to.be.true;
    expect(model.randomFirstPlayer).to.be.true;
    expect(model.expansions.venus).to.be.false;
  });

  it('applies all official expansions preset', () => {
    const model = defaultCreateGameModel();
    applyGamePreset(model, 'all_official');
    expect(model.allOfficialExpansions).to.be.true;
    expect(model.expansions.corpera).to.be.true;
    expect(model.expansions.prelude).to.be.true;
    expect(model.expansions.venus).to.be.true;
    expect(model.expansions.colonies).to.be.true;
    expect(model.expansions.turmoil).to.be.true;
    expect(model.expansions.promo).to.be.true;
    expect(model.solarPhaseOption).to.be.true;
    expect(model.randomMA).to.eq(RandomMAOptionType.LIMITED);
    expect(model.draftVariant).to.be.true;
    expect(model.showOtherPlayersVP).to.be.true;
  });

  it('applies classic base preset', () => {
    const model = defaultCreateGameModel();
    model.expansions.venus = true;
    applyGamePreset(model, 'classic');
    expect(model.expansions.corpera).to.be.true;
    expect(model.expansions.prelude).to.be.false;
    expect(model.expansions.venus).to.be.false;
    expect(model.draftVariant).to.be.true;
  });

  it('applies solo challenge preset', () => {
    const model = defaultCreateGameModel();
    model.playersCount = 4;
    applyGamePreset(model, 'solo');
    expect(model.playersCount).to.eq(1);
    expect(model.expansions.corpera).to.be.true;
    expect(model.soloTR).to.be.true;
  });

  it('applies all-in fan preset', () => {
    const model = defaultCreateGameModel();
    applyGamePreset(model, 'all_in');
    expect(model.expansions.corpera).to.be.true;
    expect(model.expansions.ares).to.be.true;
    expect(model.expansions.moon).to.be.true;
    expect(model.expansions.pathfinders).to.be.true;
    expect(model.draftVariant).to.be.true;
  });
});
