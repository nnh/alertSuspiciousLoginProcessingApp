/**
 * Send a chat.
 * @param {string} The text of the post.
 * @return none.
 */
function sendWorkInformationToChat_(strPayload) {
  // Webhook URL
  const postUrl =
    PropertiesService.getScriptProperties().getProperty('chatTargetUrl');
  const payload = {
    text: strPayload,
  };
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
  const _ = UrlFetchApp.fetch(postUrl, options);
}
