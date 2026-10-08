<template>
  <div class="board-space-upgrade" :title="title">
    <div class="board-space-upgrade-img" :style="backgroundStyle"></div>
    <div v-if="upgrade.color !== undefined" :class="playerColorCss"></div>
    <div v-if="hasBonuses" class="board-space-upgrade-bonuses">
      <Bonus :bonus="upgrade.additionalPlacementBonus!" />
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {SpaceUpgradeModel, POSTLUDE_CARD_IMAGE_MAP} from '@/common/postlude/PostludeTypes';
import Bonus from '@/client/components/Bonus.vue';
import {getPreferences} from '@/client/utils/PreferencesManager';

export default defineComponent({
  name: 'BoardSpaceUpgrade',
  components: {
    Bonus,
  },
  props: {
    upgrade: {
      type: Object as PropType<SpaceUpgradeModel>,
      required: true,
    },
  },
  computed: {
    title(): string {
      const bonusText = this.hasBonuses ? ' (Neighbor bonus)' : '';
      return `${this.upgrade.cardId}${bonusText}`;
    },
    hasBonuses(): boolean {
      return (
        this.upgrade.additionalPlacementBonus !== undefined &&
        this.upgrade.additionalPlacementBonus.length > 0
      );
    },
    playerColorCss(): string {
      if (this.upgrade.color === undefined) {
        return '';
      }
      const css = 'board-cube board-cube--' + this.upgrade.color;
      return getPreferences().symbol_overlay ? css + ' overlay' : css;
    },
    backgroundStyle(): Record<string, string> {
      const fileName = POSTLUDE_CARD_IMAGE_MAP[this.upgrade.cardId];
      if (fileName) {
        return {
          backgroundImage: `url(/assets/postlude/${fileName})`,
        };
      }
      return {};
    },
  },
});
</script>

<style scoped lang="less">
.board-space-upgrade {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;

  .board-space-upgrade-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 46px;
    height: 51px;
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.75));
  }

  .board-space-upgrade-bonuses {
    position: absolute;
    top: 3px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 4;
  }
}
</style>
