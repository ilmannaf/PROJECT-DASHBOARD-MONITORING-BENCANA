const getAdminToken = () => localStorage.getItem('adminToken');
const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export function getProtectedFileUrl(fileUrl) {
  if (!fileUrl) return null;
  const filename = fileUrl.startsWith('/api/files/')
    ? fileUrl.split('/').pop()
    : fileUrl.startsWith('/uploads/')
      ? fileUrl.split('/').pop()
      : null;
  if (!filename) return fileUrl;
  const token = getAdminToken();
  const protectedUrl = `${apiOrigin}/api/files/${encodeURIComponent(filename)}`;
  return token ? `${protectedUrl}?token=${encodeURIComponent(token)}` : protectedUrl;
}
