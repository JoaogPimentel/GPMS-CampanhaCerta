import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ChannelBadge from './ChannelBadge'

describe('ChannelBadge', () => {
  it('aplica a classe correta para cada canal', () => {
    const { rerender } = render(<ChannelBadge channel="Instagram" />)
    expect(screen.getByText('Instagram')).toHaveClass('chip-channel-instagram')

    rerender(<ChannelBadge channel="Google Ads" />)
    expect(screen.getByText('Google Ads')).toHaveClass('chip-channel-google-ads')

    rerender(<ChannelBadge channel="E-mail" />)
    expect(screen.getByText('E-mail')).toHaveClass('chip-channel-e-mail')

    rerender(<ChannelBadge channel="Facebook" />)
    expect(screen.getByText('Facebook')).toHaveClass('chip-channel-facebook')

    rerender(<ChannelBadge channel="TikTok" />)
    expect(screen.getByText('TikTok')).toHaveClass('chip-channel-tiktok')
  })
})
