<template>
  <div class="header-swoop" aria-hidden="true">
    <svg
      class="header-swoop__svg"
      viewBox="0 0 1804 70"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 68.2008C5.65351e-07 46.966 16.5634 29.4431 37.7694 28.3383C167.773 21.5658 605.058 0 902 0C1198.94 0 1636.23 21.5658 1766.23 28.3383C1787.44 29.4431 1804 46.9661 1804 68.2008V69.8988H0V68.2008Z"
        fill="white"
      />
    </svg>
  </div>
</template>

<style scoped>
.header-swoop {
  width: 100%;
  line-height: 0;
  pointer-events: none;
  margin-top: calc(var(--swoop-height) * -0.55);
  display: flex;
  justify-content: center;
}

.header-swoop__svg {
  display: block;
  width: 100%;
  min-width: min(100%, var(--content-wide-max));
  max-width: 100%;
  height: var(--swoop-height);
}
</style>
