export function getInitials(nameOrProfile) {
  if (!nameOrProfile) return ''
  if (typeof nameOrProfile === 'string') {
    const parts = nameOrProfile.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  // If passed an object (profile)
  const name = nameOrProfile.name || nameOrProfile.email || nameOrProfile.id || ''
  return getInitials(name)
}
