<template>
  <div class="input-container">
    <!-- Min and Max Inputs Side by Side -->
    <div class="input-group">
      <label for="min-input">Min:</label>
      <input
        id="min-input"
        type="number"
        v-model="minValue"
        :min="min"
        :max="max"
        :step="step"
        @input="updateMin"
      />

      <label for="max-input">Max:</label>
      <input
        id="max-input"
        type="number"
        v-model="maxValue"
        :min="min"
        :max="max"
        :step="step"
        @input="updateMax"
      />
    </div>

    <!-- Display Current Values -->
    <div class="range-values">
      <span>Selected range: {{ minValue }} - {{ maxValue }}</span>
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
    },
    step: {
      type: Number,
      default: 1
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
      // Ensure minValue is less than maxValue
      if (this.minValue >= this.maxValue) {
        this.minValue = this.maxValue - 1
      }
      this.$emit('update-min', this.minValue)
    },
    updateMax() {
      // Ensure maxValue is greater than minValue
      if (this.maxValue <= this.minValue) {
        this.maxValue = this.minValue + 1
      }
      this.$emit('update-max', this.maxValue)
    }
  }
})
</script>

<style scoped>
.input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.input-group {
  display: flex;
  gap: 20px; /* Space between Min and Max inputs */
  align-items: center;
}

input[type='number'] {
  padding: 5px;
  width: 80px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.range-values {
  margin-top: 10px;
  text-align: center;
}
</style>
