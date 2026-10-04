<template>
  <aside class="colonies-drawer" :class="{ 'is-open': isOpen }">
    <!-- Шапка панели -->
    <div class="drawer-header">
      <div class="drawer-title">
        <h2 v-i18n>Колонии и флоты</h2>
        <div class="fleets-status" v-if="player">
          <span class="status-label">Ваши корабли:</span>
          <span class="status-count">
            {{ availableFleets }} / {{ totalFleets }}
          </span>
          <span class="fleet-icon">🚀</span>
        </div>
      </div>
      <button class="close-btn" @click="closeSidebar" aria-label="Close" title="Закрыть панель">✕</button>
    </div>

    <!-- Контент со списком колоний и флотами -->
    <div class="drawer-content">
      <slot />
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { PublicPlayerModel } from '@/common/models/PlayerModel';

export default defineComponent({
  name: 'ColoniesSidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    player: {
      type: Object as PropType<PublicPlayerModel>,
      required: false,
    },
  },
  emits: ['update:isOpen', 'close'],
  setup(props, { emit }) {
    const closeSidebar = () => {
      emit('update:isOpen', false);
      emit('close');
    };

    const totalFleets = computed(() => {
      return props.player?.fleetSize ?? 1;
    });

    const usedFleets = computed(() => {
      return props.player?.tradesThisGeneration ?? 0;
    });

    const availableFleets = computed(() => {
      return Math.max(0, totalFleets.value - usedFleets.value);
    });

    return {
      closeSidebar,
      totalFleets,
      availableFleets,
    };
  },
});
</script>

<style scoped lang="less">
/* Выдвижная боковая шторка без оверлея */
.colonies-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  max-width: 90vw;
  height: 100vh;
  background: #0f172a;
  border-left: 2px solid #334155;
  box-shadow: -6px 0 20px rgba(0, 0, 0, 0.45);
  z-index: 1003;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  pointer-events: auto;

  &.is-open {
    transform: translateX(0);
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #1e293b;
  border-bottom: 1px solid #334155;

  .drawer-title {
    h2 {
      margin: 0;
      font-size: 1.2rem;
      color: #f1f5f9;
    }

    .fleets-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #94a3b8;
      margin-top: 4px;

      .status-count {
        font-weight: bold;
        color: #38bdf8;
      }
    }
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 1.3rem;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;

    &:hover {
      color: #ffffff;
      background: #334155;
    }
  }
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  :deep(.player_home_colony_cont) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
}
</style>