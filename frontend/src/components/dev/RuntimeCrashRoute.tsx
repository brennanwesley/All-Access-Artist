export const RuntimeCrashRoute = () => {
  throw new Error('Intentional runtime crash for error boundary QA verification')
}
