import { type ReactElement, useId } from 'react'

export type FoodieIconName =
  | 'dashboard'
  | 'foodLog'
  | 'progress'
  | 'recipes'
  | 'settings'
  | 'barcode'
  | 'grocery'
  | 'language'
  | 'profile'
  | 'planner'
  | 'scale'
  | 'shield'
  | 'spark'
  | 'mail'
  | 'reset'
  | 'target'
  | 'streak'
  | 'milestone'
  | 'calories'
  | 'protein'
  | 'carbs'
  | 'fat'

interface FoodieIconProps {
  name: FoodieIconName
  className?: string
}

const iconPaths: Record<FoodieIconName, ReactElement> = {
  dashboard: (
    <>
      <rect x='3.5' y='3.5' width='7' height='7' rx='2' />
      <rect x='13.5' y='3.5' width='7' height='11' rx='2' />
      <rect x='3.5' y='13.5' width='7' height='7' rx='2' />
      <path d='M13.5 17h7' />
      <path d='M17 13.5v7' />
    </>
  ),
  foodLog: (
    <>
      <path d='M7 4v8' />
      <path d='M10 4v8' />
      <path d='M8.5 12v8' />
      <path d='M15 4c1.7 2 2.5 4 2.5 6s-.8 4-2.5 6' />
      <path d='M15 4v16' />
    </>
  ),
  progress: (
    <>
      <path d='M4 18c2.5-4.5 5-7 7.5-7S16 13 20 6' />
      <path d='M16 6h4v4' />
      <path d='M4 20h16' />
    </>
  ),
  recipes: (
    <>
      <path d='M7 4h8a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3V7a3 3 0 0 1 3-3Z' />
      <path d='M7 20h11' />
      <path d='M9 8h6' />
      <path d='M9 12h5' />
    </>
  ),
  settings: (
    <>
      <path d='M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Z' />
      <path d='M12 2.8v2.4' />
      <path d='M12 18.8v2.4' />
      <path d='m4.8 4.8 1.7 1.7' />
      <path d='m17.5 17.5 1.7 1.7' />
      <path d='M2.8 12h2.4' />
      <path d='M18.8 12h2.4' />
      <path d='m4.8 19.2 1.7-1.7' />
      <path d='m17.5 6.5 1.7-1.7' />
    </>
  ),
  barcode: (
    <>
      <path d='M5 5v14' />
      <path d='M8 5v14' />
      <path d='M10 8v8' />
      <path d='M13 5v14' />
      <path d='M16 8v8' />
      <path d='M19 5v14' />
    </>
  ),
  grocery: (
    <>
      <path d='M7 8h10l-1 10H8L7 8Z' />
      <path d='M9 8V7a3 3 0 0 1 6 0v1' />
      <path d='M10 12h4' />
      <path d='M10 15h6' />
    </>
  ),
  language: (
    <>
      <circle cx='12' cy='12' r='8' />
      <path d='M4.5 12h15' />
      <path d='M12 4a13 13 0 0 1 0 16' />
      <path d='M12 4a13 13 0 0 0 0 16' />
    </>
  ),
  profile: (
    <>
      <circle cx='12' cy='8.5' r='3.2' />
      <path d='M5.5 19a6.8 6.8 0 0 1 13 0' />
    </>
  ),
  planner: (
    <>
      <rect x='4.5' y='5.5' width='15' height='14' rx='2.5' />
      <path d='M8 3.5v4' />
      <path d='M16 3.5v4' />
      <path d='M4.5 9.5h15' />
      <path d='M8 13h3' />
      <path d='M13.5 13h2.5' />
    </>
  ),
  scale: (
    <>
      <path d='M5 9.5A4.5 4.5 0 0 1 9.5 5h5A4.5 4.5 0 0 1 19 9.5V17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z' />
      <path d='M12 10.5 14.7 8' />
      <circle cx='12' cy='10.5' r='1.3' />
    </>
  ),
  shield: (
    <>
      <path d='M12 3 5.5 5.5v5.3c0 4.2 2.6 8 6.5 9.6 3.9-1.6 6.5-5.4 6.5-9.6V5.5Z' />
      <path d='m9.5 11.8 1.7 1.7 3.6-4' />
    </>
  ),
  spark: (
    <>
      <path d='m12 3 1.8 4.8L19 9.6l-4.4 2.5L13 17l-2-4.9L6.5 9.6l5.2-1.8Z' />
      <path d='M5 4.5 6 7l2.5 1-2.5 1L5 11.5 4 9 1.5 8 4 7Z' />
    </>
  ),
  mail: (
    <>
      <rect x='3.5' y='5.5' width='17' height='13' rx='3' />
      <path d='m5.5 8.5 6.5 4.8 6.5-4.8' />
    </>
  ),
  reset: (
    <>
      <path d='M6.8 8.5A6.8 6.8 0 1 1 5 12' />
      <path d='M4 4v5h5' />
    </>
  ),
  target: (
    <>
      <circle cx='12' cy='12' r='7.5' />
      <circle cx='12' cy='12' r='3.5' />
      <path d='M12 2.5v3' />
      <path d='M21.5 12h-3' />
    </>
  ),
  streak: (
    <>
      <path d='M12 3c2.5 3 3 5 1.5 7.2C12.1 9.3 10 9 9.2 7 7.5 8.3 6.7 10 6.7 12.1A5.3 5.3 0 0 0 12 17.5a5.3 5.3 0 0 0 5.3-5.4c0-2.8-1.5-4.9-5.3-9.1Z' />
      <path d='M10.3 14.3c.7.6 1.4.9 1.7.9 1.2 0 2-.8 2-2 0-.7-.4-1.5-1.2-2.3' />
    </>
  ),
  milestone: (
    <>
      <path d='M6 18V6.5A1.5 1.5 0 0 1 7.5 5H18l-2.5 4 2.5 4H7.5' />
      <path d='M6 18v2' />
    </>
  ),
  calories: (
    <>
      <path d='M12 3c2.7 3 4 5.5 4 8a4 4 0 1 1-8 0c0-1.8.9-3.8 4-8Z' />
      <path d='M10 14.5c.7.6 1.3.9 2 .9 1.2 0 2-.9 2-2.1' />
    </>
  ),
  protein: (
    <>
      <path d='M7 6.5c0-1.7 1.3-3 3-3h1c3.3 0 6 2.7 6 6v1c0 3.9-3.1 7-7 7h0a3 3 0 0 1-3-3Z' />
      <path d='M10 8.5c2 0 3.5 1.5 3.5 3.5S12 15.5 10 15.5' />
    </>
  ),
  carbs: (
    <>
      <path d='M5 14c0-5 3.5-8.5 7-8.5s7 3.5 7 8.5a7 7 0 1 1-14 0Z' />
      <path d='M8.5 11.5h7' />
      <path d='M8 15h8' />
    </>
  ),
  fat: (
    <>
      <path d='M12 4c4.8 0 8 3 8 7.8C20 16.8 16.6 20 12 20S4 16.8 4 11.8C4 7 7.2 4 12 4Z' />
      <path d='M12 7.5c1.5 2 2.2 3.4 2.2 4.7a2.2 2.2 0 1 1-4.4 0c0-1.3.7-2.7 2.2-4.7Z' />
    </>
  ),
}

