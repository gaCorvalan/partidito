export default defineNuxtPlugin(() => {
  if (window.location.hash.includes('access_token')) {
    const cleanUrl = window.location.pathname + window.location.search
    window.history.replaceState({}, document.title, cleanUrl)
  }
})
