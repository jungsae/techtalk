import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Get current user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('fcm_tokens')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError
    }

    const existingTokens = profile?.fcm_tokens || []
    
    // Add token if it doesn't exist
    if (!existingTokens.includes(token)) {
      const updatedTokens = [...existingTokens, token]

      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          fcm_tokens: updatedTokens,
        }, {
          onConflict: 'id',
        })

      if (updateError) throw updateError
    }

    return NextResponse.json({ message: 'Token registered successfully' })
  } catch (error: any) {
    console.error('Error registering FCM token:', error)
    return NextResponse.json(
      { error: 'Failed to register token' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Get current user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('fcm_tokens')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ message: 'Token removed successfully' })
    }

    const existingTokens = profile.fcm_tokens || []
    const updatedTokens = existingTokens.filter((t: string) => t !== token)

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ fcm_tokens: updatedTokens })
      .eq('id', user.id)

    if (updateError) throw updateError

    return NextResponse.json({ message: 'Token removed successfully' })
  } catch (error: any) {
    console.error('Error removing FCM token:', error)
    return NextResponse.json(
      { error: 'Failed to remove token' },
      { status: 500 }
    )
  }
}

