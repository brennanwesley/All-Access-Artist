/**
 * Inspirational Quotes Utilities
 * Extracted from Dashboard component for SRP compliance
 */

const inspirationalQuotes = [
  "Music is the universal language of mankind. - Henry Wadsworth Longfellow",
  "Without music, life would be a mistake. - Friedrich Nietzsche", 
  "Music can heal the wounds which medicine cannot touch. - Debasish Mridha",
  "Where words fail, music speaks. - Hans Christian Andersen",
  "Music is the strongest form of magic. - Marilyn Manson",
  "One good thing about music, when it hits you, you feel no pain. - Bob Marley",
  "Music is my religion. - Jimi Hendrix",
  "Music is the wine which inspires one to new generative processes. - Ludwig van Beethoven",
  "The music is not in the notes, but in the silence between. - Wolfgang Amadeus Mozart",
  "Music expresses that which cannot be said. - Victor Hugo"
]

export const getRandomQuote = (): string => {
  const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length)
  return inspirationalQuotes[randomIndex]
}

export const getQuoteOfTheDay = (): string => {
  // Use date as seed for consistent daily quote
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
  const quoteIndex = dayOfYear % inspirationalQuotes.length
  return inspirationalQuotes[quoteIndex] || inspirationalQuotes[0]
}

export const getAllQuotes = (): string[] => {
  return [...inspirationalQuotes]
}

export const searchQuotes = (searchTerm: string): string[] => {
  const term = searchTerm.toLowerCase()
  return inspirationalQuotes.filter(quote => 
    quote && quote.toLowerCase().includes(term)
  )
}
