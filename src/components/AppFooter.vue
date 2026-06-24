<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <p class="footer__copyright">© {{ year }} Zoresco. All rights reserved.</p>

      <nav class="footer__links" aria-label="Footer">
        <a href="#" class="footer__link">Privacy Policy</a>
        <a href="#" class="footer__link">Terms of Use</a>
        <a
          href="https://www.zoresco.com"
          class="footer__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Zoresco
        </a>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding: var(--space-lg) var(--content-padding);
}

.footer__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  max-width: var(--content-wide-max);
  margin: 0 auto;
}

.footer__copyright {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-lg);
}

.footer__link {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.footer__link:hover {
  text-decoration: underline;
}
</style>