export const FoodieIcon = ({ name, className }: FoodieIconProps) => (
  <span className={className} aria-hidden='true'>
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.9' strokeLinecap='round' strokeLinejoin='round'>
      {iconPaths[name]}
    </svg>
  </span>
)

export const AuthIllustration = () => {
  const accentId = useId().replace(/:/g, '')
  const glowId = `${accentId}-glow`
  const cardId = `${accentId}-card`

  return (
    <svg viewBox='0 0 320 220' className='foodie-illustration-svg' role='img' aria-label='Illustration of nutrition tracking and secure account access'>
      <defs>
        <linearGradient id={glowId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#ffcf5c' />
          <stop offset='55%' stopColor='#ff7d68' />
          <stop offset='100%' stopColor='#5dba8a' />
        </linearGradient>
        <linearGradient id={cardId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#ffffff' />
          <stop offset='100%' stopColor='#fff4dc' />
        </linearGradient>
      </defs>
      <rect x='22' y='26' width='276' height='168' rx='32' fill={`url(#${cardId})`} />
      <circle cx='78' cy='68' r='36' fill='rgba(93, 186, 138, 0.18)' />
      <circle cx='252' cy='72' r='24' fill='rgba(70, 135, 255, 0.14)' />
      <circle cx='232' cy='154' r='34' fill='rgba(255, 125, 104, 0.16)' />
      <rect x='62' y='64' width='110' height='88' rx='18' fill='#0f473d' />
      <rect x='148' y='48' width='104' height='98' rx='22' fill={`url(#${glowId})`} />
      <rect x='164' y='66' width='70' height='48' rx='14' fill='rgba(255,255,255,0.84)' />
      <path d='M80 118c12-16 24-24 36-24s20 7 28 18 17 18 28 18' stroke='#7ff0b3' strokeWidth='8' strokeLinecap='round' fill='none' />
      <path d='m188 88 11 10 18-22' stroke='#0f473d' strokeWidth='8' strokeLinecap='round' strokeLinejoin='round' fill='none' />
      <rect x='86' y='80' width='26' height='10' rx='5' fill='#f7c752' />
      <rect x='86' y='98' width='46' height='10' rx='5' fill='#ffffff' opacity='0.9' />
      <rect x='86' y='116' width='38' height='10' rx='5' fill='#ffffff' opacity='0.7' />
      <circle cx='248' cy='156' r='22' fill='#ffffff' opacity='0.85' />
      <path d='M248 141v30' stroke='#0f473d' strokeWidth='8' strokeLinecap='round' />
      <path d='M233 156h30' stroke='#0f473d' strokeWidth='8' strokeLinecap='round' />
    </svg>
  )
}

export const DashboardIllustration = () => {
  const accentId = useId().replace(/:/g, '')
  const ringId = `${accentId}-ring`
  const barId = `${accentId}-bar`

  return (
    <svg viewBox='0 0 300 210' className='foodie-illustration-svg' role='img' aria-label='Illustration of colorful nutrition progress cards'>
      <defs>
        <linearGradient id={ringId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#48a7ff' />
          <stop offset='100%' stopColor='#7d74ff' />
        </linearGradient>
        <linearGradient id={barId} x1='0%' y1='0%' x2='100%' y2='0%'>
          <stop offset='0%' stopColor='#ffb84d' />
          <stop offset='100%' stopColor='#ff6d74' />
        </linearGradient>
      </defs>
      <rect x='20' y='20' width='260' height='170' rx='28' fill='#ffffff' opacity='0.94' />
      <circle cx='90' cy='95' r='46' fill='none' stroke={`url(#${ringId})`} strokeWidth='18' />
      <circle cx='90' cy='95' r='24' fill='#eef9f2' />
      <path d='M90 71v24l16 10' stroke='#0f473d' strokeWidth='7' strokeLinecap='round' strokeLinejoin='round' fill='none' />
      <rect x='154' y='52' width='86' height='24' rx='12' fill={`url(#${barId})`} />
      <rect x='154' y='88' width='70' height='18' rx='9' fill='#5dba8a' opacity='0.95' />
      <rect x='154' y='118' width='96' height='18' rx='9' fill='#f2c14e' opacity='0.95' />
      <rect x='154' y='148' width='62' height='18' rx='9' fill='#56a7e8' opacity='0.95' />
      <circle cx='238' cy='54' r='26' fill='rgba(255, 125, 104, 0.18)' />
      <circle cx='58' cy='156' r='18' fill='rgba(93, 186, 138, 0.2)' />
      <circle cx='254' cy='144' r='14' fill='rgba(86, 167, 232, 0.2)' />
    </svg>
  )
}

export const FoodLogIllustration = () => {
  const accentId = useId().replace(/:/g, '')
  const spoonId = `${accentId}-spoon`
  const cardId = `${accentId}-card`

  return (
    <svg viewBox='0 0 300 210' className='foodie-illustration-svg' role='img' aria-label='Illustration of meal logging and colorful nutrition chips'>
      <defs>
        <linearGradient id={spoonId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#ffbe4d' />
          <stop offset='100%' stopColor='#ff7468' />
        </linearGradient>
        <linearGradient id={cardId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#ffffff' />
          <stop offset='100%' stopColor='#eef9f2' />
        </linearGradient>
      </defs>
      <rect x='20' y='24' width='260' height='162' rx='28' fill={`url(#${cardId})`} />
      <rect x='42' y='44' width='112' height='122' rx='22' fill='#0f473d' />
      <rect x='166' y='50' width='92' height='28' rx='14' fill='rgba(86, 167, 232, 0.9)' />
      <rect x='166' y='90' width='70' height='16' rx='8' fill='rgba(93, 186, 138, 0.92)' />
      <rect x='166' y='116' width='84' height='16' rx='8' fill='rgba(255, 190, 77, 0.92)' />
      <rect x='166' y='142' width='60' height='16' rx='8' fill='rgba(255, 116, 104, 0.9)' />
      <circle cx='98' cy='102' r='32' fill='#ffffff' opacity='0.92' />
      <path d='M84 102c3-11 10-17 20-17 10 0 17 6 20 17-3 11-10 17-20 17-10 0-17-6-20-17Z' fill='rgba(255, 190, 77, 0.82)' />
      <path d='M67 69c8 7 12 14 12 22s-2 18-6 31' stroke={`url(#${spoonId})`} strokeWidth='8' strokeLinecap='round' fill='none' />
      <circle cx='236' cy='56' r='20' fill='rgba(255, 116, 104, 0.16)' />
      <circle cx='58' cy='150' r='16' fill='rgba(86, 167, 232, 0.16)' />
    </svg>
  )
}

export const RecipesIllustration = () => {
  const accentId = useId().replace(/:/g, '')
  const pageId = `${accentId}-page`
  const noteId = `${accentId}-note`

  return (
    <svg viewBox='0 0 300 210' className='foodie-illustration-svg' role='img' aria-label='Illustration of recipes, planner cards, and ingredients'>
      <defs>
        <linearGradient id={pageId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#fff6dc' />
          <stop offset='100%' stopColor='#ffffff' />
        </linearGradient>
        <linearGradient id={noteId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#68c39a' />
          <stop offset='100%' stopColor='#48a7ff' />
        </linearGradient>
      </defs>
      <rect x='26' y='26' width='248' height='160' rx='28' fill={`url(#${pageId})`} />
      <rect x='52' y='46' width='92' height='120' rx='20' fill='#ffffff' />
      <rect x='156' y='60' width='90' height='86' rx='22' fill={`url(#${noteId})`} />
      <rect x='70' y='64' width='54' height='10' rx='5' fill='rgba(255, 190, 77, 0.92)' />
      <rect x='70' y='88' width='48' height='10' rx='5' fill='rgba(86, 167, 232, 0.92)' />
      <rect x='70' y='112' width='42' height='10' rx='5' fill='rgba(93, 186, 138, 0.92)' />
      <circle cx='182' cy='94' r='18' fill='rgba(255,255,255,0.82)' />
      <path d='M182 83c4 4 6 8 6 12a6 6 0 1 1-12 0c0-3 2-7 6-12Z' fill='#ff7a68' />
      <rect x='172' y='122' width='58' height='8' rx='4' fill='rgba(255,255,255,0.84)' />
      <circle cx='246' cy='52' r='18' fill='rgba(255, 122, 104, 0.18)' />
      <circle cx='56' cy='156' r='14' fill='rgba(104, 195, 154, 0.18)' />
    </svg>
  )
}

export const SettingsIllustration = () => {
  const accentId = useId().replace(/:/g, '')
  const shieldId = `${accentId}-shield`
  const panelId = `${accentId}-panel`

  return (
    <svg viewBox='0 0 300 210' className='foodie-illustration-svg' role='img' aria-label='Illustration of colorful account settings and security panels'>
      <defs>
        <linearGradient id={shieldId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#ffca58' />
          <stop offset='100%' stopColor='#68c39a' />
        </linearGradient>
        <linearGradient id={panelId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#ffffff' />
          <stop offset='100%' stopColor='#eef4ff' />
        </linearGradient>
      </defs>
      <rect x='22' y='26' width='256' height='160' rx='30' fill={`url(#${panelId})`} />
      <rect x='48' y='50' width='90' height='112' rx='22' fill='#ffffff' />
      <rect x='156' y='58' width='96' height='34' rx='17' fill='rgba(86, 167, 232, 0.94)' />
      <rect x='156' y='106' width='82' height='20' rx='10' fill='rgba(255, 202, 88, 0.94)' />
      <rect x='156' y='138' width='68' height='18' rx='9' fill='rgba(104, 195, 154, 0.94)' />
      <path d='M93 66 69 75v20c0 17 10 32 24 38 14-6 24-21 24-38V75Z' fill={`url(#${shieldId})`} />
      <path d='m84 97 8 8 15-17' stroke='#0f473d' strokeWidth='7' strokeLinecap='round' strokeLinejoin='round' fill='none' />
      <circle cx='238' cy='62' r='18' fill='rgba(255, 122, 104, 0.18)' />
      <circle cx='52' cy='154' r='14' fill='rgba(104, 195, 154, 0.18)' />
    </svg>
  )
}

export const ProgressIllustration = () => {
  const accentId = useId().replace(/:/g, '')
  const arcId = `${accentId}-arc`
  const cardId = `${accentId}-card`

  return (
    <svg viewBox='0 0 300 210' className='foodie-illustration-svg' role='img' aria-label='Illustration of body progress, trend lines, and weekly momentum'>
      <defs>
        <linearGradient id={arcId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#48a7ff' />
          <stop offset='45%' stopColor='#7d74ff' />
          <stop offset='100%' stopColor='#68c39a' />
        </linearGradient>
        <linearGradient id={cardId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#ffffff' />
          <stop offset='100%' stopColor='#f1f9ff' />
        </linearGradient>
      </defs>
      <rect x='20' y='22' width='260' height='166' rx='28' fill={`url(#${cardId})`} />
      <path d='M52 148c20-28 42-42 67-42 18 0 33 6 46 17 12 11 25 16 39 16 17 0 34-9 51-28' stroke={`url(#${arcId})`} strokeWidth='10' strokeLinecap='round' fill='none' />
      <circle cx='92' cy='112' r='32' fill='rgba(255,255,255,0.9)' />
      <path d='M77 112a15 15 0 1 1 30 0' stroke='#0f473d' strokeWidth='7' strokeLinecap='round' fill='none' />
      <path d='M92 97v15l10 6' stroke='#ff7a68' strokeWidth='7' strokeLinecap='round' strokeLinejoin='round' fill='none' />
      <rect x='170' y='54' width='70' height='24' rx='12' fill='rgba(255, 189, 77, 0.92)' />
      <rect x='170' y='90' width='90' height='18' rx='9' fill='rgba(86, 167, 232, 0.92)' />
      <rect x='170' y='120' width='64' height='18' rx='9' fill='rgba(104, 195, 154, 0.96)' />
      <circle cx='242' cy='56' r='18' fill='rgba(255, 122, 104, 0.16)' />
      <circle cx='54' cy='70' r='14' fill='rgba(104, 195, 154, 0.18)' />
      <circle cx='250' cy='148' r='16' fill='rgba(72, 167, 255, 0.16)' />
    </svg>
  )
}