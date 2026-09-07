function channelToSlug(channel) {
  return channel.toLowerCase().replace(/\s+/g, '-')
}

function ChannelBadge({ channel }) {
  return <span className={`chip chip-channel-${channelToSlug(channel)}`}>{channel}</span>
}

export default ChannelBadge
