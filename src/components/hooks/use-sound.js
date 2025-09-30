import { useRef, useState, useEffect, useCallback } from 'react'
import useMount from './useMount'

/**
 *
 * @param {String | String[]} src
 * @param {{id: Number, volume: Number, playbackRate: Number, soundEnabled: Boolean, interrupt: Boolean, onload, skip: Boolean, delegated}} options
 * @returns
 */
const useSound = (src, { id, volume = 1, playbackRate = 1, soundEnabled = true, interrupt = false, onload, skip = false, ...delegated } = {}) => {
  const HowlConstructor = useRef(null)
  const [duration, setDuration] = useState(null)
  const [sound, setSound] = useState(null)

  const handleLoad = function () {
    if (typeof onload === 'function') {
      onload.call(this)
    }
    if (isMounted) {
      setDuration(this.duration() * 1000)
    }
    setSound(this)
  }

  const { isMounted } = useMount(
    async () => {
      if (!skip) {
        const mod = await import('howler')
        // Depending on the module system used, `mod` might hold
        // the export directly, or it might be under `default`.
        HowlConstructor.current = mod.Howl ?? mod.default.Howl
        // eslint-disable-next-line no-new, new-cap
        new HowlConstructor.current({
          src: Array.isArray(src) ? src : [src],
          volume,
          rate: playbackRate,
          onload: handleLoad,
          ...delegated
        })
      }
    }, [skip]
  )

  // When the `src` changes, we have to do a whole thing where we recreate
  // the Howl instance. This is because Howler doesn't expose a way to
  // tweak the sound
  useEffect(() => {
    if (HowlConstructor.current && sound) {
      // eslint-disable-next-line new-cap
      setSound(new HowlConstructor.current({
        src: Array.isArray(src) ? src : [src],
        volume,
        onload: handleLoad,
        ...delegated
      }))
    }
    // The linter wants to run this effect whenever ANYTHING changes,
    // but very specifically I only want to recreate the Howl instance
    // when the `src` changes. Other changes should have no effect.
    // Passing array to the useEffect dependencies list will result in
    // ifinite loop so we need to stringify it, for more details check
    // https://github.com/facebook/react/issues/14476#issuecomment-471199055
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [JSON.stringify(src)]
  )

  // Whenever volume/playbackRate are changed, change those properties
  // on the sound instance.
  useEffect(() => {
    if (sound) {
      sound.volume(volume)
      sound.rate(playbackRate)
    }
    // A weird bug means that including the `sound` here can trigger an
    // error on unmount, where the state loses track of the sprites??
    // No idea, but anyway I don't need to re-run this if only the `sound`
    // changes.
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [volume, playbackRate]
  )

  /**
   *
   * @param {{id: Number, forceSoundEnabled: Boolean, playbackRate: Number}} options
   * @returns
   */
  const rawPlay = (options) => {
    if (typeof options === 'undefined') {
      options = {}
    }
    if (!sound || (!soundEnabled && !options.forceSoundEnabled)) {
      return
    }
    if (interrupt) {
      sound.stop()
    }
    if (options.playbackRate) {
      sound.rate(options.playbackRate)
    }
    sound.play(options.id)
  }

  const play = useCallback(rawPlay, [sound, soundEnabled, interrupt])

  /**
   *
   * @param {Number} id
   * @returns
   */
  const rawStop = id => {
    if (!sound) {
      return
    }
    sound.stop(id)
  }

  const stop = useCallback(rawStop, [sound])

  /**
   *
   * @param {Number} id
   * @returns
   */
  const rawPause = id => {
    if (!sound) {
      return
    }
    sound.pause(id)
  }

  const pause = useCallback(rawPause, [sound])

  const returnedValue = [
    play,
    {
      sound,
      stop,
      pause,
      duration
    }
  ]
  return returnedValue
}

export default useSound
export { useSound }
