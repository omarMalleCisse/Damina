/**
 * Récupère le token d'authentification (localStorage ou sessionStorage).
 */
export const getToken = () =>
  localStorage.getItem('access_token') ||
  localStorage.getItem('token') ||
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('access_token') ||
  sessionStorage.getItem('token') ||
  sessionStorage.getItem('accessToken') ||
  '';
