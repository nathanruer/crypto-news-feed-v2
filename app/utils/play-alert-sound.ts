let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) audioCtx = new AudioContext()
    return audioCtx
  }
  catch {
    return null
  }
}

/** Play a short beep using Web Audio API. No external audio file needed. */
export async function playAlertSound(): Promise<void> {
  const ctx = getAudioContext()
  if (!ctx) return

  // Resume suspended context (browser requires user interaction first)
  if (ctx.state === 'suspended') await ctx.resume()

  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.frequency.value = 880
  oscillator.type = 'sine'
  gain.gain.value = 0.3

  oscillator.start()
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
  oscillator.stop(ctx.currentTime + 0.3)
}
