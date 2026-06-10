// Replicates the IntersectionObserver logic from reference app.js
// threshold: 0.1, rootMargin: '0px 0px -50px 0px' — exact reference values
export function reveal(node: Element) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        node.dispatchEvent(new CustomEvent('reveal'))
        observer.unobserve(node)
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )
  observer.observe(node)
  return { destroy: () => observer.disconnect() }
}
