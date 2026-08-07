<template>
  <button
    class="ghi-button"
    :class="{ 'ghi-button-dark': isDark }"
    type="button"
  >
    <div class="ghi-button-state"></div>
    <div class="ghi-button-content-wrapper">
      <div class="ghi-button-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          width="20"
          height="20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
      </div>
      <span class="ghi-button-contents">Sign in with GitHub</span>
    </div>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === 'dark');
</script>

<style scoped>
.ghi-button {
  user-select: none;
  appearance: none;
  background-color: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  box-sizing: border-box;
  color: #24292f;
  cursor: pointer;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Noto Sans',
    Helvetica,
    Arial,
    sans-serif;
  font-size: 14px;
  height: 40px;
  letter-spacing: 0.25px;
  outline: none;
  overflow: hidden;
  padding: 0 12px;
  position: relative;
  text-align: center;
  transition:
    background-color 0.218s,
    border-color 0.218s,
    box-shadow 0.218s;
  vertical-align: middle;
  white-space: nowrap;
  width: auto;
  min-width: min-content;
}

.ghi-button .ghi-button-state {
  position: absolute;
  inset: 0;
  transition: opacity 0.218s;
  opacity: 0;
  background-color: #24292f;
}

.ghi-button:hover .ghi-button-state {
  opacity: 0.06;
}

.ghi-button .ghi-button-content-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.ghi-button .ghi-button-icon {
  height: 20px;
  width: 20px;
  margin-right: 12px;
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ghi-button .ghi-button-contents {
  font-weight: 500;
}

.ghi-button-dark {
  background-color: #21262d;
  border-color: #30363d;
  color: #e6edf3;
}
</style>
