export function getCookie(name) {
  var pattern = RegExp(name + "=.[^;]*");
  var matched = document.cookie.match(pattern);
  if (matched) {
    var cookie = matched[0].split("=");
    return JSON.parse(decodeURIComponent(cookie[1]));
  }
  return false;
}
export function setCookie(name, value, maxAge) {
  document.cookie = `${name}=${JSON.stringify(
    value
  )}; max-age=${maxAge}; Path=/;`;
}
export function deleteCookie(name) {
  document.cookie = name + "=; max-age=0; Path=/;";
}
