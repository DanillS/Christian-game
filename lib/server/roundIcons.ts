import { isSupabaseEnabled, supabaseRestRequest } from './supabaseClient'

interface IconRow {
  round_id: string
  icon_url: string
}

export async function fetchRoundIcons() {
  if (!isSupabaseEnabled()) {
    try {
      const rows = await supabaseRestRequest<IconRow[]>('round_icons', {
        searchParams: {
          select: 'round_id,icon_url',
        },
      })
  
      return (rows || []).reduce<Record<string, string>>((acc, row) => {
        if (row.round_id && row.icon_url) {
          acc[row.round_id] = row.icon_url
        }
        return acc
      }, {})
    } catch (error) {
      console.error('[roundIcons] Failed to load icons', error)
      return {}
    }
  }

  
}

