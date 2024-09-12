<template>
  <div class="slider-container">
    <!-- Min Slider -->
    <input
      type="range"
      v-model="minValue"
      :min="min"
      :max="max"
      step="0.1"
      class="slider min-slider"
      @input="updateMin"
    />

    <!-- Max Slider -->
    <input
      type="range"
      v-model="maxValue"
      :min="min"
      :max="max"
      step="0.1"
      class="slider max-slider"
      @input="updateMax"
    />

    <!-- Display Current Values -->
    <div class="range-values">
      <span>Min: {{ minValue }}</span>
      <span>Max: {{ maxValue }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DoubleSlider',
  props: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    initialMin: {
      type: Number,
      default: 0
    },
    initialMax: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      minValue: this.initialMin,
      maxValue: this.initialMax
    }
  },
  methods: {
    updateMin() {
      if (this.minValue >= this.maxValue) {
        this.minValue = this.maxValue - 1
      }
      this.$emit('update-min', this.minValue)
    },
    updateMax() {
      if (this.maxValue <= this.minValue) {
        this.maxValue = this.minValue + 1
      }
      this.$emit('update-max', this.maxValue)
    }
  }
})
</script>

<style scoped>
.slider-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.slider {
  -webkit-appearance: none;
  width: 80%; /* Adjust width to center the slider */
  height: 8px;
  background: #ddd;
  outline: none;
  margin: 10px 0;
  position: relative;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #4caf50;
  cursor: pointer;
  border-radius: 50%;
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #4caf50;
  cursor: pointer;
  border-radius: 50%;
}

.range-values {
  display: flex;
  justify-content: space-between;
  width: 80%; /* Matches the slider width */
  margin-top: 10px;
}

.min-slider {
  z-index: 2;
}

.max-slider {
  z-index: 1;
}
</style>
